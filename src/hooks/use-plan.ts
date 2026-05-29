'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PlanType } from '@/types'

export function usePlan() {
    const [plan, setPlan] = useState<PlanType>('free')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPlan() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data } = await supabase
                .from('subscriptions')
                .select('plan, status, current_period_end')
                .eq('user_id', user.id)
                .single()

            if (data) {
                // Cek apakah subscription masih aktif
                const isActive = data.status === 'active' &&
                    (!data.current_period_end || new Date(data.current_period_end) > new Date())
                setPlan(isActive ? data.plan : 'free')
            }
            setLoading(false)
        }
        fetchPlan()
    }, [])

    const isPro = plan === 'pro' || plan === 'business'
    const canUse = (feature: 'cv' | 'analytics' | 'custom_domain' | 'unlimited_projects') => {
        if (isPro) return true
        return false
    }

    return { plan, isPro, loading, canUse }
}