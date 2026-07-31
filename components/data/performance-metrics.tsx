'use client'

import { useMemo } from 'react'
import { mdMetrics } from '@/lib/db/schema'

interface PerformanceMetricsProps {
  metrics: (typeof mdMetrics.$inferSelect)[]
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  // Group by metric type and calculate stats
  const stats = useMemo(() => {
    const grouped = {
      LCP: metrics.filter((m) => m.isLCP),
      FCP: metrics.filter((m) => m.isFCP),
      CLS: metrics.filter((m) => m.isCLS),
      FID: metrics.filter((m) => m.isFID),
      TTFB: metrics.filter((m) => m.isTTFB),
    }

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      count: data.length,
      avg: (data.reduce((sum, m) => sum + (m.metricValue || 0), 0) / (data.length || 1)).toFixed(1),
      good: data.filter((m) => m.rating === 'good').length,
      needs: data.filter((m) => m.rating === 'needs-improvement').length,
      poor: data.filter((m) => m.rating === 'poor').length,
    }))
  }, [metrics])

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-50">Metrics by Type (24h)</h2>

      {/* Summary Table */}
      <div className="overflow-x-auto bg-zinc-900/40 border border-zinc-800 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-6 py-3 text-left font-semibold text-zinc-300">Metric</th>
              <th className="px-6 py-3 text-left font-semibold text-zinc-300">Avg</th>
              <th className="px-6 py-3 text-left font-semibold text-zinc-300">Good</th>
              <th className="px-6 py-3 text-left font-semibold text-zinc-300">Needs Improvement</th>
              <th className="px-6 py-3 text-left font-semibold text-zinc-300">Poor</th>
              <th className="px-6 py-3 text-left font-semibold text-zinc-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row) => (
              <tr key={row.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="px-6 py-3 font-mono font-semibold text-lime-400">{row.name}</td>
                <td className="px-6 py-3 text-zinc-300">{row.avg}ms</td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-950/40 text-green-300 text-xs font-semibold">
                    {row.good}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-950/40 text-yellow-300 text-xs font-semibold">
                    {row.needs}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-950/40 text-red-300 text-xs font-semibold">
                    {row.poor}
                  </span>
                </td>
                <td className="px-6 py-3 text-zinc-400">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50 mb-3">Recent Metrics</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {metrics.slice(0, 20).map((m) => (
            <div key={m.id} className="bg-zinc-900/40 border border-zinc-800 rounded p-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-lime-400">{m.metricName}</span>
                  <span className="ml-2 text-zinc-400">{m.metricValue}ms</span>
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                      m.rating === 'good'
                        ? 'bg-green-950/40 text-green-300'
                        : m.rating === 'needs-improvement'
                          ? 'bg-yellow-950/40 text-yellow-300'
                          : 'bg-red-950/40 text-red-300'
                    }`}
                  >
                    {m.rating}
                  </span>
                </div>
                <span className="text-zinc-500">{new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-zinc-500 mt-1 truncate">{m.url}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
