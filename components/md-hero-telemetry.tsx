'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Simulated live-session telemetry HUD for the homepage hero.
 * All values are generated client-side sample data, clearly labeled "SIMULATED",
 * to demonstrate what the platform surfaces during a real session — NOT live data.
 */

type Telemetry = {
  speed: number      // mph
  rpm: number        // engine rpm
  lean: number       // degrees
  frontSag: number   // mm
  rearSag: number    // mm
  heartRate: number  // rider bpm
  gForce: number     // rider g-force
  lapMs: number      // current lap elapsed ms
}

function fmtLap(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

export default function MdHeroTelemetry() {
  const [t, setT] = useState<Telemetry>({
    speed: 46, rpm: 9200, lean: 28, frontSag: 34, rearSag: 102, heartRate: 158, gForce: 1.4, lapMs: 0,
  })
  const [lastLap, setLastLap] = useState(96430)
  const lapStart = useRef<number>(Date.now())
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let lastTick = performance.now()

    const loop = (now: number) => {
      const dt = now - lastTick
      if (dt >= 80) {
        lastTick = now
        setT((prev) => {
          // smooth pseudo-random drift within realistic bounds
          const jitter = (base: number, amp: number, min: number, max: number) =>
            Math.min(max, Math.max(min, base + (Math.random() - 0.5) * amp))
          const elapsed = Date.now() - lapStart.current
          return {
            speed: jitter(prev.speed, 6, 22, 72),
            rpm: Math.round(jitter(prev.rpm, 900, 6800, 12400)),
            lean: jitter(prev.lean, 7, 6, 43),
            frontSag: jitter(prev.frontSag, 1.2, 30, 38),
            rearSag: jitter(prev.rearSag, 2, 96, 108),
            heartRate: Math.round(jitter(prev.heartRate, 4, 148, 182)),
            gForce: jitter(prev.gForce, 0.5, 0.6, 3.2),
            lapMs: elapsed,
          }
        })
      }
      raf = requestAnimationFrame(loop)
    }

    if (!reduced.current) raf = requestAnimationFrame(loop)

    // lap + tip rotation
    const lapTimer = setInterval(() => {
      setLastLap(90000 + Math.floor(Math.random() * 9000))
      lapStart.current = Date.now()
    }, 12000)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(lapTimer)
    }
  }, [])

  const rpmPct = Math.min(100, ((t.rpm - 6000) / 6800) * 100)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none"
    >
      {/* ── Live session badge (top-right of hero) ── */}
      <div className="hidden md:flex absolute top-24 right-6 lg:right-10 flex-col items-end gap-2">
        <div className="flex items-center gap-2 bg-zinc-950/70 border border-lime-400/30 px-3 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-lime-400">
            Live Session · Simulated
          </span>
        </div>
      </div>

      {/* Mobile telemetry is rendered in-flow via <MdHeroTelemetryInline /> */}

      {/* ── Telemetry cluster — DESKTOP (full row) ── */}
      <div className="hidden sm:block absolute bottom-14 left-0 right-0 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            {/* readouts */}
            <div className="flex flex-wrap gap-2.5">
              <Readout label="Speed" value={Math.round(t.speed).toString()} unit="mph" />
              <Readout label="Lean" value={Math.round(t.lean).toString()} unit="deg" />
              <Readout label="Front Sag" value={t.frontSag.toFixed(1)} unit="mm" />
              <Readout label="Rear Sag" value={t.rearSag.toFixed(0)} unit="mm" />
              <Readout label="Heart Rate" value={t.heartRate.toString()} unit="bpm" accent />
              <Readout label="G-Force" value={t.gForce.toFixed(1)} unit="g" accent />
            </div>
            {/* lap + rpm */}
            <div className="flex items-end gap-2.5">
              <div className="bg-zinc-950/75 border border-zinc-800 px-4 py-2.5 backdrop-blur-sm min-w-[132px]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Lap · Last {fmtLap(lastLap)}</p>
                <p className="text-lime-400 text-2xl leading-none font-black tabular-nums" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                  {fmtLap(t.lapMs)}
                </p>
              </div>
              <div className="bg-zinc-950/75 border border-zinc-800 px-4 py-2.5 backdrop-blur-sm min-w-[132px]">
                <div className="flex items-baseline justify-between mb-1.5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">RPM</p>
                  <p className="font-mono text-[10px] text-zinc-300 tabular-nums">{t.rpm.toLocaleString()}</p>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-lime-400 transition-[width] duration-75 ease-out" style={{ width: `${rpmPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Readout({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className={`bg-zinc-950/75 border px-3.5 py-2.5 backdrop-blur-sm min-w-[92px] ${accent ? 'border-lime-400/40' : 'border-zinc-800'}`}>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-1">{label}</p>
      <p className={`leading-none ${accent ? 'text-lime-400' : 'text-zinc-100'}`}>
        <span
          className="text-2xl font-black tabular-nums"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {value}
        </span>
        <span className="font-mono text-[10px] text-zinc-500 ml-1 uppercase">{unit}</span>
      </p>
    </div>
  )
}
