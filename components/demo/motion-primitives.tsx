'use client'

import { clamp, lerp, wavePoints } from '@/lib/demo-motion'

// All primitives take a live numeric value (already computed from the clock)
// and render continuously. They are pure/stateless — the parent re-renders
// every animation frame, so motion is driven entirely by `t`.

const LIME = 'rgb(163 230 53)'
const CYAN = 'rgb(34 211 238)'
const ORANGE = 'rgb(251 146 60)'
const ZINC = 'rgb(82 82 91)'

// ── Sweeping-needle gauge ──────────────────────────────────────
export function Gauge({
  value,
  min,
  max,
  label,
  unit,
  color = LIME,
  size = 130,
}: {
  value: number
  min: number
  max: number
  label: string
  unit: string
  color?: string
  size?: number
}) {
  const pct = clamp((value - min) / (max - min), 0, 1)
  const startAngle = -220
  const endAngle = 40
  const angle = lerp(startAngle, endAngle, pct)
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 12

  // Arc track + filled arc.
  const arc = (a0: number, a1: number) => {
    const p0 = polar(cx, cy, r, a0)
    const p1 = polar(cx, cy, r, a1)
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`
  }
  const needle = polar(cx, cy, r - 6, angle)
  // Tick marks.
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const a = lerp(startAngle, endAngle, i / 8)
    const outer = polar(cx, cy, r, a)
    const inner = polar(cx, cy, r - 7, a)
    return { outer, inner }
  })

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={arc(startAngle, endAngle)} fill="none" stroke={ZINC} strokeWidth={6} strokeLinecap="round" opacity={0.4} />
        <path d={arc(startAngle, angle)} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
        {ticks.map((tk, i) => (
          <line key={i} x1={tk.inner.x} y1={tk.inner.y} x2={tk.outer.x} y2={tk.outer.y} stroke={ZINC} strokeWidth={1.5} />
        ))}
        {/* needle */}
        <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill="rgb(9 9 11)" stroke={color} strokeWidth={2} />
        <text x={cx} y={cy + r - 10} textAnchor="middle" fill="rgb(244 244 245)" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: size * 0.24 }}>
          {Math.round(value)}
        </text>
      </svg>
      <div className="text-center -mt-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">{label}</span>
        <span className="font-mono text-[9px] text-zinc-600 ml-1">{unit}</span>
      </div>
    </div>
  )
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

// ── Racing horizontal bar ──────────────────────────────────────
export function RacingBar({
  label,
  value,
  max,
  unit = '',
  color = LIME,
  highlight = false,
}: {
  label: string
  value: number
  max: number
  unit?: string
  color?: string
  highlight?: boolean
}) {
  const pct = clamp((value / max) * 100, 0, 100)
  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-[10px] uppercase tracking-wider w-24 shrink-0 truncate ${highlight ? 'text-lime-400' : 'text-zinc-400'}`}>
        {label}
      </span>
      <div className="relative flex-1 h-4 bg-zinc-800/60 rounded-sm overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{ width: `${pct}%`, background: color, boxShadow: highlight ? `0 0 12px ${color}` : 'none' }}
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-zinc-200 w-16 text-right shrink-0" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
        {value.toFixed(value < 10 ? 1 : 0)}{unit}
      </span>
    </div>
  )
}

// ── Scrolling waveform ─────────────────────────────────────────
export function Waveform({
  t,
  kind = 'sine',
  color = LIME,
  label,
  live,
  height = 70,
}: {
  t: number
  kind?: 'ecg' | 'sine' | 'throttle'
  color?: string
  label?: string
  live?: string
  height?: number
}) {
  const W = 300
  const H = height
  const n = 120
  const pts = wavePoints(t, n, kind)
  const d = pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${((i / (n - 1)) * W).toFixed(1)},${(y * H).toFixed(1)}`).join(' ')
  const area = `${d} L ${W},${H} L 0,${H} Z`
  return (
    <div className="w-full">
      {(label || live) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">{label}</span>}
          {live && <span className="font-mono text-[11px] tabular-nums" style={{ color }}>{live}</span>}
        </div>
      )}
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={`wf-${kind}-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#wf-${kind}-${color})`} />
        <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── Big spinning/jittering counter ─────────────────────────────
export function BigStat({
  value,
  label,
  unit,
  color = LIME,
  decimals = 0,
}: {
  value: number
  label: string
  unit?: string
  color?: string
  decimals?: number
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="tabular-nums leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.8rem)', color }}>
          {value.toFixed(decimals)}
        </span>
        {unit && <span className="font-mono text-xs text-zinc-500">{unit}</span>}
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500 mt-0.5">{label}</span>
    </div>
  )
}

// ── Pulsing radial ring ────────────────────────────────────────
export function Ring({
  value,
  max = 100,
  label,
  sub,
  color = LIME,
  size = 150,
}: {
  value: number
  max?: number
  label: string
  sub?: string
  color?: string
  size?: number
}) {
  const pct = clamp(value / max, 0, 1)
  const r = size / 2 - 14
  const circ = 2 * Math.PI * r
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ZINC} strokeWidth={8} opacity={0.35} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular-nums leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: size * 0.28, color }}>
          {Math.round(value)}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400 mt-1">{label}</span>
        {sub && <span className="font-mono text-[8px] text-zinc-600">{sub}</span>}
      </div>
    </div>
  )
}

// ── Equalizer bars (vertical, dancing) ─────────────────────────
export function Equalizer({ t, bars = 16, color = CYAN, height = 60 }: { t: number; bars?: number; color?: string; height?: number }) {
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {Array.from({ length: bars }, (_, i) => {
        const h = (Math.sin(t * 4 + i * 0.6) * 0.4 + Math.sin(t * 2.3 + i) * 0.3 + 0.5) * 100
        return <div key={i} className="flex-1 rounded-sm" style={{ height: `${clamp(h, 8, 100)}%`, background: color, opacity: 0.55 + (i % 3) * 0.15 }} />
      })}
    </div>
  )
}

export const COLORS = { LIME, CYAN, ORANGE, ZINC }
