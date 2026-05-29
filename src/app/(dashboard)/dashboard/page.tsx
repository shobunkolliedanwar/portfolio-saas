import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
    ArrowRight,
    Eye,
    FileText,
    Share2,
    type LucideIcon,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

type DashboardStat = {
    label: string
    value: string
    description: string
    icon: LucideIcon
}

function getFirstName(fullName?: string | null) {
    if (!fullName) return 'there'

    return fullName.trim().split(' ')[0]
}

function formatPlan(plan?: string | null) {
    if (!plan) return 'Free'

    return plan.charAt(0).toUpperCase() + plan.slice(1)
}

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const [
        profileResult,
        subscriptionResult,
        projectsResult,
        skillsResult,
    ] = await Promise.all([
        supabase
            .from('profiles')
            .select(
                `
                id,
                full_name,
                username,
                portfolio_views,
                is_published
            `
            )
            .eq('id', user.id)
            .single(),

        supabase
            .from('subscriptions')
            .select('plan, status')
            .eq('user_id', user.id)
            .maybeSingle(),

        supabase
            .from('projects')
            .select('*', {
                count: 'exact',
                head: true,
            })
            .eq('user_id', user.id),

        supabase
            .from('skills')
            .select('*', {
                count: 'exact',
                head: true,
            })
            .eq('user_id', user.id),
    ])

    const { data: profile, error: profileError } = profileResult
    const { data: subscription } = subscriptionResult

    if (profileError || !profile) {
        redirect('/onboarding')
    }

    const totalProjects = projectsResult.count ?? 0
    const totalSkills = skillsResult.count ?? 0

    const stats: DashboardStat[] = [
        {
            label: 'Portfolio Views',
            value: String(profile.portfolio_views ?? 0),
            description: 'Total kunjungan portfolio',
            icon: Eye,
        },
        {
            label: 'Projects',
            value: String(totalProjects),
            description: 'Project telah ditambahkan',
            icon: FileText,
        },
        {
            label: 'Skills',
            value: String(totalSkills),
            description: 'Skill terdaftar',
            icon: Share2,
        },
    ]

    const portfolioUrl = `portofolio.id/${profile.username}`

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                    Halo, {getFirstName(profile.full_name)} 👋
                </h1>

                <p className="text-sm text-muted-foreground">
                    Selamat datang di dashboard portfolio kamu.
                </p>
            </section>

            {/* Publish Warning */}
            {!profile.is_published && (
                <section className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Portfolio kamu belum dipublish
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Lengkapi profil dan publish agar portfolio bisa
                            dilihat orang lain.
                        </p>
                    </div>

                    <Button size="sm" asChild>
                        <Link href="/profile">
                            Lengkapi Profil
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </section>
            )}

            {/* Stats */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon

                    return (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </CardTitle>

                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>

                            <CardContent>
                                <p className="text-3xl font-bold">
                                    {stat.value}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </section>

            {/* Bottom Cards */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Subscription */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Plan Kamu
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Paket aktif
                            </span>

                            <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium">
                                {formatPlan(subscription?.plan)}
                            </span>
                        </div>

                        {subscription?.plan === 'free' && (
                            <Button
                                variant="outline"
                                className="w-full"
                                size="sm"
                                asChild
                            >
                                <Link href="/settings/billing">
                                    Upgrade ke Pro
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Portfolio URL */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Link Portfolio
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="truncate rounded-md bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
                            {portfolioUrl}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            size="sm"
                            asChild
                        >
                            <Link
                                href={`/${profile.username}`}
                                target="_blank"
                            >
                                Lihat Portfolio
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}