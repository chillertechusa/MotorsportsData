import Link from 'next/link'
import MdReveal from './md-reveal'

const tiers = [
  { id: 'rookie',       name: 'The Rookie',      price: 'FREE',   note: 'Forever, no credit card', sub: 'Track the bike, log the rides, save the story.', free: true },
  { id: 'privateer',    name: 'The Privateer',   price: '$89',    note: 'The solo racer',          sub: 'Full setup logs, part vault, and MD Intel.' },
  { id: 'race_team',    name: 'The Race Team',   price: '$399',   note: 'Up to 8 riders',          sub: 'Race Coach AI, video analysis, team collab.', popular: true },
  { id: 'factory_rig',  name: 'The Factory Rig', price: '$3,999', note: 'Professional operations',  sub: 'Unlimited riders, API access, white-label, custom AI.' },
]

export default function MdPricingCta() {
  return (
    <section className="bg-zinc-900 border-y border-zinc-800 py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <MdReveal className="max-w-2xl mb-12">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            &#47;&#47; free-forever · grow-as-you-race
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Start Free, Race Forever.{' '}
            <span className="text-lime-400">Upgrade When You&apos;re Ready.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Join the garage for free, no credit card needed. Log your setups, track your progress, and connect with riders worldwide. Upgrade to unlock AI coaching, team collaboration, and pro tools as your racing evolves.
          </p>
        </MdReveal>

        {/* Tier grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t, i) => (
            <MdReveal key={t.id} delay={i * 90}>
              <div
                className={`relative flex h-full flex-col p-6 bg-zinc-950 border ${
                  t.free ? 'border-sky-400' : t.popular ? 'border-lime-400' : 'border-zinc-800'
                }`}
              >
                {t.popular && (
                  <>
                    <span className="absolute -top-px left-0 right-0 h-px bg-lime-400" />
                    <span className="absolute -top-3 right-4 bg-lime-400 text-zinc-950 font-mono text-[9px] font-black uppercase tracking-widest px-2 py-1">
                      Most Popular
                    </span>
                  </>
                )}
                {t.free && (
                  <>
                    <span className="absolute -top-px left-0 right-0 h-px bg-sky-400" />
                    <span className="absolute -top-3 right-4 bg-sky-400 text-zinc-950 font-mono text-[9px] font-black uppercase tracking-widest px-2 py-1">
                      No Credit Card
                    </span>
                  </>
                )}
                <p className={`font-mono text-[10px] uppercase tracking-widest mb-3 ${t.free ? 'text-sky-400' : t.popular ? 'text-lime-400' : 'text-zinc-600'}`}>
                  {t.name}
                </p>
                <p
                  className={`text-4xl uppercase leading-none mb-1 ${t.free ? 'text-sky-400' : 'text-zinc-100'}`}
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
                >
                  {t.price}
                  {!t.free && <span className="text-zinc-500 text-lg font-normal">/mo</span>}
                </p>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-4">
                  {t.note}
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed flex-1 mb-6">{t.sub}</p>
                <Link
                  href={t.id === 'rookie' ? '/data/sign-in?mode=sign-up&redirect=/data' : `/data/checkout?plan=${t.id}`}
                  className={`block text-center px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors font-mono ${
                    t.free
                      ? 'border-2 border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-zinc-950'
                      : t.popular
                        ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
                        : 'border border-zinc-700 text-zinc-100 hover:border-lime-400 hover:text-lime-400'
                  }`}
                >
                  {t.free ? 'Start Free' : t.id === 'factory_rig' ? 'Go Factory' : 'Start Racing'}
                </Link>
              </div>
            </MdReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
