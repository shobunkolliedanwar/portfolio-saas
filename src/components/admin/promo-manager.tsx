'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2 } from 'lucide-react'
import type { PromoCode } from '@/types'

interface Props {
    promos: PromoCode[]
}

export function PromoManager({ promos: initialPromos }: Props) {
    const [promos, setPromos] = useState<PromoCode[]>(initialPromos)
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState({
        code: '', discount_percent: 20, max_uses: 100, valid_until: '',
    })

    async function createPromo() {
        if (!form.code.trim()) { toast.error('Kode tidak boleh kosong'); return }
        setCreating(true)
        const supabase = createClient()
        const { data, error } = await supabase
            .from('promo_codes')
            .insert({
                code: form.code.toUpperCase().trim(),
                discount_percent: form.discount_percent,
                max_uses: form.max_uses,
                valid_until: form.valid_until || null,
                is_active: true,
            })
            .select().single()

        if (error) {
            toast.error(error.message.includes('unique') ? 'Kode sudah ada' : 'Gagal membuat promo')
        } else if (data) {
            setPromos(prev => [data, ...prev])
            setForm({ code: '', discount_percent: 20, max_uses: 100, valid_until: '' })
            toast.success('Kode promo dibuat!')
        }
        setCreating(false)
    }

    async function togglePromo(id: string, isActive: boolean) {
        const supabase = createClient()
        await supabase.from('promo_codes').update({ is_active: !isActive }).eq('id', id)
        setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !isActive } : p))
    }

    async function deletePromo(id: string) {
        const supabase = createClient()
        await supabase.from('promo_codes').delete().eq('id', id)
        setPromos(prev => prev.filter(p => p.id !== id))
        toast.success('Promo dihapus')
    }

    const formatDate = (d: string | null) => d
        ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Tidak ada batas'

    return (
        <div className="space-y-6">
            {/* Form buat promo baru */}
            <Card>
                <CardHeader><CardTitle className="text-base">Buat kode promo baru</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Kode promo</Label>
                            <Input
                                value={form.code}
                                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                placeholder="LAUNCH50"
                                className="uppercase font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Diskon (%)</Label>
                            <Input
                                type="number" min={1} max={100}
                                value={form.discount_percent}
                                onChange={e => setForm(f => ({ ...f, discount_percent: parseInt(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Maks penggunaan</Label>
                            <Input
                                type="number" min={1}
                                value={form.max_uses}
                                onChange={e => setForm(f => ({ ...f, max_uses: parseInt(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Berlaku hingga <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                            <Input
                                type="date"
                                value={form.valid_until}
                                onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
                            />
                        </div>
                    </div>
                    <Button onClick={createPromo} disabled={creating}>
                        <Plus className="h-4 w-4 mr-2" />
                        {creating ? 'Membuat...' : 'Buat promo'}
                    </Button>
                </CardContent>
            </Card>

            {/* List promo */}
            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kode</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Diskon</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Penggunaan</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Berlaku hingga</th>
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Aktif</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {promos.map(promo => (
                            <tr key={promo.id} className="bg-card hover:bg-muted/20">
                                <td className="px-4 py-3 font-mono font-semibold">{promo.code}</td>
                                <td className="px-4 py-3">
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                        {promo.discount_percent}% off
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {promo.uses_count} / {promo.max_uses}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(promo.valid_until)}</td>
                                <td className="px-4 py-3 text-center">
                                    <Switch
                                        checked={promo.is_active}
                                        onCheckedChange={() => togglePromo(promo.id, promo.is_active)}
                                    />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => deletePromo(promo.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {promos.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-sm">Belum ada kode promo</div>
                )}
            </div>
        </div>
    )
}