import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { mdMechanicPortfolio, mdMechanicOptimizations, mdTeams } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { TrendingDown, Users, Award, Zap } from 'lucide-react'

export const metadata = {
  title: 'Mechanic Analytics | Motorsports Data',
  description: 'Team mechanic performance and ROI analytics',
}

async function getMechanicAnalytics() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return null

  // Get all mechanics in team
  const mechanics = await db
    .select()
    .from(mdMechanicPortfolio)
    .where(eq(mdMechanicPortfolio.teamId, auth.teamId))

  // Get optimization counts per mechanic
  const mechanicStats = await Promise.all(
    mechanics.map(async (mechanic) => {
      const optimizations = await db
        .select()
        .from(mdMechanicOptimizations)
        .where(eq(mdMechanicOptimizations.mechanicUserId, mechanic.userId))

      const evaluated = optimizations.filter(o => o.actualLapTimeDelta !== null)
      const successCount = evaluated.filter(o => (o.actualLapTimeDelta ?? 0) < 0).length

      return {
        ...mechanic,
        totalOptimizations: optimizations.length,
        successRate: evaluated.length > 0 ? (successCount / evaluated.length) * 100 : 0,
      }
    })
  )

  return mechanicStats.sort((a, b) => (b.totalLapTimeSavings ?? 0) - (a.totalLapTimeSavings ?? 0))
}

export default async function MechanicAnalyticsPage() {
  const analytics = await getMechanicAnalytics()

  if (!analytics) {
    redirect('/data/sign-in')
  }

  const totalLapSavings = analytics.reduce((sum, m) => sum + (m.totalLapTimeSavings || 0), 0)
  const avgRidersServed = analytics.length > 0
    ? analytics.reduce((sum, m) => sum + (m.totalRidersServed || 0), 0) / analytics.length
    : 0

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mechanic Analytics</h1>
          <p className="text-muted-foreground">Team mechanic performance and ROI metrics</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-lime-400" />
              <span className="text-sm text-muted-foreground">Total Mechanics</span>
            </div>
            <div className="text-3xl font-bold text-lime-400">{analytics.length}</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-muted-foreground">Total Lap Savings</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{Math.abs(totalLapSavings).toFixed(1)}s</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Avg Riders Served</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{avgRidersServed.toFixed(1)}</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-muted-foreground">Total Optimizations</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">
              {analytics.reduce((sum, m) => sum + (m.totalOptimizations || 0), 0)}
            </div>
          </div>
        </div>

        {/* Mechanics Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                  <th className="text-left px-6 py-4 font-semibold">Mechanic</th>
                  <th className="text-center px-6 py-4 font-semibold">Work Orders</th>
                  <th className="text-center px-6 py-4 font-semibold">Lap Savings</th>
                  <th className="text-center px-6 py-4 font-semibold">Success Rate</th>
                  <th className="text-center px-6 py-4 font-semibold">Riders Served</th>
                  <th className="text-center px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((mechanic) => (
                  <tr key={mechanic.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{mechanic.displayName || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground">{mechanic.bio}</p>
                      </div>
                    </td>
                    <td className="text-center px-6 py-4 font-mono text-yellow-400">
                      {mechanic.totalWorkOrders}
                    </td>
                    <td className="text-center px-6 py-4 font-mono text-lime-400">
                      {Math.abs(mechanic.totalLapTimeSavings || 0).toFixed(2)}s
                    </td>
                    <td className="text-center px-6 py-4 font-mono text-blue-400">
                      {mechanic.successRate.toFixed(0)}%
                    </td>
                    <td className="text-center px-6 py-4 font-mono text-orange-400">
                      {mechanic.totalRidersServed}
                    </td>
                    <td className="text-center px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                        mechanic.verificationStatus === 'elite'
                          ? 'bg-lime-950 text-lime-200'
                          : mechanic.verificationStatus === 'verified'
                          ? 'bg-blue-950 text-blue-200'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {mechanic.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {analytics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No mechanics on this team yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
