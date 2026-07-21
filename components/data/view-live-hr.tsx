'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Heart, Wifi, WifiOff, Plus, Trash2, RefreshCw, AlertCircle, Activity, Zap } from 'lucide-react'
import { hrZone } from '@/lib/terra/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type HrPoint = { ts: number; hr: number }

type RiderHR = {
  id: string
  userId: string
  riderName: string
  provider: string | null
  connected: boolean
  latestHr: number | null
  latestHrAt: string | null
  secondsAgo: number | null
  hrHistory: HrPoint[]
}

// ---------------------------------------------------------------------------
// Sparkline — canvas-based mini HR chart
// ---------------------------------------------------------------------------

function Sparkline({ history, color }: { history: HrPoint[]; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || history.length < 2) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const hrs = history.map((p) => p.hr)
    const min = Math.max(40, Math.min(...hrs) - 10)
    const max = Math.min(220, Math.max(...hrs) + 10)
    const range = max - min || 1

    const pts = history.map((p, i) => ({
      x: (i / (history.length - 1)) * w,
      y: h - ((p.hr - min) / range) * h,
    }))

    // Fill
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, `${color}40`)
    grad.addColorStop(1, `${color}00`)
    ctx.beginPath()
    ctx.moveTo(pts[0].x, h)
    pts.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.lineTo(pts[pts.length - 1].x, h)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.stroke()
  }, [history, color])

  return <canvas ref={ref} width={120} height={32} className="w-full h-8" />
}

// ---------------------------------------------------------------------------
// Single rider card
// ---------------------------------------------------------------------------

