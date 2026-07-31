import Link from 'next/link'

const TIERS = [
  {
    name: 'Privateer',
    price: '$49',
    per: '/mo',
    who: 'Semi-pro and club racers running their own program',
    features: [
      'Contingency automation',
      'Season P&L + QuickBooks export',
      'Sponsor dashboard + ROI reports',
      'AI Doctor, bike file, body file',
      'Coach invite (1 seat)',
    ],
    cta: 'Start Privateer',
    href: '/auth/sign-up?tier=privateer',
    featured: false,
  },
  {
    name: 'Race Team',
    price: '$299',
    per: '/mo',
    who: 'Clubs and regional programs with a roster and a crew',
    features: [
      'Everything in Privateer',
      'Up to 8 riders on one roster',
      '11 team roles with scoped access',
      'Team-wide budget and travel planning',
      'Cross-rider performance analytics',
    ],
    cta: 'Start Race Team',
    href: '/auth/sign-up?tier=race-team',
    featured: true,
  },
  {
    name: 'Factory Rig',
    price: '$2,499',
    per: '/mo',
    who: 'Full factory squads running a national season',
    features: [
      'Everything in Race Team',
      'Unlimited riders and staff',
      'Full season logistics + rig ops',
      'Dedicated data analyst tooling',
      'Priority support and onboarding',
    ],
    cta: 'Talk to us',
    href: '/contact?tier=factory-rig',
    featured: false,
  },
]

export default function MdPricing() {
  return (
    <section id="pricing" className="border-t border-zinc-800 bg-[#0A0A0A] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              Priced like<br />
              <span className="text-lime">infrastructure.</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              A season costs $12,000 to $39,000. The platform that runs it should cost a
              fraction of one blown motor.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            07 / Pricing
          </span>
        </div>

        {/* Rookie on-ramp */}
        <div className="mb-px flex flex-wrap items-center justify-between gap-6 border border-zinc-800 bg-[#111111] px-8 py-7">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-lime">
                Rookie
              </span>
              <span className="font-mono text-2xl font-black text-white">$9</span>
              <span className="font-mono text-xs text-zinc-500">/mo</span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
              Ages 4&ndash;12. Built for moto parents: season budget, schedule, injury and
              return-to-ride tracking, and the AI Doctor.
            </p>
          </div>
          <Link
            href="/auth/sign-up?tier=rookie"
            className="inline-flex shrink-0 items-center justify-center border border-zinc-700 px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:border-lime hover:text-lime"
          >
            Start Rookie
          </Link>
        </div>

        {/* Main tiers */}
        <div className="grid gap-px bg-zinc-800 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col gap-6 p-10 ${
                tier.featured
                  ? 'bg-[#111111] outline outline-1 -outline-offset-1 outline-lime'
                  : 'bg-[#0A0A0A]'
              }`}
            >
              {tier.featured && (
                <span className="absolute right-4 top-4 bg-lime px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                  Most popular
                </span>
              )}

              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-lime">
                  {tier.name}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-sans text-5xl font-black tracking-tight text-white">
                    {tier.price}
                  </span>
                  <span className="font-mono text-sm text-zinc-500">{tier.per}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-zinc-500">{tier.who}</p>
              </div>

              <ul className="space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                    <span aria-hidden="true" className="mt-2 h-1 w-3 shrink-0 bg-lime" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`mt-auto inline-flex items-center justify-center px-6 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] transition-colors ${
                  tier.featured
                    ? 'bg-lime text-black hover:bg-lime-bright'
                    : 'border border-zinc-700 text-zinc-300 hover:border-lime hover:text-lime'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
