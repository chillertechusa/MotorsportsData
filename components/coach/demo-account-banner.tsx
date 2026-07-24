'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'

interface DemoAccountBannerProps {
  teamId: string
  /** ISO string of when the demo team was created */
  createdAt: string
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

function formatTimeLeft(ms: number) {
  if (ms <= 0) return 'expired'
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

export default function DemoAccountBanner({ teamId, createdAt }: DemoAccountBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!teamId.startsWith('demo-')) return

    const expires = new Date(createdAt).getTime() + TWO_HOURS_MS
    const update = () => setTimeLeft(expires - Date.now())
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [teamId, createdAt])

  if (!teamId.startsWith('demo-') || dismissed) return null

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/8 px-4 py-2 text-sm"
      style={{ background: 'oklch(0.75 0.18 75 / 0.07)' }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
        <span className="truncate text-amber-200/80">
          <span className="font-semibold text-amber-300">Demo account</span>
          {' — '}this data expires in{' '}
          <span className="font-mono font-semibold text-amber-300">
            {formatTimeLeft(timeLeft)}
          </span>
          . Your real account starts here.
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/checkout/tier?tier=coach_pro&utm_source=demo_banner"
          className="flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
        >
          Start real account
          <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss demo banner"
          className="rounded p-0.5 text-amber-500/60 transition-colors hover:text-amber-400"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
