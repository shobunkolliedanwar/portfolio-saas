import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, username')
        .eq('id', user?.id)
        .single()

    const initials = profile?.full_name
        ?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U'

    return (
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
            <div />
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url ?? undefined} />
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>
                            <p className="font-medium text-sm">{profile?.full_name ?? 'User'}</p>
                            <p className="text-xs text-muted-foreground font-normal">@{profile?.username}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href="/settings">Pengaturan</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`/${profile?.username}`} target="_blank">Lihat portfolio</a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}