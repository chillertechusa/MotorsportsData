'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, Timer, Dumbbell, MapPin, Bike, BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface YearStats {
  totalSessions: number
  totalHours: number
  timedSessions: number
  bestLapSeconds: number | null
  uniqueTracks: number
  trackList: string[]
}

interface MonthBreakdown {
  month: string
  sessions: number
  hours: number
  bestLap: number | null
}

interface VehicleStat {
  id: string
  name: string
  discipline: string | null
  sessions: number
  hours: number
  bestLap: number | null
  tracks: number
}

interface LapPoint {
  date: string | null
  lapSeconds: number | null
  track: string | null
}

interface AnalyticsData {
  year: number
  compareYear: number
  vehicles: VehicleStat[]
  yearStats: YearStats | null
  compareStats: YearStats | null
  monthlyBreakdown: MonthBreakdown[]
  bestLapTrend: LapPoint[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLap(seconds: number | null): string {
  if (seconds == null) return '--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toFixed(3).padStart(6, '0')}`
}

function delta(current: number | null, prior: number | null, lowerIsBetter = false): { pct: number | null; improved: boolean | null } {
  if (current == null || prior == null || prior === 0) return { pct: null, improved: null }
  const pct = ((current - prior) / prior) * 100
  const improved = lowerIsBetter ? pct < 0 : pct > 0
  return { pct: Math.abs(pct), improved }
}

function formatDelta(d: ReturnType<typeof delta>, suffix = '%'): string {
  if (d.pct == null) return '--'
  return `${d.improved ? '+' : '-'}${d.pct.toFixed(1)}${suffix}`
}

// ── Mini bar chart (pure CSS) ─────────────────────────────────────────────────

function BarChart({ data, max, color = 'bg-lime-400' }: { data: number[]; max: number; color?: string }) {
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} opacity-80 transition-all`}
          style={{ height: max > 0 ? `${Math.max(2, (v / max) * 48)}px` : '2px' }}
          title={String(v)}
        />
      ))}
    </div>
  )
}

// ── Lap trend spark line ───────────────────────────────────────────────────────

function LapTrendLine({ points }: { points: LapPoint[] }) {
  const timed = points.filter((p) => p.lapSeconds != null)
  if (timed.length < 2) {
    return (
      <div className="flex items-center justify-center h-24 text-zinc-500 text-sm">
        Need 2+ timed sessions to show a trend
      </div>
    )
  }
  const laps = timed.map((p) => p.lapSeconds!)
  const minLap = Math.min(...laps)
  const maxLap = Math.max(...laps)
  const range = maxLap - minLap || 1
  const W = 480
  const H = 80
  const pts = timed.map((p, i) => {
    const x = (i / (timed.length - 1)) * W
    // Lower lap = better = higher on chart
    const y = H - ((maxLap - p.lapSeconds!) / range) * (H - 8) - 4
    return `${x},${y}`
  })
  const d = `M ${pts.join(' L ')}`
  const bestIdx = laps.indexOf(minLap)

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
        {/* gradient fill */}
        <defs>
          <linearGradient id="lapGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L ${(timed.length - 1) / (timed.length - 1) * W},${H} L 0,${H} Z`} fill="url(#lapGrad)" />
        <path d={d} fill="none" stroke="#a3e635" strokeWidth="2" strokeLinejoin="round" />
        {/* best lap dot */}
        {timed[bestIdx] && (
          <circle
            cx={(bestIdx / (timed.length - 1)) * W}
            cy={H - ((maxLap - laps[bestIdx]) / range) * (H - 8) - 4}
            r="4"
            fill="#a3e635"
          />
        )}
      </svg>
      <div className="flex justify-between text-xs text-zinc-500 mt-1">
        <span>Session 1</span>
        <span className="text-lime-400 font-medium">PB: {formatLap(minLap)}</span>
        <span>Session {timed.length}</span>
      </div>
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  delta: d,
  icon: Icon,
  lowerIsBetter,
}: {
  label: string
  value: string
  sub?: string
  delta?: ReturnType<typeof delta>
  icon: typeof TrendingUp
  lowerIsBetter?: boolean
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-2xl font-black text-zinc-50 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
      {d && d.pct != null && (
        <div className={`flex items-center gap-1 text-xs font-medium ${d.improved ? 'text-lime-400' : 'text-red-400'}`}>
          {d.improved ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {formatDelta(d)} vs prior year
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ViewHistoricalAnalytics() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (y: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/md-analytics?year=${y}&compareYear=${y - 1}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(year) }, [year, fetchData])

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!loading && data && data.vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <BarChart2 className="h-10 w-10 text-zinc-600" />
        <p className="text-zinc-400 font-medium">No vehicles yet</p>
        <p className="text-zinc-600 text-sm max-w-xs">Add a vehicle and log sessions to see year-over-year performance analytics.</p>
      </div>
    )
  }

  const s = data?.yearStats
  const c = data?.compareStats

  const sessionDelta = delta(s?.totalSessions ?? null, c?.totalSessions ?? null)
  const hoursDelta = delta(s?.totalHours ?? null, c?.totalHours ?? null)
  const lapDelta = delta(s?.bestLapSeconds ?? null, c?.bestLapSeconds ?? null, true)
  const tracksDelta = delta(s?.uniqueTracks ?? null, c?.uniqueTracks ?? null)

  const maxSessions = data ? Math.max(...data.monthlyBreakdown.map((m) => m.sessions), 1) : 1
  const maxHours = data ? Math.max(...data.monthlyBreakdown.map((m) => m.hours), 0.1) : 0.1

  return (
    <div className="flex flex-col gap-6 p-1">

      {/* Year selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="h-8 w-8 rounded-lg border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-50 hover:border-zinc-500 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-2xl font-black text-zinc-50 tabular-nums min-w-[4ch] text-center">{year}</div>
        <button
          onClick={() => setYear((y) => Math.min(y + 1, currentYear))}
          disabled={year >= currentYear}
          className="h-8 w-8 rounded-lg border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-50 hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="text-xs text-zinc-500 ml-1">vs {year - 1}</span>
        {loading && <div className="ml-auto h-4 w-4 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* KPI grid */}
      {s && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Sessions" value={String(s.totalSessions)} sub={`${s.timedSessions} timed`} delta={sessionDelta} icon={Bike} />
          <KpiCard label="Ride Hours" value={`${s.totalHours}h`} delta={hoursDelta} icon={Timer} />
          <KpiCard label="Best Lap" value={formatLap(s.bestLapSeconds)} sub={c?.bestLapSeconds ? `Prior: ${formatLap(c.bestLapSeconds)}` : undefined} delta={lapDelta} icon={TrendingUp} lowerIsBetter />
          <KpiCard label="Tracks" value={String(s.uniqueTracks)} sub={s.trackList.slice(0, 2).join(', ')} delta={tracksDelta} icon={MapPin} />
        </div>
      )}

      {/* Best lap trend */}
      {data && data.bestLapTrend.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Best Lap Trend — {year}</h3>
          <LapTrendLine points={data.bestLapTrend} />
        </div>
      )}

      {/* Monthly breakdown charts */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sessions per month */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Sessions per Month</h3>
            <BarChart data={data.monthlyBreakdown.map((m) => m.sessions)} max={maxSessions} color="bg-lime-400" />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              {['Jan', 'Apr', 'Jul', 'Oct'].map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>

          {/* Ride hours per month */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Ride Hours per Month</h3>
            <BarChart data={data.monthlyBreakdown.map((m) => m.hours)} max={maxHours} color="bg-sky-400" />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              {['Jan', 'Apr', 'Jul', 'Oct'].map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* YoY comparison table */}
      {s && c && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Year-over-Year</h3>
            <div className="flex gap-4 text-xs text-zinc-500">
              <span className="text-lime-400 font-bold">{year}</span>
              <span>{year - 1}</span>
            </div>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {[
                { label: 'Total Sessions', curr: s.totalSessions, prior: c.totalSessions, fmt: (v: number) => String(v) },
                { label: 'Timed Sessions', curr: s.timedSessions, prior: c.timedSessions, fmt: (v: number) => String(v) },
                { label: 'Ride Hours', curr: s.totalHours, prior: c.totalHours, fmt: (v: number) => `${v}h` },
                { label: 'Best Lap', curr: s.bestLapSeconds, prior: c.bestLapSeconds, fmt: formatLap, lowerIsBetter: true },
                { label: 'Unique Tracks', curr: s.uniqueTracks, prior: c.uniqueTracks, fmt: (v: number) => String(v) },
              ].map(({ label, curr, prior, fmt, lowerIsBetter }) => {
                const d2 = delta(curr ?? null, prior ?? null, lowerIsBetter)
                return (
                  <tr key={label} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-5 py-2.5 text-zinc-400">{label}</td>
                    <td className="px-5 py-2.5 text-lime-400 font-bold tabular-nums text-right">{fmt(curr as number)}</td>
                    <td className="px-5 py-2.5 text-zinc-500 tabular-nums text-right">{fmt(prior as number)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {d2.pct != null ? (
                        <span className={`flex items-center justify-end gap-1 text-xs font-medium ${d2.improved ? 'text-lime-400' : 'text-red-400'}`}>
                          {d2.improved ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {formatDelta(d2)}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">--</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-vehicle breakdown */}
      {data && data.vehicles.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Per-Vehicle — {year}</h3>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {data.vehicles.map((v) => (
              <div key={v.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-200 truncate">{v.name}</div>
                  {v.discipline && <div className="text-xs text-zinc-500 capitalize">{v.discipline.replace('_', ' / ')}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-zinc-50 tabular-nums">{v.sessions} <span className="text-zinc-500 font-normal text-xs">sessions</span></div>
                  <div className="text-xs text-zinc-500">{v.hours}h &middot; {v.tracks} track{v.tracks !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-right shrink-0 w-20">
                  <div className="text-sm font-bold text-lime-400 tabular-nums">{formatLap(v.bestLap)}</div>
                  <div className="text-xs text-zinc-500">best lap</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly table (scrollable) */}
      {data && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Monthly Breakdown — {year}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-5 py-2 text-left text-xs font-medium text-zinc-500">Month</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-zinc-500">Sessions</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-zinc-500">Hours</th>
                  <th className="px-5 py-2 text-right text-xs font-medium text-zinc-500">Best Lap</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyBreakdown.map((m) => (
                  <tr key={m.month} className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-2 text-zinc-400">{m.month}</td>
                    <td className="px-5 py-2 text-right tabular-nums">
                      {m.sessions > 0 ? (
                        <span className="text-zinc-200 font-medium">{m.sessions}</span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-right tabular-nums text-zinc-400">{m.hours > 0 ? `${m.hours}h` : '—'}</td>
                    <td className="px-5 py-2 text-right tabular-nums font-medium text-lime-400">{m.bestLap != null ? formatLap(m.bestLap) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
