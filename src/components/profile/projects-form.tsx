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
import { Plus, Trash2, FolderOpen, X } from 'lucide-react'
import type { Project } from '@/types'

interface Props {
    projects: Project[]
    userId: string
    onUpdate: (projects: Project[]) => void
}

export function ProjectsForm({ projects, userId, onUpdate }: Props) {
    const [items, setItems] = useState<Project[]>(projects)
    const [saving, setSaving] = useState<string | null>(null)
    const [techInput, setTechInput] = useState<Record<string, string>>({})

    async function addNew() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('projects')
            .insert({ user_id: userId, title: '', description: '', tech_stack: [], is_featured: false, order_index: items.length })
            .select().single()
        if (!error && data) { const u = [...items, data]; setItems(u); onUpdate(u) }
    }

    function updateItem(id: string, changes: Partial<Project>) {
        const u = items.map(i => i.id === id ? { ...i, ...changes } : i)
        setItems(u); onUpdate(u)
    }

    function addTech(id: string) {
        const val = techInput[id]?.trim()
        if (!val) return
        const item = items.find(i => i.id === id)
        if (!item || item.tech_stack.includes(val)) return
        updateItem(id, { tech_stack: [...item.tech_stack, val] })
        setTechInput(prev => ({ ...prev, [id]: '' }))
    }

    function removeTech(id: string, tech: string) {
        const item = items.find(i => i.id === id)
        if (!item) return
        updateItem(id, { tech_stack: item.tech_stack.filter(t => t !== tech) })
    }

    async function saveItem(item: Project) {
        setSaving(item.id)
        const supabase = createClient()
        const { error } = await supabase.from('projects').update({
            title: item.title, description: item.description, tech_stack: item.tech_stack,
            url: item.url, github_url: item.github_url, is_featured: item.is_featured,
        }).eq('id', item.id)
        if (error) toast.error('Gagal menyimpan'); else toast.success('Tersimpan!')
        setSaving(null)
    }

    async function deleteItem(id: string) {
        const supabase = createClient()
        await supabase.from('projects').delete().eq('id', id)
        const u = items.filter(i => i.id !== id); setItems(u); onUpdate(u)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-medium">Proyek</h2>
                    <p className="text-xs text-muted-foreground">Portofolio proyek yang sudah kamu kerjakan</p>
                </div>
                <Button size="sm" onClick={addNew}><Plus className="h-4 w-4 mr-2" />Tambah</Button>
            </div>

            {items.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada proyek</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={addNew}>Tambah proyek pertama</Button>
                </div>
            )}

            {items.map((item) => (
                <Card key={item.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{item.title || 'Proyek baru'}</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <Switch checked={item.is_featured} onCheckedChange={v => updateItem(item.id, { is_featured: v })} />
                                    <Label className="text-xs">Featured</Label>
                                </div>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Nama proyek</Label>
                            <Input value={item.title} placeholder="Nama proyek kamu"
                                onChange={e => updateItem(item.id, { title: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Deskripsi</Label>
                            <Textarea value={item.description ?? ''} placeholder="Ceritakan proyek ini..." rows={2}
                                onChange={e => updateItem(item.id, { description: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tech stack</Label>
                            <div className="flex gap-2">
                                <Input value={techInput[item.id] ?? ''} placeholder="React, Node.js..."
                                    onChange={e => setTechInput(prev => ({ ...prev, [item.id]: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && addTech(item.id)} />
                                <Button size="sm" variant="outline" onClick={() => addTech(item.id)}>Tambah</Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.tech_stack.map(tech => (
                                    <span key={tech} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                                        {tech}
                                        <button onClick={() => removeTech(item.id, tech)}><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">URL demo</Label>
                                <Input value={item.url ?? ''} placeholder="https://demo.com"
                                    onChange={e => updateItem(item.id, { url: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">GitHub URL</Label>
                                <Input value={item.github_url ?? ''} placeholder="https://github.com/..."
                                    onChange={e => updateItem(item.id, { github_url: e.target.value })} />
                            </div>
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