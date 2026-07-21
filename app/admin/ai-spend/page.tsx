'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Zap, DollarSign, Activity, Clock } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RouteRow {
  route: string
  model: string
  calls: number
  costUSD: number
  inputTokens: number
  outputTokens: number
  avgLatencyMs: number | null
  costPerCall: number
}

interface SparkPoint {
  date: string
  costUSD: number
}

interface SpendData {
  summary: {
    totalCostUSD: number
    cost30dUSD: number
    cost24hUSD: number
    totalCalls: number
    totalInputTokens: number
    totalOutputTokens: number
  }
  routes: RouteRow[]
  sparkline: SparkPoint[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtUSD(v: number) {
  if (v < 0.0001) return '$0.0000'
  if (v < 1) return `$${v.toFixed(4)}`
  return `$${v.toFixed(2)}`
}

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const MODEL_TIER: Record<string, { label: string; color: string }> = {
  'google/gemini-2.5-flash': { label: 'Flash', color: 'text-lime-400 bg-lime-400/10 border-lime-400/30' },
  'google/gemini-2.5-pro':   { label: 'Pro',   color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  'anthropic/claude-opus-4-1': { label: 'Opus', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  'anthropic/claude-opus-4-8': { label: 'Opus', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  'openai/gpt-4-turbo':      { label: 'GPT-4T', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  'openai/gpt-4o':           { label: 'GPT-4o', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
}

function ModelBadge({ model }: { model: string }) {
  const tier = MODEL_TIER[model] ?? { label: model.split('/').pop() ?? model, color: 'text-zinc-400 bg-zinc-800 border-zinc-700' }
  return (
    <span className={`inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest rounded-sm ${tier.color}`}>
      {tier.label}
    </span>
  )
}

// Inline mini bar chart — no recharts dependency needed for a simple bar
function SparkBars({ data }: { data: SparkPoint[] }) {
  if (!data.length) return <p className="text-zinc-600 text-xs font-mono">No data yet</p>
  const max = Math.max(...data.map(d => d.costUSD), 0.000001)
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div
            className="w-full bg-lime-400/70 hover:bg-lime-400 transition-colors"
            style={{ height: `${Math.max(2, (d.costUSD / max) * 40)}px` }}
          />
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 whitespace-nowrap bg-zinc-900 border border-zinc-700 px-1 py-0.5 z-10">
            {d.date.slice(5)}: {fmtUSD(d.costUSD)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AISpendPage() {
  const [data, setData] = useState<SpendData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/ai-spend')
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(e.error ?? res.statusText)
      }
      setData(await res.json())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/data/owner"
              className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Owner Console
            </Link>
            <span className="text-zinc-700">/</span>
            <h1
              className="text-zinc-100 uppercase tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.8rem' }}
            >
              AI Spend Monitor
            </h1>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 h-8 px-3 rounded-none border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors font-mono text-xs uppercase tracking-widest text-zinc-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 font-mono text-xs text-zinc-600 uppercase tracking-widest animate-pulse">
            Loading spend data...
          </div>
        )}

        {error && (
          <div className="border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400 font-mono">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: '24h Spend',    value: fmtUSD(data.summary.cost24hUSD),    icon: DollarSign, accent: 'lime' },
                { label: '30d Spend',    value: fmtUSD(data.summary.cost30dUSD),    icon: Activity,   accent: 'zinc' },
                { label: 'All-time',     value: fmtUSD(data.summary.totalCostUSD),  icon: Zap,        accent: 'zinc' },
                { label: 'Total Calls',  value: data.summary.totalCalls.toLocaleString(), icon: Clock, accent: 'zinc' },
              ].map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className="border border-zinc-800 bg-zinc-900/50 px-4 py-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${accent === 'lime' ? 'text-lime-400' : 'text-zinc-600'}`} />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
                  </div>
                  <p className={`font-mono text-lg font-bold ${accent === 'lime' ? 'text-lime-400' : 'text-zinc-100'}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Token totals */}
            <div className="flex items-center gap-6 border border-zinc-800 bg-zinc-900/30 px-4 py-3">
              <div>
                <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Input tokens</span>
                <p className="font-mono text-sm text-zinc-300">{fmtTokens(data.summary.totalInputTokens)}</p>
              </div>
              <div className="h-6 border-l border-zinc-800" />
              <div>
                <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Output tokens</span>
                <p className="font-mono text-sm text-zinc-300">{fmtTokens(data.summary.totalOutputTokens)}</p>
              </div>
              <div className="h-6 border-l border-zinc-800" />
              <div>
                <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Ratio in:out</span>
                <p className="font-mono text-sm text-zinc-300">
                  {data.summary.totalOutputTokens
                    ? `${(data.summary.totalInputTokens / data.summary.totalOutputTokens).toFixed(1)}x`
                    : '—'}
                </p>
              </div>
            </div>

            {/* 14-day sparkline */}
            <div className="border border-zinc-800 bg-zinc-900/30 px-4 py-4 space-y-3">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">14-day daily spend</p>
              <SparkBars data={data.sparkline} />
              <div className="flex gap-4 pt-1">
                {data.sparkline.slice(-3).map(d => (
                  <div key={d.date} className="font-mono text-[10px] text-zinc-600">
                    {d.date.slice(5)}: <span className="text-zinc-400">{fmtUSD(d.costUSD)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-route breakdown */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                Per-route breakdown — sorted by total cost
              </p>

              {data.routes.length === 0 && (
                <div className="border border-zinc-800 bg-zinc-900/30 px-4 py-8 text-center">
                  <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">No calls logged yet</p>
                  <p className="text-zinc-600 text-sm mt-2">AI calls will appear here once users start making requests.</p>
                </div>
              )}

              {data.routes.map((r) => {
                const pct = data.summary.totalCostUSD > 0 ? (r.costUSD / data.summary.totalCostUSD) * 100 : 0
                return (
                  <div key={r.route} className="border border-zinc-800 bg-zinc-900/40 px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <ModelBadge model={r.model} />
                        <code className="text-zinc-200 text-xs font-mono truncate">{r.route}</code>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="font-mono text-sm font-bold text-zinc-100">{fmtUSD(r.costUSD)}</p>
                          <p className="font-mono text-[10px] text-zinc-600">{r.calls.toLocaleString()} calls</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-zinc-400">{fmtUSD(r.costPerCall)}/call</p>
                          <p className="font-mono text-[10px] text-zinc-600">
                            {r.avgLatencyMs != null ? `${r.avgLatencyMs}ms avg` : '—'}
                          </p>
                        </div>
                        <div className="text-right w-10">
                          <p className="font-mono text-xs text-zinc-500">{pct.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    {/* Cost share bar */}
                    <div className="h-0.5 bg-zinc-800 w-full">
                      <div className="h-0.5 bg-lime-400/60" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-4 text-[10px] font-mono text-zinc-600">
                      <span>{fmtTokens(r.inputTokens)} in</span>
                      <span>{fmtTokens(r.outputTokens)} out</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Model cost reference */}
            <div className="border border-zinc-800 bg-zinc-900/20 px-4 py-4 space-y-3">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Model cost reference (per 1M tokens)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { model: 'google/gemini-2.5-flash', input: '$0.30', output: '$1.00' },
                  { model: 'google/gemini-2.5-pro',   input: '$7.00', output: '$21.00' },
                  { model: 'anthropic/claude-opus-4-1', input: '$75.00', output: '$225.00' },
                ].map(({ model, input, output }) => (
                  <div key={model} className="flex items-center gap-2">
                    <ModelBadge model={model} />
                    <span className="font-mono text-[10px] text-zinc-500">
                      {input} / {output}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
