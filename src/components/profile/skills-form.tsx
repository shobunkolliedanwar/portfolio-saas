'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Zap, Lock } from 'lucide-react'
import Link from 'next/link'
import type { Skill } from '@/types'
import { PLANS } from '@/types'

interface Props {
    skills: Skill[]
    userId: string
    plan: string
    onUpdate: (skills: Skill[]) => void
}

const categories = ['technical', 'design', 'tools', 'soft skill', 'language']
const levels = ['', 'Pemula', 'Dasar', 'Menengah', 'Mahir', 'Expert']

export function SkillsForm({ skills, userId, plan, onUpdate }: Props) {
    const [items, setItems] = useState<Skill[]>(skills)
    const [newSkill, setNewSkill] = useState('')
    const [newCategory, setNewCategory] = useState('technical')
    const [newLevel, setNewLevel] = useState(3)

    const limit = PLANS[plan as keyof typeof PLANS]?.limits?.skills ?? 5
    const isAtLimit = limit !== -1 && items.length >= limit
    const isPro = plan === 'pro' || plan === 'business'

    async function addSkill() {
        if (!newSkill.trim()) return

        if (isAtLimit) {
            toast.error(`Paket Free hanya bisa menambah ${limit} skill. Upgrade ke Pro untuk skill tak terbatas.`)
            return
        }

        const supabase = createClient()
        const res = await fetch('/api/profile/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newSkill.trim(),
                level: newLevel,
                category: newCategory,
                order_index: items.length,
            }),
        })

        if (!res.ok) {
            const err = await res.json()
            toast.error(err.error)
            return
        }
        const data = await res.json()
        const u = [...items, data]
        setItems(u)
        onUpdate(u)
        setNewSkill('')
    }

    async function deleteSkill(id: string) {
        const supabase = createClient()
        await supabase.from('skills').delete().eq('id', id)
        const u = items.filter(i => i.id !== id)
        setItems(u)
        onUpdate(u)
        toast.success('Skill dihapus')
    }

    const grouped = categories.reduce((acc, cat) => {
        acc[cat] = items.filter(s => s.category === cat)
        return acc
    }, {} as Record<string, Skill[]>)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-medium">Skill & keahlian</h2>
                    <p className="text-xs text-muted-foreground">
                        {isPro ? 'Skill tak terbatas' : `${items.length} / ${limit} skill`}
                    </p>
                </div>
                {!isPro && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        Free: {items.length}/{limit}
                    </span>
                )}
            </div>

            {/* Progress bar untuk Free user */}
            {!isPro && (
                <div className="space-y-1">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-destructive' : 'bg-primary'}`}
                            style={{ width: `${Math.min((items.length / limit) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Form tambah skill — disabled kalau sudah limit */}
            <div className={`border rounded-xl p-4 space-y-3 ${isAtLimit ? 'opacity-60' : ''}`}>
                <p className="text-sm font-medium">Tambah skill baru</p>
                <div className="flex gap-2">
                    <Input
                        value={newSkill}
                        placeholder="React, Figma, Python..."
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !isAtLimit && addSkill()}
                        disabled={isAtLimit}
                        className="flex-1"
                    />
                    <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        disabled={isAtLimit}
                        className="border rounded-md px-3 py-2 text-sm bg-background disabled:opacity-50"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-xs text-muted-foreground">Level:</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(l => (
                            <button key={l} type="button"
                                disabled={isAtLimit}
                                onClick={() => setNewLevel(l)}
                                className={`w-7 h-7 rounded text-xs font-medium transition-colors disabled:opacity-50 ${l <= newLevel ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>{l}</button>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{levels[newLevel]}</span>
                </div>
                <Button size="sm" onClick={addSkill} disabled={!newSkill.trim() || isAtLimit}>
                    <Plus className="h-4 w-4 mr-2" />Tambah skill
                </Button>
            </div>

            {/* Banner upgrade kalau sudah limit */}
            {isAtLimit && (
                <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Lock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Batas skill Free tercapai</p>
                        <p className="text-xs text-muted-foreground">Upgrade ke Pro untuk menambah skill tak terbatas</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/settings/billing">Upgrade</Link>
                    </Button>
                </div>
            )}

            {/* List skill */}
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