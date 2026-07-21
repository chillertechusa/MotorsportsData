'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react'
import { DemoScene, CHAPTERS, SCENE_TOTAL, contextAt } from './demo-scenes'
import { DemoBackdrop } from './demo-backdrop'
import { sceneIndexAt, DEMO_DURATION } from '@/lib/demo-motion'

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function DenseDemoPlayer() {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number | null>(null)
  const tRef = useRef(0)

  // Keep a ref in sync so the rAF loop reads the latest time without re-subscribing.
  useEffect(() => {
    tRef.current = t
  }, [t])

  const tick = useCallback((now: number) => {
    if (lastRef.current == null) lastRef.current = now
    const dt = (now - lastRef.current) / 1000
    lastRef.current = now
    let next = tRef.current + dt
    if (next >= DEMO_DURATION) {
      next = DEMO_DURATION
      tRef.current = next
      setT(next)
      setPlaying(false)
      return
    }
    tRef.current = next
    setT(next)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (playing) {
      lastRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    } else if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, tick])

  const play = () => {
    if (tRef.current >= DEMO_DURATION) {
      setT(0)
      tRef.current = 0
    }
    setStarted(true)
    setPlaying(true)
  }
  const pause = () => setPlaying(false)
  const toggle = () => (playing ? pause() : play())
  const seek = (to: number) => {
    const clamped = Math.max(0, Math.min(DEMO_DURATION, to))
    tRef.current = clamped
    setT(clamped)
  }
  const skip = (delta: number) => seek(tRef.current + delta)

  const index = sceneIndexAt(t)
  const activeChapter = [...CHAPTERS].reverse().find((c) => t >= c.at) ?? CHAPTERS[0]
  const pct = (t / DEMO_DURATION) * 100
  const ctx = contextAt(t)
  const accent = ctx.accent

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); toggle() }
      else if (e.key === 'ArrowLeft') skip(-10)
      else if (e.key === 'ArrowRight') skip(10)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  return (
    <div className="w-full">
      {/* Stage */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        {/* Living, moving backdrop — scrolling perspective grid, breathing glow, scan line */}
        <DemoBackdrop t={t} accent={accent} />

        {/* Active scene */}
        <DemoScene t={t} index={index} />

        {/* Start overlay */}
        {!started && (
          <button
            onClick={play}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/70 backdrop-blur-sm group"
            aria-label="Play demo"
          >
            <span className="flex items-center justify-center h-20 w-20 rounded-full bg-lime-400 text-zinc-950 group-hover:scale-110 transition-transform">
              <Play className="h-9 w-9 ml-1" fill="currentColor" />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-lime-400">Play 120-Second Demo</span>
            <span className="text-zinc-400 text-sm">{SCENE_TOTAL} live scenes · every metric moving in real time</span>
          </button>
        )}

        {/* Live phase badge */}
        {started && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-zinc-950/70 backdrop-blur-sm border border-zinc-800 px-3 py-1.5 rounded">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: accent }} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300">{activeChapter.label}</span>
          </div>
        )}

        {/* Narrative context strip — anchors the numbers to a story */}
        {started && (
          <div className="absolute inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-4 py-2.5">
            <div className="flex items-center gap-3 sm:gap-4">
              <span
                className="font-mono text-[10px] sm:text-xs tabular-nums px-2 py-1 rounded shrink-0"
                style={{ color: accent, background: `${accent}1a`, border: `1px solid ${accent}40` }}
              >
                {ctx.lap}
              </span>
              <span className="font-mono text-[10px] sm:text-xs tabular-nums text-zinc-400 shrink-0 hidden xs:inline">
                {ctx.sector}
              </span>
              <span className="h-3 w-px bg-zinc-700 shrink-0 hidden sm:block" />
              <span className="text-zinc-200 text-xs sm:text-sm leading-tight truncate">{ctx.headline}</span>
            </div>
          </div>
        )}
      </div>

      {/* Transport controls */}
      <div className="mt-3 flex flex-col gap-2">
        {/* Scrubber with chapter ticks */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={DEMO_DURATION}
            step={0.1}
            value={t}
            onChange={(e) => seek(parseFloat(e.target.value))}
            aria-label="Seek demo timeline"
            className="w-full h-1.5 appearance-none bg-zinc-800 rounded-full cursor-pointer accent-lime-400"
            style={{ background: `linear-gradient(to right, rgb(163 230 53) ${pct}%, rgb(39 39 42) ${pct}%)` }}
          />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
            {CHAPTERS.map((c) => (
              <span
                key={c.label}
                className="absolute h-3 w-px bg-zinc-600 -translate-y-1/2"
                style={{ left: `${(c.at / DEMO_DURATION) * 100}%` }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => skip(-10)} aria-label="Back 10 seconds" className="flex items-center justify-center h-9 w-9 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="flex items-center justify-center h-10 w-10 rounded bg-lime-400 text-zinc-950 hover:bg-lime-300 transition-colors">
              {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 ml-0.5" fill="currentColor" />}
            </button>
            <button onClick={() => skip(10)} aria-label="Forward 10 seconds" className="flex items-center justify-center h-9 w-9 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors">
              <RotateCw className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs tabular-nums text-zinc-400 ml-2">
              {fmt(t)} <span className="text-zinc-600">/ {fmt(DEMO_DURATION)}</span>
            </span>
          </div>

          {/* Chapter jump buttons */}
          <div className="hidden md:flex items-center gap-1">
            {CHAPTERS.map((c, i) => (
              <button
                key={c.label}
                onClick={() => { seek(c.at); setStarted(true); setPlaying(true) }}
                className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded transition-colors ${activeChapter.label === c.label ? 'bg-lime-400/15 text-lime-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
              >
                {i + 1}. {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
