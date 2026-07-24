'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

// Platform launch — August 31, 2026 at midnight UTC
const ROUND_ONE = new Date('2026-08-31T23:59:59-07:00')

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    }
  }
  const [countdown, setCountdown] = useState(calc)
  useEffect(() => {
    setCountdown(calc())
    const id = setInterval(() => setCountdown(calc()), 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return countdown
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-zinc-950 font-black leading-none tabular-nums"
        style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '1.1rem' }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-zinc-700 font-mono uppercase tracking-widest" style={{ fontSize: '0.55rem' }}>
        {label}
      </span>
    </div>
  )
}

export default function MdCampaignBanner() {
  const [dismissed, setDismissed] = useState(true)
  const countdown = useCountdown(ROUND_ONE)

  useEffect(() => {
    const stored = localStorage.getItem('md-founding-banner-dismissed')
    if (!stored) {
      setDismissed(false)
      document.documentElement.style.setProperty('--banner-offset', '40px')
    }
  }, [])

  function dismiss() {
    localStorage.setItem('md-founding-banner-dismissed', '1')
    document.documentElement.style.setProperty('--banner-offset', '0px')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div
      role="banner"
      className="fixed top-0 left-0 right-0 z-[60] bg-lime-400 text-zinc-950"
      style={{ height: '40px' }}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">

        {/* Left — founding label */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
            Founding pricing locks Aug 31 — 30% off forever
          </span>
        </div>

        {/* Center — countdown */}
        <div className="flex items-center gap-3 sm:gap-5 mx-auto sm:mx-0">
          <p className="text-xs sm:text-sm font-semibold leading-none">
            <span className="hidden sm:inline">Platform launches — </span>
            Aug 31 in
          </p>

          {/* Countdown digits */}
          <div className="flex items-center gap-2">
            <Digit value={countdown.days} label="d" />
            <span className="text-zinc-700 font-black text-sm leading-none mb-1">:</span>
            <Digit value={countdown.hours} label="h" />
            <span className="text-zinc-700 font-black text-sm leading-none mb-1">:</span>
            <Digit value={countdown.minutes} label="m" />
            <span className="text-zinc-700 font-black text-sm leading-none mb-1">:</span>
            <Digit value={countdown.seconds} label="s" />
          </div>

          <Link
            href="#pricing"
            className="hidden sm:inline-flex items-center gap-1 bg-zinc-950 text-lime-400 font-bold text-xs px-3 py-1 rounded hover:bg-zinc-800 transition-colors whitespace-nowrap"
          >
            Lock founding price &rarr;
          </Link>
        </div>

        {/* Right — dismiss */}
        <button
          onClick={dismiss}
          aria-label="Dismiss banner"
          className="shrink-0 p-1 hover:bg-lime-300 rounded transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
