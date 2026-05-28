'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    LayoutDashboard, User, Settings, LogOut, FileText, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/profile', icon: User, label: 'Profil & Portfolio' },
    { href: '/cv', icon: FileText, label: 'CV Generator', badge: 'Pro' },
    { href: '/settings', icon: Settings, label: 'Pengaturan' },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <aside className="w-64 border-r bg-card flex flex-col h-full">
            <div className="p-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-bold">P</span>
                    </div>
                    <span className="font-semibold text-lg">Portofolio.id</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                    {item.badge}
                                </span>
                            )}
                            {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Keluar
                </Button>
            </div>
        </aside>
    )
}