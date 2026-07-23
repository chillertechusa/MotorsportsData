'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Shield,
  Database,
  CreditCard,
  Cpu,
} from 'lucide-react'
import { AGENT_GROUPS, AgentGroup } from '@/app/actions/agents-orchestrator'
import { HealthCheck } from '@/lib/health-check-types'

interface AgentGroupResult {
  group: AgentGroup
  checks: HealthCheck[]
  lastRefreshed: Date | null
}

const GROUP_ICONS: Record<string, React.ReactNode> = {
  platform_health: <Shield className="h-4 w-4" />,
  smx_checkout: <CreditCard className="h-4 w-4" />,
  data_telemetry: <Database className="h-4 w-4" />,
  ai_systems: <Cpu className="h-4 w-4" />,
  pre_launch_sentinel: <Zap className="h-4 w-4" />,
}

const GROUP_ACCENT: Record<string, string> = {
  platform_health: 'border-lime-500/30 text-lime-400',
  smx_checkout: 'border-amber-500/30 text-amber-400',
  data_telemetry: 'border-sky-500/30 text-sky-400',
  ai_systems: 'border-violet-500/30 text-violet-400',
  pre_launch_sentinel: 'border-red-500/30 text-red-400',
}

function StatusBadge({ status }: { status: HealthCheck['status'] }) {
  const map: Record<HealthCheck['status'], { label: string; cls: string; icon: React.ReactNode }> = {
    pass: { label: 'PASS', cls: 'bg-lime-950/60 text-lime-400 border-lime-500/30', icon: <CheckCircle2 className="h-3 w-3" /> },
    fail: { label: 'FAIL', cls: 'bg-orange-950/60 text-orange-400 border-orange-500/30', icon: <AlertTriangle className="h-3 w-3" /> },
    error: { label: 'ERROR', cls: 'bg-red-950/60 text-red-400 border-red-500/30', icon: <AlertCircle className="h-3 w-3" /> },
    warning: { label: 'WARN', cls: 'bg-amber-950/60 text-amber-400 border-amber-500/30', icon: <AlertTriangle className="h-3 w-3" /> },
  }
  const m = map[status] ?? { label: 'IDLE', cls: 'bg-zinc-900 text-zinc-500 border-zinc-700', icon: <Clock className="h-3 w-3" /> }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-mono font-bold ${m.cls}`}>
      {m.icon}
      {m.label}
    </span>
  )
}

function LaunchReadinessBanner({ summary }: { summary: { total: number; passed: number; failed: number; errors: number; warnings: number } }) {
  if (summary.total === 0) return null
  const issues = summary.failed + summary.errors
  const pct = Math.round((summary.passed / summary.total) * 100)
  const ready = issues === 0 && summary.warnings === 0
  const borderCls = ready ? 'border-lime-500/40 bg-lime-950/20' : issues > 0 ? 'border-red-500/40 bg-red-950/20' : 'border-amber-500/40 bg-amber-950/20'
  const labelCls = ready ? 'text-lime-400' : issues > 0 ? 'text-red-400' : 'text-amber-400'
  const label = ready ? 'LAUNCH READY' : issues > 0 ? 'NOT LAUNCH READY' : 'REVIEW WARNINGS'

  return (
    <div className={`rounded-lg border px-5 py-4 flex items-center justify-between gap-4 ${borderCls}`}>
      <div className="flex items-center gap-3">
        <Activity className={`h-5 w-5 ${labelCls}`} />
        <div>
          <p className={`text-sm font-bold font-mono tracking-widest ${labelCls}`}>{label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {summary.passed}/{summary.total} checks passing{summary.warnings > 0 ? ` · ${summary.warnings} warning${summary.warnings > 1 ? 's' : ''}` : ''}{issues > 0 ? ` · ${issues} issue${issues > 1 ? 's' : ''}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* progress bar */}
        <div className="hidden sm:block w-40 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${ready ? 'bg-lime-400' : issues > 0 ? 'bg-red-500' : 'bg-amber-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xl font-bold font-mono ${labelCls}`}>{pct}%</span>
      </div>
    </div>
  )
}

