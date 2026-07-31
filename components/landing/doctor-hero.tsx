'use client'

import Link from 'next/link'
import DemoButton from '@/components/demo-button'

const STATS = [
  { stat: '$0', label: 'What riders pay. Forever.' },
  { stat: '10s', label: 'To log a symptom trackside' },
  { stat: '$150+', label: 'Avg shop diagnostic fee skipped' },
]

export default function DoctorHero() {
  return (
    <section className="relative min-h-svh overflow-hidden bg-black">

      {/* Full-bleed video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/md-hero.mp4"
      />

      {/* Dark overlay so text stays readable */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60"
      />
      {/* Bottom fade to next section */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent"
      />

      {/* Content */}
      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col justify-between px-6 pb-16 pt-28 sm:px-10 lg:px-16">

        {/* Top eyebrow */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#CCFF00]">
            Rider Platform
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Estd 2024
          </span>
        </div>

        {/* Hero headline */}
        <div className="mt-auto pt-16 pb-12">
          <div className="max-w-5xl">
            <h1 className="font-sans text-[clamp(3.5rem,12vw,9rem)] font-black uppercase leading-[0.88] tracking-tight text-white drop-shadow-2xl">
              Your bike<br />
              has a{' '}
              <em className="not-italic text-[#CCFF00]">doctor</em>.
            </h1>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Describe what you feel on the track. The AI Doctor tells you what&apos;s wrong,
              how bad it is, and whether you can ride it &mdash; then sends the full history
              to your shop before you even load the truck.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <DemoButton label="Try it free — live demo" size="lg" role="coach" />
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center border border-zinc-600 px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-[#CCFF00] hover:text-[#CCFF00]"
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="border-t border-white/10 pt-10">
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            {STATS.map((item) => (
              <div key={item.label}>
                <div className="font-mono text-2xl font-black text-[#CCFF00] drop-shadow-[0_0_12px_#CCFF0088] sm:text-3xl">
                  {item.stat}
                </div>
                <div className="mt-1 text-xs leading-snug text-zinc-400 sm:text-sm">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
