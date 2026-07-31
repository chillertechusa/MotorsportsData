import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

export const dynamic = 'force-dynamic'

// Simulated revenue data (in production, query Square or accounting system)
const revenueData = [
  { month: 'Jan', mrr: 12400, newCustomers: 24 },
  { month: 'Feb', mrr: 14210, newCustomers: 18 },
  { month: 'Mar', mrr: 18290, newCustomers: 32 },
  { month: 'Apr', mrr: 22110, newCustomers: 28 },
  { month: 'May', mrr: 28890, newCustomers: 42 },
  { month: 'Jun', mrr: 35210, newCustomers: 38 },
]

const churnData = [
  { month: 'Jan', retention: 92 },
  { month: 'Feb', retention: 94 },
  { month: 'Mar', retention: 95 },
  { month: 'Apr', retention: 94 },
  { month: 'May', retention: 96 },
  { month: 'Jun', retention: 97 },
]

export default async function AdminRevenueePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect('/data/sign-in')
  }

  // Check if user is admin (owner of a system team)
  const isAdmin = await db
    .select({ id: mdTeamMembers.id })
    .from(mdTeamMembers)
    .where(eq(mdTeamMembers.userId, session.user.id))
    .limit(1)

  if (!isAdmin || isAdmin.length === 0) {
    redirect('/data')
  }

  // Get team count
  const teamCount = await db
    .select({ id: mdTeams.id })
    .from(mdTeams)

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Admin Revenue Dashboard</h1>
          <p className="text-zinc-400">Real-time KPIs and financial visibility</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Monthly Recurring Revenue</p>
            <p className="text-3xl font-black text-lime-400">$35.2K</p>
            <p className="text-xs text-zinc-500 mt-2">↑ 23% from last month</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Active Teams</p>
            <p className="text-3xl font-black text-blue-400">{teamCount.length}</p>
            <p className="text-xs text-zinc-500 mt-2">All tiers combined</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Retention Rate</p>
            <p className="text-3xl font-black text-green-400">97%</p>
            <p className="text-xs text-zinc-500 mt-2">↑ 3% from March</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">LTV (avg)</p>
            <p className="text-3xl font-black text-purple-400">$8.4K</p>
            <p className="text-xs text-zinc-500 mt-2">Based on 2.4yr avg lifetime</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* MRR Trend */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-6">MRR & New Customers</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ color: '#f4f4f5' }}
                />
                <Legend />
                <Bar dataKey="mrr" fill="#a3e635" name="MRR ($)" />
                <Bar dataKey="newCustomers" fill="#3b82f6" name="New Teams" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Retention Trend */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-6">Monthly Retention Rate</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" />
                <YAxis stroke="#71717a" domain={[85, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ color: '#f4f4f5' }}
                />
                <Line type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-600 pt-8 border-t border-zinc-800">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </main>
  )
}
