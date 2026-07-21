import type { Metadata } from 'next'
import Link from 'next/link'
import MdFooter from '@/components/md-footer'
import MdReveal from '@/components/md-reveal'
import { ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motocross Race Day Checklist: 47 Items Before the Gate Drops | Motorsport Data',
  description: 'The complete motocross race day checklist — 47 items covering the bike, the rider, the gear, and the logistics. Print it, screenshot it, or use it inside the Motorsport Data platform.',
  keywords: ['motocross race day checklist', 'mx race prep checklist', 'motocross pre-race checklist', 'race day preparation motocross', 'dirt bike race day list', 'motocross race day tips', 'gate drop preparation', 'mx pre-race routine'],
  alternates: { canonical: `${BASE_URL}/motocross-race-day-checklist` },
  openGraph: {
    title: 'Motocross Race Day Checklist — 47 Items Before the Gate Drops',
    description: 'The complete pre-race checklist for bike, rider, gear, and logistics.',
    url: `${BASE_URL}/motocross-race-day-checklist`,
  },
}

const categories = [
  {
    id: 'night-before',
    title: 'Night Before — The Bike',
    color: 'text-lime-400',
    borderColor: 'border-lime-400/30',
    items: [
      { item: 'Engine oil checked and changed if within 10% of service interval', critical: true },
      { item: 'Air filter cleaned, re-oiled, and reinstalled', critical: true },
      { item: 'Chain tension set — 25–35mm slack at midpoint', critical: false },
      { item: 'Chain lubed after last wash', critical: false },
      { item: 'Tire pressure checked front and rear (OEM spec as baseline)', critical: false },
      { item: 'Coolant level at cold fill line', critical: false },
      { item: 'Brake pads inspected front and rear', critical: true },
      { item: 'Brake fluid level checked', critical: false },
      { item: 'Throttle cable free, no binding through full steering lock', critical: true },
      { item: 'Clutch cable adjusted, perch set to rider preference', critical: false },
      { item: 'Levers and handlebars tight and aligned', critical: false },
      { item: 'Radiator guards and plastic tight', critical: false },
    ],
  },
  {
    id: 'morning-of',
    title: 'Morning Of — Gear + Logistics',
    color: 'text-sky-400',
    borderColor: 'border-sky-400/30',
    items: [
      { item: 'Helmet — no cracks, visor tight, liner clean', critical: true },
      { item: 'Goggles — lens clean, strap elastic good, tear-offs loaded', critical: false },
      { item: 'Neck brace / chest protector fitted', critical: false },
      { item: 'Boots — buckles working, sole not separating', critical: true },
      { item: 'Pants, jersey, gloves — all present', critical: false },
      { item: 'Knee braces if worn — hinges clean and moving freely', critical: false },
      { item: 'Registration or transponder if required for the venue', critical: true },
      { item: 'Gate pick (if applicable) understood', critical: false },
      { item: 'AMA or local race license / medical card', critical: true },
      { item: 'Emergency contact info accessible in gear bag', critical: false },
      { item: 'Water + food loaded — at minimum 2L water per rider', critical: false },
      { item: 'Cash for gate, pit fee, and emergency parts', critical: false },
    ],
  },
  {
    id: 'at-the-track',
    title: 'At the Track — Pre-Race',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/30',
    items: [
      { item: 'Sag checked in gear on race bike', critical: true },
      { item: 'Clicker settings confirmed against setup log for this track', critical: true },
      { item: 'Gearing confirmed for the track layout', critical: false },
      { item: 'Start position walk — gate condition, surface, ruts', critical: false },
      { item: 'Track walk completed — note key sections, lines, braking points', critical: false },
      { item: 'Practice moto scheduled and class start time confirmed', critical: false },
      { item: 'Warm-up protocol completed — at least 10 minutes easy riding', critical: false },
      { item: 'Tire pressure re-checked after warm-up (heat changes pressure)', critical: false },
      { item: 'Fuel topped off — check float bowl doesn\'t need draining if parked', critical: true },
      { item: 'Goggles on correctly, strap outside helmet', critical: false },
      { item: 'Gate pick executed and position noted', critical: false },
    ],
  },
  {
    id: 'between-motos',
    title: 'Between Motos',
    color: 'text-orange-400',
    borderColor: 'border-orange-400/30',
    items: [
      { item: 'Coolant level after first moto', critical: true },
      { item: 'Check for oil or coolant leaks on subframe and under engine', critical: true },
      { item: 'Tire pressure re-check if conditions changed', critical: false },
      { item: 'Chain tension re-check', critical: false },
      { item: 'Any parts loose from the race — check lever bolts, axle bolts', critical: true },
      { item: 'Goggle lens replaced or cleaned', critical: false },
      { item: 'Rider hydration — water between every moto', critical: true },
      { item: 'Log the moto — notes while memory is fresh', critical: false },
      { item: 'Discuss setup with rider for any changes', critical: false },
      { item: 'Address any mechanical items before next gate call', critical: true },
      { item: 'Fuel check if multi-moto event', critical: false },
      { item: 'Mentally reset — one moto at a time', critical: false },
    ],
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Motocross Race Day Checklist — 47 Items Before the Gate Drops',
  description: 'The complete motocross race day checklist covering bike prep, gear, track prep, and between-moto protocol.',
  url: `${BASE_URL}/motocross-race-day-checklist`,
  step: categories.map((cat) => ({
    '@type': 'HowToSection',
    name: cat.title,
    itemListElement: cat.items.map((item, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: item.item,
    })),
  })),
}

export default function MotocrossRaceDayChecklistPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="pt-16 bg-zinc-950 min-h-screen">

        {/* Hero */}
        <section className="border-b border-zinc-800 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-lime-400" />
                <span className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">Race Day Reference</span>
              </div>
              <h1 className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-6" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                Motocross Race Day Checklist:<br />
                <span className="text-lime-400">47 Items Before the Gate Drops</span>
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mb-8">
                Four checklists covering the night before, morning of, at the track, and between motos. Built for riders, parents, and team managers who refuse to let a missed item decide the race.
              </p>
              <div className="flex flex-wrap gap-3">
                {categories.map((c) => (
                  <a key={c.id} href={`#${c.id}`} className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 border ${c.borderColor} ${c.color} hover:opacity-80 transition-opacity`}>
                    {c.title}
                  </a>
                ))}
              </div>
            </MdReveal>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-zinc-800 bg-zinc-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-zinc-800">
              {[
                { value: '47', label: 'Total checklist items' },
                { value: '4', label: 'Phases covered' },
                { value: '16', label: 'Critical items flagged' },
                { value: '0', label: 'Excuses accepted' },
              ].map((s, i) => (
                <MdReveal key={s.label} delay={i * 80} className="p-8 text-center">
                  <p className="text-lime-400 uppercase leading-none mb-2" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '3.5rem' }}>{s.value}</p>
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{s.label}</p>
                </MdReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Checklist sections */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 divide-y divide-zinc-800">
          {categories.map((cat, ci) => (
            <MdReveal key={cat.id} className="py-16">
              <span id={cat.id} />
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-px w-8 ${cat.color.replace('text-', 'bg-')}`} />
                <span className={`font-mono text-xs uppercase tracking-[0.3em] ${cat.color}`}>Phase {ci + 1}</span>
              </div>
              <h2 className="text-zinc-100 uppercase leading-none mb-8" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                {cat.title}
              </h2>
              <div className="space-y-1">
                {cat.items.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 px-4 py-3 border transition-colors hover:bg-zinc-900 ${item.critical ? 'border-zinc-700 bg-zinc-950/50' : 'border-zinc-800'}`}>
                    <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${item.critical ? cat.color : 'text-zinc-700'}`} />
                    <span className={`text-sm leading-relaxed ${item.critical ? 'text-zinc-200' : 'text-zinc-400'}`}>
                      {item.item}
                    </span>
                    {item.critical && (
                      <span className={`ml-auto font-mono text-[9px] uppercase tracking-widest shrink-0 ${cat.color} opacity-70`}>Critical</span>
                    )}
                  </div>
                ))}
              </div>
            </MdReveal>
          ))}
        </div>

        {/* Key mistakes */}
        <section className="py-16 border-t border-zinc-800 bg-zinc-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal className="mb-10">
              <h2 className="text-zinc-100 uppercase leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                The Five Mistakes That Decide Races <span className="text-lime-400">Before the Gate Drops</span>
              </h2>
            </MdReveal>
            <div className="space-y-4">
              {[
                { n: '01', title: 'Wrong sag for the track', body: 'Sag is the first thing to check and the last thing most people do. A bike set up for sand running at a hardpack track handles like a truck.' },
                { n: '02', title: 'Running on a dirty air filter', body: 'You can feel a dirty filter. The bike loses crisp bottom end and feels sluggish. It\'s also destroying your piston. Check it the night before — not at the track.' },
                { n: '03', title: 'No track walk', body: 'Walking the track before motos isn\'t optional. You identify your braking points, your lines through the rhythm section, and where the ruts are forming. Not walking costs lap time and increases crash risk.' },
                { n: '04', title: 'Skipping hydration between motos', body: 'Two motos 45 minutes apart in the heat. Riders who don\'t drink between motos start Moto 2 already dehydrated. Reaction time, decision making, and grip strength all decline.' },
                { n: '05', title: 'Not logging the session after', body: 'The best information you have about your setup is your memory right after the moto. It takes 3 minutes to log clicker notes, conditions, and what you felt. Most riders don\'t. Then they wonder why they can\'t replicate a good day.' },
              ].map((m) => (
                <MdReveal key={m.n}>
                  <div className="flex items-start gap-4 border border-zinc-800 p-5 hover:border-lime-400/20 transition-colors">
                    <span className="font-mono text-xs text-lime-400 uppercase tracking-widest shrink-0 mt-0.5 w-8">{m.n}</span>
                    <div>
                      <h3 className="text-zinc-100 font-semibold mb-1 text-sm">{m.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">{m.body}</p>
                    </div>
                  </div>
                </MdReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal>
              <div className="border border-lime-400/20 bg-zinc-950 p-8">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-5 w-5 text-lime-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-zinc-100 uppercase mb-3" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.8rem' }}>
                      Log the session. Every time.
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                      Item 47 on this list is &quot;log the moto while the memory is fresh.&quot; Every setup, every condition, every result — logged and searchable in MD Intel AI. When you&apos;re back at this track next month, you have the exact setup that worked last time, not a guess.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/data/privateer" className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors">
                        Start Logging — $49/mo <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link href="/data/rookie" className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-lime-400 hover:text-lime-400 transition-colors">
                        Rookie — $9/mo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </MdReveal>
          </div>
        </section>

      </main>
      <MdFooter />
    </>
  )
}
