'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Calendar, ClipboardList, ReceiptText, Brain,
  ChevronRight, ArrowRight, CheckCircle2, Lock, Zap,
  BarChart3, Target, Dumbbell
} from 'lucide-react'

const WHAT_YOULL_SEE = [
  {
    icon: Users,
    label: 'Athlete Roster',
    detail: '5 athletes across MX/SX, Enduro, and Karting — Tyler, Jade, Mason, Sienna, Brody',
  },
  {
    icon: Calendar,
    label: 'Upcoming Sessions',
    detail: 'Tuesday MX gate-start session, video review, past enduro and karting debriefs with AI notes',
  },
  {
    icon: ClipboardList,
    label: 'Training Plans',
    detail: "Tyler's pre-race build week, Jade's base block, Sienna's karting season plan — with AI-generated blocks",
  },
  {
    icon: ReceiptText,
    label: 'Invoicing & Billing',
    detail: '$1,580 MRR — 3 paid invoices, 2 outstanding, 2 service packages configured',
  },
  {
    icon: Brain,
    label: 'AI Debriefs',
    detail: 'Real AI-generated post-session analysis for Mason and Sienna with improvement notes',
  },
  {
    icon: BarChart3,
    label: 'Business KPIs',
    detail: 'Revenue, session cadence, athlete utilization, and outstanding AR — at a glance',
  },
]

const WHAT_IS_REAL = [
  'Live database — your demo data actually lives in Neon Postgres',
  'Real application code — same routes, same queries, same UI as a paying account',
  'AI debrief notes written for your demo athletes',
  'No mocks, no fake API responses',
]

const WHAT_IS_NOT = [
  'No credit card or account required',
  'Demo data is isolated — it does not affect real accounts',
  'The session auto-expires after 60 minutes',
]

type LaunchState = 'idle' | 'launching' | 'error'

