'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Shield,
  ShieldAlert,
  KeyRound,
  UserCheck,
  Eye,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Radar,
  ArrowLeft,
} from 'lucide-react'
import {
  SENTINEL_LENSES,
  type SentinelLens,
  type SentinelStats,
  type SentinelEventRow,
} from '@/lib/sentinel-types'
import {
  loadSentinelConsole,
  acknowledgeEvent,
  triggerSentinelSweep,
} from '@/app/actions/owner-sentinel'

const LENS_ICON: Record<SentinelLens, typeof Shield> = {
  access: KeyRound,
  consent: UserCheck,
  ip: Eye,
  security: Lock,
}

function timeAgo(d: Date | string | null): string {
  if (!d) return '—'
  const t = typeof d === 'string' ? new Date(d).getTime() : d.getTime()
  const secs = Math.round((Date.now() - t) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

function severityStyles(sev: string) {
  switch (sev) {
    case 'critical':
      return { chip: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', Icon: AlertCircle }
    case 'warning':
      return { chip: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500', Icon: AlertTriangle }
    default:
      return { chip: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', Icon: Shield }
  }
}

function humanize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function SentinelConsoleClient({
  initialStats,
  initialEvents,
}: {
  initialStats: SentinelStats
  initialEvents: SentinelEventRow[]
}) {
  const [stats, setStats] = useState(initialStats)
  const [events, setEvents] = useState(initialEvents)
  const [activeLens, setActiveLens] = useState<SentinelLens | 'all'>('all')
  const [sweepNote, setSweepNote] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const reload = (lens: SentinelLens | 'all') => {
    startTransition(async () => {
      const data = await loadSentinelConsole(lens === 'all' ? undefined : lens)
      setStats(data.stats)
      setEvents(data.events)
    })
  }

  const selectLens = (lens: SentinelLens | 'all') => {
    setActiveLens(lens)
    reload(lens)
  }

  const onAcknowledge = (id: string) => {
    startTransition(async () => {
      await acknowledgeEvent(id)
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, acknowledged: true } : e)))
      const data = await loadSentinelConsole(activeLens === 'all' ? undefined : activeLens)
      setStats(data.stats)
    })
  }

  const onRunSweep = () => {
    setSweepNote(null)
    startTransition(async () => {
      const res = await triggerSentinelSweep()
      setSweepNote(
        res.totalCreated > 0
          ? `Sweep complete — ${res.totalCreated} new event${res.totalCreated === 1 ? '' : 's'} detected.`
          : 'Sweep complete — no new patterns detected.',
      )
      const data = await loadSentinelConsole(activeLens === 'all' ? undefined : activeLens)
      setStats(data.stats)
      setEvents(data.events)
    })
  }

  const totalEvents = SENTINEL_LENSES.reduce((s, l) => s + stats.byLens[l.key].total, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/data/owner/agents-console"
              className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Agents Console
            </Link>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <Radar className="h-7 w-7 text-emerald-600" />
              Sentinel Squad
            </h1>
            <p className="mt-1 text-gray-600">
              One engine, four lenses. Detect, log, and alert — no auto-blocking. You stay in control.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => reload(activeLens)} disabled={pending} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${pending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={onRunSweep} disabled={pending} className="gap-2">
              <Radar className="h-4 w-4" />
              Run sweep now
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            DRAFT — this is automated monitoring, not a professional security audit. Have a security
            professional review the platform&apos;s posture before relying on it in production.
          </span>
        </div>

        {sweepNote && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {sweepNote}
          </div>
        )}

        {/* Lens cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SENTINEL_LENSES.map((lens) => {
            const s = stats.byLens[lens.key]
            const Icon = LENS_ICON[lens.key]
            const isActive = activeLens === lens.key
            const alarm = s.critical > 0 ? 'critical' : s.unacknowledged > 0 ? 'warning' : 'ok'
            return (
              <button
                key={lens.key}
                onClick={() => selectLens(isActive ? 'all' : lens.key)}
                className={`rounded-lg border p-4 text-left transition hover:shadow-md ${
                  isActive ? 'border-emerald-400 bg-white ring-2 ring-emerald-100' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <Icon className="h-5 w-5 text-gray-700" />
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      alarm === 'critical' ? 'bg-red-500' : alarm === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    aria-hidden
                  />
                </div>
                <div className="text-sm font-semibold text-gray-900">{lens.label}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{s.total}</span>
                  <span className="text-xs text-gray-500">events</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1 text-xs">
                  {s.critical > 0 && (
                    <span className="rounded border border-red-200 bg-red-100 px-1.5 py-0.5 text-red-700">
                      {s.critical} critical
                    </span>
                  )}
                  {s.unacknowledged > 0 ? (
                    <span className="rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-amber-800">
                      {s.unacknowledged} open
                    </span>
                  ) : (
                    <span className="rounded border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                      clear
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{lens.description}</p>
              </button>
            )
          })}
        </div>

        {/* Feed header + filter */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Event Feed
            <span className="ml-2 text-sm font-normal text-gray-500">
              {activeLens === 'all' ? `${totalEvents} total` : `${humanize(activeLens)} lens`}
            </span>
          </h2>
          {activeLens !== 'all' && (
            <button onClick={() => selectLens('all')} className="text-sm text-emerald-700 hover:underline">
              Show all lenses
            </button>
          )}
        </div>

        {/* Feed */}
        <div className="space-y-2">
          {events.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
              No events in this view. Inline hooks log in real time; the sweep finds patterns on a schedule.
            </div>
          )}
          {events.map((e) => {
            const sev = severityStyles(e.severity)
            const target =
              e.externalAccountName ||
              e.teamName ||
              (e.targetRef ? e.targetRef.replace(/^email:/, '') : null) ||
              e.actorUserId ||
              '—'
            return (
              <div
                key={e.id}
                className={`flex flex-wrap items-start gap-3 rounded-lg border bg-white p-3 ${
                  e.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${sev.dot}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{humanize(e.eventType)}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-xs ${sev.chip}`}>{e.severity}</span>
                    <span className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs capitalize text-gray-600">
                      {e.sentinel}
                    </span>
                    <span className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500">
                      {e.detectedBy}
                    </span>
                    {e.acknowledged && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> acknowledged
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-medium text-gray-800">{target}</span>
                    {e.ipAddress && <span className="text-gray-400"> · {e.ipAddress}</span>}
                    <span className="text-gray-400"> · {timeAgo(e.createdAt)}</span>
                  </div>
                  {Object.keys(e.detail || {}).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      {Object.entries(e.detail)
                        .slice(0, 5)
                        .map(([k, v]) => (
                          <span key={k}>
                            <span className="text-gray-400">{humanize(k)}:</span> {String(v)}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                {!e.acknowledged && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAcknowledge(e.id)}
                    disabled={pending}
                    className="shrink-0"
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
