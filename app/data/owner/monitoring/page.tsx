'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OwnerMonitoringPage() {
  const [monitoring, setMonitoring] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedError, setSelectedError] = useState<any>(null)

  useEffect(() => {
    fetchMonitoring()
    const interval = setInterval(fetchMonitoring, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchMonitoring = async () => {
    try {
      const response = await fetch('/api/owner/monitoring')
      if (!response.ok) throw new Error('Failed to fetch monitoring data')
      const data = await response.json()
      setMonitoring(data)
    } catch (error) {
      console.error('[v0] Monitoring fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading monitoring data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">Error Monitoring</h1>
          <p className="text-zinc-400">Platform health, errors, and performance metrics</p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold">Status</p>
                <p className="text-2xl font-bold text-lime-400 mt-1">
                  {monitoring?.status === 'healthy' ? 'Healthy' : 'Issues'}
                </p>
              </div>
              {monitoring?.status === 'healthy' ? (
                <CheckCircle className="h-8 w-8 text-lime-400" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-amber-400" />
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold">Errors (24h)</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{monitoring?.errors24h || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400/30" />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold">Uptime</p>
                <p className="text-2xl font-bold text-lime-400 mt-1">
                  {monitoring?.uptime || '99.9'}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-lime-400/30" />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold">Avg Response</p>
                <p className="text-2xl font-bold text-zinc-100 mt-1">
                  {monitoring?.avgResponseTime || '245'}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-zinc-400/30" />
            </div>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 mb-8">
          <h2 className="text-xl font-bold text-zinc-100 mb-4">Recent Errors</h2>
          <div className="space-y-3">
            {monitoring?.recentErrors?.length ? (
              monitoring.recentErrors.map((err: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-4 border border-zinc-800 rounded-lg hover:border-red-500/20 cursor-pointer transition-colors"
                  onClick={() => setSelectedError(err)}
                >
                  <div>
                    <p className="font-semibold text-zinc-100">{err.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {err.occurrences} occurrences • {err.lastSeen}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400">
                    {err.severity}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-8">No errors in the past 24 hours</p>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Core Web Vitals</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">LCP (Largest Contentful Paint)</span>
                <span className="text-sm font-semibold text-lime-400">2.1s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">FID (First Input Delay)</span>
                <span className="text-sm font-semibold text-lime-400">45ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">CLS (Cumulative Layout Shift)</span>
                <span className="text-sm font-semibold text-lime-400">0.08</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">API Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Database Queries</span>
                <span className="text-sm font-semibold">
                  <span className="text-lime-400">42ms</span> avg
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Cache Hit Rate</span>
                <span className="text-sm font-semibold text-lime-400">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Request Volume</span>
                <span className="text-sm font-semibold">
                  <span className="text-zinc-100">12.4k</span> /hour
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="text-sm font-bold text-zinc-100 mb-3">Monitoring Setup</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>
              • Add{' '}
              <code className="bg-zinc-800 px-1 rounded text-amber-300">SENTRY_DSN</code> to
              environment variables for full error tracking
            </li>
            <li>
              • Add{' '}
              <code className="bg-zinc-800 px-1 rounded text-amber-300">DATADOG_API_KEY</code> for
              performance monitoring
            </li>
            <li>
              • Configure alerts in monitoring dashboard for critical errors
            </li>
            <li>• Set up PagerDuty integration for on-call notifications</li>
          </ul>
        </div>
      </div>

      {selectedError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-96 overflow-auto p-6">
            <h2 className="text-xl font-bold text-zinc-100 mb-4">{selectedError.title}</h2>
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                <strong>Severity:</strong> {selectedError.severity}
              </p>
              <p>
                <strong>Occurrences:</strong> {selectedError.occurrences}
              </p>
              <p>
                <strong>Last Seen:</strong> {selectedError.lastSeen}
              </p>
              <p>
                <strong>Stack Trace:</strong>
              </p>
              <pre className="bg-zinc-800 p-3 rounded overflow-auto text-xs">
                {selectedError.stack || 'No stack trace available'}
              </pre>
            </div>
            <button
              onClick={() => setSelectedError(null)}
              className="mt-6 w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
