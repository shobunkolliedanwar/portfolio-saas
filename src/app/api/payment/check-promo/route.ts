import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    const { code } = await request.json()
    const supabase = await createClient()

    const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

    if (!promo) return NextResponse.json({ valid: false, message: 'Kode tidak ditemukan' })
    if (promo.uses_count >= promo.max_uses) return NextResponse.json({ valid: false, message: 'Kode sudah habis' })
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
        return NextResponse.json({ valid: false, message: 'Kode sudah expired' })
    }

    return NextResponse.json({
        valid: true,
        discount_percent: promo.discount_percent,
        message: `Diskon ${promo.discount_percent}% berhasil diterapkan!`,
    })
}