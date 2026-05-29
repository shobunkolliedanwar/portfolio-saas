import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    const body = await request.json()

    // Verifikasi signature Midtrans
    const {
        order_id,
        status_code,
        gross_amount,
        transaction_status,
        fraud_status,
        payment_type,
        transaction_id,
        signature_key,
    } = body

    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const expectedSignature = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex')

    if (signature_key !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const supabase = await createClient()

    // Cek transaction ada
    const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('midtrans_order_id', order_id)
        .single()

    if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    // Tentukan status berdasarkan Midtrans response
    let newStatus: string = 'pending'
    const isSuccess =
        transaction_status === 'capture' && fraud_status === 'accept' ||
        transaction_status === 'settlement'
    const isFailed = ['deny', 'cancel', 'failure'].includes(transaction_status)
    const isExpired = transaction_status === 'expire'

    if (isSuccess) newStatus = 'success'
    else if (isFailed) newStatus = 'failed'
    else if (isExpired) newStatus = 'expired'

    // Update transaction
    await supabase
        .from('transactions')
        .update({
            status: newStatus,
            midtrans_transaction_id: transaction_id,
            payment_type,
        })
        .eq('midtrans_order_id', order_id)

    // Kalau sukses, aktifkan subscription Pro
    if (isSuccess) {
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        await supabase
            .from('subscriptions')
            .update({
                plan: 'pro',
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd.toISOString(),
                midtrans_order_id: order_id,
                midtrans_transaction_id: transaction_id,
            })
            .eq('user_id', transaction.user_id)

        // Update promo code usage kalau ada
        const promoCode = transaction.metadata?.promo_code
        if (promoCode) {
            await supabase.rpc('increment_promo_usage', { code: promoCode })
        }
    }

    return NextResponse.json({ success: true })
}