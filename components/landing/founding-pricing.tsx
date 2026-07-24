import Link from 'next/link'
import { Lock, CheckCircle2, ArrowRight, Star } from 'lucide-react'
import { getFoundingSlotStatus } from '@/app/actions/founding-rigs'

const PLANS = [
  {
    id: 'privateer',
    name: 'Privateer',
    price: '$89',
    per: '/mo',
    note: 'Solo racer',
    founding: false,
    color: 'border-zinc-700',
    labelColor: 'text-zinc-400',
    features: [
      'Lap & telemetry logging',
      'Bike & setup log',
      'Part lifecycle tracker',
      'Rider health & readiness',
      'AI Rig Doctor (monthly reports)',
      'Race budget & expenses',
      '1 rider, 2 bikes',
    ],
    cta: 'Start as Privateer',
    ctaStyle: 'border border-zinc-700 text-zinc-100 hover:border-lime-400/50 hover:text-lime-400',
  },
  {
    id: 'race_team',
    name: 'Race Team',
    price: '$399',
    per: '/mo',
    note: 'Up to 8 riders — FOUNDING',
    founding: true,
    color: 'border-lime-400',
    labelColor: 'text-lime-400',
    popular: true,
    features: [
      'Everything in Privateer',
      'Up to 8 riders + unlimited bikes',
      'Team operations & work orders',
      'AI Rig Doctor (live coaching)',
      'Invoicing & sponsor ROI reports',
      'Race budget & P&L by event',
      'Payroll export (ADP / QuickBooks)',
      'Slot locked — price never increases',
    ],
    cta: 'Reserve Race Team Slot',
    ctaStyle: 'bg-lime-400 text-zinc-950 hover:bg-lime-300',
  },
  {
    id: 'factory_rig',
    name: 'Factory Rig',
    price: '$3,999',
    per: '/mo',
    note: 'Full professional operations — FOUNDING',
    founding: true,
    color: 'border-zinc-600',
    labelColor: 'text-zinc-300',
    features: [
      'Everything in Race Team',
      'Unlimited riders, staff & bikes',
      'Full API access',
      'White-label dashboard',
      'Custom AI models & data pipeline',
      'Dedicated onboarding engineer',
      'Priority support SLA',
      'Slot locked — price never increases',
    ],
    cta: 'Reserve Factory Rig Slot',
    ctaStyle: 'border border-zinc-500 text-zinc-100 hover:border-zinc-300 hover:text-white',
  },
]

export default async function FoundingPricing() {
  const slots = await getFoundingSlotStatus()

  return (
    <section id="pricing" className="bg-zinc-950 border-t border-zinc-800 py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            // 50 founding slots total &mdash; {slots.remaining} remaining
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-5"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Lock Your Price.{' '}
            <span className="text-lime-400">Own Your Slot.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Race Team and Factory Rig founding members lock their monthly rate permanently.
            Enroll before August 31&mdash;enrollment closes when 50 slots are taken.
          </p>
        </div>

        {/* Tier grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col bg-zinc-950 p-8 border-t-2 ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-8">
                  <span className="inline-flex items-center gap-1.5 bg-lime-400 text-zinc-950 font-mono text-[10px] font-black uppercase tracking-widest px-3 py-1">
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p className={`font-mono text-[11px] uppercase tracking-widest mb-3 mt-4 ${plan.labelColor}`}>
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-end gap-1 mb-1">
                <span
                  className="text-zinc-100 text-5xl uppercase leading-none"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
                >
                  {plan.price}
                </span>
                <span className="text-zinc-500 text-lg mb-1.5">{plan.per}</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-6">
                {plan.note}
              </p>

              {/* Founding lock badge */}
              {plan.founding && (
                <div className="flex items-center gap-2 mb-6 border border-lime-400/20 bg-lime-400/5 px-3 py-2">
                  <Lock className="h-3.5 w-3.5 text-lime-400 shrink-0" aria-hidden="true" />
                  <span className="font-mono text-[10px] text-lime-400 uppercase tracking-wider">
                    Founding price locked forever
                  </span>
                </div>
              )}

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-zinc-400 text-sm leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/data/sign-in?mode=sign-up&redirect=/checkout/tier?plan=${plan.id}`}
                className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-colors ${plan.ctaStyle}`}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center font-mono text-xs text-zinc-600 uppercase tracking-widest">
          All plans billed monthly &bull; Cancel anytime &bull; Founding teams lock their price on first charge
        </p>
      </div>
    </section>
  )
}
