'use client'

import { useEffect, useState } from 'react'
import { X, Zap } from 'lucide-react'
import Link from 'next/link'

const LAUNCH_DATE = new Date('2026-08-31T09:00:00-06:00') // Aug 31 9am MT
const STORAGE_KEY = 'md_launch_banner_dismissed'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function Segment({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-0.5">
      <span className="font-mono text-sm font-bold tabular-nums text-primary leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </span>
  )
}

export default function LaunchCountdownBanner() {
  const [visible, setVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft())
  const [launched, setLaunched] = useState(false)

  useEffect(() => {
    // Don't show if dismissed or already past launch
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(STORAGE_KEY)
      if (!dismissed && LAUNCH_DATE.getTime() > Date.now()) {
        setVisible(true)
      }
    }
    if (LAUNCH_DATE.getTime() <= Date.now()) {
      setLaunched(true)
      return
    }

    const id = setInterval(() => {
      const tl = getTimeLeft()
      setTimeLeft(tl)
      if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
        setLaunched(true)
        clearInterval(id)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  if (!visible || launched) return null

  return (
    <div
      role="banner"
      className="relative z-50 w-full border-b border-primary/20 bg-primary/8 backdrop-blur-sm"
      style={{ background: 'oklch(0.78 0.20 130 / 0.06)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        {/* Left — icon + copy */}
        <div className="flex min-w-0 items-center gap-2">
          <Zap className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <p className="truncate text-xs font-medium text-foreground/80">
            <span className="font-semibold text-foreground">Platform launches Aug 31.</span>
            {' '}Founding slots are open now — lock your rate before launch.
          </p>
        </div>

        {/* Center — countdown segments */}
        <div
          className="hidden shrink-0 items-center gap-3 sm:flex"
          aria-label={`Time until launch: ${timeLeft.days} days ${timeLeft.hours} hours ${timeLeft.minutes} minutes ${timeLeft.seconds} seconds`}
        >
          <Segment value={timeLeft.days}    label="d"  />
          <span className="text-muted-foreground/40 text-sm font-bold leading-none">:</span>
          <Segment value={timeLeft.hours}   label="h"  />
          <span className="text-muted-foreground/40 text-sm font-bold leading-none">:</span>
          <Segment value={timeLeft.minutes} label="m"  />
          <span className="text-muted-foreground/40 text-sm font-bold leading-none">:</span>
          <Segment value={timeLeft.seconds} label="s"  />
        </div>

        {/* Right — CTA + dismiss */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/#pricing"
            className="hidden rounded border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 sm:block"
          >
            Claim founding rate
          </Link>
          <button
            onClick={dismiss}
            aria-label="Dismiss launch banner"
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
