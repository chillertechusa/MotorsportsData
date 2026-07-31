import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdMetrics } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import PerformanceMetrics from '@/components/data/performance-metrics'
import { AlertCircle, TrendingDown, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Performance Monitoring',
  description: 'Real-time Web Vitals and performance metrics dashboard',
}

export default async function PerformancePage() {
  const session = await auth.api.getSession()
  if (!session) return <div>Not authenticated</div>

  // Fetch recent metrics — last 24 hours
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const recentMetrics = await db
    .select()
    .from(mdMetrics)
    .where(
      // WHERE timestamp >= 24h ago
      () => {
        const timestamp = mdMetrics.timestamp
        return timestamp.gt(oneDayAgo)
      }
    )
    .orderBy(desc(mdMetrics.timestamp))
    .limit(500)

  // Calculate 24h aggregates
  const poorMetrics = recentMetrics.filter((m) => m.rating === 'poor')
  const needsImprovementMetrics = recentMetrics.filter((m) => m.rating === 'needs-improvement')
  const goodMetrics = recentMetrics.filter((m) => m.rating === 'good')

  const avgCLS = (
    recentMetrics
      .filter((m) => m.isCLS)
      .reduce((sum, m) => sum + (m.metricValue || 0), 0) / (recentMetrics.filter((m) => m.isCLS).length || 1)
  ).toFixed(3)

  const avgLCP = (
    recentMetrics
      .filter((m) => m.isLCP)
      .reduce((sum, m) => sum + (m.metricValue || 0), 0) / (recentMetrics.filter((m) => m.isLCP).length || 1)
  ).toFixed(0)

  const avgFCP = (
    recentMetrics
      .filter((m) => m.isFCP)
      .reduce((sum, m) => sum + (m.metricValue || 0), 0) / (recentMetrics.filter((m) => m.isFCP).length || 1)
  ).toFixed(0)

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-zinc-50">Performance Monitoring</h1>
          <p className="text-zinc-400 mt-2">Real-time Web Vitals and user experience metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Avg LCP</p>
                <p className="text-2xl font-black text-lime-400 mt-2">{avgLCP}ms</p>
              </div>
              <Zap className="h-5 w-5 text-lime-400" />
            </div>
            <p className="text-xs text-zinc-500 mt-3">Good ≤ 2.5s</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Avg FCP</p>
                <p className="text-2xl font-black text-lime-400 mt-2">{avgFCP}ms</p>
              </div>
              <Zap className="h-5 w-5 text-lime-400" />
            </div>
            <p className="text-xs text-zinc-500 mt-3">Good ≤ 1.8s</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Avg CLS</p>
                <p className="text-2xl font-black text-lime-400 mt-2">{avgCLS}</p>
              </div>
              <Zap className="h-5 w-5 text-lime-400" />
            </div>
            <p className="text-xs text-zinc-500 mt-3">Good ≤ 0.1</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Poor Metrics (24h)</p>
                <p className="text-2xl font-black text-red-400 mt-2">{poorMetrics.length}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-xs text-zinc-500 mt-3">Needs attention</p>
          </div>
        </div>

        {/* Alerts */}
        {poorMetrics.length > 0 && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-300">Performance Alerts (24h)</h3>
                <p className="text-sm text-red-200/80 mt-1">{poorMetrics.length} metrics rated as "poor"</p>
                <ul className="text-xs text-red-200/70 mt-2 space-y-1">
                  {poorMetrics.slice(0, 5).map((m) => (
                    <li key={m.id}>
                      • {m.metricName}: {m.metricValue}ms — {m.url}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Table */}
        <PerformanceMetrics metrics={recentMetrics} />
      </div>
    </div>
  )
}
