import type { Metadata } from 'next'
import Link from 'next/link'
import MdNav from '@/components/md-nav'
import MdFooter from '@/components/md-footer'
import { DemoBangerPlayer } from '@/components/demo/DemoBangerPlayer'
import { ArrowRight } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Platform Demo — See Inside the Motorsports Data Platform',
  description:
    'Watch a complete walkthrough of the motorsports data platform: sign-in, dashboard, training logs, live sessions, real-time telemetry, AI coaching, competitive analysis, and business metrics. 8 scenes, 90 seconds.',
  keywords: [
    'motorsports platform demo', 'telemetry dashboard', 'AI coaching', 'race analysis',
    'team performance', 'rider coaching', 'competitive racing', 'data platform walkthrough',
  ],
  alternates: { canonical: `${BASE_URL}/demo` },
  openGraph: {
    title: 'Platform Demo — Complete Walkthrough',
    description:
      'See what\\'s inside: sign-in flow, dashboard, training preparation, live session data, telemetry playback, AI coaching, results analysis, and business impact.',
    type: 'website',
    url: `${BASE_URL}/demo`,
    images: [{ url: `${BASE_URL}/images/md-hero-bg.png`, width: 1200, height: 630, alt: 'Motorsports Data Platform Demo' }],
  },
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <MdNav />

      <main className="pt-16 pb-24">
        {/* Hero section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-0.5 w-6 bg-lime-400" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-lime-400">Live · 32 Sections · Every Metric Moving</span>
              <span className="h-0.5 w-6 bg-lime-400" />
            </div>
            <h1
              className="text-zinc-50 uppercase leading-none tracking-tight text-balance mb-4"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
            >
              Walk Through the <span className="text-lime-400">Platform</span>
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-3xl text-pretty">
              Press play to see the complete user journey: sign in as a factory team, check your rider&apos;s readiness,
              review training prep, dive into live telemetry from a qualifying session, watch AI coaching in action,
              see competitive analysis with position changes, and view the business impact metrics. 8 scenes, 90 seconds,
              all the data that drives wins.
            </p>
          </div>
        </section>

        {/* Banger 120s demo player */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <DemoBangerPlayer />
        </section>

        {/* What you saw */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-lime-400">The 8 Chapters</h2>
              <ul className="space-y-3 text-zinc-300 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="font-bold text-lime-400 shrink-0">01.</span>
                  <span><strong>Live Telemetry</strong> — Speed, RPM, lean, throttle/brake, suspension travel, vitals</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-cyan-400 shrink-0">02.</span>
                  <span><strong>AI Setup Engine</strong> — Suspension solver, tire/thermal gauges, before/after lap-time gain</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-lime-400 shrink-0">03.</span>
                  <span><strong>Readiness &amp; Health</strong> — Readiness, HRV, training load, fuel, mental fitness, injury risk</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-400 shrink-0">04.</span>
                  <span><strong>Live Coaching</strong> — Sub-500ms lap feed, pit-to-rider radio, coach dashboard</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-cyan-400 shrink-0">05.</span>
                  <span><strong>Competitive Edge</strong> — Leaderboard climbing, sector deltas, gap-to-leader closing</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-orange-400 shrink-0">06.</span>
                  <span><strong>Crew &amp; Logistics</strong> — Part vault, engine hours, maintenance, race calendar</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-cyan-400 shrink-0">07.</span>
                  <span><strong>Business</strong> — Sponsor media value, invoice-to-cash financials</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-lime-400 shrink-0">08.</span>
                  <span><strong>The Payoff</strong> — Season totals, championship points, whole-team roster</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black uppercase text-cyan-400">Why This Approach</h2>
              <ul className="space-y-3 text-zinc-300 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>No false claims</strong> — Real product metrics animating live, not staged video</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Dense information</strong> — Every second shows new animated data flowing in</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Honest storytelling</strong> — Shows actual product UI with real metrics animating</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>Integrated narrative</strong> — Training informs readiness, readiness informs setup, setup drives wins</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span><strong>No link-digging</strong> — Everything visible in one continuous flow</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-lime-400/30 bg-gradient-to-r from-lime-400/10 via-cyan-400/10 to-lime-400/10 rounded-lg p-8 sm:p-12 text-center">
            <h2
              className="text-zinc-50 uppercase leading-none text-balance mb-3"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Ready to Build Your Edge?
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              Start free. No credit card. Invite your team. Upload your first session. Watch the AI work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/data/sign-in?redirect=/data"
                className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-semibold px-8 py-4 rounded-lg hover:bg-lime-300 transition-colors text-lg"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/data/pricing"
                className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-100 font-semibold px-8 py-4 rounded-lg hover:bg-zinc-800/70 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MdFooter />
    </div>
  )
}