export default function DemoLaunchClient() {
  const router = useRouter()
  const [state, setState] = useState<LaunchState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleLaunch() {
    setState('launching')
    setError(null)
    try {
      const res = await fetch('/api/demo/provision', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Provisioning failed')
      // In production this would follow data.redirectTo with an auth token.
      // For now, redirect to the coach dashboard.
      router.push(data.redirectTo ?? '/data/coach')
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-foreground] flex flex-col">

      {/* Nav bar */}
      <header className="sticky top-0 z-20 border-b border-[--color-border] bg-[--color-background]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/" className="font-heading font-black text-xl tracking-wide text-[--color-foreground]">
            MOTORSPORT DATA
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-sm font-medium text-[--color-muted-foreground] hover:text-[--color-foreground] transition-colors"
          >
            Create real account &rarr;
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-[--color-primary] bg-[--color-primary]/10 border border-[--color-primary]/20 rounded px-3 py-1 mb-5">
            Live product demo — no sign-up required
          </span>
          <h1 className="font-heading font-black text-5xl md:text-6xl lg:text-7xl tracking-tight text-balance leading-none mb-5">
            Walk into a real<br />
            <span className="text-[--color-primary]">coaching account.</span>
          </h1>
          <p className="text-[--color-muted-foreground] text-lg md:text-xl max-w-2xl mx-auto text-balance leading-relaxed">
            We&apos;ll spin up a live demo account pre-loaded with real athletes, sessions,
            training plans, and invoices. You&apos;re clicking around the actual product —
            not a video, not a tour, not a slide deck.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">

          {/* Left — what you'll see */}
          <div className="bg-[--color-card] border border-[--color-border] rounded-xl p-7">
            <h2 className="font-heading font-black text-xl tracking-wide mb-5 text-[--color-foreground] uppercase">
              What&apos;s loaded in your demo
            </h2>
            <div className="flex flex-col gap-4">
              {WHAT_YOULL_SEE.map(({ icon: Icon, label, detail }) => (
                <div key={label} className="flex gap-3">
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-[--color-primary]/10 border border-[--color-primary]/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[--color-primary]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[--color-foreground] leading-snug">{label}</p>
                    <p className="text-[--color-muted-foreground] text-xs leading-relaxed mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — honesty card + CTA */}
          <div className="flex flex-col gap-6">

            {/* What's real */}
            <div className="bg-[--color-card] border border-[--color-border] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[--color-primary]" aria-hidden="true" />
                <h3 className="font-heading font-bold text-base tracking-wide uppercase text-[--color-foreground]">
                  This is the real product
                </h3>
              </div>
              <ul className="flex flex-col gap-2">
                {WHAT_IS_REAL.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-[--color-muted-foreground]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[--color-primary] mt-0.5 shrink-0" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* What's NOT required */}
            <div className="bg-[--color-card] border border-[--color-border] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-[--color-muted-foreground]" aria-hidden="true" />
                <h3 className="font-heading font-bold text-base tracking-wide uppercase text-[--color-muted-foreground]">
                  No friction
                </h3>
              </div>
              <ul className="flex flex-col gap-2">
                {WHAT_IS_NOT.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-[--color-muted-foreground]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Launch CTA */}
            <div className="bg-[--color-primary]/5 border border-[--color-primary]/25 rounded-xl p-6 flex flex-col gap-4">
              <div>
                <p className="font-heading font-black text-lg tracking-wide uppercase text-[--color-foreground]">
                  Ready to see it?
                </p>
                <p className="text-[--color-muted-foreground] text-sm mt-1">
                  Takes about 3 seconds to provision. You&apos;ll land inside the Coach Business OS.
                </p>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleLaunch}
                disabled={state === 'launching'}
                className="group w-full flex items-center justify-center gap-2 bg-[--color-primary] text-[--color-primary-foreground] font-heading font-black text-base uppercase tracking-wide rounded-lg py-3.5 px-6 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Launch live demo account"
              >
                {state === 'launching' ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Provisioning your demo...
                  </>
                ) : (
                  <>
                    Launch Live Demo
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="text-center text-[--color-muted-foreground] text-xs">
                Or{' '}
                <Link href="/auth/sign-up?plan=coach_pro" className="text-[--color-primary] hover:underline">
                  start a real Coach Pro account
                </Link>{' '}
                &mdash; founding pricing available until Aug 31.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom strip — what the product covers */}
        <div className="border-t border-[--color-border] pt-10">
          <p className="text-center text-[--color-muted-foreground] text-xs font-mono uppercase tracking-widest mb-6">
            The demo shows the Coach Business OS — the full platform also includes
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Target, label: 'Telemetry & Lap Data', sub: 'Device ingest, session replay, channel normalization across all disciplines' },
              { icon: Dumbbell, label: 'Rider Health & Readiness', sub: 'Physical, mental, nutrition, injury tracking, RTR protocol' },
              { icon: BarChart3, label: 'Race Team Operations', sub: 'Parts vault, work orders, expenses, payroll, sponsor ROI' },
              { icon: Brain, label: 'Rig Doctor AI', sub: 'Setup coaching, debrief analysis, training plan generation, race-day intelligence' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-[--color-card] border border-[--color-border] rounded-lg p-4">
                <Icon className="w-5 h-5 text-[--color-primary] mb-2" aria-hidden="true" />
                <p className="font-semibold text-sm text-[--color-foreground] leading-snug">{label}</p>
                <p className="text-[--color-muted-foreground] text-xs mt-1 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="border-t border-[--color-border] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[--color-muted-foreground] text-xs">
            &copy; {new Date().getFullYear()} Motorsport Data &mdash; Chiller Tech Support LLC
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="text-[--color-muted-foreground] text-xs hover:text-[--color-foreground] transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="text-[--color-muted-foreground] text-xs hover:text-[--color-foreground] transition-colors">Terms</Link>
            <Link href="/auth/sign-up" className="text-[--color-primary] text-xs font-medium hover:underline flex items-center gap-1">
              Get started <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
