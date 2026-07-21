'use client'

import { useEffect, useRef, useState } from 'react'

type Telemetry = {
  speed: number
  rpm: number
  lean: number
  frontSag: number
  rearSag: number
  heartRate: number
  gForce: number
  lapMs: number
}

function fmtLap(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

export default function MdHeroTelemetryInline() {
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
    <div aria-hidden="true" className="pointer-events-none select-none">
      {/* Live badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-lime-400">
          Live Session · Simulated
        </span>
      </div>

      {/* 2×3 stat grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <Stat label="Speed" value={Math.round(t.speed).toString()} unit="mph" />
        <Stat label="Heart Rate" value={t.heartRate.toString()} unit="bpm" accent />
        <Stat label="G-Force" value={t.gForce.toFixed(1)} unit="g" accent />
        <Stat label="Lean" value={Math.round(t.lean).toString()} unit="deg" />
        <Stat label="Front Sag" value={t.frontSag.toFixed(1)} unit="mm" />
        <Stat label="Rear Sag" value={t.rearSag.toFixed(0)} unit="mm" />
      </div>

      {/* Lap + RPM bar full width */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-2 backdrop-blur-sm">
          <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-500 mb-1">
            Lap · Last {fmtLap(lastLap)}
          </p>
          <p
            className="text-lime-400 text-xl leading-none font-black tabular-nums"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            {fmtLap(t.lapMs)}
          </p>
        </div>
        <div className="bg-zinc-950/80 border border-zinc-800 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-baseline justify-between mb-1.5">
            <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-500">RPM</p>
            <p className="font-mono text-[9px] text-zinc-300 tabular-nums">{t.rpm.toLocaleString()}</p>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-lime-400 transition-[width] duration-75 ease-out"
              style={{ width: `${rpmPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className={`bg-zinc-950/80 border px-2.5 py-2 backdrop-blur-sm ${accent ? 'border-lime-400/40' : 'border-zinc-800'}`}>
      <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-zinc-500 mb-0.5 truncate">{label}</p>
      <p className={`leading-none ${accent ? 'text-lime-400' : 'text-zinc-100'}`}>
        <span
          className="text-base font-black tabular-nums"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {value}
        </span>
        <span className="font-mono text-[7px] text-zinc-500 ml-0.5 uppercase">{unit}</span>
      </p>
    </div>
  )
}
