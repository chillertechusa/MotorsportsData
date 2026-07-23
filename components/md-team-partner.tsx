import Link from 'next/link'
import { CheckCircle2, Radio, ShieldCheck, Truck, Users } from 'lucide-react'

const TIERS = [
  {
    id: 'team_partner',
    label: 'Team Partner',
    tag: 'Entry Program',
    price: '$1,500',
    unit: '/mo',
    commitment: 'Full season — Jan to May 2027',
    who: '1–3 rider team running the full SMX 2027 calendar',
    accent: 'border-amber-400/40',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-400/5',
    topBar: 'bg-amber-400/30',
    features: [
      'Full lap telemetry + setup logs every round',
      'Crew chief AI — live setup recommendations each session',
      'Multi-rider command dashboard — all riders, one view',
      'Race weekend AI chat: query the season dataset live',
      'Post-moto debrief auto-generated after every session',
      'Command Rig access — connect trackside at every venue',
      'Season standings tracker + points scenario calculator',
      'Exportable full season data — your numbers, your property',
    ],
    cta: 'Apply for Team Partner',
    href: 'mailto:motorsportsdata@gmail.com?subject=Team%20Partner%20Application%20%E2%80%94%20SMX%202027',
    popular: false,
  },
  {
    id: 'command_partner',
    label: 'Command Partner',
    tag: 'Recommended',
    price: '$4,500',
    unit: '/mo',
    commitment: 'Full season — Jan to May 2027',
    who: '4–8 rider program — dedicated analyst + rig desk included',
    accent: 'border-lime-400/60',
    accentText: 'text-lime-400',
    accentBg: 'bg-lime-400/5',
    topBar: 'bg-lime-400',
    features: [
      'Everything in Team Partner',
      'Dedicated Motorsports Data analyst assigned to your program',
      'Analyst on-call at the Command Rig all race weekend',
      'Dedicated desk inside the rig — your team owns the space',
      'Cross-rider lap comparison and multi-session trend analysis',
      'R&D data layer — development build tracking across the season',
      'Custom setup report templates built for your crew chief\'s workflow',
      'Direct line to engineering for in-season platform customizations',
    ],
    cta: 'Apply for Command Partner',
    href: 'mailto:motorsportsdata@gmail.com?subject=Command%20Partner%20Application%20%E2%80%94%20SMX%202027',
    popular: true,
  },
  {
    id: 'factory_command',
    label: 'Factory Command',
    tag: 'Elite / Custom',
    price: 'Custom',
    unit: '',
    commitment: 'Season contract — manufacturer programs only',
    who: 'Manufacturer-backed program — full white-glove operations',
    accent: 'border-red-400/40',
    accentText: 'text-red-400',
    accentBg: 'bg-red-400/5',
    topBar: 'bg-red-500/40',
    features: [
      'Everything in Command Partner',
      'Embedded analyst at every round — in your pit, not ours',
      'Unlimited riders + unlimited staff seats',
      'Custom integration with your existing data pipeline',
      'Fleet telemetry across all programs simultaneously',
      'White-glove onboarding with your engineering team',
      'Manufacturer R&D analytics and development program data layer',
      'Private data infrastructure — air-gapped from all other teams',
    ],
    cta: 'Contact Us Directly',
    href: 'mailto:motorsportsdata@gmail.com?subject=Factory%20Command%20%E2%80%94%20SMX%202027',
    popular: false,
  },
] as const

const TRUST_BADGES = [
  { icon: Truck, label: 'Command rig at every venue' },
  { icon: Radio, label: 'Live analyst all race weekend' },
  { icon: Users, label: 'First 5 Command + Factory teams — embedded analyst every round' },
  { icon: ShieldCheck, label: 'Your data never shared, never sold' },
]

export default function MdTeamPartner() {
  return (
    <section
      id="team-partner"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="SMX 2027 Elite Season Programs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
            <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
              SMX 2027 — Elite Season Programs
            </span>
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
          </div>
          <h2
            className="text-zinc-100 uppercase leading-none mb-5 text-balance"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 6vw, 3.75rem)',
            }}
          >
            Three Programs.{' '}
            <span className="text-lime-400">One Season.</span>
            <br />
            No Individual Riders.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            This is a team program. We commit the full season alongside you — Command Rig at every venue, live analyst support every race weekend, and a data infrastructure built around how elite teams actually operate.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={[
                'relative flex flex-col border overflow-hidden transition-colors',
                tier.accent,
                tier.accentBg,
                tier.popular ? 'ring-1 ring-lime-400/30' : '',
              ].join(' ')}
            >
              {/* Top accent bar */}
              <div className={`h-0.5 w-full ${tier.topBar}`} aria-hidden="true" />

              <div className="p-6 sm:p-8 flex flex-col flex-1">
                {/* Tag */}
                {tier.popular ? (
                  <span className="inline-flex self-start bg-lime-400 text-zinc-950 font-bold font-mono text-[10px] uppercase tracking-widest px-3 py-0.5 mb-3">
                    {tier.tag}
                  </span>
                ) : (
                  <span className={`font-mono text-[10px] uppercase tracking-widest mb-3 ${tier.accentText}`}>
                    {tier.tag}
                  </span>
                )}

                {/* Price */}
                <div className="mb-1 flex items-end gap-1.5">
                  <span
                    className={['font-black leading-none', tier.accentText, tier.price === 'Custom' ? 'text-4xl' : 'text-5xl'].join(' ')}
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    {tier.price}
                  </span>
                  {tier.unit && (
                    <span className="text-zinc-500 text-sm mb-1">{tier.unit}</span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                  {tier.commitment}
                </p>

                {/* Name + who */}
                <h3
                  className={['text-xl font-black uppercase mt-4 mb-1', tier.accentText].join(' ')}
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {tier.label}
                </h3>
                <p className="text-zinc-400 text-sm mb-6 leading-snug border-b border-zinc-800 pb-5">
                  {tier.who}
                </p>

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
                      : `border ${tier.accent} ${tier.accentText} hover:bg-zinc-800/60`,
                  ].join(' ')}
                >
                  {tier.cta} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 border-t border-zinc-800">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-lime-400 shrink-0" aria-hidden="true" />
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Closing note */}
        <p className="text-center font-mono text-[10px] text-zinc-700 uppercase tracking-widest mt-8">
          No self-serve checkout. No month-to-month. All programs are season-length commitments — Jan to May 2027.
        </p>
      </div>
    </section>
  )
}
