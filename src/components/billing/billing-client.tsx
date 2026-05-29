'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Check, Loader2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { PLANS } from '@/types'
import type { Subscription, Transaction } from '@/types'

interface Props {
    subscription: Subscription | null
    transactions: Transaction[]
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

const statusColor: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-gray-100 text-gray-600',
}

const statusLabel: Record<string, string> = {
    success: 'Berhasil', pending: 'Menunggu', failed: 'Gagal',
    expired: 'Kadaluarsa', cancelled: 'Dibatalkan',
}

export function BillingClient({ subscription, transactions }: Props) {
    const [loading, setLoading] = useState(false)
    const [promoCode, setPromoCode] = useState('')
    const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null)
    const [checkingPromo, setCheckingPromo] = useState(false)

    const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'
    const plan = PLANS[subscription?.plan ?? 'free']

    async function checkPromo() {
        if (!promoCode.trim()) return
        setCheckingPromo(true)
        const res = await fetch('/api/payment/check-promo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: promoCode }),
        })
        const data = await res.json()
        setPromoResult({
            valid: data.valid,
            discount: data.discount_percent ?? 0,
            message: data.message,
        })
        setCheckingPromo(false)
    }

    async function handleUpgrade() {
        setLoading(true)
        try {
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: 'pro',
                    promo_code: promoResult?.valid ? promoCode : null,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Load Midtrans Snap
            const script = document.createElement('script')
            script.src = process.env.NODE_ENV === 'production'
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js'
            script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
            document.head.appendChild(script)

            script.onload = () => {
                (window as any).snap.pay(data.snap_token, {
                    onSuccess: () => {
                        toast.success('Pembayaran berhasil! Akun kamu sudah diupgrade ke Pro.')
                        window.location.reload()
                    },
                    onPending: () => toast.info('Pembayaran sedang diproses'),
                    onError: () => toast.error('Pembayaran gagal, silakan coba lagi'),
                    onClose: () => setLoading(false),
                })
            }
        } catch (err: any) {
            toast.error(err.message)
            setLoading(false)
        }
    }

    const discountedPrice = promoResult?.valid
        ? 49000 - Math.floor(49000 * promoResult.discount / 100)
        : 49000

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
                <p className="text-muted-foreground text-sm mt-1">Kelola paket dan riwayat pembayaran kamu</p>
            </div>

            {/* Status plan sekarang */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Paket aktif</CardTitle>
                        <Badge className={isPro ? 'bg-primary' : ''}>
                            {isPro ? 'Pro' : 'Free'}
                        </Badge>
                    </div>
                    <CardDescription>
                        {isPro && subscription?.current_period_end
                            ? `Aktif hingga ${formatDate(subscription.current_period_end)}`
                            : 'Paket gratis — upgrade untuk fitur lengkap'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {plan.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Upgrade card (hanya muncul kalau masih Free) */}
            {!isPro && (
                <Card className="border-primary/30">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <CardTitle>Upgrade ke Pro</CardTitle>
                        </div>
                        <CardDescription>Akses semua fitur premium termasuk AI CV generator & analytics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Promo code */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Punya kode promo?</p>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9 uppercase"
                                        placeholder="MASUKKAN KODE"
                                        value={promoCode}
                                        onChange={e => {
                                            setPromoCode(e.target.value.toUpperCase())
                                            setPromoResult(null)
                                        }}
                                    />
                                </div>
                                <Button variant="outline" onClick={checkPromo} disabled={checkingPromo || !promoCode.trim()}>
                                    {checkingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terapkan'}
                                </Button>
                            </div>
                            {promoResult && (
                                <p className={`text-xs ${promoResult.valid ? 'text-green-600' : 'text-destructive'}`}>
                                    {promoResult.message}
                                </p>
                            )}
                        </div>

                        {/* Harga */}
                        <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm text-muted-foreground">Harga</span>
                                {promoResult?.valid ? (
                                    <div className="text-right">
                                        <span className="text-sm line-through text-muted-foreground mr-2">{formatCurrency(49000)}</span>
                                        <span className="text-xl font-bold text-primary">{formatCurrency(discountedPrice)}</span>
                                    </div>
                                ) : (
                                    <span className="text-xl font-bold">{formatCurrency(49000)}</span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground text-right">per bulan</p>
                        </div>

                        <Button className="w-full" size="lg" onClick={handleUpgrade} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            {loading ? 'Memproses...' : `Upgrade ke Pro — ${formatCurrency(discountedPrice)}/bulan`}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            Pembayaran aman via Midtrans. Mendukung transfer bank, QRIS, e-wallet, dan kartu kredit.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Riwayat transaksi */}
            <div>
                <h2 className="font-medium mb-3">Riwayat transaksi</h2>
                {transactions.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl">
                        <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                                <div>
                                    <p className="text-sm font-medium">Pro Plan — 1 bulan</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                                    {tx.payment_type && (
                                        <p className="text-xs text-muted-foreground capitalize">{tx.payment_type.replace(/_/g, ' ')}</p>
                                    )}
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm font-semibold">{formatCurrency(tx.amount)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[tx.status] ?? ''}`}>
                                        {statusLabel[tx.status] ?? tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}