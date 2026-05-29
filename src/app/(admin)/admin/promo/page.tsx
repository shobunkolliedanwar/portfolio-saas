import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { PromoManager } from '@/components/admin/promo-manager'

export default async function AdminPromoPage() {
    await requireAdmin()
    const supabase = await createClient()
    const { data: promos } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Kode Promo</h1>
                <p className="text-muted-foreground text-sm mt-1">Buat dan kelola kode diskon</p>
            </div>
            <PromoManager promos={promos ?? []} />
        </div>
    )
}