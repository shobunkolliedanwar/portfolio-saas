import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-semibold">Pengaturan</h1>
                <p className="text-muted-foreground mt-1">Kelola akun dan preferensi kamu</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Akun</CardTitle>
                    <CardDescription>Fitur pengaturan akun akan hadir di Fase 3</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Password, notifikasi, dan billing akan diimplementasikan setelah Fase 2 selesai.</p>
                </CardContent>
            </Card>
        </div>
    )
}