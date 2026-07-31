import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptionsPage() {
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

  // Get all teams with subscription info
  const teams = await db
    .select({
      id: mdTeams.id,
      name: mdTeams.name,
      tier: mdTeams.subscriptionTier,
      status: mdTeams.subscriptionStatus,
      createdAt: mdTeams.createdAt,
      riderName: mdTeams.riderName,
      discipline: mdTeams.discipline,
    })
    .from(mdTeams)
    .orderBy(mdTeams.createdAt)

  const tierPricing: Record<string, number> = {
    grassroots: 49,
    privateer: 199,
    race_team: 599,
    factory_command: 18000,
  }

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      grassroots: 'Grassroots',
      privateer: 'Privateer',
      race_team: 'Race Team',
      factory_command: 'Factory Command',
    }
    return labels[tier] || tier
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'past_due':
        return 'bg-amber-500/20 text-amber-400'
      case 'canceled':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-zinc-500/20 text-zinc-400'
    }
  }

  const getDisciplineLabel = (discipline: string) => {
    const labels: Record<string, string> = {
      mx_sx: 'Motocross',
      nascar: 'NASCAR',
      karting: 'Karting',
      drag: 'Drag',
      boats: 'Boats',
      offroad: 'Off-Road',
      rally: 'Rally',
      other: 'Other',
    }
    return labels[discipline] || 'Unknown'
  }

  // Calculate metrics
  const totalMRR = teams.reduce((sum, t) => sum + (tierPricing[t.tier] || 0), 0)
  const tierBreakdown = teams.reduce(
    (acc, t) => {
      acc[t.tier] = (acc[t.tier] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Subscriptions</h1>
          <p className="text-zinc-400">All active teams and billing status</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Total Teams</p>
            <p className="text-2xl font-black mt-2">{teams.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Total MRR</p>
            <p className="text-2xl font-black text-lime-400 mt-2">${(totalMRR / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Active</p>
            <p className="text-2xl font-black text-green-400 mt-2">{teams.filter(t => t.status === 'active').length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Avg LTV</p>
            <p className="text-2xl font-black text-blue-400 mt-2">${((totalMRR * 28.8) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Tier Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Teams by Tier</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(tierBreakdown).map(([tier, count]) => (
              <div key={tier} className="bg-zinc-800 rounded p-4 text-center">
                <p className="text-sm text-zinc-400 mb-1">{getTierLabel(tier)}</p>
                <p className="text-2xl font-black">{count}</p>
                <p className="text-xs text-zinc-500 mt-2">${tierPricing[tier]}/mo each</p>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">Team</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">Discipline</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">Tier</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">MRR</th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-400 font-semibold">Signup Date</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{team.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{getDisciplineLabel(team.discipline || 'mx_sx')}</td>
                    <td className="px-6 py-4 font-semibold text-lime-400">{getTierLabel(team.tier)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                        {team.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-lime-400 font-semibold">${tierPricing[team.tier] || 0}</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
