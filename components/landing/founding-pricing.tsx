import Link from 'next/link'
import { Lock, CheckCircle2, ArrowRight, Star, Users, Building2 } from 'lucide-react'

type Plan = {
  id: string
  name: string
  price: string
  per: string
  prefix?: string
  note: string
  founding?: boolean
  popular?: boolean
  features: string[]
  cta: string
  primary?: boolean
}

const COMPETE_PLANS: Plan[] = [
  {
    id: 'privateer',
    name: 'Privateer',
    price: '$89',
    per: '/mo',
    note: 'Solo rider / family program',
    features: [
      'Lap, run & telemetry logging',
      'Machine setup & part lifecycle',
      'Rider health & readiness',
      'AI Rig Doctor reports',
      'Race budget & expenses',
      '1 rider, 2 machines',
    ],
    cta: 'Start as Privateer',
  },
  {
    id: 'race_team',
    name: 'Race Team',
    price: '$399',
    per: '/mo',
    note: 'Up to 8 riders — founding rig',
    founding: true,
    popular: true,
    primary: true,
    features: [
      'Everything in Privateer',
      'Up to 8 riders + unlimited machines',
      'Team operations & work orders',
      'Live AI coaching and setup guidance',
      'Invoicing, sponsor ROI & event P&L',
      'Payroll export (ADP / QuickBooks)',
      'Founding price locked permanently',
    ],
    cta: 'Reserve Race Team Rig',
  },
  {
    id: 'factory_rig',
    name: 'Factory Rig',
    price: '$3,999',
    per: '/mo',
    note: 'Factory / OEM race program',
    founding: true,
    features: [
      'Everything in Race Team',
      'Unlimited riders, staff & machines',
      'Full API and data-pipeline access',
      'White-label dashboards',
      'Custom AI models',
      'Dedicated onboarding engineer',
      'Priority support SLA',
    ],
    cta: 'Reserve Factory Rig',
  },
]

const COACH_PLANS: Plan[] = [
  {
    id: 'coach_pro',
    name: 'Coach Pro',
    price: '$499',
    per: '/mo',
    note: 'Independent professional coach',
    founding: true,
    primary: true,
    features: [
      'Multi-athlete roster and profiles',
      'Session and telemetry analysis',
      'Training plans and progress tracking',
      'Scheduling and package management',
      'Invoicing, expenses and payments',
      'Discipline-aware AI coach copilot',
      'White-glove athlete data migration',
    ],
    cta: 'Become a Founding Coach',
  },
  {
    id: 'academy',
    name: 'Academy',
    prefix: 'from',
    price: '$2,499',
    per: '/mo',
    note: 'Elite academy / performance facility',
    founding: true,
    features: [
      'Everything in Coach Pro',
      'Multi-coach organization and staff',
      'High-volume athlete operations',
      'Cross-program performance intelligence',
      'Custom workflow configuration',
      'Founder-led launch and migration',
      'Scope finalized during onboarding',
    ],
    cta: 'Reserve Academy Access',
  },
]

function PlanCard({ plan, coach = false }: { plan: Plan; coach?: boolean }) {
  return (
    <article
      className={`relative flex flex-col bg-zinc-950 p-7 sm:p-8 border-t-2 ${
        plan.primary ? 'border-lime-400' : coach ? 'border-zinc-500' : 'border-zinc-700'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-8">
          <span className="inline-flex items-center gap-1.5 bg-lime-400 text-zinc-950 font-mono text-[10px] font-black uppercase tracking-widest px-3 py-1">
            <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            Most Popular
          </span>
        </div>
      )}

      <p className={`font-mono text-[11px] uppercase tracking-widest mb-3 mt-4 ${plan.primary ? 'text-lime-400' : 'text-zinc-400'}`}>
        {plan.name}
      </p>
      <div className="flex items-end gap-2 mb-1">
        {plan.prefix && <span className="font-mono text-xs text-zinc-500 uppercase mb-2">{plan.prefix}</span>}
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

      {plan.founding && (
        <div className="flex items-center gap-2 mb-6 border border-lime-400/20 bg-lime-400/5 px-3 py-2">
          <Lock className="h-3.5 w-3.5 text-lime-400 shrink-0" aria-hidden="true" />
          <span className="font-mono text-[10px] text-lime-400 uppercase tracking-wider">
            {coach ? 'Founding coach · price lock + migration' : 'Founding price locked permanently'}
          </span>
        </div>
      )}

      <ul className="flex flex-col gap-2.5 flex-1 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-zinc-400 text-sm leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/data/sign-in?mode=sign-up&redirect=/checkout/tier?tier=${plan.id}`}
        className={`inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 text-xs font-black uppercase tracking-widest transition-colors ${
          plan.primary
            ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
            : 'border border-zinc-600 text-zinc-100 hover:border-lime-400/50 hover:text-lime-400'
        }`}
      >
        {plan.cta}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </article>
  )
}

export default function FoundingPricing() {
  return (
    <section id="pricing" className="bg-zinc-950 border-t border-zinc-800 py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            // choose your operating lens
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-5"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Built for the Racer. <span className="text-lime-400">Priced for the Business.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed text-pretty">
            Compete, operate a team, or build an elite coaching business. Founding teams and
            coaches lock their rate permanently when they enroll before August 31.
          </p>
        </div>

        {/* Compete track */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <Users className="h-5 w-5 text-lime-400" aria-hidden="true" />
            <div>
              <h3 className="font-mono text-sm font-black text-zinc-100 uppercase tracking-widest">Compete</h3>
              <p className="text-zinc-500 text-sm">For riders, race teams, and factory operations.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800">
            {COMPETE_PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
          </div>
        </div>

        {/* Coach track */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-lime-400" aria-hidden="true" />
              <div>
                <h3 className="font-mono text-sm font-black text-zinc-100 uppercase tracking-widest">Coach Business OS</h3>
                <p className="text-zinc-500 text-sm">For professionals whose roster is their business.</p>
              </div>
            </div>
            <p className="font-mono text-[10px] text-lime-400 uppercase tracking-widest">
              Separate founding-coach cohort
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800">
            {COACH_PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} coach />)}
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-xs text-zinc-600 uppercase tracking-widest">
          Monthly billing &bull; Cancel anytime &bull; Founding rates lock on first charge
        </p>
      </div>
    </section>
  )
}
