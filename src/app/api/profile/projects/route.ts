import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/types'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', user.id)
        .single()

    const isActive = subscription?.status === 'active' &&
        (!subscription?.current_period_end || new Date(subscription.current_period_end) > new Date())
    const plan = isActive ? (subscription?.plan ?? 'free') : 'free'
    const limit = PLANS[plan as keyof typeof PLANS]?.limits?.projects ?? 3

    if (limit !== -1) {
        const { count } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if ((count ?? 0) >= limit) {
            return NextResponse.json(
                { error: `Paket ${plan} hanya bisa menambah ${limit} proyek` },
                { status: 403 }
            )
        }
    }

    const body = await request.json()
    const { data, error } = await supabase
        .from('projects')
        .insert({ ...body, user_id: user.id })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}