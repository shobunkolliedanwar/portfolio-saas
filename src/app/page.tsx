import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  'Portfolio profesional dalam hitungan menit',
  'Generate CV ATS-friendly dengan AI',
  'Custom domain & analytics',
  'Gratis untuk mulai',
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 h-16 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-semibold text-lg">Portfolio.id</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild><Link href="/login">Masuk</Link></Button>
          <Button asChild><Link href="/register">Mulai gratis</Link></Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Portfolio & CV profesional<br />
            <span className="text-primary">dalam satu platform</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Buat portfolio yang memukau, generate CV ATS-friendly dengan AI, dan dapatkan pekerjaan impian kamu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Mulai gratis <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sudah punya akun</Link>
            </Button>
          </div>
          <ul className="flex flex-col sm:flex-row gap-3 justify-center text-sm text-muted-foreground">
            {features.map(f => (
              <li key={f} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}