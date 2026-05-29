import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { AdminUsersTable } from '@/components/admin/users-table'

export default async function AdminUsersPage() {
    await requireAdmin()
    const supabase = await createClient()

    const { data: users } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Kelola User</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {users?.length ?? 0} user terdaftar
                </p>
            </div>
            <AdminUsersTable users={users ?? []} />
        </div>
    )
}