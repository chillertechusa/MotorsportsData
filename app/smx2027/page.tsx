import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Flag, Users, Zap, ShieldCheck, ArrowRight } from 'lucide-react'
import MdLogo from '@/components/md-logo'
import MdSeasonTimeline from '@/components/md-season-timeline'
import MdOnsiteRig from '@/components/md-onsite-rig'
import MdTeamPartner from '@/components/md-team-partner'
import MdFooter from '@/components/md-footer'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'SMX 2027 Data Command Center | Motorsport Data',
  description:
    'The official AI data platform for the SMX 2027 Championship season. 17 rounds, live AI crew chief support, multi-rider team dashboards, and full season analytics from Anaheim to Las Vegas. Team partnerships open now.',
  keywords: [
    'smx 2027', 'supercross 2027 data platform', 'smx championship team analytics',
    'motocross crew chief AI', 'supercross setup data 2027', 'smx team software',
    'race team data platform', 'smx command rig', 'elite smx team data',
    'motorsport data smx 2027', 'smx 2027 elite program', 'factory smx data program',
  ],
  alternates: {
    canonical: `${BASE_URL}/smx2027`,
  },
  openGraph: {
    title: 'SMX 2027 Data Command Center | Motorsport Data',
    description:
      '17 rounds. Live AI. Every gate drop. The data platform built specifically for the SMX 2027 Championship season.',
    type: 'website',
    url: `${BASE_URL}/smx2027`,
    images: [
      {
        url: `${BASE_URL}/assets/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'SMX 2027 Data Command Center — Motorsport Data',
      },
    ],
  },
}

const WHY_NOW = [
  {
    stat: '17',
    unit: 'Rounds',
    copy: 'Full season coverage from Anaheim Round 1 to the Las Vegas Championship Final.',
  },
  {
    stat: '3',
    unit: 'Elite Programs',
    copy: 'Team Partner · Command Partner · Factory Command. No solo riders. Teams only.',
  },
  {
    stat: '5',
    unit: 'Command Spots',
    copy: 'Only 5 Command Partner spots available. Includes dedicated analyst + rig desk every round.',
  },
  {
    stat: 'Onsite',
    unit: 'Every Venue',
    copy: 'Our Command Rig deploys to all 17 SMX venues. Live data ops parked in your pits.',
  },
]

const WHAT_WE_CRUNCH = [
  'Lap time deltas — session to session, round to round, all 17 venues',
  'Suspension setup change history — never repeat a bad setting',
  'Rider readiness score before every gate drop',
  'Post-moto AI debrief — auto-generated after every moto',
  'Cross-rider comparison — benchmark your full roster against each other',
  'Season standings tracker + points scenario calculator',
  'Race weekend chat AI — crew chief queries, platform answers in real time',
  'Command Rig onsite — live data ops parked in the pits every race weekend',
  'Full data export — your numbers, your property, always',
]

export default function SMX2027Page() {
  return (
    <>
      {/* Stripped header — logo only, no distraction */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/98 backdrop-blur-lg border-b border-zinc-800/40 h-14 flex items-center px-4 sm:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" aria-label="Motorsport Data home">
            <MdLogo size="sm" asLink={false} />
          </Link>
          <Link
            href="#team-partner"
            className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-bold text-xs sm:text-sm px-4 py-2 hover:bg-lime-300 transition-colors"
          >
            Apply for Elite Program
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="bg-zinc-950 pt-14">

        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden py-20 sm:py-28 lg:py-36"
          aria-label="SMX 2027 Campaign Hero"
        >
          {/* Grid overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(163,230,53,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.025) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
          {/* Corner accents */}
          <div aria-hidden="true" className="pointer-events-none absolute top-16 right-0 w-px h-64 bg-gradient-to-b from-lime-400/40 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute top-16 right-0 w-64 h-px bg-gradient-to-l from-lime-400/40 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
              <span className="font-mono text-[10px] sm:text-xs text-lime-400 uppercase tracking-[0.25em]">
                SMX World Championship · 2027 Season · Now Accepting Team Partners
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-zinc-100 uppercase leading-none tracking-tight mb-6 text-balance max-w-5xl"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(2.8rem, 10vw, 6.5rem)',
              }}
            >
              Your Team&apos;s{' '}
              <span className="text-lime-400">AI Crew Chief</span>
              <br />
              for the Full{' '}
              <span className="text-zinc-400">2027 Season.</span>
            </h1>

            {/* Subhead */}
            <p className="text-zinc-400 text-base sm:text-xl leading-relaxed max-w-2xl mb-8">
              Three elite programs. Our Command Rig in your pits. Live AI every gate drop — from Anaheim to Las Vegas. Built exclusively for team programs that run on data and cannot afford to guess.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-16">
              <Link
                href="#team-partner"
                className="inline-flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-bold px-7 py-4 hover:bg-lime-300 transition-colors text-base"
              >
                <Users className="h-5 w-5" aria-hidden="true" />
                Apply for Elite Program
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-zinc-600 text-zinc-100 font-semibold px-7 py-4 hover:bg-zinc-800/70 transition-colors text-base"
              >
                See the Platform
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Why-now stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Key campaign stats">
              {WHY_NOW.map((item) => (
                <div
                  key={item.unit}
                  role="listitem"
                  className="border border-zinc-800 bg-zinc-900/60 p-5"
                >
                  <p
                    className="text-lime-400 font-black leading-none mb-1"
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
                  >
                    {item.stat}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    {item.unit}
                  </p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Season Timeline ── */}
        <MdSeasonTimeline />

        {/* ── Onsite Support Rig ── */}
        <MdOnsiteRig />

        {/* ── What We Crunch ── */}
        <section
          className="border-t border-zinc-800/60 py-16 sm:py-20"
          aria-label="What Motorsport Data analyzes"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left — headline */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
                  <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
                    Data We Crunch
                  </span>
                </div>
                <h2
                  className="text-zinc-100 uppercase leading-none mb-5"
                  style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontWeight: 900,
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  }}
                >
                  Everything your crew chief needs.{' '}
                  <span className="text-lime-400">Every round.</span>
                </h2>
                <p className="text-zinc-400 text-base leading-relaxed max-w-md">
                  The platform runs continuously throughout the season — not just on race weekends. Setup changes, fitness trends, and lap delta analysis build up over all 17 rounds so every decision is backed by a full season of context.
                </p>
              </div>

              {/* Right — checklist */}
              <ul className="space-y-3" role="list">
                {WHAT_WE_CRUNCH.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-zinc-300 text-sm leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Team Partner Tiers ── */}
        <MdTeamPartner />

        {/* ── Final CTA strip ── */}
        <section
          className="border-t border-zinc-800/60 py-14 sm:py-16 bg-lime-400"
          aria-label="Final call to action"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2
              className="text-zinc-950 uppercase leading-none mb-4"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              }}
            >
              The season starts January 2027.
              <br />
              Your team should be ready at Round 1.
            </h2>
            <p className="text-zinc-800 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Only 5 Command Partner spots available. First teams in get embedded analyst support at every round from our rig. No solo riders. No self-serve. Apply now.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#team-partner"
                className="inline-flex items-center gap-2 bg-zinc-950 text-lime-400 font-bold px-8 py-4 hover:bg-zinc-800 transition-colors text-base"
              >
                Apply for Elite Program &rarr;
              </Link>
              <a
                href="mailto:motorsportsdata@gmail.com?subject=SMX%202027%20Elite%20Program%20Inquiry"
                className="inline-flex items-center gap-2 border-2 border-zinc-950 text-zinc-950 font-bold px-8 py-4 hover:bg-lime-300 transition-colors text-base"
              >
                Email Us Directly
              </a>
            </div>
          </div>
        </section>
      </main>

      <MdFooter />
    </>
  )
}
