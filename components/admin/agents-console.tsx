'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, PlayCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { AGENT_GROUPS, AgentGroup } from '@/app/actions/agents-orchestrator'
import { HealthCheck } from '@/lib/health-check-types'

interface AgentGroupResult {
  group: AgentGroup
  checks: HealthCheck[]
  lastRefreshed: Date | null
}

export function AgentsConsole() {
  const [groupResults, setGroupResults] = useState<AgentGroupResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalSummary, setTotalSummary] = useState({ passed: 0, failed: 0, errors: 0, warnings: 0 })

  // Initialize with empty results
  useEffect(() => {
    const initial = AGENT_GROUPS.map((group) => ({
      group,
      checks: [],
      lastRefreshed: null,
    }))
    setGroupResults(initial)
  }, [])

  const runAllAgents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/agents-console', { method: 'POST' })
      const data = await response.json()

      if (data.groups) {
        const results = data.groups.map((gResult: any) => ({
          group: gResult.group,
          checks: gResult.checks,
          lastRefreshed: new Date(),
        }))
        setGroupResults(results)

        // Update summary
        const allChecks = results.flatMap((r: any) => r.checks)
        setTotalSummary({
          passed: allChecks.filter((c: HealthCheck) => c.status === 'pass').length,
          failed: allChecks.filter((c: HealthCheck) => c.status === 'fail').length,
          errors: allChecks.filter((c: HealthCheck) => c.status === 'error').length,
          warnings: allChecks.filter((c: HealthCheck) => c.status === 'warning').length,
        })
      }
    } catch (error) {
      console.error('Failed to run agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const runGroupAgents = async (groupId: string) => {
    try {
      const response = await fetch('/api/agents-console', {
        method: 'POST',
        body: JSON.stringify({ groupId }),
      })
      const data = await response.json()

      if (data.group) {
        setGroupResults((prev) =>
          prev.map((r) =>
            r.group.group_id === groupId
              ? { ...r, checks: data.group.checks, lastRefreshed: new Date() }
              : r
          )
        )
      }
    } catch (error) {
      console.error('Failed to run group agents:', error)
    }
  }

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'border-lime-500/30 bg-lime-950/20 text-lime-400'
      case 'fail':
        return 'border-orange-500/30 bg-orange-950/20 text-orange-400'
      case 'error':
        return 'border-red-500/30 bg-red-950/20 text-red-400'
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/20 text-amber-400'
      default:
        return 'border-zinc-700 bg-zinc-900/30 text-zinc-400'
    }
  }

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-lime-400" />
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />
      default:
        return <Clock className="h-4 w-4 text-zinc-500" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-50">Agents Console</h2>
          <p className="text-sm text-zinc-500 mt-1">
            All {AGENT_GROUPS.reduce((sum, g) => sum + g.agents.length, 0)} monitoring agents across{' '}
            {AGENT_GROUPS.length} groups. Last refresh: {groupResults[0]?.lastRefreshed ? groupResults[0].lastRefreshed.toLocaleTimeString() : '—'}
          </p>
        </div>
        <button
          onClick={runAllAgents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-semibold hover:bg-lime-300 disabled:opacity-50 transition-colors"
        >
          <PlayCircle className="h-4 w-4" />
          {loading ? 'Running...' : 'Test All Agents'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-zinc-900/50 border border-lime-500/20 px-4 py-3">
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Passing</p>
          <p className="text-2xl font-bold text-lime-400 mt-1">{totalSummary.passed}</p>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-orange-500/20 px-4 py-3">
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Failed</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{totalSummary.failed}</p>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-red-500/20 px-4 py-3">
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Errors</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{totalSummary.errors}</p>
        </div>
        <div className="rounded-lg bg-zinc-900/50 border border-amber-500/20 px-4 py-3">
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Warnings</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{totalSummary.warnings}</p>
        </div>
      </div>

      {/* Agent Groups */}
      <div className="space-y-8">
        {groupResults.map((result) => (
          <div key={result.group.group_id} className="space-y-4">
            {/* Group Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-100">{result.group.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  every {result.group.refresh_interval_min} min · {result.checks.length} agents
                </p>
              </div>
              <button
                onClick={() => runGroupAgents(result.group.group_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            {/* Agent Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.checks.map((check) => (
                <div
                  key={check.id}
                  className={`rounded-lg border px-4 py-3 flex flex-col gap-2 ${getStatusColor(check.status)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getStatusIcon(check.status)}
                      <span className="font-semibold text-sm truncate">
                        {result.group.agents.find((a) => a.id === check.check_type.replace('_', ''))?.name ||
                          check.check_type}
                      </span>
                    </div>
                    <span className="text-xs font-mono shrink-0">{check.response_time_ms}ms</span>
                  </div>
                  <p className="text-xs leading-tight">{check.message}</p>
                  {check.error_details && (
                    <p className="text-xs opacity-70 font-mono">
                      {Object.entries(check.error_details)
                        .slice(0, 2)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
