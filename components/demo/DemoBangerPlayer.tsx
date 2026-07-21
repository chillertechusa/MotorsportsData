'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Play, Pause, RotateCcw, SkipBack, SkipForward,
  ChevronRight, Activity, Zap, Heart, Timer,
  TrendingUp, Radio, Trophy, Target, Shield
} from 'lucide-react'
import {
  DEMO_SEQUENCES, DEMO_TOTAL_SECONDS,
  getSequenceAt, getSequenceProgress, animateTelemetry, lerp,
  type DemoSequence,
} from './DemoSequence'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function GaugeBar({ label, value, max, color = 'lime' }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100)
  const colorMap: Record<string, string> = {
    lime: 'bg-lime-400', cyan: 'bg-cyan-400', orange: 'bg-orange-400', rose: 'bg-rose-400',
  }
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
        <span className="font-mono text-xs text-zinc-200">{value}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorMap[color] ?? 'bg-lime-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SparkLine({ values, color = '#a3e635' }: { values: number[]; color?: string }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const w = 120
  const h = 40
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w
        const y = h - ((v - min) / range) * (h - 4) - 2
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
      })}
    </svg>
  )
}

// ─── Overlay renderers ────────────────────────────────────────────────────────

function TelemetryHUD({ seq, t }: { seq: DemoSequence; t: number }) {
  if (!seq.telemetry) return null
  const tel = seq.telemetry
  const p = getSequenceProgress(t)
  const speed = animateTelemetry(tel.speed, 8, t, 0.9)
  const rpm = animateTelemetry(tel.rpm, 400, t, 1.3)
  const hr = animateTelemetry(tel.heartRate, 6, t, 0.7)
  const throttle = Math.min(100, animateTelemetry(tel.throttle, 10, t, 1.1))
  const lean = animateTelemetry(tel.lean, 5, t, 0.8)
  const brake = Math.min(100, Math.max(0, animateTelemetry(tel.brake, 8, t, 1.4)))

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      {/* Top row — lap + sector */}
      <div className="flex justify-between items-start">
        <div className="bg-black/70 backdrop-blur-sm border border-zinc-700/50 rounded-xl px-4 py-2 flex items-center gap-3">
          <Timer className="h-4 w-4 text-lime-400" />
          <span className="font-mono text-lg text-zinc-100 tracking-tight">{tel.lapTime}</span>
          <span className="font-mono text-xs text-zinc-500 uppercase">Lap 1</span>
        </div>
        <div className="bg-black/70 backdrop-blur-sm border border-zinc-700/50 rounded-xl px-3 py-2 text-right">
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Sector</div>
          <div className="text-lime-400 font-black text-xl" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            {tel.sector}
          </div>
        </div>
      </div>

      {/* Bottom panel — all gauges */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Speed + RPM big display */}
        <div className="bg-black/75 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-4 flex gap-6 items-end">
          <div>
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Speed</div>
            <div className="text-lime-400 font-black leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
              {speed}
            </div>
            <div className="font-mono text-[10px] text-zinc-600 uppercase">mph</div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">RPM</div>
            <div className="text-zinc-100 font-black leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>
              {rpm.toLocaleString()}
            </div>
          </div>
          <div>
            <Heart className="h-3.5 w-3.5 text-rose-400 mb-0.5" />
            <div className="text-rose-400 font-black leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              {hr}
            </div>
            <div className="font-mono text-[10px] text-zinc-600 uppercase">bpm</div>
          </div>
        </div>

        {/* Gauge bars */}
        <div className="bg-black/75 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-4 flex-1 space-y-2.5 min-w-[180px]">
          <GaugeBar label="Throttle" value={throttle} max={100} color="lime" />
          <GaugeBar label="Brake" value={brake} max={100} color="rose" />
          <GaugeBar label="Lean" value={lean} max={65} color="cyan" />
        </div>
      </div>
    </div>
  )
}

