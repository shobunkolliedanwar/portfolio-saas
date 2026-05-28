'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const registerSchema = z.object({
    full_name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
    message: 'Password tidak sama',
    path: ['confirm_password'],
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    })

    async function onSubmit(data: RegisterForm) {
        setLoading(true)
        setError(null)
        const supabase = createClient()

        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: { full_name: data.full_name },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Cek email kamu</CardTitle>
                    <CardDescription>
                        Kami sudah kirim link verifikasi ke email kamu. Klik link tersebut untuk mengaktifkan akun.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Buat akun gratis</CardTitle>
                <CardDescription>Mulai buat portfolio profesional kamu</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Nama lengkap</Label>
                        <Input id="full_name" placeholder="Budi Santoso" {...register('full_name')} />
                        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="kamu@email.com" {...register('email')} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Min. 8 karakter" {...register('password')} />
                        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm_password">Konfirmasi password</Label>
                        <Input id="confirm_password" type="password" placeholder="Ulangi password" {...register('confirm_password')} />
                        {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Daftar sekarang
                    </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline">Masuk</Link>
                </p>
            </CardContent>
        </Card>
    )
}