'use client'

import Image from 'next/image'
import Link from 'next/link'
import DemoButton from '@/components/demo-button'

const STATS = [
  { stat: '$0', label: 'What riders pay. Forever.' },
  { stat: '10s', label: 'To log a symptom trackside' },
  { stat: '$150+', label: 'Avg shop diagnostic fee skipped' },
]

export default function DoctorHero() {
  return (
    <section className="relative min-h-svh overflow-hidden bg-[#0A0A0A]">

      {/* Full-bleed emblem — centered, fades into black at edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <Image
          src="/images/md-rider-emblem.png"
          alt=""
          width={900}
          height={900}
          priority
          className="h-full w-full max-w-3xl object-contain opacity-[0.13]"
        />
        {/* soft vignette over the emblem */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col justify-between px-6 pb-16 pt-28 sm:px-10 lg:px-16">

        {/* Top eyebrow */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0C050]">
            Rider Platform
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            Estd 2024
          </span>
        </div>

        {/* Hero headline */}
        <div className="mt-auto pt-16 pb-12">
          <div className="max-w-5xl">
            <h1 className="font-sans text-[clamp(3.5rem,12vw,9rem)] font-black uppercase leading-[0.88] tracking-tight text-white">
              Your bike<br />
              has a{' '}
              <em className="not-italic text-[#A0C050]">doctor</em>.
            </h1>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Describe what you feel on the track. The AI Doctor tells you what&apos;s wrong,
              how bad it is, and whether you can ride it &mdash; then sends the full history
              to your shop before you even load the truck.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <DemoButton label="Try it free &mdash; live demo" size="lg" role="coach" />
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center border border-zinc-700 px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-[#A0C050] hover:text-[#A0C050]"
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>

        {/* Stat strip — bottom of hero */}
        <div className="border-t border-zinc-800 pt-10">
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            {STATS.map((item) => (
              <div key={item.label}>
                <div className="font-mono text-2xl font-black text-[#A0C050] sm:text-3xl">
                  {item.stat}
                </div>
                <div className="mt-1 text-xs leading-snug text-zinc-500 sm:text-sm">
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
