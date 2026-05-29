'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload } from 'lucide-react'
import type { Profile } from '@/types'

const schema = z.object({
    full_name: z.string().min(2, 'Nama minimal 2 karakter'),
    tagline: z.string().max(100, 'Maks 100 karakter').optional(),
    bio: z.string().max(500, 'Maks 500 karakter').optional(),
    username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/, 'Hanya huruf kecil, angka, _ dan -'),
    location: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().url('URL tidak valid').optional().or(z.literal('')),
    linkedin_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
    github_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
    twitter_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface Props {
    profile: Profile
    onUpdate: (profile: Profile) => void
}

export function BasicInfoForm({ profile, onUpdate }: Props) {
    const [loading, setLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            full_name: profile.full_name ?? '',
            tagline: profile.tagline ?? '',
            bio: profile.bio ?? '',
            username: profile.username,
            location: profile.location ?? '',
            phone: profile.phone ?? '',
            website: profile.website ?? '',
            linkedin_url: profile.linkedin_url ?? '',
            github_url: profile.github_url ?? '',
            twitter_url: profile.twitter_url ?? '',
        },
    })

    async function onSubmit(data: FormData) {
        setLoading(true)
        const supabase = createClient()
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', profile.id)

        if (error) {
            toast.error(error.message.includes('unique') ? 'Username sudah dipakai' : 'Gagal menyimpan')
        } else {
            onUpdate({ ...profile, ...data })
            toast.success('Profil disimpan!')
        }
        setLoading(false)
    }

    async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { toast.error('Ukuran foto maks 2MB'); return }

        setAvatarLoading(true)
        const supabase = createClient()
        const ext = file.name.split('.').pop()
        const path = `avatars/${profile.id}.${ext}`

        const { error: uploadError } = await supabase.storage
            .from('portfolio-assets')
            .upload(path, file, { upsert: true })

        if (uploadError) { toast.error('Gagal upload foto'); setAvatarLoading(false); return }

        const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(path)

        await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
        onUpdate({ ...profile, avatar_url: publicUrl })
        toast.success('Foto profil diperbarui!')
        setAvatarLoading(false)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar upload */}
            <Card>
                <CardHeader><CardTitle className="text-sm">Foto profil</CardTitle></CardHeader>
                <CardContent className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {profile.avatar_url
                            ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            : <span className="text-2xl font-semibold text-muted-foreground">
                                {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
                            </span>
                        }
                    </div>
                    <label className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild disabled={avatarLoading}>
                            <span>
                                {avatarLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                Upload foto
                            </span>
                        </Button>
                        <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
                    </label>
                    <p className="text-xs text-muted-foreground">JPG, PNG. Maks 2MB</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-sm">Informasi dasar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Nama lengkap</Label>
                            <Input {...register('full_name')} placeholder="Budi Santoso" />
                            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Username</Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 text-xs bg-muted border border-r-0 rounded-l-md text-muted-foreground">portofolio.id/</span>
                                <Input className="rounded-l-none" {...register('username')} placeholder="budisantoso" />
                            </div>
                            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Tagline <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                        <Input {...register('tagline')} placeholder="Full Stack Developer | Open to Work" />
                        {errors.tagline && <p className="text-xs text-destructive">{errors.tagline.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Bio</Label>
                        <Textarea {...register('bio')} placeholder="Ceritakan tentang diri kamu..." rows={3} />
                        {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Lokasi</Label>
                            <Input {...register('location')} placeholder="Jakarta, Indonesia" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Nomor telepon</Label>
                            <Input {...register('phone')} placeholder="+62 812 3456 7890" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-sm">Tautan & sosial media</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { field: 'website' as const, label: 'Website', placeholder: 'https://website.com' },
                        { field: 'linkedin_url' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                        { field: 'github_url' as const, label: 'GitHub', placeholder: 'https://github.com/username' },
                        { field: 'twitter_url' as const, label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
                    ].map(({ field, label, placeholder }) => (
                        <div key={field} className="space-y-1.5">
                            <Label>{label}</Label>
                            <Input {...register(field)} placeholder={placeholder} />
                            {errors[field] && <p className="text-xs text-destructive">{errors[field]?.message}</p>}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan perubahan
            </Button>
        </form>
    )
}