'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, X, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    username: string
    onClose: () => void
}

export function ShareDialog({ username, onClose }: Props) {
    const [copied, setCopied] = useState(false)
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`

    async function copyLink() {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link disalin!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-background border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-semibold">Bagikan portfolio</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">@{username}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>

                <div className="flex justify-center mb-5">
                    <div className="p-3 border rounded-xl bg-white">
                        <QRCodeSVG value={url} size={160} />
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <Input value={url} readOnly className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={copyLink}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" asChild>
                        <a href={url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />Buka portfolio
                        </a>
                    </Button>
                    <Button className="flex-1" variant="outline"
                        onClick={() => {
                            if (navigator.share) navigator.share({ title: `Portfolio ${username}`, url })
                            else copyLink()
                        }}>
                        Bagikan
                    </Button>
                </div>
            </div>
        </div>
    )
}