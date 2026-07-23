import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import MdHeroTelemetry from '@/components/md-hero-telemetry'
import MdHeroTelemetryInline from '@/components/md-hero-telemetry-inline'

export default function MdHero() {
  return (
    <section
      className="relative flex flex-col justify-start overflow-hidden bg-zinc-950 pt-14 min-h-screen min-h-[100svh]"
      aria-label="Hero"
    >
      {/* Dark base overlay */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,230,53,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.025) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Corner accent lines */}
      <div aria-hidden="true" className="pointer-events-none absolute top-16 right-0 w-px h-64 bg-gradient-to-b from-lime-400/50 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute top-16 right-0 w-64 h-px bg-gradient-to-l from-lime-400/50 to-transparent" />

      {/* Live-session telemetry overlay */}
      <MdHeroTelemetry />

      {/* Content */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 md:pt-12
                      sm:max-w-7xl sm:mx-auto
                      pb-6 sm:pb-52 md:pb-56">

        {/* Founding badge */}
        <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/30 px-3 py-1 mb-6">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
          <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
            Founding Season — 30% off forever
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="text-zinc-100 uppercase leading-none tracking-tight mb-4 sm:mb-6 text-balance"
          style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontWeight: 900,
            fontSize: 'clamp(2.6rem, 11vw, 7.5rem)',
          }}
        >
          Run your entire{' '}
          <br className="hidden sm:block" />
          racing program.{' '}
          <br className="hidden sm:block" />
          <span className="text-lime-400">Like a business.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-zinc-400 text-sm sm:text-lg md:text-xl leading-relaxed max-w-xl sm:max-w-2xl mb-5 sm:mb-8 text-pretty">
          From the family pit to the factory rig — one platform for every role on the team.
          Bike maintenance, setup coaching, crew chief AI, hauler ops, sponsor ROI, and live race intelligence.
          One login. Every tier.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:mb-10">
          <Link
            href="#pricing"
            className="group inline-flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-bold px-6 py-3.5 hover:bg-lime-300 transition-colors"
          >
            Claim Founding Pricing
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="#modules"
            className="inline-flex items-center justify-center gap-2 border border-zinc-600 text-zinc-100 font-semibold px-6 py-3.5 hover:bg-zinc-800/70 backdrop-blur-sm transition-colors"
          >
            See every module
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Tier strip — desktop */}
        <div className="hidden sm:block pt-6 sm:pt-8 border-t border-zinc-800/60">
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-[0.25em] mb-3 sm:mb-4">
            One platform — four tiers — every program size
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3">
            {[
              'Grassroots — $49/mo',
              'Privateer — $199/mo',
              'Race Team — $599/mo',
              'Factory Command — $18K/mo',
              '12 Modules',
              'AI Coach Built In',
              'Zero per-user fees',
            ].map((tag) => (
              <span key={tag} className="font-mono text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2.5 sm:px-3 py-1 bg-zinc-950/60">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile strip */}
        <div className="sm:hidden">
          <div className="pt-4 border-t border-zinc-800/60 mb-5">
            <div className="flex flex-wrap gap-x-2 gap-y-2">
              {['$49/mo Start', '12 Modules', 'AI Coach', 'Factory Ready'].map((tag) => (
                <span key={tag} className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-1 bg-zinc-950/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <MdHeroTelemetryInline />
        </div>

        {/* Stat badges — desktop only */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4">
          {[
            { label: 'Starting at', value: '$49', sub: 'per month' },
            { label: 'Platform modules', value: '12' , sub: 'live + roadmap' },
            { label: 'Team roles', value: '6', sub: 'every console covered' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-zinc-950/80 border border-zinc-800 px-5 py-4 min-w-[160px] backdrop-blur-sm"
              style={{ animation: `mdFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.12}s both` }}
            >
              <p className="text-lime-400 text-3xl font-black leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                {stat.value}
              </p>
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
              <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest mt-0.5">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
