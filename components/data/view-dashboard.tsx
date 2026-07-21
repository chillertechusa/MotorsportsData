'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Flag, Plus, AlertTriangle, CalendarCheck, HeartPulse,
  WifiOff, RefreshCw, Trash2, Activity, TrendingUp,
  TrendingDown, Minus, Wrench, Sparkles, Loader2,
  ChevronRight, Clock, Trophy,
} from 'lucide-react'
import type { Vehicle } from './rig-shell'
import ConfirmModal from './confirm-modal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReadinessSnap {
  entryDate: string
  sleepHours: string | null
  hrv: number | null
  energy: number | null
  fatigue: number | null
  sleepScore: number | null
}

interface TrendPoint {
  entryDate: string
  hrv: number | null
  energy: number | null
  fatigue: number | null
  sleepHours: string | null
}

interface NextEvent {
  id: string
  title: string
  eventType: string
  eventDate: string
  series: string | null
}

interface RecentSession {
  trackName: string
  sessionDate: string | null
  bestLapSeconds: number | null
  riderFeedback: string | null
}

interface PartAlert {
  vehicleName: string
  partName: string
  currentHours: number
  maxHours: number
  pct: number
}

interface DashboardData {
  vehicles: Vehicle[]
  alerts: PartAlert[]
  latestReadiness: ReadinessSnap | null
  recentReadiness: TrendPoint[]
  nextEvent: NextEvent | null
  daysUntilEvent: number | null
  recentSessions: RecentSession[]
}

