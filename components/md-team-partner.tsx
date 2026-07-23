import Link from 'next/link'
import { CheckCircle2, ShieldCheck, Truck, Users, Zap } from 'lucide-react'

const TIERS = [
  {
    id: 'privateer',
    label: 'Privateer Partner',
    tag: 'Solo Season',
    price: '$79',
    unit: '/mo',
    perRound: '$4.65 / round',
    who: 'Solo rider doing the full SMX 2027 calendar',
    accent: 'border-orange-400/40',
    accentText: 'text-orange-400',
    accentBg: 'bg-orange-400/5',
    features: [
      'Full lap telemetry + setup logs every round',
      'Rig Doctor AI — pre-race setup recommendations',
      'Rider readiness score per round',
      'Post-moto debrief auto-generated',
      'Season standings tracker + points calculator',
      'Exportable data — your numbers, your property',
    ],
    cta: 'Start Season Partnership',
    href: '/data/sign-in?plan=privateer&ref=smx2027',
    popular: false,
  },
  {
    id: 'race_team',
    label: 'Season Team',
    tag: 'Most Popular',
    price: '$599',
    unit: '/mo',
    perRound: '$35 / round',
    who: '2–4 rider team running the full SMX 2027 series',
    accent: 'border-lime-400/60',
    accentText: 'text-lime-400',
    accentBg: 'bg-lime-400/5',
    features: [
      'Multi-rider command dashboard — all riders, one view',
      'Crew chief AI — live setup calls during race weekends',
      'Cross-rider lap comparison and trend analysis',
      'Team setup log — track every config change all season',
      'Race weekend AI chat: ask anything, get data-backed answers',
      'First 10 teams: direct onboarding call with our team',
    ],
    cta: 'Apply for Season Partnership',
    href: '/smx2027/apply',
    popular: true,
  },
  {
    id: 'factory_rig',
    label: 'Factory Season',
    tag: 'Elite Program',
    price: '$15,000',
    unit: '/mo',
    perRound: '$882 / round',
    who: 'Manufacturer-backed program, full staff operations',
    accent: 'border-red-400/40',
    accentText: 'text-red-400',
    accentBg: 'bg-red-400/5',
    features: [
      'Unlimited riders + unlimited staff seats',
      'White-glove onboarding + dedicated account manager',
      'Custom integration with your existing data pipeline',
      'Fleet telemetry across all programs simultaneously',
      'R&D analytics — development program data layer',
      'Direct line to engineering team for custom builds',
    ],
    cta: 'Contact Us Directly',
    href: 'mailto:team@motorsportsdata.io?subject=Factory%20Season%20Partnership%20%E2%80%94%20SMX%202027',
    popular: false,
  },
] as const

const TRUST_BADGES = [
  { icon: Users, label: 'First 10 teams get direct onboarding' },
  { icon: Zap, label: 'Founding season pricing — locked all 2027' },
  { icon: ShieldCheck, label: 'Your data never leaves your account' },
  { icon: Truck, label: 'Onsite command rig at every venue' },
]

export default function MdTeamPartner() {
  return (
    <section
      id="team-partner"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="SMX 2027 Team Partnership Plans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
            <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
              Season Partnership
            </span>
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
          </div>
          <h2
            className="text-zinc-100 uppercase leading-none mb-4 text-balance"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 6vw, 3.75rem)',
            }}
          >
            Run Your Team{' '}
            <span className="text-lime-400">on Data.</span>
            <br />
            All 17 Rounds.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Pick your tier. We crunch every lap, every session, every round of the 2027 SMX Championship — so your crew chief makes faster calls and your rider rides smarter.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={[
                'relative flex flex-col border p-6 sm:p-8 transition-colors',
                tier.accent,
                tier.accentBg,
                tier.popular ? 'ring-1 ring-lime-400/30' : '',
              ].join(' ')}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div
                  className="absolute -top-px left-0 right-0 h-0.5 bg-lime-400"
                  aria-hidden="true"
                />
              )}
              {tier.popular && (
                <span className="absolute -top-3 left-6 bg-lime-400 text-zinc-950 font-bold font-mono text-[10px] uppercase tracking-widest px-3 py-0.5">
                  {tier.tag}
                </span>
              )}
              {!tier.popular && (
                <span
                  className={[
                    'font-mono text-[10px] uppercase tracking-widest mb-3',
                    tier.accentText,
                  ].join(' ')}
                >
                  {tier.tag}
                </span>
              )}
              {tier.popular && <div className="h-4" aria-hidden="true" />}

              {/* Price */}
              <div className="mb-1">
                <span
                  className={['text-5xl font-black leading-none', tier.accentText].join(' ')}
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {tier.price}
                </span>
                <span className="text-zinc-500 text-sm ml-1">{tier.unit}</span>
              </div>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                {tier.perRound}
              </p>
              <p className="text-zinc-400 text-sm mb-6 leading-snug border-b border-zinc-800 pb-5">
                {tier.who}
              </p>

              {/* Name */}
              <h3
                className={['text-xl font-black uppercase mb-4', tier.accentText].join(' ')}
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                {tier.label}
              </h3>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={['h-4 w-4 shrink-0 mt-0.5', tier.accentText].join(' ')}
                      aria-hidden="true"
                    />
                    <span className="text-zinc-300 text-sm leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={tier.href}
                className={[
                  'inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3.5 transition-colors',
                  tier.popular
                    ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
                    : 'border border-zinc-700 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800/60',
                ].join(' ')}
              >
                {tier.cta} &rarr;
              </Link>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pt-8 border-t border-zinc-800">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-lime-400 shrink-0" aria-hidden="true" />
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
