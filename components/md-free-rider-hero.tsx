'use client'

import { useRouter } from 'next/navigation'
import { Bike, ClipboardList, TrendingUp, HeartPulse, MapPin } from 'lucide-react'
import { RookieDemo } from '@/components/tier-feature-demos'

const freeRiderFeatures = [
  { icon: Bike, text: '1 Bike — Maintenance + Hour Tracking' },
  { icon: ClipboardList, text: 'Ride Log — every session, every track' },
  { icon: TrendingUp, text: 'Progression Timeline — every first, saved forever' },
  { icon: HeartPulse, text: 'Injury Log + Concussion / RTR Protocol' },
  { icon: MapPin, text: 'Practice Schedule + Track Weather' },
]

export default function MdFreeRiderHero() {
  const router = useRouter()

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8 py-14 lg:py-20 relative">
      {/* Sign-in button - positioned top right */}
      <div className="absolute top-14 lg:top-20 right-5 lg:right-8 z-50">
        <button
          onClick={() => router.push('/data/sign-in')}
          className="px-7 py-3 text-base font-bold text-zinc-950 bg-lime-400 rounded-lg hover:bg-lime-300 transition-colors shadow-lg hover:shadow-xl"
        >
          Sign In
        </button>
      </div>
      <div className="rounded-3xl border-2 border-lime-400/50 bg-gradient-to-br from-lime-400/10 to-zinc-900 p-6 lg:p-10 shadow-[0_0_50px_-12px] shadow-lime-400/25">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          <div className="lg:w-2/5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-lime-400/15 border border-lime-400/40 flex items-center justify-center">
                <Bike className="h-7 w-7 text-lime-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
                  Any Rider · Any Bike
                </p>
                <h2 className="mt-1 text-3xl lg:text-4xl font-black uppercase tracking-wide text-zinc-50">
                  Free Rider
                </h2>
              </div>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-5xl font-black tracking-tight text-lime-400">FREE</span>
              <span className="mb-2 text-sm text-zinc-500 font-medium">forever · no credit card</span>
            </div>

            <p className="mt-5 text-zinc-300 leading-relaxed">
              Your account, for as long as you ride. Whether it&apos;s your kid&apos;s first 50,
              your Sunday trail bike, or the vet class you&apos;ll never quit — keep every bike,
              every ride, and every milestone in one place.
            </p>

            <button
              onClick={() => router.push('/data/sign-in?mode=sign-up&redirect=/data')}
              className="mt-6 w-full lg:w-auto lg:px-10 h-14 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wider text-base transition-colors hover:bg-lime-300"
            >
              Start Free
            </button>

            <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
              Grows with you — when you want more bikes, AI coaching, or a full team command
              center, your data comes with you.
            </p>
          </div>

          <div className="lg:flex-1 lg:border-l lg:border-lime-400/15 lg:pl-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 mb-4">
              What&apos;s included
            </p>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {freeRiderFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-lime-400/15 text-lime-400">
                    <f.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-zinc-300 text-sm leading-relaxed">{f.text}</span>
                </li>
              ))}
            </ul>
            <RookieDemo />
          </div>
        </div>
      </div>
    </section>
  )
}
