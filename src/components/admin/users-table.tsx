'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, ExternalLink, ShieldBan, ShieldCheck } from 'lucide-react'
import type { AdminUser } from '@/types'

interface Props {
    users: AdminUser[]
}

const planColor: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600',
    pro: 'bg-blue-100 text-blue-700',
    business: 'bg-purple-100 text-purple-700',
}

const roleColor: Record<string, string> = {
    user: 'bg-gray-100 text-gray-600',
    admin: 'bg-amber-100 text-amber-700',
    superadmin: 'bg-red-100 text-red-700',
}

export function AdminUsersTable({ users: initialUsers }: Props) {
    const [users, setUsers] = useState<AdminUser[]>(initialUsers)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'pro' | 'free'>('all')

    const filtered = users.filter(u => {
        const matchSearch = !search ||
            u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.username?.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'all' || u.plan === filter
        return matchSearch && matchFilter
    })

    async function toggleAdmin(userId: string, currentRole: string) {
        const newRole = currentRole === 'user' ? 'admin' : 'user'
        const supabase = createClient()
        const { error } = await supabase
            .from('user_roles')
            .update({ role: newRole })
            .eq('user_id', userId)

        if (error) { toast.error('Gagal mengubah role'); return }
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u))
        toast.success(`Role diubah menjadi ${newRole}`)
    }

    async function forceUpgradePro(userId: string) {
        const supabase = createClient()
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        const { error } = await supabase
            .from('subscriptions')
            .update({ plan: 'pro', status: 'active', current_period_end: periodEnd.toISOString() })
            .eq('user_id', userId)

        if (error) { toast.error('Gagal upgrade'); return }
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: 'pro' } : u))
        toast.success('User diupgrade ke Pro')
    }

    const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Cari nama, email, username..." value={search}
                        onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-1">
                    {(['all', 'pro', 'free'] as const).map(f => (
                        <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'}
                            onClick={() => setFilter(f)} className="capitalize">{f}</Button>
                    ))}
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bergabung</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.map(user => (
                            <tr key={user.id} className="bg-card hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                                            {user.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.full_name ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                            <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${planColor[user.plan] ?? ''}`}>
                                        {user.plan}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor[user.role] ?? ''}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(user.created_at)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1 justify-end">
                                        {user.is_published && (
                                            <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
                                                <a href={`/${user.username}`} target="_blank" rel="noreferrer">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </Button>
                                        )}
                                        {user.plan === 'free' && (
                                            <Button size="sm" variant="outline" className="h-7 text-xs"
                                                onClick={() => forceUpgradePro(user.id)}>
                                                → Pro
                                            </Button>
                                        )}
                                        {user.role !== 'superadmin' && (
                                            <Button size="icon" variant="ghost" className="h-7 w-7"
                                                title={user.role === 'admin' ? 'Hapus admin' : 'Jadikan admin'}
                                                onClick={() => toggleAdmin(user.id, user.role)}>
                                                {user.role === 'admin'
                                                    ? <ShieldBan className="h-3.5 w-3.5 text-red-500" />
                                                    : <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        Tidak ada user yang cocok
                    </div>
                )}
            </div>
        </div>
    )
}