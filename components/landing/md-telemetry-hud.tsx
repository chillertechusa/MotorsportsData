'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

/* ── Telemetry is a PURE FUNCTION of video time ──────────────────────────
   Nothing accumulates and there is no independent timer, so the readouts
   are locked to the footage: the same frame always produces the same
   numbers, on every loop and for every visitor. SSR renders frameAt(0)
   and the client's first paint agrees. */

/* The hero clip is short and loops. One video loop == one simulated lap,
   so the sector bar fills exactly once per loop and every platform event
   fires every time. Resolved from the real duration at runtime. */
const FALLBACK_CYCLE = 7.2
const TRACE_POINTS = 24
const TRACE_STEP = 0.09 // seconds between trace samples

type Frame = {
  speed: number
  rpm: number
  lean: number
  travel: number
  gear: number
  lap: number
  sector: number
  lapNo: number
  progress: number
  trace: number[]
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Normalized 0–1 speed at any point in time. */
function speedPct(t: number) {
  const phase = Math.sin(t / 0.72)
  const phase2 = Math.sin(t / 0.3 + 1.2)
  return clamp((52 + phase * 26 + phase2 * 4 - 14) / 70, 0, 1)
}

function frameAt(t: number, cycle: number, loop: number): Frame {
  const pct = speedPct(t)
  const speed = 14 + pct * 70
  const phase2 = Math.sin(t / 0.3 + 1.2)

  const trace: number[] = []
  for (let i = 0; i < TRACE_POINTS; i += 1) {
    trace.push(Math.round(speedPct(t - (TRACE_POINTS - 1 - i) * TRACE_STEP) * 100))
  }

  const inCycle = clamp(t, 0, cycle)

  return {
    speed,
    rpm: clamp(6.4 + pct * 5.4 + phase2 * 0.3, 4.2, 12.4),
    lean: clamp(30 + Math.abs(Math.sin(t / 0.5)) * 22 - Math.sin(t / 0.72) * 6, 4, 52),
    travel: clamp(58 + Math.sin(t / 0.21) * 32, 6, 99),
    gear: clamp(Math.round(1 + pct * 4), 1, 5),
    lap: 44.2 + Math.sin(loop * 1.7) * 1.6,
    sector: clamp(Math.floor((inCycle / cycle) * 3) + 1, 1, 3),
    lapNo: loop + 4,
    progress: inCycle / cycle,
    trace,
  }
}

/* ── What the platform does, fired at fixed points in the lap ──────────── */

type PlatformEvent = {
  at: number
  hold: number
  tag: string
  title: string
  body: string
}

/* Positions are fractions of one video loop (0–1), so the schedule holds
   no matter how long the clip is. One event is on screen at all times. */
const EVENTS: PlatformEvent[] = [
  {
    at: 0,
    hold: 0.25,
    tag: 'Ride log',
    title: 'Lap auto-logged',
    body: 'Lap time and sector splits written straight to the rider file.',
  },
  {
    at: 0.25,
    hold: 0.25,
    tag: 'AI Doctor',
    title: 'Fork bottoming — 3 hits',
    body: 'Compression too soft for this track. Suggests +2 clicks.',
  },
  {
    at: 0.5,
    hold: 0.25,
    tag: 'Contingency',
    title: '3 programs matched',
    body: 'This result qualifies for $450. Claims filed automatically.',
  },
  {
    at: 0.75,
    hold: 0.25,
    tag: 'Readiness',
    title: 'Training load spike',
    body: 'Third session in four days. Recovery day recommended.',
  },
]

/** Advances through the four capabilities as the clip plays, and offsets by
    a prime-ish stride each loop so a viewer parked on the hero doesn't see
    the same slot land on the same footage twice in a row. */
function eventAt(progress: number, loop: number): PlatformEvent {
  const slot = EVENTS.findIndex((e) => progress >= e.at && progress < e.at + e.hold)
  const base = slot === -1 ? 0 : slot
  return EVENTS[(base + loop * 3) % EVENTS.length]
}

export default function MdTelemetryHud({
  videoRef,
}: {
  videoRef?: RefObject<HTMLVideoElement | null>
}) {
  const [t, setT] = useState(0)
  const [cycle, setCycle] = useState(FALLBACK_CYCLE)
  const [loopNo, setLoopNo] = useState(0)
  const raf = useRef<number | null>(null)
  const lastT = useRef(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const tick = () => {
      const video = videoRef?.current

      if (video?.duration && Number.isFinite(video.duration)) {
        setCycle((prev) => (Math.abs(prev - video.duration) > 0.05 ? video.duration : prev))
      }

      /* Read the clock the viewer is actually watching. Fall back to the
         document timeline only if the video element never mounts. */
      const now =
        video && Number.isFinite(video.currentTime)
          ? video.currentTime
          : performance.now() / 1000

      /* currentTime jumping backwards means the clip wrapped — count it so
         lap number advances and the event schedule rotates. */
      if (now < lastT.current - 0.2) setLoopNo((n) => n + 1)
      lastT.current = now

      setT(now)
      raf.current = window.requestAnimationFrame(tick)
    }

    raf.current = window.requestAnimationFrame(tick)
    return () => {
      if (raf.current !== null) window.cancelAnimationFrame(raf.current)
    }
  }, [videoRef])

  const frame = frameAt(t, cycle, loopNo)
  const event = eventAt(frame.progress, loopNo)

  const tracePoints = frame.trace
    .map((v, i) => `${(i / (frame.trace.length - 1)) * 100},${34 - (v / 100) * 30}`)
    .join(' ')

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none border border-white/12 bg-black/45 backdrop-blur-md"
    >
      {/* Header — session identity, tied to the footage */}
      <div className="flex items-center justify-between border-b border-white/12 px-4 py-2.5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-lime">
          Live Telemetry
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
          Rec
        </span>
      </div>

      {/* Lap + sector progress — visibly tracks the video position */}
      <div className="border-b border-white/12 px-4 py-2.5">
        <div className="flex items-baseline justify-between font-mono text-[9px] uppercase tracking-[0.2em]">
          <span className="text-zinc-500">
            Lap <span className="text-white">{frame.lapNo}</span>
          </span>
          <span className="text-zinc-500">
            Sector <span className="text-white">{frame.sector}</span> / 3
          </span>
        </div>
        <div className="mt-2 flex gap-1">
          {[0, 1, 2].map((s) => {
            const fill = clamp(frame.progress * 3 - s, 0, 1)
            return (
              <div key={s} className="h-[3px] flex-1 bg-white/12">
                <div className="h-full bg-lime" style={{ width: `${fill * 100}%` }} />
              </div>
            )
          })}
        </div>
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
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
            RPM &times;1K
          </div>
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

      {/* What the platform is doing with this data, right now */}
      <div className="min-h-[92px] border-t border-white/12 bg-lime/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 bg-lime" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-lime">
            {event.tag}
          </span>
        </div>
        <div className="mt-2 text-[13px] font-bold leading-tight text-white">{event.title}</div>
        <p className="mt-1.5 text-[11px] leading-snug text-zinc-400">{event.body}</p>
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
        <div className="h-full bg-lime" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
