'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Play, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react'

interface HealthCheckResult {
  check_type: string
  status: 'pass' | 'fail' | 'error'
  message?: string
  response_time_ms?: number
  error_details?: Record<string, any>
  executed_at?: string
  user_email?: string
}

interface RunResult {
  timestamp: string
  all_checks: HealthCheckResult[]
  passed: number
  failed: number
  errors: number
  total_time_ms: number
  manual_trigger: boolean
}

export function TestAgentsDashboardClient() {
  const [results, setResults] = useState<RunResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [history, setHistory] = useState<RunResult[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch health checks and normalize the API response into the shape the UI expects.
  // API returns: { checks, summary: { total, passed, failed, errors, average_response_ms }, executed_at }
  const runHealthChecks = async (manual = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/health-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual }),
      })
      const data = await response.json()

      // Surface API-level errors instead of crashing on a missing checks array
      if (!response.ok || data?.error || !Array.isArray(data?.checks)) {
        const msg =
          data?.message || data?.error || `Request failed (${response.status})`
        setError(msg)
        return
      }

      const checks = data.checks as HealthCheckResult[]
      const summary = data.summary ?? {}
      const normalized: RunResult = {
        timestamp: data.executed_at || new Date().toISOString(),
        all_checks: checks,
        passed: summary.passed ?? checks.filter((c) => c.status === 'pass').length,
        failed: summary.failed ?? checks.filter((c) => c.status === 'fail').length,
        errors: summary.errors ?? checks.filter((c) => c.status === 'error').length,
        total_time_ms: checks.reduce((sum, c) => sum + (c.response_time_ms || 0), 0),
        manual_trigger: manual,
      }

      setError(null)
      setResults(normalized)
      setHistory((prev) => [normalized, ...prev].slice(0, 20))
    } catch (err) {
      console.error('[v0] Health check error:', err)
      setError(err instanceof Error ? err.message : 'Failed to run health checks')
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(() => runHealthChecks(false), 5 * 60 * 1000)
      return () => clearInterval(timer)
    }
  }, [autoRefresh])

  // Initial load
  useEffect(() => {
    runHealthChecks(false)
  }, [])

  if (!results) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="max-w-6xl mx-auto">
          {error ? (
            <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-6 text-center space-y-4">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
              <div>
                <div className="font-mono uppercase tracking-wider text-red-400 text-sm">
                  Health checks failed to run
                </div>
                <div className="text-sm text-zinc-400 mt-2">{error}</div>
              </div>
              <Button
                onClick={() => runHealthChecks(true)}
                disabled={loading}
                className="bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold inline-flex items-center gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Try again
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 text-zinc-400 py-20">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="animate-pulse">Loading health checks...</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-lime-500/10 border-lime-500/30 text-lime-400'
      case 'fail':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      case 'error':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      default:
        return 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-lime-400" />
      case 'fail':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      default:
        return <Clock className="h-4 w-4 text-zinc-400" />
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-8">
          <h1 className="text-3xl font-bold font-mono uppercase tracking-wider text-lime-400 mb-2">
            Test Agents Dashboard
          </h1>
          <p className="text-sm text-zinc-400">
            Real-time health checks and platform monitoring. Runs automatically every 5 minutes.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            onClick={() => runHealthChecks(true)}
            disabled={loading}
            className="bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold flex items-center gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? 'Running...' : 'Run Now'}
          </Button>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-zinc-300">Auto-refresh (5 min)</span>
          </label>

          {results && (
            <div className="text-xs text-zinc-500 ml-auto">
              Last run: {new Date(results.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Inline error (when a refresh fails but we still have prior results) */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-lg p-3 flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Last run failed: {error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-lime-400">{results.total_time_ms}ms</div>
            <div className="text-xs text-zinc-500 mt-1">execution time</div>
          </Card>

          <Card className="bg-lime-500/10 border-lime-500/30 p-4">
            <div className="text-xs font-mono uppercase tracking-wider text-lime-400 mb-1">Passed</div>
            <div className="text-2xl font-bold text-lime-400">{results.passed}</div>
            <div className="text-xs text-lime-500/70 mt-1">checks</div>
          </Card>

          <Card className="bg-red-500/10 border-red-500/30 p-4">
            <div className="text-xs font-mono uppercase tracking-wider text-red-400 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-400">{results.failed}</div>
            <div className="text-xs text-red-500/70 mt-1">checks</div>
          </Card>

          <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
            <div className="text-xs font-mono uppercase tracking-wider text-yellow-400 mb-1">Errors</div>
            <div className="text-2xl font-bold text-yellow-400">{results.errors}</div>
            <div className="text-xs text-yellow-500/70 mt-1">checks</div>
          </Card>
        </div>

        {/* Health Checks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-zinc-200">Current Run</h2>
          {results.all_checks.map((check) => (
            <div
              key={check.check_type}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${statusColor(check.status)}`}
              onClick={() => setExpanded(expanded === check.check_type ? null : check.check_type)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcon(check.status)}
                  <div>
                    <div className="font-mono uppercase text-sm tracking-wider">{check.check_type}</div>
                    {check.user_email && <div className="text-xs opacity-75 mt-1">{check.user_email}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {check.response_time_ms && (
                    <span className="text-xs font-mono">{check.response_time_ms}ms</span>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {check.status}
                  </Badge>
                </div>
              </div>

              {expanded === check.check_type && (
                <div className="mt-4 pt-4 border-t border-current/20 space-y-2 text-sm">
                  {check.message && (
                    <div>
                      <div className="font-mono text-xs opacity-75 uppercase">Message</div>
                      <div className="mt-1">{check.message}</div>
                    </div>
                  )}
                  {check.error_details && (
                    <div>
                      <div className="font-mono text-xs opacity-75 uppercase">Details</div>
                      <pre className="mt-1 bg-zinc-900 p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(check.error_details, null, 2)}
                      </pre>
                    </div>
                  )}
                  {check.executed_at && (
                    <div className="text-xs opacity-75">
                      Executed: {new Date(check.executed_at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 1 && (
          <div className="space-y-4 border-t border-zinc-800 pt-8">
            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-zinc-200">Recent Runs</h2>
            <div className="space-y-2">
              {history.slice(1).map((run, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-zinc-900 border border-zinc-800 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <div className="text-zinc-500">{new Date(run.timestamp).toLocaleTimeString()}</div>
                    <Badge variant="outline" className={`capitalize ${run.passed === 5 ? 'border-lime-500/50 text-lime-400' : 'border-red-500/50 text-red-400'}`}>
                      {run.passed}/{run.all_checks.length} passed
                    </Badge>
                  </div>
                  <span className="text-xs text-zinc-500">{run.total_time_ms}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
