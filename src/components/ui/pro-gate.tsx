'use client'

import { usePlan } from '@/hooks/use-plan'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Props {
    children: React.ReactNode
    feature?: string
}

export function ProGate({ children, feature }: Props) {
    const { isPro, loading } = usePlan()

    if (loading) return <div className="animate-pulse h-32 bg-muted rounded-xl" />
    if (isPro) return <>{children}</>

    return (
        <div className="relative">
            <div className="pointer-events-none opacity-30 select-none">{children}</div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl border border-dashed">
                <div className="text-center space-y-3 p-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Fitur Pro</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {feature ?? 'Fitur ini'} hanya tersedia untuk pengguna Pro
                        </p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/settings/billing">
                            <Sparkles className="h-3.5 w-3.5 mr-2" />
                            Upgrade ke Pro
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}