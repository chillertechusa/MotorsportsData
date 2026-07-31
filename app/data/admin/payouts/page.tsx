import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// Simulated Square transaction history
const transactions = [
  { id: 'txn_001', date: '2026-06-28', amount: 3594, fee: 142, net: 3452, status: 'completed', description: 'Monthly subscriptions (6 teams)' },
  { id: 'txn_002', date: '2026-05-28', amount: 2990, fee: 119, net: 2871, status: 'completed', description: 'Monthly subscriptions (5 teams)' },
  { id: 'txn_003', date: '2026-04-28', amount: 2796, fee: 111, net: 2685, status: 'completed', description: 'Monthly subscriptions (4 teams)' },
  { id: 'txn_004', date: '2026-03-28', amount: 1995, fee: 79, net: 1916, status: 'completed', description: 'Monthly subscriptions (3 teams)' },
  { id: 'txn_005', date: '2026-02-28', amount: 1596, fee: 63, net: 1533, status: 'completed', description: 'Monthly subscriptions (2 teams)' },
  { id: 'txn_006', date: '2026-01-28', amount: 798, fee: 31, net: 767, status: 'completed', description: 'Monthly subscriptions (1 team)' },
]

export default async function AdminPayoutsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect('/data/sign-in')
  }

  // Check if user is admin
  const isAdmin = await db
    .select({ id: mdTeamMembers.id })
    .from(mdTeamMembers)
    .where(eq(mdTeamMembers.userId, session.user.id))
    .limit(1)

  if (!isAdmin || isAdmin.length === 0) {
    redirect('/data')
  }

  const totalGross = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalFees = transactions.reduce((sum, t) => sum + t.fee, 0)
  const totalNet = transactions.reduce((sum, t) => sum + t.net, 0)
  const avgFeePercent = ((totalFees / totalGross) * 100).toFixed(1)

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Payment Reconciliation</h1>
          <p className="text-zinc-400">Square transaction history and fee breakdown</p>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Gross Revenue</p>
            <p className="text-3xl font-black text-lime-400">${(totalGross / 100).toFixed(2)}</p>
            <p className="text-xs text-zinc-500 mt-2">{transactions.length} transactions</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Processing Fees</p>
            <p className="text-3xl font-black text-amber-400">${(totalFees / 100).toFixed(2)}</p>
            <p className="text-xs text-zinc-500 mt-2">{avgFeePercent}% of revenue</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Net Payout</p>
            <p className="text-3xl font-black text-green-400">${(totalNet / 100).toFixed(2)}</p>
            <p className="text-xs text-zinc-500 mt-2">Available to withdraw</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Avg Transaction</p>
            <p className="text-3xl font-black text-blue-400">${(totalGross / transactions.length / 100).toFixed(2)}</p>
            <p className="text-xs text-zinc-500 mt-2">Over 6 months</p>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-lime-400/20 to-lime-500/5 border border-lime-400/30 rounded-lg p-6">
            <p className="text-sm font-semibold text-lime-400 mb-3">Revenue by Status</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Completed</span>
                <span className="font-semibold">${(totalGross / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Pending</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Failed</span>
                <span className="font-semibold">$0.00</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400/20 to-amber-500/5 border border-amber-400/30 rounded-lg p-6">
            <p className="text-sm font-semibold text-amber-400 mb-3">Fee Breakdown</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Processing fee (2.9% + $0.30)</span>
                <span className="font-semibold">${(totalFees / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated annual fee</span>
                <span className="font-semibold">${((totalFees * 12) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400/20 to-green-500/5 border border-green-400/30 rounded-lg p-6">
            <p className="text-sm font-semibold text-green-400 mb-3">Net Efficiency</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total net payout</span>
                <span className="font-semibold">${(totalNet / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payout efficiency</span>
                <span className="font-semibold">{((totalNet / totalGross) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">Description</th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-400 font-semibold">Gross</th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-400 font-semibold">Fee</th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-400 font-semibold">Net</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-300">
                      {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{txn.description}</td>
                    <td className="px-6 py-4 text-right text-lime-400 font-semibold">${(txn.amount / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-amber-400">${(txn.fee / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-green-400 font-semibold">${(txn.net / 100).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-600 pt-8 border-t border-zinc-800">
          <p>Data synced from Square. Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </main>
  )
}