function SetupOverlay({ seq, t }: { seq: DemoSequence; t: number }) {
  if (!seq.setupRecs) return null
  const p = getSequenceProgress(t)
  const visibleCount = Math.min(seq.setupRecs.length, Math.ceil(p * (seq.setupRecs.length + 1)))

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      {/* Top badge */}
      <div className="flex items-center gap-2">
        <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-full px-3 py-1 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">AI Setup Engine</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        {seq.setupRecs.slice(0, visibleCount).map((rec, i) => (
          <div
            key={i}
            className="bg-black/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-3 flex items-center gap-4"
            style={{ animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase">{rec.corner}</span>
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="font-mono text-[10px] text-zinc-600">{rec.confidence}% confidence</span>
              </div>
              <p className="text-zinc-100 text-sm font-medium truncate">{rec.change}</p>
            </div>
            <div className="shrink-0 bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-right">
              <div className="font-mono text-[10px] text-zinc-500 uppercase">delta</div>
              <div className="text-cyan-400 font-black text-sm" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                {rec.delta}
              </div>
            </div>
          </div>
        ))}
        {/* Confidence bar for most recent */}
        {seq.setupRecs[visibleCount - 1] && (
          <div className="bg-black/60 backdrop-blur-sm border border-zinc-800 rounded-xl px-4 py-2">
            <GaugeBar label="Confidence" value={seq.setupRecs[visibleCount - 1].confidence} max={100} color="cyan" />
          </div>
        )}
      </div>
    </div>
  )
}

function ReadinessOverlay({ seq, t }: { seq: DemoSequence; t: number }) {
  if (!seq.readiness) return null
  const r = seq.readiness
  const p = getSequenceProgress(t)
  const animScore = Math.round(lerp(55, r.score, p))
  const labelColor = r.score >= 85 ? 'text-lime-400' : r.score >= 70 ? 'text-yellow-400' : 'text-rose-400'

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-3">
        {/* Big readiness ring */}
        <div className="bg-black/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-5 flex items-center gap-6">
          {/* Circular score */}
          <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
            <svg width={96} height={96} viewBox="0 0 96 96">
              <circle cx={48} cy={48} r={42} fill="none" stroke="#27272a" strokeWidth="8" />
              <circle
                cx={48} cy={48} r={42} fill="none"
                stroke={r.score >= 85 ? '#a3e635' : r.score >= 70 ? '#facc15' : '#f43f5e'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - animScore / 100)}`}
                transform="rotate(-90 48 48)"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-black text-2xl leading-none ${labelColor}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                {animScore}
              </span>
              <span className="font-mono text-[9px] text-zinc-600 uppercase">Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className={`font-black text-2xl uppercase ${labelColor}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
              {r.label}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'HRV', value: `${r.hrv}ms` },
                { label: 'Sleep', value: `${r.sleep}h` },
                { label: 'Fatigue', value: `${r.fatigue}/10` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-900/80 rounded-lg p-2 text-center">
                  <div className="font-mono text-[9px] text-zinc-600 uppercase">{label}</div>
                  <div className="font-mono text-xs text-zinc-200 font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7-day HRV sparkline */}
        <div className="bg-black/80 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">7-Day HRV Trend</span>
            <TrendingUp className="h-3.5 w-3.5 text-lime-400" />
          </div>
          <SparkLine values={r.trend} color={r.score >= 85 ? '#a3e635' : '#facc15'} />
        </div>
      </div>
    </div>
  )
}

