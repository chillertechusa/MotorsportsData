'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ADVISORS,
  type AdvisorKey,
  type AdvisorReport,
  type HealthSignal,
} from '@/lib/advisor-types'
import {
  runAdvisorsNow,
  runSingleAdvisorNow,
  acknowledgeAdvisor,
} from '@/app/actions/owner-advisors'
import {
  TrendingUp,
  DollarSign,
  Users,
  Database,
  RefreshCw,
  ArrowLeft,
  Check,
  CircleAlert,
  CircleCheck,
  CircleDot,
} from 'lucide-react'

const ICONS: Record<AdvisorKey, typeof TrendingUp> = {
  growth: TrendingUp,
  revenue: DollarSign,
  retention: Users,
  data_asset: Database,
}

const SIGNAL_STYLES: Record<HealthSignal, { dot: string; badge: string; label: string; Icon: typeof CircleDot }> = {
  good: { dot: 'text-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Healthy', Icon: CircleCheck },
  watch: { dot: 'text-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Watch', Icon: CircleDot },
  risk: { dot: 'text-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'At Risk', Icon: CircleAlert },
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-gray-50 text-gray-600 border-gray-200',
}

function timeAgo(date: Date | null): string {
  if (!date) return 'never run'
  const d = new Date(date)
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AdvisorsConsoleClient({
  initialLatest,
}: {
  initialLatest: Record<AdvisorKey, AdvisorReport | null>
}) {
  const [latest, setLatest] = useState(initialLatest)
  const [selected, setSelected] = useState<AdvisorKey>('growth')
  const [isPending, startTransition] = useTransition()
  const [runningKey, setRunningKey] = useState<AdvisorKey | 'all' | null>(null)

  function runAll() {
    setRunningKey('all')
    startTransition(async () => {
      try {
        const { latest: fresh } = await runAdvisorsNow()
        setLatest(fresh)
      } finally {
        setRunningKey(null)
      }
    })
  }

  function runOne(key: AdvisorKey) {
    setRunningKey(key)
    startTransition(async () => {
      try {
        const report = await runSingleAdvisorNow(key)
        setLatest((prev) => ({ ...prev, [key]: report }))
      } finally {
        setRunningKey(null)
      }
    })
  }

  function acknowledge(key: AdvisorKey, id: string) {
    startTransition(async () => {
      await acknowledgeAdvisor(id)
      setLatest((prev) => {
        const r = prev[key]
        return r ? { ...prev, [key]: { ...r, acknowledged: true } } : prev
      })
    })
  }

  const current = latest[selected]
  const meta = ADVISORS.find((a) => a.key === selected)!
  const CurrentIcon = ICONS[selected]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/data/owner" className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> Owner Console
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Advisor Agents</h1>
            <p className="mt-1 text-gray-500">
              Scheduled agents that evaluate the business and recommend actions. Metrics are exact; narratives are AI-synthesized with a rule-based fallback.
            </p>
          </div>
          <button
            onClick={runAll}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${runningKey === 'all' ? 'animate-spin' : ''}`} />
            {runningKey === 'all' ? 'Running all…' : 'Run all advisors'}
          </button>
        </div>

        {/* Advisor cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADVISORS.map((a) => {
            const r = latest[a.key]
            const Icon = ICONS[a.key]
            const signal = r ? SIGNAL_STYLES[r.healthSignal] : null
            const isActive = selected === a.key
            return (
              <button
                key={a.key}
                onClick={() => setSelected(a.key)}
                className={`rounded-xl border bg-white p-4 text-left transition hover:shadow-md ${
                  isActive ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <Icon className="h-5 w-5 text-gray-700" />
                  {signal ? (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${signal.badge}`}>
                      <signal.Icon className="h-3 w-3" /> {signal.label}
                    </span>
                  ) : (
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-400">no data</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-gray-900">{a.label}</div>
                <div className="mt-0.5 text-xs text-gray-500">{a.role}</div>
                {r && (
                  <div className="mt-2 line-clamp-2 text-xs text-gray-600">{r.headline}</div>
                )}
                <div className="mt-2 text-[11px] text-gray-400">{timeAgo(r?.createdAt ?? null)}</div>
              </button>
            )
          })}
        </div>

        {/* Detail panel */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <CurrentIcon className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{meta.label}</h2>
                <p className="text-sm text-gray-500">{meta.description}</p>
              </div>
            </div>
            <button
              onClick={() => runOne(selected)}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${runningKey === selected ? 'animate-spin' : ''}`} />
              {runningKey === selected ? 'Running…' : 'Run now'}
            </button>
          </div>

          {!current ? (
            <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              This advisor has not run yet. Click <span className="font-medium">Run now</span> to generate its first report.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Headline + signal */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const s = SIGNAL_STYLES[current.healthSignal]
                    return <s.Icon className={`h-5 w-5 ${s.dot}`} />
                  })()}
                  <span className="font-semibold text-gray-900">{current.headline}</span>
                </div>
                {current.summary && <p className="mt-2 text-sm leading-relaxed text-gray-600">{current.summary}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                  <span>Updated {timeAgo(current.createdAt)}</span>
                  <span aria-hidden>·</span>
                  <span>Source: {current.synthesizedBy === 'rules' ? 'rule-based' : current.synthesizedBy}</span>
                  <span aria-hidden>·</span>
                  <span>Period {current.period}</span>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Recommendations</h3>
                <div className="space-y-3">
                  {current.recommendations.map((rec, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-gray-900">{rec.title}</span>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.low}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{rec.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Metrics</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(current.metrics).map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="text-lg font-bold text-gray-900">{v === null ? '—' : String(v)}</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toLowerCase()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acknowledge */}
              <div className="flex justify-end">
                {current.acknowledged ? (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                    <Check className="h-4 w-4" /> Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => acknowledge(selected, current.id)}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> Mark reviewed
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
