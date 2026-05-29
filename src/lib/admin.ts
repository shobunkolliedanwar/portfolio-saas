import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!roleData || roleData.role === 'user') redirect('/dashboard')
    return { user, role: roleData.role }
}

export async function requireSuperadmin() {
    const { user, role } = await requireAdmin()
    if (role !== 'superadmin') redirect('/dashboard')
    return { user, role }
}