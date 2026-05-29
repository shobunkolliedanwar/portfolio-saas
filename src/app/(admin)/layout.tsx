import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Users, CreditCard, Tag, Settings, LogOut, ShieldCheck } from 'lucide-react'

const adminNav = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Kelola User' },
    { href: '/admin/transactions', icon: CreditCard, label: 'Transaksi' },
    { href: '/admin/promo', icon: Tag, label: 'Kode Promo' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { role } = await requireAdmin()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="flex h-screen overflow-hidden bg-muted/20">
            <aside className="w-60 border-r bg-card flex flex-col">
                <div className="p-5 border-b">
                    <Link href="/admin" className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-semibold text-sm">Admin Panel</p>
                            <p className="text-xs text-muted-foreground capitalize">{role}</p>
                        </div>
                    </Link>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {adminNav.map(item => (
                        <Link key={item.href} href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-3 border-t space-y-1">
                    <Link href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
                        <Settings className="h-4 w-4" />
                        Kembali ke app
                    </Link>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">{children}</div>
            </main>
        </div>
    )
}