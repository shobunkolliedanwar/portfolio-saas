'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, GraduationCap } from 'lucide-react'
import type { Education } from '@/types'

interface Props {
    educations: Education[]
    userId: string
    onUpdate: (educations: Education[]) => void
}

export function EducationForm({ educations, userId, onUpdate }: Props) {
    const [items, setItems] = useState<Education[]>(educations)
    const [saving, setSaving] = useState<string | null>(null)

    async function addNew() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('educations')
            .insert({
                user_id: userId, institution: '', degree: '', field_of_study: '',
                start_date: '', is_current: false, order_index: items.length,
            })
            .select().single()
        if (!error && data) { const u = [...items, data]; setItems(u); onUpdate(u) }
    }

    function updateItem(id: string, changes: Partial<Education>) {
        const u = items.map(i => i.id === id ? { ...i, ...changes } : i)
        setItems(u); onUpdate(u)
    }

    async function saveItem(item: Education) {
        setSaving(item.id)
        const supabase = createClient()
        const { error } = await supabase.from('educations').update({
            institution: item.institution, degree: item.degree,
            field_of_study: item.field_of_study, start_date: item.start_date,
            end_date: item.is_current ? null : item.end_date,
            is_current: item.is_current, gpa: item.gpa,
        }).eq('id', item.id)
        if (error) toast.error('Gagal menyimpan'); else toast.success('Tersimpan!')
        setSaving(null)
    }

    async function deleteItem(id: string) {
        const supabase = createClient()
        await supabase.from('educations').delete().eq('id', id)
        const u = items.filter(i => i.id !== id); setItems(u); onUpdate(u)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-medium">Pendidikan</h2>
                    <p className="text-xs text-muted-foreground">Riwayat pendidikan formal kamu</p>
                </div>
                <Button size="sm" onClick={addNew}><Plus className="h-4 w-4 mr-2" />Tambah</Button>
            </div>

            {items.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada riwayat pendidikan</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={addNew}>Tambah pendidikan</Button>
                </div>
            )}

            {items.map((item) => (
                <Card key={item.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{item.institution || 'Institusi baru'}</CardTitle>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Nama institusi</Label>
                            <Input value={item.institution} placeholder="Universitas Indonesia"
                                onChange={e => updateItem(item.id, { institution: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Gelar</Label>
                                <Input value={item.degree} placeholder="S1 / S2 / D3"
                                    onChange={e => updateItem(item.id, { degree: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Jurusan</Label>
                                <Input value={item.field_of_study ?? ''} placeholder="Teknik Informatika"
                                    onChange={e => updateItem(item.id, { field_of_study: e.target.value })} />
                            </div>
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
                            <Switch checked={item.is_current} onCheckedChange={v => updateItem(item.id, { is_current: v })} />
                            <Label className="text-xs">Masih kuliah</Label>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">IPK / GPA <span className="text-muted-foreground">(opsional)</span></Label>
                            <Input value={item.gpa ?? ''} placeholder="3.85" className="w-28"
                                onChange={e => updateItem(item.id, { gpa: e.target.value })} />
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