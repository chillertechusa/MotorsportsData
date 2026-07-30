'use client'

import DemoButton from '@/components/demo-button'
import Link from 'next/link'

export default function DoctorHero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Technical grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* System label */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-green-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            MD // Rider Platform
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
            Free for every rider
          </span>
        </div>

        <h1 className="max-w-3xl text-balance font-sans text-5xl font-black uppercase leading-[0.95] tracking-tight text-white md:text-7xl">
          Your bike has a{' '}
          <span className="text-green-500">doctor</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-zinc-400 md:text-xl">
          Describe what you feel on the track. The AI Doctor tells you what&apos;s wrong,
          how bad it is, and whether you can ride it &mdash; then sends the full history to
          your shop before you even load the truck.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <DemoButton
            label="Try it free — live demo"
            size="lg"
            role="coach"
          />
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center border border-zinc-700 px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-green-500 hover:text-green-500"
          >
            Create free account
          </Link>
        </div>

        {/* Stat strip */}
        <div className="mt-16 grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
          {[
            { stat: '$150+', label: 'Average shop diagnostic fee you skip' },
            { stat: '10 sec', label: 'To log a symptom from the parking lot' },
            { stat: '$0', label: 'What riders pay. Forever.' },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-950 p-6">
              <div className="font-mono text-3xl font-black text-green-500">{item.stat}</div>
              <div className="mt-1 text-sm leading-relaxed text-zinc-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
