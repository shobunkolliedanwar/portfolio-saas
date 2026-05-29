'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Zap } from 'lucide-react'
import type { Skill } from '@/types'

interface Props {
    skills: Skill[]
    userId: string
    onUpdate: (skills: Skill[]) => void
}

const categories = ['technical', 'design', 'tools', 'soft skill', 'language']
const levels = ['', 'Pemula', 'Dasar', 'Menengah', 'Mahir', 'Expert']

export function SkillsForm({ skills, userId, onUpdate }: Props) {
    const [items, setItems] = useState<Skill[]>(skills)
    const [newSkill, setNewSkill] = useState('')
    const [newCategory, setNewCategory] = useState('technical')
    const [newLevel, setNewLevel] = useState(3)

    async function addSkill() {
        if (!newSkill.trim()) return
        const supabase = createClient()
        const { data, error } = await supabase
            .from('skills')
            .insert({ user_id: userId, name: newSkill.trim(), level: newLevel, category: newCategory, order_index: items.length })
            .select().single()
        if (!error && data) {
            const u = [...items, data]; setItems(u); onUpdate(u)
            setNewSkill('')
        }
    }

    async function deleteSkill(id: string) {
        const supabase = createClient()
        await supabase.from('skills').delete().eq('id', id)
        const u = items.filter(i => i.id !== id); setItems(u); onUpdate(u)
        toast.success('Skill dihapus')
    }

    const grouped = categories.reduce((acc, cat) => {
        acc[cat] = items.filter(s => s.category === cat)
        return acc
    }, {} as Record<string, Skill[]>)

    return (
        <div className="space-y-4">
            <div>
                <h2 className="font-medium">Skill & keahlian</h2>
                <p className="text-xs text-muted-foreground">Tambahkan skill yang kamu kuasai</p>
            </div>

            {/* Add new skill */}
            <div className="border rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium">Tambah skill baru</p>
                <div className="flex gap-2">
                    <Input
                        value={newSkill} placeholder="React, Figma, Python..."
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addSkill()}
                        className="flex-1"
                    />
                    <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm bg-background"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground">Level:</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(l => (
                            <button key={l} type="button"
                                onClick={() => setNewLevel(l)}
                                className={`w-7 h-7 rounded text-xs font-medium transition-colors ${l <= newLevel ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>{l}</button>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{levels[newLevel]}</span>
                </div>
                <Button size="sm" onClick={addSkill} disabled={!newSkill.trim()}>
                    <Plus className="h-4 w-4 mr-2" />Tambah skill
                </Button>
            </div>

            {/* Grouped skills */}
            {categories.map(cat => {
                const catSkills = grouped[cat]
                if (!catSkills?.length) return null
                return (
                    <div key={cat}>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-2">{cat}</p>
                        <div className="flex flex-wrap gap-2">
                            {catSkills.map(skill => (
                                <div key={skill.id}
                                    className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5 text-sm">
                                    <span>{skill.name}</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(l => (
                                            <div key={l} className={`w-1.5 h-1.5 rounded-full ${l <= skill.level ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                        ))}
                                    </div>
                                    <button onClick={() => deleteSkill(skill.id)} className="text-muted-foreground hover:text-destructive ml-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}

            {items.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <Zap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada skill</p>
                </div>
            )}
        </div>
    )
}