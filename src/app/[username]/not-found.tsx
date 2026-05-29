import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl font-bold text-muted-foreground">404</h1>
            <p className="text-xl font-semibold mt-4">Portfolio tidak ditemukan</p>
            <p className="text-muted-foreground mt-2">Portfolio ini belum dipublish atau username tidak ada.</p>
            <Button className="mt-6" asChild><Link href="/">Kembali ke beranda</Link></Button>
        </div>
    )
}