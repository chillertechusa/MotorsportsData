'use client'

import { useEffect, useRef, useState } from 'react'

/* Deterministic start values so SSR and first client paint agree. */
const SEED_TRACE = [38, 44, 52, 61, 68, 74, 79, 83, 86, 88, 84, 76, 66, 58, 63, 71, 78, 84, 89, 92]

type Frame = {
  speed: number
  rpm: number
  lean: number
  travel: number
  gear: number
  lap: number
  trace: number[]
}

const SEED: Frame = {
  speed: 58,
  rpm: 9.4,
  lean: 34,
  travel: 71,
  gear: 4,
  lap: 44.2,
  trace: SEED_TRACE,
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export default function MdTelemetryHud() {
  const [frame, setFrame] = useState<Frame>(SEED)
  const tick = useRef(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      tick.current += 1
      const t = tick.current

      /* Smooth pseudo-lap: sine-driven so it reads like a real rider
         cycling through corner-entry, apex, and drive-out. */
      const phase = Math.sin(t / 14)
      const phase2 = Math.sin(t / 6 + 1.2)

      setFrame((prev) => {
        const speed = clamp(52 + phase * 26 + phase2 * 4, 14, 84)
        const rpm = clamp(6.4 + ((speed - 14) / 70) * 5.4 + phase2 * 0.3, 4.2, 12.4)
        const lean = clamp(30 + Math.abs(Math.sin(t / 9)) * 22 - phase * 6, 4, 52)
        const travel = clamp(58 + Math.sin(t / 4) * 30, 8, 98)
        const gear = clamp(Math.round(1 + ((speed - 14) / 70) * 4), 1, 5)
        const next = [...prev.trace.slice(1), Math.round(((speed - 14) / 70) * 100)]
        const lap = clamp(prev.lap + Math.sin(t / 21) * 0.14, 41.8, 47.4)
        return { speed, rpm, lean, travel, gear, lap, trace: next }
      })
    }, 130)

    return () => window.clearInterval(id)
  }, [])

  const tracePoints = frame.trace
    .map((v, i) => `${(i / (frame.trace.length - 1)) * 100},${34 - (v / 100) * 30}`)
    .join(' ')

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none border border-white/12 bg-black/45 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/12 px-4 py-2.5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-lime">
          Live Telemetry
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
          Rec
        </span>
      </div>

      {/* Primary readout */}
      <div className="flex items-end gap-5 px-4 pt-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">MPH</div>
          <div className="font-mono text-4xl font-black leading-none tabular-nums text-white">
            {frame.speed.toFixed(0)}
          </div>
        </div>
        <div className="pb-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Gear</div>
          <div className="font-mono text-2xl font-black leading-none tabular-nums text-lime">
            {frame.gear}
          </div>
        </div>
        <div className="pb-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">RPM ×1K</div>
          <div className="font-mono text-2xl font-black leading-none tabular-nums text-white">
            {frame.rpm.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Speed trace */}
      <div className="px-4 pt-3">
        <svg viewBox="0 0 100 34" preserveAspectRatio="none" className="h-10 w-full">
          <polyline
            points={tracePoints}
            fill="none"
            stroke="var(--color-lime)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Channels */}
      <div className="mt-1 flex flex-col gap-3 px-4 pb-4">
        <Channel label="Lean" value={`${frame.lean.toFixed(0)}°`} pct={(frame.lean / 52) * 100} />
        <Channel label="Fork travel" value={`${frame.travel.toFixed(0)}%`} pct={frame.travel} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/12 px-4 py-2.5">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
          Last lap
        </span>
        <span className="font-mono text-[11px] font-bold tabular-nums text-lime">
          1:{frame.lap.toFixed(2).padStart(5, '0')}
        </span>
      </div>
    </div>
  )
}

function Channel({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </span>
        <span className="font-mono text-[11px] font-bold tabular-nums text-white">{value}</span>
      </div>
      <div className="mt-1.5 h-[3px] w-full bg-white/12">
        <div
          className="h-full bg-lime transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
