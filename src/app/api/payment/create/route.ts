import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import midtransClient from 'midtrans-client'

const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
})

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan, promo_code } = await request.json()
    if (plan !== 'pro') return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

    // Hitung harga dengan promo
    let amount = 49000
    let discount = 0

    if (promo_code) {
        const { data: promo } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', promo_code.toUpperCase())
            .eq('is_active', true)
            .single()

        if (promo && promo.uses_count < promo.max_uses) {
            if (!promo.valid_until || new Date(promo.valid_until) > new Date()) {
                discount = Math.floor(amount * promo.discount_percent / 100)
                amount = amount - discount
            }
        }
    }

    const orderId = `PORTO-${user.id.slice(0, 8)}-${Date.now()}`

    // Simpan transaction dulu dengan status pending
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            midtrans_order_id: orderId,
            plan: 'pro',
            amount,
            status: 'pending',
            metadata: { promo_code, discount, original_amount: 49000 },
        })
        .select()
        .single()

    if (txError) return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })

    // Buat Midtrans snap token
    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: amount,
        },
        customer_details: {
            first_name: profile?.full_name ?? 'User',
            email: profile?.email ?? user.email,
        },
        item_details: [
            {
                id: 'pro_plan_monthly',
                price: amount,
                quantity: 1,
                name: `Portofolio.id Pro${discount > 0 ? ` (Diskon ${promo_code})` : ''}`,
            },
        ],
        callbacks: {
            finish: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?status=success`,
            error: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?status=error`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?status=pending`,
        },
    }

    try {
        const snapResponse = await snap.createTransaction(parameter)

        // Update transaction dengan snap token
        await supabase
            .from('transactions')
            .update({ snap_token: snapResponse.token, snap_redirect_url: snapResponse.redirect_url })
            .eq('id', transaction.id)

        return NextResponse.json({
            snap_token: snapResponse.token,
            order_id: orderId,
            amount,
            discount,
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}