function RiderCard({ rider, onDisconnect }: { rider: RiderHR; onDisconnect: (id: string) => void }) {
  const zone = rider.latestHr ? hrZone(rider.latestHr) : null
  const isStale = rider.secondsAgo !== null && rider.secondsAgo > 15
  const isFresh = rider.secondsAgo !== null && rider.secondsAgo <= 5

  // Pick sparkline hex color based on zone
  const sparkColor =
    !zone ? '#52525b' :
    zone.label === 'Rest' ? '#71717a' :
    zone.label === 'Warm-up' ? '#38bdf8' :
    zone.label === 'Aerobic' ? '#a3e635' :
    zone.label === 'Moderate' ? '#fbbf24' :
    zone.label === 'Hard' ? '#fb923c' : '#f87171'

  return (
    <div className={`relative rounded-2xl border bg-zinc-900/80 p-4 transition-all ${
      rider.connected && rider.latestHr
        ? 'border-zinc-700/80'
        : 'border-zinc-800/60 opacity-70'
    }`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-100 truncate">{rider.riderName}</span>
            {rider.connected ? (
              <span className="shrink-0 flex items-center gap-1 rounded-full bg-lime-500/15 border border-lime-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-400">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
                Live
              </span>
            ) : (
              <span className="shrink-0 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Not connected
              </span>
            )}
          </div>
          {rider.provider && (
            <span className="text-[11px] text-zinc-500">{rider.provider}</span>
          )}
        </div>
        <button
          onClick={() => onDisconnect(rider.id)}
          className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors"
          title="Remove rider"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* BPM display */}
      {rider.connected && rider.latestHr ? (
        <>
          <div className="flex items-end gap-3 mb-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-black tabular-nums leading-none ${zone?.color ?? 'text-zinc-100'}`}>
                {rider.latestHr}
              </span>
              <span className="text-sm font-medium text-zinc-500">bpm</span>
            </div>
            <div className="mb-1 flex flex-col items-start gap-0.5">
              {zone && (
                <span className={`text-xs font-bold uppercase tracking-wide ${zone.color}`}>
                  {zone.label}
                </span>
              )}
              {rider.secondsAgo !== null && (
                <span className={`text-[10px] ${isFresh ? 'text-lime-500' : isStale ? 'text-amber-500' : 'text-zinc-500'}`}>
                  {rider.secondsAgo === 0 ? 'just now' : `${rider.secondsAgo}s ago`}
                </span>
              )}
            </div>
          </div>

          {/* Sparkline */}
          {rider.hrHistory.length >= 2 && (
            <Sparkline history={rider.hrHistory} color={sparkColor} />
          )}
        </>
      ) : rider.connected ? (
        <div className="flex items-center gap-2 text-zinc-500 text-sm py-2">
          <Activity className="h-4 w-4 animate-pulse" />
          <span>Waiting for data...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-zinc-600 text-xs py-2">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Device not connected</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Connect-device modal
// ---------------------------------------------------------------------------

function ConnectModal({ onClose, onConnected }: { onClose: () => void; onConnected: () => void }) {
  const [riderName, setRiderName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/terra/widget-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate connection link')
        return
      }
      // Open Terra widget in new tab
      window.open(data.url, '_blank', 'noopener,noreferrer')
      onConnected()
      onClose()
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15 border border-lime-500/20">
            <Heart className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Connect Wearable</h3>
            <p className="text-xs text-zinc-500">Garmin, Polar, Apple Watch + 500 more</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
            Rider Name
          </label>
          <input
            type="text"
            value={riderName}
            onChange={(e) => setRiderName(e.target.value)}
            placeholder="e.g. Chase Sexton"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-500/50 focus:outline-none"
          />
        </div>

        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
          A device authorization page will open in a new tab. The rider selects their
          device type and authorizes Motorsport Data to read their heart rate in real-time.
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex-1 rounded-xl bg-lime-500 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-lime-400 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Opening...' : 'Open Device Setup'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// No-config callout — shown when TERRA_API_KEY is not set
// ---------------------------------------------------------------------------

function TerraSetupCallout() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
          <Zap className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-zinc-100">Wearable Sync — On the Test Bench</h3>
            <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              Available Soon
            </span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Live heart rate monitoring from 500+ wearables (Garmin, Polar, Apple Watch, Whoop, Oura, etc.) is coming soon. 
            We&apos;re building this premium feature for Factory Rig teams. Check back soon for launch updates.
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function ViewLiveHR() {
  const [riders, setRiders] = useState<RiderHR[]>([])
  const [terraConfigured, setTerraConfigured] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showConnect, setShowConnect] = useState(false)
  const [lastPoll, setLastPoll] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/terra/live-hr')
      if (!res.ok) return
      const data = await res.json()
      setRiders(data.riders ?? [])
      setTerraConfigured(data.terraConfigured ?? false)
      setLastPoll(new Date())
    } catch {
      // network error — keep showing last data
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + 3-second poll
  useEffect(() => {
    poll()
    intervalRef.current = setInterval(poll, 3000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [poll])

  async function handleDisconnect(connectionId: string) {
    // Find the row and remove via DELETE
    try {
      await fetch(`/api/terra/widget-session`, { method: 'DELETE' })
      // Optimistic remove from UI
      setRiders((prev) => prev.filter((r) => r.id !== connectionId))
    } catch {
      // ignore
    }
  }

  const connectedCount = riders.filter((r) => r.connected && r.latestHr).length
  const totalConnected = riders.filter((r) => r.connected).length

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Heart className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">
              Live HR Monitor
            </h2>
            {connectedCount > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-lime-500/30 bg-lime-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-lime-400">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
                {connectedCount} Live
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            {loading
              ? 'Loading...'
              : riders.length === 0
              ? 'No riders connected — add a device to start'
              : `${totalConnected} of ${riders.length} riders connected${lastPoll ? ` · updated ${lastPoll.toLocaleTimeString()}` : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={poll}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {terraConfigured && (
            <button
              onClick={() => setShowConnect(true)}
              className="flex items-center gap-1.5 rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-400 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Rider
            </button>
          )}
        </div>
      </div>

      {/* Terra not configured */}
      {!terraConfigured && <TerraSetupCallout />}

      {/* Summary bar — shown when 2+ riders active */}
      {connectedCount >= 2 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Team Overview</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {riders
              .filter((r) => r.connected && r.latestHr)
              .sort((a, b) => (b.latestHr ?? 0) - (a.latestHr ?? 0))
              .map((r) => {
                const zone = hrZone(r.latestHr!)
                return (
                  <div key={r.id} className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs ${zone.bg} border-zinc-700/50`}>
                    <span className="font-medium text-zinc-300">{r.riderName.split(' ')[0]}</span>
                    <span className={`font-black tabular-nums ${zone.color}`}>{r.latestHr}</span>
                    <span className="text-zinc-600">bpm</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Rider grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl border border-zinc-800 bg-zinc-900/60 animate-pulse" />
          ))}
        </div>
      ) : riders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800">
            <Heart className="h-8 w-8 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300 mb-1">No riders connected</p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              Each rider connects their wearable device once. From then on, their live heart
              rate appears here during every session.
            </p>
          </div>
          {terraConfigured && (
            <button
              onClick={() => setShowConnect(true)}
              className="flex items-center gap-2 rounded-xl bg-lime-500 px-6 py-2.5 text-sm font-bold text-zinc-950 hover:bg-lime-400 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Connect First Rider
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {riders.map((rider) => (
            <RiderCard key={rider.id} rider={rider} onDisconnect={handleDisconnect} />
          ))}
        </div>
      )}

      {/* How it works — shown until at least one rider connects */}
      {terraConfigured && riders.filter((r) => r.connected).length === 0 && riders.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">How it works</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { step: '1', title: 'Connect once', body: 'Rider clicks "Add Rider", opens Terra widget, selects their device, and authorizes in 30 seconds.' },
              { step: '2', title: 'Race day', body: 'Rider wears their device as normal. No extra setup — data flows automatically from their device cloud.' },
              { step: '3', title: 'Live monitoring', body: 'Coach sees every rider\'s HR in real-time during the session. Cards update every 3 seconds.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-500/15 text-xs font-black text-lime-400">
                  {step}
                </span>
                <div>
                  <p className="text-xs font-bold text-zinc-300 mb-0.5">{title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stale data warning */}
      {riders.some((r) => r.connected && r.secondsAgo !== null && r.secondsAgo > 30) && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400">
          <Wifi className="h-4 w-4 shrink-0" />
          Some riders have stale HR data (&gt;30s). Check their device connection or cellular signal.
        </div>
      )}

      {showConnect && (
        <ConnectModal
          onClose={() => setShowConnect(false)}
          onConnected={() => { setTimeout(poll, 1500) }}
        />
      )}
    </div>
  )
}
