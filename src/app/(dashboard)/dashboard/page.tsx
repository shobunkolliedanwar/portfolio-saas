import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, FileText, Share2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .single()

    const stats = [
        { label: 'Portfolio views', value: '0', icon: Eye, desc: 'Belum ada data' },
        { label: 'CV di-generate', value: '0', icon: FileText, desc: 'Buat CV pertama kamu' },
        { label: 'Link dibagikan', value: '0', icon: Share2, desc: 'Mulai sharing' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Halo, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                    Selamat datang di dashboard portfolio kamu.
                </p>
            </div>

            {!profile?.is_published && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <p className="font-medium text-sm">Portfolio kamu belum dipublish</p>
                        <p className="text-muted-foreground text-xs mt-0.5">Lengkapi profil dan publish agar bisa dilihat orang lain</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/profile">Lengkapi profil <ArrowRight className="ml-2 h-3 w-3" /></Link>
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Plan kamu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Paket aktif</span>
                            <span className="text-sm font-medium capitalize px-2 py-1 bg-muted rounded-md">
                                {subscription?.plan ?? 'Free'}
                            </span>
                        </div>
                        {subscription?.plan === 'free' && (
                            <Button variant="outline" className="w-full" size="sm" asChild>
                                <Link href="/settings/billing">Upgrade ke Pro →</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Link portfolio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded-md truncate">
                            portofolio.id/{profile?.username}
                        </p>
                        <Button variant="outline" className="w-full" size="sm" asChild>
                            <Link href={`/${profile?.username}`} target="_blank">Lihat portfolio →</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}