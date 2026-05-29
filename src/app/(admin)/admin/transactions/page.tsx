import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

const statusColor: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-600',
}

export default async function AdminTransactionsPage() {
    await requireAdmin()
    const supabase = await createClient()

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, profiles(full_name, email, username)')
        .order('created_at', { ascending: false })
        .limit(50)

    const totalSuccess = transactions
        ?.filter(t => t.status === 'success')
        .reduce((sum, t) => sum + t.amount, 0) ?? 0

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Transaksi</h1>
                    <p className="text-muted-foreground text-sm mt-1">{transactions?.length ?? 0} transaksi total</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total revenue</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalSuccess)}</p>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Jumlah</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Metode</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {transactions?.map((tx: any) => (
                            <tr key={tx.id} className="bg-card hover:bg-muted/20">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{tx.profiles?.full_name ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">{tx.profiles?.email}</p>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.midtrans_order_id}</td>
                                <td className="px-4 py-3 font-semibold">{formatCurrency(tx.amount)}</td>
                                <td className="px-4 py-3 text-muted-foreground capitalize text-xs">
                                    {tx.payment_type?.replace(/_/g, ' ') ?? '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[tx.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                    {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!transactions || transactions.length === 0) && (
                    <div className="text-center py-10 text-muted-foreground text-sm">Belum ada transaksi</div>
                )}
            </div>
        </div>
    )
}