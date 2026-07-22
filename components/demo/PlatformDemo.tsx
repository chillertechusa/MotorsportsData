'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Activity, Zap, Gauge, Heart, TrendingUp, TrendingDown,
  ChevronRight, Play, Pause, SkipBack, AlertTriangle,
  CheckCircle, Cpu, Wind, Thermometer, Flag, Users, BarChart3,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface SceneProps { progress: number } // 0–1 within scene

// ─── Animated number that counts up/down ─────────────────────────────────────
function AnimatedValue({
  value, decimals = 0, unit = '', className = '',
}: { value: number; decimals?: number; unit?: string; className?: string }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const diff = value - prev.current
    const steps = 20
    let i = 0
    const tick = setInterval(() => {
      i++
      setDisplay(prev.current + (diff * i) / steps)
      if (i >= steps) { clearInterval(tick); prev.current = value }
    }, 20)
    return () => clearInterval(tick)
  }, [value])
  return (
    <span className={className}>
      {display.toFixed(decimals)}{unit}
    </span>
  )
}

// ─── SVG waveform that animates left ─────────────────────────────────────────
function Waveform({ data, color = '#a3e635', height = 48 }: { data: number[]; color?: string; height?: number }) {
  const w = 320
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / 100) * (height - 4)}`).join(' ')
  return (
    <svg width={w} height={height} className="w-full">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Metric card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, icon: Icon, color = 'lime', delta }: {
  label: string; value: number; unit: string; icon: any; color?: string; delta?: string
}) {
  const accent = color === 'lime' ? 'text-lime-400' : color === 'red' ? 'text-red-400' : color === 'blue' ? 'text-sky-400' : 'text-amber-400'
  const border = color === 'lime' ? 'border-lime-400/20' : color === 'red' ? 'border-red-400/20' : color === 'blue' ? 'border-sky-400/20' : 'border-amber-400/20'
  return (
    <div className={`border ${border} bg-zinc-900 rounded-xl p-4 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-2xl font-black tabular-nums ${accent}`}>
          <AnimatedValue value={value} decimals={unit === 'mph' || unit === 'rpm' ? 0 : 1} />
        </span>
        <span className="text-xs text-zinc-500 mb-0.5">{unit}</span>
      </div>
      {delta && <span className="text-[10px] text-zinc-500">{delta}</span>}
    </div>
  )
}

// ─── SCENE 1: Live Telemetry Dashboard ───────────────────────────────────────
function SceneLiveTelemetry({ progress }: SceneProps) {
  const t = progress
  const speed = 62 + Math.sin(t * Math.PI * 3) * 18
  const rpm = 7800 + Math.sin(t * Math.PI * 2.5) * 2100
  const throttle = Math.max(0, Math.min(100, 45 + Math.sin(t * Math.PI * 4) * 45))
  const hr = 168 + Math.sin(t * Math.PI * 1.5) * 14
  const lean = Math.abs(Math.sin(t * Math.PI * 2) * 58)
  const lap = Math.floor(t * 8) + 1

  const wave = Array.from({ length: 40 }, (_, i) => {
    const pos = (t * 40 + i) % 40
    return 30 + Math.sin((pos / 40) * Math.PI * 6) * 40 + Math.sin((pos / 40) * Math.PI * 11) * 20
  })

  return (
    <div className="h-full flex flex-col gap-3 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-lime-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-lime-400">Live Session</span>
          </div>
          <p className="text-lg font-black text-zinc-50 mt-0.5">#32 Casey Martinez</p>
          <p className="text-xs text-zinc-500">2026 KTM 450 SX-F · Lap {lap}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-zinc-500">Best Lap</p>
          <p className="text-xl font-black text-lime-400">1:43.8</p>
          <p className="font-mono text-[10px] text-zinc-600">Last: 1:44.6</p>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
        <MetricCard label="Speed" value={speed} unit="mph" icon={Gauge} color="lime" />
        <MetricCard label="Engine RPM" value={rpm} unit="rpm" icon={Zap} color="amber" />
        <MetricCard label="Heart Rate" value={hr} unit="bpm" icon={Heart} color="red" />
        <MetricCard label="Lean Angle" value={lean} unit="°" icon={Wind} color="blue" />
      </div>

      {/* Throttle bar */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-3">
        <div className="flex justify-between mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Throttle Position</span>
          <span className="font-mono text-xs text-lime-400 font-bold"><AnimatedValue value={throttle} decimals={0} unit="%" /></span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-lime-400 rounded-full transition-all duration-100"
            style={{ width: `${throttle}%` }}
          />
        </div>
      </div>

      {/* Waveform */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-3">
        <div className="flex justify-between mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Speed Waveform</span>
          <span className="font-mono text-[10px] text-zinc-600">500ms window</span>
        </div>
        <Waveform data={wave} />
      </div>
    </div>
  )
}

// ─── SCENE 2: AI Setup Recommender ───────────────────────────────────────────
function SceneAISetup({ progress }: SceneProps) {
  const messages = [
    { role: 'user', text: 'Losing time in the whoops section. What should I change?' },
    { role: 'ai', text: 'Based on your last 3 laps, you\'re losing 0.42s through the whoops. Your rebound damping is too slow — the front wheel is deflecting off each bump. Recommendation:', delay: 0.15 },
  ]

  const recommendations = [
    { part: 'Front Fork Rebound', change: '+3 clicks out', delta: '-0.28s', confidence: 94 },
    { part: 'Rear Shock Compression', change: '+1 click', delta: '-0.14s', confidence: 87 },
  ]

  const showReply = progress > 0.2
  const showRecs = progress > 0.45
  const showDelta = progress > 0.7

  return (
    <div className="h-full flex flex-col gap-3 p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Cpu className="h-4 w-4 text-lime-400" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">AI Setup Advisor</span>
        <span className="ml-auto font-mono text-[10px] text-zinc-600">2026 KTM 450 SX-F</span>
      </div>

      {/* Chat */}
      <div className="flex flex-col gap-3 flex-1">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-xs bg-zinc-800 rounded-xl rounded-tr-sm px-4 py-2.5">
            <p className="text-sm text-zinc-100">{messages[0].text}</p>
          </div>
        </div>

        {/* AI reply */}
        {showReply && (
          <div className="flex gap-3">
            <div className="h-7 w-7 rounded-full bg-lime-400/10 border border-lime-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cpu className="h-3.5 w-3.5 text-lime-400" />
            </div>
            <div className="max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl rounded-tl-sm px-4 py-2.5">
              <p className="text-sm text-zinc-300 leading-relaxed">{messages[1].text}</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {showRecs && (
          <div className="flex flex-col gap-2 ml-10">
            {recommendations.map((rec, i) => (
              <div key={i} className="border border-lime-400/20 bg-zinc-900 rounded-xl p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{rec.part}</p>
                  <p className="font-mono text-[11px] text-zinc-500 mt-0.5">{rec.change}</p>
                </div>
                {showDelta && (
                  <div className="text-right">
                    <p className="text-lime-400 font-black text-lg">{rec.delta}</p>
                    <p className="font-mono text-[10px] text-zinc-600">{rec.confidence}% conf.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total projected gain */}
      {showDelta && (
        <div className="border border-lime-400/30 bg-lime-400/5 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-zinc-300 font-semibold">Projected lap time improvement</span>
          <span className="text-lime-400 font-black text-xl">-0.42s</span>
        </div>
      )}
    </div>
  )
}

// ─── SCENE 3: Readiness Dashboard ────────────────────────────────────────────
function SceneReadiness({ progress }: SceneProps) {
  const score = Math.min(91, Math.round(62 + progress * 29))
  const hrv = Math.min(68, Math.round(44 + progress * 24))
  const sleep = 7.2 + progress * 1.1
  const days = [78, 82, 75, 88, 84, 91, score]
  const showLabel = progress > 0.6

  return (
    <div className="h-full flex flex-col gap-3 p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-red-400" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Rider Readiness</span>
        <span className="ml-auto font-mono text-[10px] text-zinc-600">48hr prediction</span>
      </div>

      {/* Big score */}
      <div className="flex items-center gap-6 border border-zinc-800 bg-zinc-900 rounded-xl p-5">
        {/* Ring */}
        <div className="relative h-24 w-24 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#27272a" strokeWidth="7" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={score >= 85 ? '#a3e635' : score >= 70 ? '#f59e0b' : '#ef4444'}
              strokeWidth="7" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 213.6} 213.6`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-black tabular-nums ${score >= 85 ? 'text-lime-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
              {score}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xl font-black text-zinc-50 mb-1">
            {score >= 85 ? 'Race Ready' : score >= 70 ? 'Good to Ride' : 'Recovery Day'}
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {score >= 85
              ? 'All systems go. Peak performance window is open.'
              : 'Sub-optimal recovery. Limit intensity today.'}
          </p>
          {showLabel && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-lime-400/10 border border-lime-400/30 rounded-full px-2.5 py-0.5">
              <CheckCircle className="h-3 w-3 text-lime-400" />
              <span className="text-[11px] text-lime-400 font-semibold">Gate drop: 10:00am</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-3 text-center">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">HRV</p>
          <p className="text-xl font-black text-sky-400">{hrv}</p>
          <p className="font-mono text-[10px] text-zinc-600">ms</p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-3 text-center">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Sleep</p>
          <p className="text-xl font-black text-amber-400">{sleep.toFixed(1)}</p>
          <p className="font-mono text-[10px] text-zinc-600">hrs</p>
        </div>
        <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-3 text-center">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Load</p>
          <p className="text-xl font-black text-lime-400">72</p>
          <p className="font-mono text-[10px] text-zinc-600">TSS</p>
        </div>
      </div>

      {/* 7-day bar chart */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">7-Day Trend</p>
        <div className="flex items-end gap-1.5 h-12">
          {days.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height: `${(v / 100) * 48}px`,
                  background: i === 6
                    ? (v >= 85 ? '#a3e635' : v >= 70 ? '#f59e0b' : '#ef4444')
                    : '#3f3f46',
                }}
              />
              <span className="font-mono text-[9px] text-zinc-600">{['M', 'T', 'W', 'T', 'F', 'S', 'T'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── SCENE 4: Competitive Analysis ───────────────────────────────────────────
function SceneCompetitive({ progress }: SceneProps) {
  const riders = [
    { num: 32, name: 'Casey Martinez', lap: '1:43.8', gap: '+0.000', pos: 1, trend: 'up' },
    { num: 7,  name: 'Jake Thornton',  lap: '1:44.2', gap: '+0.421', pos: 2, trend: 'down' },
    { num: 14, name: 'Marcus Webb',    lap: '1:44.6', gap: '+0.832', pos: 3, trend: 'stable' },
    { num: 21, name: 'Ryan Cole',      lap: '1:45.1', gap: '+1.314', pos: 4, trend: 'down' },
  ]

  const sectors = [
    { name: 'S1 Whoops', you: 28.4, best: 27.9, delta: '+0.5' },
    { name: 'S2 Rhythm', you: 41.2, best: 42.1, delta: '-0.9' },
    { name: 'S3 Corner', you: 34.2, best: 34.0, delta: '+0.2' },
  ]

  const showSectors = progress > 0.45

  return (
    <div className="h-full flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-lime-400" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Competitive Analysis</span>
        <span className="ml-auto text-[10px] font-mono text-zinc-600">Lap {Math.floor(progress * 8) + 1}</span>
      </div>

      {/* Leaderboard */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl overflow-hidden">
        {riders.map((r, i) => (
          <div
            key={r.num}
            className={`flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 last:border-0 transition-all duration-300 ${r.pos === 1 ? 'bg-lime-400/5' : ''}`}
          >
            <span className={`font-mono text-sm font-black w-4 ${r.pos === 1 ? 'text-lime-400' : 'text-zinc-500'}`}>{r.pos}</span>
            <div className={`h-6 w-6 rounded flex items-center justify-center font-mono text-[10px] font-black ${r.pos === 1 ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
              {r.num}
            </div>
            <span className={`text-sm font-semibold flex-1 ${r.pos === 1 ? 'text-zinc-50' : 'text-zinc-400'}`}>{r.name}</span>
            <span className="font-mono text-xs text-zinc-300">{r.lap}</span>
            <span className={`font-mono text-xs w-14 text-right ${r.pos === 1 ? 'text-lime-400' : 'text-zinc-500'}`}>{r.gap}</span>
            {r.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-lime-400" />}
            {r.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
          </div>
        ))}
      </div>

      {/* Sector comparison */}
      {showSectors && (
        <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Sector Analysis vs. Field Best</p>
          <div className="flex flex-col gap-2">
            {sectors.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-20 flex-shrink-0">{s.name}</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.delta.startsWith('-') ? 'bg-lime-400' : 'bg-red-400'}`}
                    style={{ width: `${(s.you / 50) * 100}%` }}
                  />
                </div>
                <span className={`font-mono text-xs w-10 text-right font-bold ${s.delta.startsWith('-') ? 'text-lime-400' : 'text-red-400'}`}>
                  {s.delta}s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {progress > 0.75 && (
        <div className="border border-lime-400/20 bg-lime-400/5 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-zinc-300">Current championship position</span>
          <div className="text-right">
            <span className="text-2xl font-black text-lime-400">P3</span>
            <span className="text-xs text-zinc-500 ml-1">/ 378 pts</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SCENE 5: Pit Box Coach ───────────────────────────────────────────────────
function SceneCoach({ progress }: SceneProps) {
  const messages = [
    { from: 'ai', text: 'Turn 7 entry — braking 3m late. Losing 0.28s. Brake marker is the red board.', time: '1:43.2', show: 0.05 },
    { from: 'coach', text: 'Copy that. #32 roll more throttle mid-corner S2.', time: '1:44.1', show: 0.3 },
    { from: 'ai', text: 'Throttle smoothed — sector 2 improved 0.19s this lap. Continue.', time: '1:45.0', show: 0.55 },
    { from: 'coach', text: 'Great lap Casey. Push the rhythm section harder.', time: '1:45.8', show: 0.75 },
  ]

  return (
    <div className="h-full flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-amber-400" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Pit Box · Live Coach</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="font-mono text-[10px] text-red-400">ON AIR</span>
        </div>
      </div>

      {/* Live metrics strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Speed', value: `${Math.round(62 + Math.sin(progress * Math.PI * 3) * 18)} mph`, color: 'text-lime-400' },
          { label: 'Lap', value: `${Math.floor(progress * 8) + 1}`, color: 'text-zinc-100' },
          { label: 'Gap to P1', value: '−0.42s', color: 'text-amber-400' },
        ].map(m => (
          <div key={m.label} className="border border-zinc-800 bg-zinc-900 rounded-lg p-2 text-center">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{m.label}</p>
            <p className={`font-mono text-sm font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Message feed */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        {messages.map((m, i) => (
          progress > m.show && (
            <div key={i} className={`flex gap-3 ${m.from === 'coach' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-6 w-6 rounded flex items-center justify-center flex-shrink-0 text-[9px] font-black
                ${m.from === 'ai' ? 'bg-lime-400/10 border border-lime-400/30 text-lime-400' : 'bg-amber-400/10 border border-amber-400/30 text-amber-400'}`}>
                {m.from === 'ai' ? 'AI' : 'CC'}
              </div>
              <div className={`rounded-xl px-3 py-2 max-w-xs
                ${m.from === 'ai' ? 'bg-zinc-900 border border-zinc-800 rounded-tl-sm' : 'bg-zinc-800 rounded-tr-sm'}`}>
                <p className="text-xs text-zinc-200 leading-relaxed">{m.text}</p>
                <p className="font-mono text-[10px] text-zinc-600 mt-1">{m.time}</p>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Alert */}
      {progress > 0.85 && (
        <div className="flex items-start gap-2 border border-lime-400/20 bg-lime-400/5 rounded-xl p-3">
          <CheckCircle className="h-4 w-4 text-lime-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300">All coaching calls this session were data-backed. Lap time improved <span className="text-lime-400 font-semibold">1.2s</span> vs session start.</p>
        </div>
      )}
    </div>
  )
}

// ─── SCENE CONFIG ─────────────────────────────────────────────────────────────
const SCENES = [
  {
    id: 'telemetry',
    label: 'Live Telemetry',
    caption: 'Every sensor. Every lap. In real time.',
    duration: 7000,
    component: SceneLiveTelemetry,
  },
  {
    id: 'ai-setup',
    label: 'AI Setup Advisor',
    caption: 'Data-backed setup changes your mechanic can make in 5 minutes.',
    duration: 7000,
    component: SceneAISetup,
  },
  {
    id: 'readiness',
    label: 'Rider Readiness',
    caption: 'Know 48 hours before gate drop if your rider can podium.',
    duration: 7000,
    component: SceneReadiness,
  },
  {
    id: 'competitive',
    label: 'Competitive Edge',
    caption: 'See exactly where you are faster. And where you are not.',
    duration: 7000,
    component: SceneCompetitive,
  },
  {
    id: 'coach',
    label: 'Pit Box Coach',
    caption: 'Real-time coaching with data-backed calls. No guessing.',
    duration: 7000,
    component: SceneCoach,
  },
]

// ─── MAIN PLAYER ─────────────────────────────────────────────────────────────
export default function PlatformDemo() {
  const [sceneIndex, setSceneIndex] = useState(0)
  const [sceneProgress, setSceneProgress] = useState(0) // 0–1
  const [isPlaying, setIsPlaying] = useState(true)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const pausedProgressRef = useRef(0)

  const scene = SCENES[sceneIndex]

  useEffect(() => {
    if (!isPlaying) return
    const sceneDuration = scene.duration

    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now - pausedProgressRef.current * sceneDuration
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / sceneDuration, 1)
      setSceneProgress(progress)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        // Advance to next scene
        const next = (sceneIndex + 1) % SCENES.length
        setSceneIndex(next)
        setSceneProgress(0)
        pausedProgressRef.current = 0
        startRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isPlaying, sceneIndex, scene.duration])

  function handlePlayPause() {
    if (isPlaying) {
      pausedProgressRef.current = sceneProgress
      startRef.current = null
    } else {
      startRef.current = null
    }
    setIsPlaying(p => !p)
  }

  function jumpToScene(i: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setSceneIndex(i)
    setSceneProgress(0)
    pausedProgressRef.current = 0
    startRef.current = null
    setIsPlaying(true)
  }

  const SceneComponent = scene.component

  return (
    <div className="w-full space-y-4">
      {/* Player shell */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              motorsportsdata.io · {scene.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
            <span className="font-mono text-[10px] text-lime-400">Live</span>
          </div>
        </div>

        {/* Scene */}
        <div className="h-[420px] overflow-hidden">
          <SceneComponent progress={sceneProgress} />
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-800">
          <div
            className="h-full bg-lime-400 transition-none"
            style={{ width: `${sceneProgress * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 px-4 py-3 border-t border-zinc-800 bg-zinc-900">
          <button
            onClick={handlePlayPause}
            className="h-8 w-8 rounded-full bg-lime-400 text-zinc-950 flex items-center justify-center hover:bg-lime-300 transition-colors flex-shrink-0"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
          </button>

          {/* Scene dots */}
          <div className="flex items-center gap-2 flex-1">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => jumpToScene(i)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wide transition-all
                  ${i === sceneIndex
                    ? 'bg-lime-400/15 text-lime-400 border border-lime-400/40'
                    : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${i === sceneIndex ? 'bg-lime-400' : 'bg-zinc-700'}`} />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>

          <span className="font-mono text-[10px] text-zinc-600 flex-shrink-0">
            {sceneIndex + 1}/{SCENES.length}
          </span>
        </div>
      </div>

      {/* Caption */}
      <p className="text-center text-zinc-400 text-sm leading-relaxed">
        {scene.caption}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/data/sign-in"
          className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-black uppercase tracking-wider text-sm px-6 py-3 rounded-xl hover:bg-lime-300 transition-colors"
        >
          Start Free — No Card Required
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="/data/pricing"
          className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 font-semibold text-sm px-6 py-3 rounded-xl hover:border-zinc-500 hover:text-zinc-100 transition-colors"
        >
          View Pricing
        </Link>
      </div>
    </div>
  )
}
