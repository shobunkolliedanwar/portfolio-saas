'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Briefcase } from 'lucide-react'
import type { Experience } from '@/types'

interface Props {
    experiences: Experience[]
    userId: string
    onUpdate: (experiences: Experience[]) => void
}

const emptyExp = (): Omit<Experience, 'id' | 'user_id'> => ({
    company: '', position: '', location: '', start_date: '',
    end_date: null, is_current: false, description: '', order_index: 0,
})

export function ExperienceForm({ experiences, userId, onUpdate }: Props) {
    const [items, setItems] = useState<Experience[]>(experiences)
    const [saving, setSaving] = useState<string | null>(null)

    async function addNew() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('experiences')
            .insert({ ...emptyExp(), user_id: userId, order_index: items.length })
            .select().single()

        if (!error && data) {
            const updated = [...items, data]
            setItems(updated)
            onUpdate(updated)
        }
    }

    async function updateItem(id: string, changes: Partial<Experience>) {
        const updated = items.map(i => i.id === id ? { ...i, ...changes } : i)
        setItems(updated)
        onUpdate(updated)
    }

    async function saveItem(item: Experience) {
        setSaving(item.id)
        const supabase = createClient()
        const { error } = await supabase
            .from('experiences')
            .update({
                company: item.company, position: item.position, location: item.location,
                start_date: item.start_date, end_date: item.is_current ? null : item.end_date,
                is_current: item.is_current, description: item.description,
            })
            .eq('id', item.id)

        if (error) toast.error('Gagal menyimpan')
        else toast.success('Tersimpan!')
        setSaving(null)
    }

    async function deleteItem(id: string) {
        const supabase = createClient()
        await supabase.from('experiences').delete().eq('id', id)
        const updated = items.filter(i => i.id !== id)
        setItems(updated)
        onUpdate(updated)
        toast.success('Dihapus')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-medium">Pengalaman kerja</h2>
                    <p className="text-xs text-muted-foreground">Tambahkan riwayat karir kamu</p>
                </div>
                <Button size="sm" onClick={addNew}>
                    <Plus className="h-4 w-4 mr-2" /> Tambah
                </Button>
            </div>

            {items.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada pengalaman kerja</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={addNew}>
                        Tambah pengalaman pertama
                    </Button>
                </div>
            )}

            {items.map((item) => (
                <Card key={item.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{item.position || 'Posisi baru'}</CardTitle>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Posisi / jabatan</Label>
                                <Input value={item.position} placeholder="Software Engineer"
                                    onChange={e => updateItem(item.id, { position: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Perusahaan</Label>
                                <Input value={item.company} placeholder="PT Contoh Indonesia"
                                    onChange={e => updateItem(item.id, { company: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Lokasi</Label>
                            <Input value={item.location ?? ''} placeholder="Jakarta, Indonesia"
                                onChange={e => updateItem(item.id, { location: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Mulai</Label>
                                <Input type="month" value={item.start_date?.slice(0, 7) ?? ''}
                                    onChange={e => updateItem(item.id, { start_date: e.target.value + '-01' })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Selesai</Label>
                                <Input type="month" value={item.end_date?.slice(0, 7) ?? ''}
                                    disabled={item.is_current}
                                    onChange={e => updateItem(item.id, { end_date: e.target.value + '-01' })} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={item.is_current}
                                onCheckedChange={v => updateItem(item.id, { is_current: v })}
                            />
                            <Label className="text-xs">Masih bekerja di sini</Label>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Deskripsi pekerjaan</Label>
                            <Textarea value={item.description ?? ''} placeholder="Jelaskan tanggung jawab dan pencapaian kamu..." rows={3}
                                onChange={e => updateItem(item.id, { description: e.target.value })} />
                        </div>
                        <Button size="sm" onClick={() => saveItem(item)} disabled={saving === item.id}>
                            {saving === item.id ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}