export function AgentsConsole() {
  const [groupResults, setGroupResults] = useState<AgentGroupResult[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingGroup, setLoadingGroup] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [totalSummary, setTotalSummary] = useState({ total: 0, passed: 0, failed: 0, errors: 0, warnings: 0 })
  const [lastFullRun, setLastFullRun] = useState<Date | null>(null)

  useEffect(() => {
    const initial = AGENT_GROUPS.map((group) => ({
      group,
      checks: [],
      lastRefreshed: null,
    }))
    setGroupResults(initial)
  }, [])

  const recomputeSummary = useCallback((results: AgentGroupResult[]) => {
    const all = results.flatMap((r) => r.checks)
    setTotalSummary({
      total: all.length,
      passed: all.filter((c) => c.status === 'pass').length,
      failed: all.filter((c) => c.status === 'fail').length,
      errors: all.filter((c) => c.status === 'error').length,
      warnings: all.filter((c) => c.status === 'warning').length,
    })
  }, [])

  const runAllAgents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/agents-console', { method: 'POST' })
      const data = await response.json()
      if (data.groups) {
        const results: AgentGroupResult[] = data.groups.map((gResult: any) => ({
          group: gResult.group,
          checks: gResult.checks,
          lastRefreshed: new Date(),
        }))
        setGroupResults(results)
        recomputeSummary(results)
        setLastFullRun(new Date())
      }
    } catch (error) {
      console.error('[v0] Agents console run failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const runGroupAgents = async (groupId: string) => {
    setLoadingGroup(groupId)
    try {
      const response = await fetch('/api/agents-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      })
      const data = await response.json()
      if (data.group) {
        const next = groupResults.map((r) =>
          r.group.group_id === groupId
            ? { ...r, checks: data.group.checks, lastRefreshed: new Date() }
            : r
        )
        setGroupResults(next)
        recomputeSummary(next)
      }
    } catch (error) {
      console.error('[v0] Group agent run failed:', error)
    } finally {
      setLoadingGroup(null)
    }
  }

  const toggleCollapse = (groupId: string) =>
    setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }))

  const totalAgents = AGENT_GROUPS.reduce((s, g) => s + g.agents.length, 0)

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-lime-400" />
            <h2
              className="text-xl font-bold text-zinc-50 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '0.05em' }}
            >
              Pre-Launch Agent Console
            </h2>
            <span className="px-2 py-0.5 rounded bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-mono font-bold">
              SMX 2027
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            {totalAgents} agents across {AGENT_GROUPS.length} groups.{' '}
            {lastFullRun ? `Last full run: ${lastFullRun.toLocaleTimeString()}` : 'Not yet run this session.'}
          </p>
        </div>
        <button
          onClick={runAllAgents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-bold text-sm hover:bg-lime-300 disabled:opacity-50 transition-colors shrink-0"
        >
          {loading
            ? <RefreshCw className="h-4 w-4 animate-spin" />
            : <PlayCircle className="h-4 w-4" />
          }
          {loading ? 'Running All...' : 'Run All Agents'}
        </button>
      </div>

      {/* ── Launch Readiness Banner ──────────────────────────────────── */}
      <LaunchReadinessBanner summary={totalSummary} />

      {/* ── Summary KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Passing', value: totalSummary.passed, cls: 'border-lime-500/20 text-lime-400' },
          { label: 'Failed', value: totalSummary.failed, cls: 'border-orange-500/20 text-orange-400' },
          { label: 'Errors', value: totalSummary.errors, cls: 'border-red-500/20 text-red-400' },
          { label: 'Warnings', value: totalSummary.warnings, cls: 'border-amber-500/20 text-amber-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`rounded-lg bg-zinc-900/50 border px-4 py-3 ${cls}`}>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${cls.split(' ')[1]}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Agent Groups ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        {groupResults.map((result) => {
          const isCollapsed = collapsed[result.group.group_id]
          const groupIssues = result.checks.filter((c) => c.status !== 'pass').length
          const accent = GROUP_ACCENT[result.group.group_id] ?? 'border-zinc-700 text-zinc-400'
          const accentBorder = accent.split(' ')[0]
          const accentText = accent.split(' ')[1]
          const isRunningGroup = loadingGroup === result.group.group_id

          return (
            <div key={result.group.group_id} className={`rounded-xl border bg-zinc-900/30 ${accentBorder}`}>
              {/* Group Header */}
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  onClick={() => toggleCollapse(result.group.group_id)}
                >
                  <span className={accentText}>
                    {GROUP_ICONS[result.group.group_id] ?? <Activity className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-100 text-sm">{result.group.name}</span>
                      {groupIssues > 0 && result.checks.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-400 font-mono">
                          {groupIssues} issue{groupIssues > 1 ? 's' : ''}
                        </span>
                      )}
                      {groupIssues === 0 && result.checks.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-lime-950/40 border border-lime-500/20 text-lime-400 font-mono">
                          all clear
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      every {result.group.refresh_interval_min} min · {result.group.agents.length} agents
                      {result.lastRefreshed && ` · refreshed ${result.lastRefreshed.toLocaleTimeString()}`}
                    </p>
                  </div>
                  <span className="ml-auto text-zinc-600 shrink-0">
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); runGroupAgents(result.group.group_id) }}
                  disabled={isRunningGroup || loading}
                  className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors disabled:opacity-40 shrink-0"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRunningGroup ? 'animate-spin' : ''}`} />
                  {isRunningGroup ? 'Running...' : 'Run'}
                </button>
              </div>

              {/* Agent Cards — collapsible */}
              {!isCollapsed && (
                <div className="px-5 pb-5">
                  {result.checks.length === 0 ? (
                    <div className="flex items-center gap-2 py-4 text-zinc-600 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Not yet run. Click Run to execute this group.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.checks.map((check, i) => {
                        const agentDef = result.group.agents.find(
                          (a) => a.id === check.check_type || check.check_type.startsWith(a.id)
                        )
                        const name = agentDef?.name ?? check.check_type.replace(/_/g, ' ')
                        return (
                          <div
                            key={`${check.id}-${i}`}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-sm text-zinc-200 truncate">{name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-mono text-zinc-600">{check.response_time_ms}ms</span>
                                <StatusBadge status={check.status} />
                              </div>
                            </div>
                            {check.message && (
                              <p className="text-xs text-zinc-500 leading-snug">{check.message}</p>
                            )}
                            {check.error_details && check.status !== 'pass' && (
                              <div className="mt-1 rounded bg-zinc-950/60 border border-zinc-800 px-2.5 py-1.5">
                                <p className="text-xs font-mono text-zinc-500 break-all">
                                  {Object.entries(check.error_details)
                                    .filter(([k]) => k !== 'error' || check.status !== 'pass')
                                    .slice(0, 3)
                                    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                                    .join('\n')}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
