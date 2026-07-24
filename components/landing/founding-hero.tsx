import Link from 'next/link'
import { ArrowRight, Lock, Calendar } from 'lucide-react'

export default function FoundingHero() {
  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden bg-zinc-950 min-h-screen pt-14"
      aria-label="Founding enrollment hero"
    >
      {/* Grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,230,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      {/* Corner accents */}
      <div aria-hidden="true" className="pointer-events-none absolute top-16 right-0 w-px h-64 bg-gradient-to-b from-lime-400/40 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute top-16 right-0 w-64 h-px bg-gradient-to-l from-lime-400/40 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl">

          {/* Launch badge */}
          <div className="inline-flex items-center gap-3 mb-8 border border-lime-400/30 bg-lime-400/5 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-xs text-lime-400 uppercase tracking-[0.25em]">
              Founding enrollment open &mdash; closes Aug 31, 2026
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-zinc-100 uppercase leading-none tracking-tight mb-6 text-balance"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(2.8rem, 9vw, 7rem)',
            }}
          >
            One Platform.<br />
            <span className="text-lime-400">Every Racing Program.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-2xl mb-8">
            The operating system for riders, race teams, and professional coaches&mdash;from
            motocross to NASCAR, drag racing to rally. Telemetry, performance, race-day operations,
            and the business behind it all. One platform, built through your lens.
          </p>

          {/* Discipline rail */}
          <div className="flex flex-wrap gap-2 mb-10" aria-label="Supported motorsport disciplines">
            {['MX / SX', 'Enduro', 'FMX', 'Flat Track', 'NASCAR', 'Drag', 'Rally', 'Karting'].map((discipline) => (
              <span
                key={discipline}
                className="border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] text-zinc-500 uppercase tracking-widest"
              >
                {discipline}
              </span>
            ))}
            <span className="border border-lime-400/30 bg-lime-400/5 px-2.5 py-1 font-mono text-[10px] text-lime-400 uppercase tracking-widest">
              + every program
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-black text-sm uppercase tracking-widest px-8 py-4 hover:bg-lime-300 transition-colors"
            >
              Choose Your Plan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 text-zinc-300 font-semibold text-sm px-8 py-4 hover:border-lime-400/50 hover:text-zinc-100 transition-colors"
            >
              See It Through Your Lens
            </Link>
          </div>

          {/* Trust row */}
          <div className="mt-12 pt-8 border-t border-zinc-800/60 flex flex-wrap gap-6">
            {[
              { icon: Lock, label: 'Price locked for founding teams' },
              { icon: Calendar, label: 'Onboarded by your team before launch' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-lime-400 shrink-0" aria-hidden="true" />
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
