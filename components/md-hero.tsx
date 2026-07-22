import Link from 'next/link'
import { Play, ArrowRight } from 'lucide-react'
import MdHeroTelemetry from '@/components/md-hero-telemetry'
import MdHeroTelemetryInline from '@/components/md-hero-telemetry-inline'

export default function MdHero() {
  return (
    <section
      className="relative flex flex-col justify-start overflow-hidden bg-zinc-950 pt-14 min-h-screen min-h-[100svh]"
      aria-label="Hero"
    >
      {/* ── Dark base overlay ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,230,53,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.025) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          backgroundPosition: '0 0',
        }}
      />

      {/* ── Corner accent lines ── */}
      <div aria-hidden="true" className="pointer-events-none absolute top-16 right-0 w-px h-64 bg-gradient-to-b from-lime-400/50 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute top-16 right-0 w-64 h-px bg-gradient-to-l from-lime-400/50 to-transparent" />

      {/* ── Simulated live-session telemetry overlay ── */}
      <MdHeroTelemetry />

      {/* ── Content ── */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10
                      sm:max-w-7xl sm:mx-auto
                      pb-6 sm:pb-52 md:pb-56">

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-0.5 w-6 sm:w-8 bg-lime-400" />
          <span className="font-mono text-[10px] sm:text-xs text-lime-400 uppercase tracking-[0.25em]">
            Watch Live Data. Simulated.
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
          Every Lap.{' '}
          <span className="text-lime-400">Every Data Point.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-zinc-400 text-sm sm:text-lg md:text-xl leading-relaxed max-w-xl sm:max-w-2xl mb-5 sm:mb-6">
          Track lap times, suspension deltas, speed, and rider vitals—all in one platform. Built for freelance riders, factory teams, and everyone racing in between.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:mb-10">
          <Link
            href="/demo"
            className="group inline-flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-semibold px-6 py-3.5 rounded-lg hover:bg-lime-300 transition-colors"
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Watch Demo
          </Link>
          <Link
            href="/data/sign-in?redirect=/data"
            className="inline-flex items-center justify-center gap-2 border border-zinc-600 text-zinc-100 font-semibold px-6 py-3.5 rounded-lg hover:bg-zinc-800/70 backdrop-blur-sm transition-colors"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Discipline tags — desktop */}
        <div className="hidden sm:block pt-6 sm:pt-8 border-t border-zinc-800/60">
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-[0.25em] mb-3 sm:mb-4">
            Real-time telemetry, from rookie to factory rig
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3">
            {['Mini / Youth', 'Amateur MX', 'Women\u2019s MX', 'Supercross', 'Pro Motocross', 'SMX', 'Factory Teams'].map((tag) => (
              <span key={tag} className="font-mono text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2.5 sm:px-3 py-1 bg-zinc-950/60">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── MOBILE ONLY: discipline strip + inline telemetry ── */}
        <div className="sm:hidden">
          {/* Discipline strip */}
          <div className="pt-4 border-t border-zinc-800/60 mb-5">
            <div className="flex flex-wrap gap-x-2 gap-y-2">
              {['MX', 'Supercross', 'SMX', 'Women\u2019s MX', 'Factory'].map((tag) => (
                <span key={tag} className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-1 bg-zinc-950/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Telemetry inline — 2×3 grid so all 6 stats show */}
          <MdHeroTelemetryInline />
        </div>

        {/* Stat badges — desktop only */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4">
          {[
            { label: 'Team Roles', value: '11' },
            { label: 'AI Co-Pilots', value: '4' },
            { label: 'Tiers, from Free', value: '5' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-zinc-950/80 border border-zinc-800 px-5 py-4 min-w-[148px] backdrop-blur-sm"
              style={{ animation: `mdFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) ${0.5 + i * 0.12}s both` }}
            >
              <p className="text-lime-400 text-3xl font-black leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                {stat.value}
              </p>
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