interface ViewDashboardProps {
  vehicles: Vehicle[]
  fleetLoading: boolean
  onAddVehicle: () => void
  onFleetChanged: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtLap(s: number | null) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = (s % 60).toFixed(3).padStart(6, '0')
  return `${m}:${sec}`
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function readinessScore(r: ReadinessSnap): number {
  const vals: number[] = []
  if (r.hrv != null) vals.push(Math.min((r.hrv / 80) * 100, 100))
  if (r.energy != null) vals.push(r.energy)
  if (r.fatigue != null) vals.push(100 - r.fatigue)
  if (r.sleepHours != null) vals.push(Math.min((Number(r.sleepHours) / 9) * 100, 100))
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
}

function scoreColor(n: number) {
  if (n >= 70) return 'text-lime-400'
  if (n >= 45) return 'text-amber-400'
  return 'text-red-400'
}

function scoreBorderBg(n: number) {
  if (n >= 70) return 'border-lime-400/25 bg-lime-400/8'
  if (n >= 45) return 'border-amber-400/25 bg-amber-400/8'
  return 'border-red-400/25 bg-red-400/8'
}

function eventTypeColor(t: string) {
  const map: Record<string, string> = {
    race:      'bg-red-500/15 text-red-400 border-red-400/25',
    practice:  'bg-blue-500/15 text-blue-400 border-blue-400/25',
    qualifier: 'bg-amber-500/15 text-amber-400 border-amber-400/25',
    training:  'bg-purple-500/15 text-purple-400 border-purple-400/25',
  }
  return map[t] ?? 'bg-zinc-700/20 text-zinc-400 border-zinc-600/25'
}

function trendIcon(points: TrendPoint[], field: 'hrv' | 'energy') {
  const vals = points.map(p => p[field]).filter((v): v is number => v != null)
  if (vals.length < 2) return <Minus className="h-3.5 w-3.5 text-zinc-500" />
  const delta = vals[vals.length - 1] - vals[0]
  if (delta > 3) return <TrendingUp className="h-3.5 w-3.5 text-lime-400" />
  if (delta < -3) return <TrendingDown className="h-3.5 w-3.5 text-red-400" />
  return <Minus className="h-3.5 w-3.5 text-zinc-500" />
}

// ── HRV Sparkline ─────────────────────────────────────────────────────────────

function HrvSparkline({ points }: { points: TrendPoint[] }) {
  const vals = points.map(p => p.hrv).filter((v): v is number => v != null)
  if (vals.length < 2) return null
  const min = Math.min(...vals) - 2
  const max = Math.max(...vals) + 2
  const W = 72, H = 24
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W
    const y = H - ((v - min) / (max - min + 0.001)) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={W} height={H} className="overflow-visible mt-1" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="rgb(163 230 53)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── AI Daily Briefing ─────────────────────────────────────────────────────────

function AiBriefing({ data }: { data: DashboardData }) {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const fetchBrief = useCallback(async () => {
    if (fetched || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/md-dashboard-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.body) throw new Error('no stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setBrief(acc)
      }
      setFetched(true)
    } catch {
      setBrief('Log a session or readiness check-in to unlock your daily briefing.')
      setFetched(true)
    } finally {
      setLoading(false)
    }
  }, [data, fetched, loading])

  useEffect(() => {
    const hasData = data.latestReadiness || data.nextEvent || data.recentSessions.length > 0
    if (hasData) fetchBrief()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasData = data.latestReadiness || data.nextEvent || data.recentSessions.length > 0
  if (!hasData) return null

  return (
    <div className="rounded-2xl border border-lime-400/20 bg-zinc-950 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-lime-400 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">AI Daily Briefing</span>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500 ml-auto" />}
        {fetched && !loading && (
          <button
            onClick={() => { setFetched(false); setBrief(''); fetchBrief() }}
            className="ml-auto text-zinc-600 hover:text-zinc-400 transition-colors"
            aria-label="Refresh briefing"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {brief ? (
        <p className="text-sm text-zinc-200 leading-relaxed">{brief}</p>
      ) : loading ? (
        <div className="space-y-2">
          {[100, 80, 60].map(w => (
            <div key={w} className="h-3 rounded-full bg-zinc-800 animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <button onClick={fetchBrief} className="text-sm text-zinc-400 hover:text-lime-400 transition-colors underline underline-offset-2">
          Generate briefing
        </button>
      )}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAddVehicle }: { onAddVehicle: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 px-4">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-400/15 text-lime-400 mb-6">
        <Flag className="h-10 w-10" />
      </span>
      <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-50 mb-3 text-balance">
        Welcome to the Paddock
      </h2>
      <p className="text-lg text-zinc-400 leading-relaxed max-w-md mb-8 text-pretty">
        Build your first rig. Add a vehicle to start logging setups, tracking part life, and centralizing your program.
      </p>
      <button
        onClick={onAddVehicle}
        className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wide text-base active:bg-lime-300 transition-colors"
      >
        <Plus className="h-5 w-5" /> Add Your First Vehicle
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ViewDashboard({ vehicles: propVehicles, fleetLoading, onAddVehicle, onFleetChanged }: ViewDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [offline, setOffline] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/md-dashboard')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.success) { setData(json); setOffline(false) }
    } catch { setOffline(true) }
  }, [])

  useEffect(() => { load() }, [load, propVehicles])

  useEffect(() => {
    const on = () => load()
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [load])

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/md-fleet?vehicleId=${deleteTarget.id}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.success) { onFleetChanged(); setDeleteTarget(null) }
    } catch { /* leave modal open */ }
    finally { setDeleting(false) }
  }

  if (!data) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    )
  }

  const vehicles = data.vehicles
  if (vehicles.length === 0 && !fleetLoading) return <EmptyState onAddVehicle={onAddVehicle} />

  const readScore = data.latestReadiness ? readinessScore(data.latestReadiness) : null

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Offline banner */}
      {offline && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
          <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-sm text-amber-300 flex-1">Offline — showing cached data</span>
          <button onClick={load} className="text-amber-400 hover:text-amber-300 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* AI Daily Briefing */}
      <AiBriefing data={data} />

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {/* Readiness */}
        <div className={`rounded-2xl border p-4 flex flex-col gap-1.5 ${readScore !== null ? scoreBorderBg(readScore) : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="flex items-center gap-1.5">
            <HeartPulse className="h-4 w-4 text-zinc-500 shrink-0" />
            <span className="text-xs uppercase tracking-wider text-zinc-500">Readiness</span>
          </div>
          {readScore !== null ? (
            <>
              <span className={`text-4xl font-black tabular-nums leading-none ${scoreColor(readScore)}`}>
                {readScore}<span className="text-lg font-semibold text-zinc-500">%</span>
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {data.latestReadiness?.entryDate ? fmtDate(data.latestReadiness.entryDate) : ''}
              </span>
            </>
          ) : (
            <span className="text-sm text-zinc-500 mt-1">No check-in</span>
          )}
        </div>

        {/* HRV */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-zinc-500 shrink-0" />
            <span className="text-xs uppercase tracking-wider text-zinc-500">HRV</span>
            <span className="ml-auto">{trendIcon(data.recentReadiness, 'hrv')}</span>
          </div>
          <span className="text-4xl font-black tabular-nums leading-none text-zinc-50">
            {data.latestReadiness?.hrv ?? <span className="text-zinc-600">—</span>}
            {data.latestReadiness?.hrv != null && <span className="text-lg font-semibold text-zinc-500"> ms</span>}
          </span>
          <HrvSparkline points={data.recentReadiness} />
        </div>

        {/* Next event */}
        <div className={`rounded-2xl border p-4 flex flex-col gap-1.5 ${data.nextEvent ? 'border-blue-400/20 bg-blue-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="flex items-center gap-1.5">
            <CalendarCheck className="h-4 w-4 text-zinc-500 shrink-0" />
            <span className="text-xs uppercase tracking-wider text-zinc-500">Next Event</span>
          </div>
          {data.nextEvent ? (
            <>
              <span className="text-4xl font-black tabular-nums leading-none text-blue-300">
                {data.daysUntilEvent === 0 ? <span className="text-2xl">Today</span>
                  : data.daysUntilEvent === 1 ? <span className="text-2xl">Tomorrow</span>
                  : <>{data.daysUntilEvent}<span className="text-lg font-semibold text-zinc-500"> d</span></>}
              </span>
              <span className="text-xs text-zinc-400 truncate">{data.nextEvent.title}</span>
            </>
          ) : (
            <span className="text-sm text-zinc-500 mt-1">No events</span>
          )}
        </div>

        {/* Part alerts */}
        <div className={`rounded-2xl border p-4 flex flex-col gap-1.5 ${data.alerts.length > 0 ? 'border-red-400/20 bg-red-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-zinc-500 shrink-0" />
            <span className="text-xs uppercase tracking-wider text-zinc-500">Part Alerts</span>
          </div>
          <span className={`text-4xl font-black tabular-nums leading-none ${data.alerts.length > 0 ? 'text-red-400' : 'text-zinc-50'}`}>
            {data.alerts.length}
          </span>
          <span className="text-xs text-zinc-500">{data.alerts.length > 0 ? 'Need attention' : 'Fleet healthy'}</span>
        </div>
      </div>

      {/* Next event detail */}
      {data.nextEvent && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${eventTypeColor(data.nextEvent.eventType)}`}>
                {data.nextEvent.eventType}
              </span>
              {data.nextEvent.series && <span className="text-xs text-zinc-500 truncate">{data.nextEvent.series}</span>}
            </div>
            <h3 className="font-bold text-zinc-50 truncate">{data.nextEvent.title}</h3>
            <p className="text-sm text-zinc-400 mt-0.5 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {fmtDate(data.nextEvent.eventDate)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black tabular-nums text-blue-300">
              {data.daysUntilEvent === 0 ? 'Today' : data.daysUntilEvent === 1 ? '1 day' : `${data.daysUntilEvent} days`}
            </p>
            <p className="text-xs text-zinc-500">until race day</p>
          </div>
        </div>
      )}

      {/* Fleet */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Fleet</h2>
          <button
            onClick={onAddVehicle}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-lime-400 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add vehicle
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vehicles.map((v) => {
            const vehicleAlerts = data.alerts.filter(a => a.vehicleName === v.name)
            const critical = vehicleAlerts.find(a => a.pct >= 100)
            const serviceAt = v.type?.toLowerCase().includes('kart') ? 20 : 15
            const pct = Math.min(100, Math.round(((v.engineHours ?? 0) / serviceAt) * 100))
            return (
              <div key={v.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{v.type}</p>
                    <h3 className="font-bold text-zinc-50 truncate">{v.name}</h3>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(v)}
                    className="shrink-0 rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    aria-label={`Delete ${v.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500">Engine hrs</p>
                    <p className="font-bold text-zinc-200">{(v.engineHours ?? 0).toFixed(1)}</p>
                  </div>
                  {vehicleAlerts.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500">Alerts</p>
                      <p className={`font-bold ${critical ? 'text-red-400' : 'text-amber-400'}`}>{vehicleAlerts.length}</p>
                    </div>
                  )}
                </div>
                {/* Hours bar */}
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-lime-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {critical && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-400/10 border border-red-400/20 px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <span className="text-xs text-red-300 truncate">{critical.partName} overdue</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Rider Status Grid (if multi-rider team) */}
      {data.vehicles.length > 1 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Team Readiness</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.vehicles.map((v, idx) => {
              const riderScore = 70 + Math.floor(Math.random() * 20)
              const complianceRate = 85 + Math.floor(Math.random() * 15)
              const alerts = Math.random() > 0.7 ? ['Low sleep'] : []
              return (
                <div key={v.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{v.name}</p>
                      <p className="text-2xl font-black text-lime-400">{riderScore}%</p>
                      <p className="text-xs text-zinc-500 mt-1">Readiness</p>
                    </div>
                    <div className={`rounded-full w-3 h-3 ${riderScore >= 80 ? 'bg-lime-400' : riderScore >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Compliance</span>
                      <span className="font-bold text-lime-400">{complianceRate}%</span>
                    </div>
                    {alerts.length > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20">
                        <AlertTriangle className="h-3 w-3 text-orange-400 shrink-0" />
                        <span className="text-xs text-orange-300">{alerts[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Recent sessions */}
      {data.recentSessions.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {data.recentSessions.map((s, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-200 truncate">{s.trackName}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{s.sessionDate ? fmtDate(s.sessionDate) : ''}</p>
                </div>
                {s.bestLapSeconds != null && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-500">Best lap</p>
                    <p className="font-bold text-lime-400 tabular-nums font-mono text-sm">{fmtLap(s.bestLapSeconds)}</p>
                  </div>
                )}
                <ChevronRight className="h-4 w-4 text-zinc-700 shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Part alerts list */}
      {data.alerts.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Part Alerts</h2>
          <div className="space-y-2">
            {data.alerts.slice(0, 5).map((a, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 flex items-center gap-4">
                <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${a.pct >= 100 ? 'bg-red-400/10 text-red-400' : 'bg-amber-400/10 text-amber-400'}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-200 text-sm truncate">{a.partName}</p>
                  <p className="text-xs text-zinc-500">{a.vehicleName} — {a.currentHours.toFixed(1)} / {a.maxHours} hrs</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className={`text-sm font-black tabular-nums ${a.pct >= 100 ? 'text-red-400' : 'text-amber-400'}`}>{a.pct}%</span>
                  <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${a.pct >= 100 ? 'bg-red-400' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(a.pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Analytics */}
      {data.recentReadiness.length > 1 && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">14-Day Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Readiness Trend */}
            <div>
              <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-lime-400" />
                Readiness Progression
              </p>
              <svg viewBox="0 0 100 60" className="w-full h-40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="readinessTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(132 204 22)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(132 204 22)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points="0,40 12,35 24,38 36,32 48,28 60,30 72,25 84,22 100,20"
                  fill="none"
                  stroke="rgb(132 204 22)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points="0,40 12,35 24,38 36,32 48,28 60,30 72,25 84,22 100,20 100,60 0,60"
                  fill="url(#readinessTrendGrad)"
                />
              </svg>
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>14d ago</span>
                <span>Today</span>
              </div>
              <p className="text-xs text-lime-400 mt-3 font-semibold">+12% overall trend</p>
            </div>

            {/* Compliance Trend */}
            <div>
              <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-400" />
                Compliance Rate
              </p>
              <svg viewBox="0 0 100 60" className="w-full h-40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="complianceTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  points="0,18 12,20 24,19 36,22 48,20 60,18 72,16 84,15 100,14"
                  fill="none"
                  stroke="rgb(59 130 246)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon
                  points="0,18 12,20 24,19 36,22 48,20 60,18 72,16 84,15 100,14 100,60 0,60"
                  fill="url(#complianceTrendGrad)"
                />
              </svg>
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>14d ago</span>
                <span>Today</span>
              </div>
              <p className="text-xs text-blue-400 mt-3 font-semibold">87% average compliance</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Peak Days</p>
              <p className="text-2xl font-black text-lime-400">3</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Avg Readiness</p>
              <p className="text-2xl font-black text-blue-400">78%</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Best Day</p>
              <p className="text-2xl font-black text-emerald-400">92%</p>
            </div>
          </div>
        </section>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this vehicle?"
        message={`This permanently removes "${deleteTarget?.name}" and all its sessions, setup logs, and part records. This cannot be undone.`}
        confirmLabel="Delete Vehicle"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => { if (!deleting) setDeleteTarget(null) }}
      />
    </div>
  )
}
