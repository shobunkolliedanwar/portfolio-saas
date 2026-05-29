import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { Users, TrendingUp, CreditCard, Eye, Star, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminMetrics } from '@/types'

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

export default async function AdminPage() {
    const { role } = await requireAdmin()
    const supabase = await createClient()

    const { data: metricsRaw } = await supabase.rpc('get_admin_metrics')
    const metrics = metricsRaw as AdminMetrics

    const stats = [
        {
            label: 'Total user',
            value: metrics?.total_users?.toLocaleString() ?? '0',
            icon: Users,
            sub: `+${metrics?.new_users_this_month ?? 0} bulan ini`,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'User Pro',
            value: metrics?.pro_users?.toLocaleString() ?? '0',
            icon: Star,
            sub: `${metrics?.free_users ?? 0} user Free`,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            label: 'Total revenue',
            value: formatCurrency(metrics?.total_revenue ?? 0),
            icon: CreditCard,
            sub: `${formatCurrency(metrics?.revenue_this_month ?? 0)} bulan ini`,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            label: 'Portfolio views',
            value: metrics?.total_portfolio_views?.toLocaleString() ?? '0',
            icon: Eye,
            sub: `${metrics?.published_portfolios ?? 0} portfolio published`,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm mt-1">Overview platform Portofolio.id</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(stat => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Conversion rate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader><CardTitle className="text-sm">Konversi Free → Pro</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary">
                            {metrics?.total_users > 0
                                ? ((metrics.pro_users / metrics.total_users) * 100).toFixed(1)
                                : '0'}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metrics?.pro_users ?? 0} dari {metrics?.total_users ?? 0} user
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm">Portfolio publish rate</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary">
                            {metrics?.total_users > 0
                                ? ((metrics.published_portfolios / metrics.total_users) * 100).toFixed(1)
                                : '0'}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metrics?.published_portfolios ?? 0} portfolio aktif
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm">Avg views per portfolio</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary">
                            {metrics?.published_portfolios > 0
                                ? Math.round(metrics.total_portfolio_views / metrics.published_portfolios)
                                : '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">views rata-rata</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}