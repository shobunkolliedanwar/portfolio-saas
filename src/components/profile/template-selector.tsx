'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import type { Profile } from '@/types'

const templates = [
    {
        id: 'minimal',
        name: 'Minimal',
        desc: 'Bersih, elegan, fokus ke konten',
        preview: 'bg-white',
        accent: '#6366f1',
    },
    {
        id: 'modern',
        name: 'Modern',
        desc: 'Sidebar berwarna, layout dua kolom',
        preview: 'bg-slate-900',
        accent: '#06b6d4',
    },
]

const colors = [
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Cyan', value: '#06b6d4' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Slate', value: '#64748b' },
]

interface Props {
    profile: Profile
    onUpdate: (profile: Profile) => void
}

export function TemplateSelector({ profile, onUpdate }: Props) {
    const [saving, setSaving] = useState(false)

    async function save(changes: Partial<Profile>) {
        setSaving(true)
        const supabase = createClient()
        await supabase.from('profiles').update(changes).eq('id', profile.id)
        onUpdate({ ...profile, ...changes })
        toast.success('Tampilan disimpan!')
        setSaving(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-medium">Pilih template</h2>
                <p className="text-xs text-muted-foreground">Tampilan portfolio kamu yang dilihat orang lain</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => save({ template_id: t.id })}
                        className={`text-left border-2 rounded-xl overflow-hidden transition-all ${profile.template_id === t.id
                                ? 'border-primary shadow-md'
                                : 'border-border hover:border-muted-foreground'
                            }`}
                    >
                        {/* Preview thumbnail */}
                        <div className={`h-32 ${t.preview} relative`}>
                            {t.id === 'minimal' && (
                                <div className="p-3 space-y-1.5">
                                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                                    <div className="w-24 h-2 bg-gray-300 rounded" />
                                    <div className="w-16 h-1.5 bg-gray-200 rounded" />
                                    <div className="flex gap-1 mt-2">
                                        {[40, 32, 48].map((w, i) => (
                                            <div key={i} className="h-1 rounded" style={{ width: w, background: profile.primary_color + '60' }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {t.id === 'modern' && (
                                <div className="flex h-full">
                                    <div className="w-1/3 p-2 space-y-1.5" style={{ background: profile.primary_color }}>
                                        <div className="w-6 h-6 rounded-full bg-white/30 mx-auto" />
                                        <div className="w-full h-1 bg-white/40 rounded" />
                                        <div className="w-3/4 h-1 bg-white/30 rounded" />
                                    </div>
                                    <div className="flex-1 p-2 space-y-1.5">
                                        <div className="w-full h-1.5 bg-slate-600 rounded" />
                                        <div className="w-5/6 h-1 bg-slate-700 rounded" />
                                        <div className="w-4/6 h-1 bg-slate-700 rounded" />
                                    </div>
                                </div>
                            )}
                            {profile.template_id === t.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <p className="font-medium text-sm">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div>
                <p className="font-medium text-sm mb-3">Warna utama</p>
                <div className="flex gap-3 flex-wrap">
                    {colors.map(c => (
                        <button
                            key={c.value}
                            title={c.label}
                            onClick={() => save({ primary_color: c.value })}
                            className={`w-8 h-8 rounded-full transition-all ${profile.primary_color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                                }`}
                            style={{ background: c.value }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}