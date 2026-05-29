import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ plan: 'free' })

    const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', user.id)
        .single()

    const isActive = data?.status === 'active' &&
        (!data?.current_period_end || new Date(data.current_period_end) > new Date())

    return NextResponse.json({
        plan: isActive ? (data?.plan ?? 'free') : 'free',
    })
}