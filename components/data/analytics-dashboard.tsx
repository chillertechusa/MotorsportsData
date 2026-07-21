'use client'

import { useState, useEffect } from 'react'
import { Download, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'

interface RiderStat {
  riderId: string
  riderName: string
  riderNumber: number
  sessionsLogged: number
  avgReadiness: number
  complianceRate: number
  avgHeartRate: number
  avgPower: number
  bestLapTime: number
  racesParticipated: number
  trend: 'improving' | 'stable' | 'declining'
}

interface AnalyticsData {
  teamSummary: {
    teamName: string
    totalRiders: number
    totalSessions: number
    totalRaces: number
    avgTeamReadiness: number
    avgCompliance: number
  }
  trendingMetrics: Array<{
    metricName: string
    value: number
    change: number
    direction: 'up' | 'down' | 'flat'
  }>
  riders: RiderStat[]
}

export function AnalyticsDashboard({ teamId }: { teamId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch from new analytics endpoints
        const [trendsRes, ridersRes] = await Promise.all([
          fetch(`/api/md-analytics/team-trends?weeks=${period === '7d' ? 1 : period === '30d' ? 4 : 12}`),
          fetch(`/api/md-analytics/rider-comparisons`),
        ])

        const trends = await trendsRes.json()
        const riders = await ridersRes.json()

        // Transform to component-expected format
        const weeks = period === '7d' ? 1 : period === '30d' ? 4 : 12
        const latestWeek = trends.data?.[0]

        const transformedData: AnalyticsData = {
          teamSummary: {
            teamName: 'Team',
            totalRiders: riders.riders?.length || 0,
            totalSessions: trends.data?.reduce((sum: number, w: any) => sum + (w.sessionCount || 0), 0) || 0,
            totalRaces: 0, // Not tracked yet
            avgTeamReadiness: latestWeek?.avgReadiness || 0,
            avgCompliance: 0, // Not tracked yet
          },
          trendingMetrics: [
            {
              metricName: 'Fastest Rider',
              value: latestWeek?.fastestLapOverall || 0,
              change: 0,
              direction: 'flat',
            },
            {
              metricName: 'Setup Changes',
              value: latestWeek?.setupChanges || 0,
              change: 0,
              direction: 'up',
            },
            {
              metricName: 'Team Readiness',
              value: latestWeek?.avgReadiness || 0,
              change: 0,
              direction: 'flat',
            },
          ],
          riders: riders.riders?.map((r: any) => ({
            riderId: r.email,
            riderName: r.email?.split('@')[0] || 'Unknown',
            riderNumber: 0,
            sessionsLogged: r.sessionCount,
            avgReadiness: r.avgReadinessScore,
            complianceRate: 100,
            avgHeartRate: 0,
            avgPower: 0,
            bestLapTime: r.bestLapSeconds || 0,
            racesParticipated: 0,
            trend: r.totalImprovementSeconds > 1 ? 'improving' : 'stable',
          })) || [],
        }

        setData(transformedData)
      } catch (error) {
        console.error('[v0] Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId, period])

  const handleExportPDF = async () => {
    if (!data) return

    setExporting(true)
    try {
      // Get the current period dates
      const now = new Date()
      const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const periodStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

      const exportData = {
        teamName: data.teamSummary.teamName,
        periodStart: periodStart.toLocaleDateString(),
        periodEnd: now.toLocaleDateString(),
        summary: {
          totalSessions: data.teamSummary.totalSessions,
          avgBestLap: data.trendingMetrics.find((m) => m.metricName === 'Avg Best Lap')?.value || 0,
          fastestLap: data.trendingMetrics.find((m) => m.metricName === 'Fastest Rider')?.value || 0,
          fastestRider: 'TBD',
          mostImproving: 'TBD',
          avgReadiness: data.teamSummary.avgTeamReadiness,
        },
        riders: data.riders.map((r) => ({
          name: r.riderName,
          sessionsLogged: r.sessionsLogged,
          bestLap: r.bestLapTime,
          improvement: 0, // Would come from historical data
          readiness: r.avgReadiness,
        })),
        setupChanges: 0, // Would come from mdCoachEffectiveness
        readinessAccuracy: 0, // Would come from mdCoachEffectiveness
      }

      const response = await fetch('/api/md-analytics/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[v0] Analytics PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-zinc-400">Loading analytics...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-400">Failed to load analytics</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-50 mb-2">Team Analytics</h1>
          <p className="text-zinc-400">{data.teamSummary.teamName}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Period Selector */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded font-bold text-sm transition ${
                  period === p
                    ? 'bg-lime-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {p === '7d' ? '7d' : p === '30d' ? '30d' : '90d'}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-lime-500 hover:bg-lime-400 text-zinc-950 rounded font-bold text-sm transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: data.teamSummary.totalSessions, color: 'text-blue-500' },
          { label: 'Avg Readiness', value: `${data.teamSummary.avgTeamReadiness}%`, color: 'text-lime-500' },
          { label: 'Avg Compliance', value: `${data.teamSummary.avgCompliance}%`, color: 'text-amber-500' },
          { label: 'Races', value: data.teamSummary.totalRaces, color: 'text-purple-500' },
        ].map((metric) => (
          <div key={metric.label} className="border border-zinc-800 bg-zinc-900 p-6 rounded-lg">
            <p className="text-sm text-zinc-400 mb-2">{metric.label}</p>
            <p className={`text-3xl font-black ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Trending Metrics */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
        <h2 className="font-bold text-lg text-zinc-50 mb-4">Trending ({period})</h2>

        <div className="space-y-4">
          {data.trendingMetrics.map((metric) => (
            <div key={metric.metricName} className="flex items-center justify-between p-4 bg-zinc-950 rounded">
              <div>
                <p className="font-bold text-zinc-50">{metric.metricName}</p>
                <p className="text-2xl font-black text-lime-500">{metric.value}</p>
              </div>

              <div className="flex items-center gap-2">
                {metric.direction === 'up' && (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-bold text-green-500">+{metric.change}</span>
                  </>
                )}
                {metric.direction === 'down' && (
                  <>
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-bold text-red-500">{metric.change}</span>
                  </>
                )}
                {metric.direction === 'flat' && (
                  <>
                    <Minus className="h-5 w-5 text-zinc-500" />
                    <span className="text-sm font-bold text-zinc-500">{metric.change}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rider Performance Table */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="font-bold text-lg text-zinc-50">Rider Performance</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950">
                <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400">Rider</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-zinc-400">Sessions</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-zinc-400">Readiness</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-zinc-400">Compliance</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-zinc-400">Avg HR</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-zinc-400">Avg Power</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-zinc-400">Best Lap</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-zinc-400">Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.riders.map((rider) => (
                <tr key={rider.riderId} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-zinc-50">{rider.riderName}</p>
                      <p className="text-xs text-zinc-400">#{rider.riderNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-300">{rider.sessionsLogged}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-lime-500/20 text-lime-400 text-sm font-bold rounded">
                      {rider.avgReadiness}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-sm font-bold rounded">
                      {rider.complianceRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-300">{rider.avgHeartRate} bpm</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{rider.avgPower}W</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{rider.bestLapTime}s</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        rider.trend === 'improving'
                          ? 'bg-green-500/20 text-green-400'
                          : rider.trend === 'stable'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {rider.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
        <h3 className="font-bold text-lg text-zinc-50 mb-4">Export Data</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-800 rounded transition border border-zinc-800">
            <div className="text-left">
              <p className="font-bold text-zinc-50">Season Summary</p>
              <p className="text-xs text-zinc-400">Team metrics and aggregates</p>
            </div>
            <Download className="h-4 w-4 text-zinc-400" />
          </button>

          <button className="flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-800 rounded transition border border-zinc-800">
            <div className="text-left">
              <p className="font-bold text-zinc-50">Rider Details</p>
              <p className="text-xs text-zinc-400">Per-rider performance data</p>
            </div>
            <Download className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
