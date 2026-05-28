import { Sidebar } from '@/components/dashboard/sidebar'
import { Navbar } from '@/components/dashboard/navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}