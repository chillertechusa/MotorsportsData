'use client'

import { useRef } from 'react'
import Link from 'next/link'
import DemoButton from '@/components/demo-button'
import MdTelemetryHud from '@/components/landing/md-telemetry-hud'

const STATS = [
  { stat: '$2,800', label: 'Avg contingency left unclaimed per season' },
  { stat: '11', label: 'Team roles on one platform' },
  { stat: 'Age 4 →', label: 'Same rider file, all the way to Factory' },
]

export default function MdHero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <section className="relative min-h-svh overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/md-hero.mp4"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/65" />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent"
      />

      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col justify-between px-6 pb-12 pt-24 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-lime">
            The Racing Program Platform
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Estd 2024
          </span>
        </div>

        <div className="mt-auto flex items-end gap-12 pt-12 pb-10">
          <div className="max-w-4xl">
            <h1 className="font-sans text-[clamp(3rem,9vw,7rem)] font-black uppercase leading-[0.88] tracking-tight text-white drop-shadow-2xl">
              Run your entire<br />
              racing <em className="not-italic text-lime">program</em>.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
              Contingency claims. Sponsor money. Season budget. Rider readiness. Setup history.
              AI coaching. One platform from the PW50 to the factory rig &mdash; and it collects
              the money you already earned.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <DemoButton label="See the platform — live demo" size="lg" role="coach" />
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center border border-zinc-600 px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-lime hover:text-lime"
              >
                Start at $9/mo
              </Link>
            </div>
          </div>

          <div className="hidden w-[300px] shrink-0 lg:block">
            <MdTelemetryHud videoRef={videoRef} />
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            {STATS.map((item) => (
              <div key={item.label}>
                <div className="font-mono text-2xl font-black text-lime sm:text-3xl">
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
