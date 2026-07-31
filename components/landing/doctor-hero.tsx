'use client'

import Image from 'next/image'
import Link from 'next/link'
import DemoButton from '@/components/demo-button'

const STATS = [
  { stat: '$150+', label: 'Average shop diagnostic fee you skip' },
  { stat: '10 sec', label: 'To log a symptom from the parking lot' },
  { stat: '$0', label: 'What riders pay. Forever.' },
]

export default function DoctorHero() {
  return (
    <section className="relative overflow-hidden bg-ink pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Technical grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      {/* Dotted halftone panels, mirroring the emblem's side texture */}
      <div
        aria-hidden="true"
        className="md-dotfield pointer-events-none absolute top-40 left-0 hidden h-40 w-24 opacity-20 lg:block"
      />
      <div
        aria-hidden="true"
        className="md-dotfield pointer-events-none absolute right-0 bottom-40 hidden h-40 w-24 opacity-20 lg:block"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Emblem header rule — MOTORSPORT IS DIRT / ESTD / 2024 */}
        <div className="mb-10 flex items-center gap-4">
          <span className="md-label shrink-0 text-lime">Motorsport is dirt</span>
          <span aria-hidden="true" className="h-px flex-1 bg-ink-line" />
          <span className="md-label hidden shrink-0 text-zinc-600 sm:inline">Estd 2024</span>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── Copy column ── */}
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-2 border border-lime-border bg-lime-faint px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-lime">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                Rider platform
              </span>
              <span className="md-label text-zinc-600">Free for every rider</span>
            </div>

            <h1 className="mt-7 text-balance font-sans text-5xl leading-[0.9] font-black tracking-tight text-white uppercase sm:text-6xl md:text-7xl">
              Your bike has a <span className="text-lime">doctor</span>.
            </h1>

            {/* Lime tick divider — emblem detail */}
            <div className="mt-7 flex items-center gap-3">
              <span className="md-tick" />
              <span className="md-label text-zinc-500">Pure</span>
              <span aria-hidden="true" className="h-px w-6 bg-ink-line" />
              <span className="md-label text-zinc-500">Drive</span>
            </div>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 md:text-lg">
              Describe what you feel on the track. The AI Doctor tells you what&apos;s wrong,
              how bad it is, and whether you can ride it &mdash; then sends the full history
              to your shop before you even load the truck.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <DemoButton label="Try it free — live demo" size="lg" role="coach" />
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center border border-zinc-700 px-8 py-4 font-mono text-sm font-bold tracking-[0.2em] text-zinc-300 uppercase transition-colors hover:border-lime hover:text-lime"
              >
                Create free account
              </Link>
            </div>
          </div>

          {/* ── Emblem column ── */}
          <div className="relative mx-auto w-full max-w-md">
            {/* Flanking emblem labels */}
            <div className="mb-3 flex items-center justify-between">
              <span className="md-label text-zinc-600">Ride hard</span>
              <span className="md-label text-zinc-600">Stay true</span>
            </div>

            <div className="md-bracket border border-ink-line bg-ink-raised p-3">
              <Image
                src="/images/md-rider-emblem.png"
                alt="MD rider emblem — a motocross rider in a skull-graphic helmet gripping the bars, framed by the words Motorsport Is Dirt"
                width={800}
                height={800}
                priority
                className="h-auto w-full"
              />
            </div>

            {/* Emblem footer rule */}
            <div className="mt-3 flex items-center gap-3">
              <span aria-hidden="true" className="h-px flex-1 bg-ink-line" />
              <span className="md-label text-lime">Dirt. Drive. Discipline.</span>
              <span aria-hidden="true" className="h-px flex-1 bg-ink-line" />
            </div>
          </div>
        </div>

        {/* ── Stat strip ── */}
        <div className="md-bracket mt-16 grid grid-cols-1 gap-px border border-ink-line bg-ink-line sm:grid-cols-3">
          {STATS.map((item) => (
            <div key={item.label} className="bg-ink p-6">
              <div className="font-mono text-3xl font-black text-lime">{item.stat}</div>
              <div className="mt-1 text-sm leading-relaxed text-zinc-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