function LeaderboardOverlay({ seq, t }: { seq: DemoSequence; t: number }) {
  if (!seq.leaderboard) return null
  const p = getSequenceProgress(t)

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      <div className="flex items-center gap-2">
        <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-full px-3 py-1 flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">Live Leaderboard</span>
        </div>
      </div>

      <div className="bg-black/80 backdrop-blur-sm border border-zinc-700/50 rounded-xl overflow-hidden">
        {/* header */}
        <div className="grid grid-cols-[40px_1fr_80px_80px] gap-2 px-4 py-2 border-b border-zinc-800">
          {['P', 'Rider', 'Gap', 'Last Lap'].map((h) => (
            <div key={h} className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{h}</div>
          ))}
        </div>
        {seq.leaderboard.map((row) => {
          const isUser = row.pos === 1
          return (
            <div
              key={row.pos}
              className={`grid grid-cols-[40px_1fr_80px_80px] gap-2 px-4 py-2.5 border-b border-zinc-800/50 last:border-0 ${isUser ? 'bg-lime-500/10' : ''}`}
            >
              <div className={`font-black text-sm ${isUser ? 'text-lime-400' : 'text-zinc-400'}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                P{row.pos}
              </div>
              <div className={`font-mono text-xs font-semibold truncate ${isUser ? 'text-lime-300' : 'text-zinc-200'}`}>
                {row.name}
              </div>
              <div className={`font-mono text-xs ${row.gap === 'LEADER' ? 'text-lime-400' : 'text-zinc-400'}`}>
                {row.gap}
              </div>
              <div className="font-mono text-xs text-zinc-300">{row.lastLap}</div>
            </div>
          )
        })}
      </div>

      {/* Live telemetry mini strip */}
      {seq.telemetry && (
        <div className="flex gap-2">
          {[
            { label: 'Speed', value: `${animateTelemetry(seq.telemetry.speed, 6, t)}mph` },
            { label: 'Throttle', value: `${animateTelemetry(seq.telemetry.throttle, 8, t)}%` },
            { label: 'HR', value: `${animateTelemetry(seq.telemetry.heartRate, 5, t)}bpm` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-black/70 backdrop-blur-sm border border-zinc-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">{label}</span>
              <span className="font-mono text-xs text-lime-400 font-semibold">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CoachingOverlay({ seq, t }: { seq: DemoSequence; t: number }) {
  if (!seq.coachMessages) return null
  const p = getSequenceProgress(t)
  const visible = Math.min(seq.coachMessages.length, Math.ceil(p * (seq.coachMessages.length + 1)))
  const fromColor: Record<string, string> = {
    AI: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    COACH: 'text-lime-400 border-lime-500/40 bg-lime-500/10',
    PIT: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      <div className="flex items-center gap-2">
        <div className="bg-orange-500/20 border border-orange-500/40 rounded-full px-3 py-1 flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-orange-400" />
          <span className="font-mono text-xs text-orange-400 uppercase tracking-widest">Pit Radio</span>
        </div>
      </div>

      <div className="space-y-2">
        {seq.coachMessages.slice(0, visible).map((msg, i) => (
          <div
            key={i}
            className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${fromColor[msg.from]} ${msg.highlight ? 'ring-1 ring-orange-400/40' : ''}`}
          >
            <div className="shrink-0 mt-0.5">
              <span className={`font-mono text-[10px] uppercase font-bold ${fromColor[msg.from].split(' ')[0]}`}>{msg.from}</span>
            </div>
            <p className="text-zinc-100 text-sm leading-relaxed flex-1">{msg.text}</p>
            <span className="font-mono text-[10px] text-zinc-600 shrink-0 mt-0.5">{msg.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PayoffOverlay({ seq, t }: { seq: DemoSequence; t: number }) {
  if (!seq.payoffStats) return null
  const p = getSequenceProgress(t)
  const visible = Math.min(seq.payoffStats.length, Math.ceil(p * (seq.payoffStats.length + 1)))

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-6 p-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-lime-400" />
        <span
          className="text-zinc-100 uppercase font-black tracking-tight"
          style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
        >
          Turn Telemetry Into Trophies
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
        {seq.payoffStats.slice(0, visible).map((stat, i) => (
          <div
            key={i}
            className="bg-black/80 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-4 text-center"
          >
            <div
              className="text-lime-400 font-black leading-none mb-1"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}
            >
              {stat.value}
            </div>
            <div className="font-mono text-[10px] text-zinc-300 uppercase tracking-wider">{stat.label}</div>
            <div className="font-mono text-[10px] text-zinc-600 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Player ──────────────────────────────────────────────────────────────

export default function DemoBangerPlayer() {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number>(0)
  const lastTs = useRef<number>(0)
  const timeRef = useRef(0)

  const seq = getSequenceAt(currentTime)
  const progress = (currentTime / DEMO_TOTAL_SECONDS) * 100

  const tick = useCallback((ts: number) => {
    if (lastTs.current === 0) lastTs.current = ts
    const delta = Math.min((ts - lastTs.current) / 1000, 0.1) // cap at 100ms
    lastTs.current = ts
    timeRef.current = Math.min(timeRef.current + delta, DEMO_TOTAL_SECONDS)
    setCurrentTime(timeRef.current)
    if (timeRef.current < DEMO_TOTAL_SECONDS) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      setIsPlaying(false)
    }
  }, [])

  const play = useCallback(() => {
    if (timeRef.current >= DEMO_TOTAL_SECONDS) {
      timeRef.current = 0
      setCurrentTime(0)
    }
    setHasStarted(true)
    setIsPlaying(true)
    lastTs.current = 0
    rafRef.current = requestAnimationFrame(tick)
    videoRef.current?.play().catch(() => {})
  }, [tick])

  const pause = useCallback(() => {
    setIsPlaying(false)
    cancelAnimationFrame(rafRef.current)
    videoRef.current?.pause()
  }, [])

  const seek = useCallback((s: number) => {
    const clamped = Math.max(0, Math.min(DEMO_TOTAL_SECONDS, s))
    timeRef.current = clamped
    setCurrentTime(clamped)
    if (videoRef.current) {
      videoRef.current.currentTime = clamped % (videoRef.current.duration || 120)
    }
  }, [])

  const restart = useCallback(() => {
    pause()
    seek(0)
  }, [pause, seek])

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Sync video loop to current time bracket
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    vid.loop = true
    vid.muted = true
    vid.playsInline = true
  }, [])

  const accentMap: Record<string, string> = {
    lime: '#a3e635', cyan: '#22d3ee', orange: '#fb923c',
  }
  const accent = accentMap[seq.accentColor] ?? '#a3e635'

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50">
      {/* Video + overlay stage */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        {/* Video background */}
        <video
          ref={videoRef}
          src="/motocross-hero.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          muted playsInline loop preload="auto"
        />

        {/* Dark overlay so text is always readable */}
        <div className="absolute inset-0 bg-zinc-950/50" />

        {/* Oscilloscope grid background (subtle) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Sequence caption — bottom center */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none px-4">
          <div
            className="text-center text-balance"
            style={{
              opacity: hasStarted ? 1 : 0,
              transition: 'opacity 0.6s ease',
            }}
          >
            <p
              className="text-zinc-300 text-sm sm:text-base leading-snug"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 400 }}
            >
              {seq.caption}
            </p>
          </div>
        </div>

        {/* Sequence-specific overlay */}
        {hasStarted && (() => {
          switch (seq.overlayType) {
            case 'telemetry-hud': return <TelemetryHUD seq={seq} t={currentTime} />
            case 'setup-recommendation': return <SetupOverlay seq={seq} t={currentTime} />
            case 'readiness-score': return <ReadinessOverlay seq={seq} t={currentTime} />
            case 'competitive-leaderboard': return <LeaderboardOverlay seq={seq} t={currentTime} />
            case 'coaching-radio': return <CoachingOverlay seq={seq} t={currentTime} />
            case 'payoff-stats': return <PayoffOverlay seq={seq} t={currentTime} />
            default: return null
          }
        })()}

        {/* Pre-play overlay */}
        {!hasStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/60">
            <p
              className="text-zinc-400 text-sm uppercase tracking-widest font-mono"
            >
              2-minute interactive demo
            </p>
            <button
              onClick={play}
              className="flex items-center gap-3 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black uppercase tracking-wider rounded-full px-8 py-4 text-base transition-all hover:scale-105 active:scale-100"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              <Play className="h-5 w-5 fill-current" />
              Watch the Platform in Action
            </button>
            <p className="font-mono text-[11px] text-zinc-600">No signup required</p>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 space-y-3">
        {/* Sequence chapter nav */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {DEMO_SEQUENCES.map((s) => {
            const active = seq.index === s.index
            return (
              <button
                key={s.index}
                onClick={() => { seek(s.start); if (!isPlaying) {} }}
                className={`shrink-0 font-mono text-[10px] uppercase tracking-wide rounded-full px-3 py-1 transition-all border ${
                  active
                    ? 'bg-lime-400 text-zinc-950 border-lime-400 font-bold'
                    : 'text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
                }`}
              >
                {s.name}
              </button>
            )
          })}
        </div>

        {/* Progress bar (clickable) */}
        <div
          className="h-2 bg-zinc-800 rounded-full cursor-pointer group relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            seek(pct * DEMO_TOTAL_SECONDS)
          }}
        >
          {/* Sequence markers */}
          {DEMO_SEQUENCES.slice(1).map((s) => (
            <div
              key={s.index}
              className="absolute top-0 bottom-0 w-px bg-zinc-600"
              style={{ left: `${(s.start / DEMO_TOTAL_SECONDS) * 100}%` }}
            />
          ))}
          <div
            className="h-full rounded-full transition-none"
            style={{ width: `${progress}%`, background: accent }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 7px)`, background: accent }}
          />
        </div>

        {/* Playback controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Restart */}
            <button
              onClick={restart}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Restart"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            {/* -10s */}
            <button
              onClick={() => seek(currentTime - 10)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Back 10 seconds"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            {/* Play/Pause */}
            <button
              onClick={isPlaying ? pause : play}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-400 hover:bg-lime-300 text-zinc-950 transition-all hover:scale-105 active:scale-100"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying
                ? <Pause className="h-4 w-4 fill-current" />
                : <Play className="h-4 w-4 fill-current" />
              }
            </button>
            {/* +10s */}
            <button
              onClick={() => seek(currentTime + 10)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Forward 10 seconds"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Timestamp */}
          <div className="font-mono text-xs text-zinc-400">
            {fmt(currentTime)} <span className="text-zinc-700">/</span> {fmt(DEMO_TOTAL_SECONDS)}
          </div>

          {/* Sequence label */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{seq.name}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
