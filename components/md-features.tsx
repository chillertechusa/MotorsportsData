import {
  Bike, Wrench, ClipboardList, CalendarDays,
  Dumbbell, Brain, HeartPulse, TrendingUp,
  Compass, Video, Sparkles, DollarSign, Truck,
  Briefcase, Activity, FileText,
} from 'lucide-react'
import MdReveal from './md-reveal'

const pillars = [
  {
    tag: 'the-machine',
    title: 'The Machine',
    blurb: 'Every bike, every part, every setup — one source of truth across the fleet.',
    features: [
      { icon: Bike, title: 'Fleet Garage', description: 'Track every bike from the PW50 to the factory 450 — hours, rebuilds, and history.' },
      { icon: Wrench, title: 'Predictive Part Vault', description: 'Engine hours, replacement cycles, and stock levels in real time. Never risk a DNF.' },
      { icon: ClipboardList, title: 'Universal Setup Sheets', description: 'Clickers, mapping, PSI, sag, gearing, and rider feedback logged for every session.' },
      { icon: CalendarDays, title: 'Schedule + Track Weather', description: 'Race calendar with live forecast and conditions pulled for every track you ride.' },
    ],
  },
  {
    tag: 'the-mechanic',
    title: 'The Mechanic',
    blurb: 'Your career follows you. Work orders, setup deltas, and rider outcomes — all in your account, from team to team.',
    features: [
      { icon: Wrench, title: 'Work Order Queue', description: 'Multi-bike open, in-progress, and closed work orders with live labor timer and before/after suspension sheets.', highlight: true },
      { icon: FileText, title: 'Career Portfolio', description: 'Every work order, every setup change, every rider improvement you had a hand in. Yours forever. Take it to the next team.' },
      { icon: Activity, title: 'Mechanic Coach AI', description: 'After closing a work order, AI reads the before/after suspension delta and the rider\'s next session result. Tells you what correlated.' },
      { icon: Briefcase, title: 'Part Vault Integration', description: 'Pull parts from the team\'s vault directly into work orders. Costs tracked automatically. No spreadsheet needed.' },
    ],
  },
  {
    tag: 'the-rider',
    title: 'The Rider',
    blurb: 'Because the athlete matters as much as the machine — from body to head to career.',
    features: [
      { icon: Dumbbell, title: 'Fitness + Nutrition', description: 'Readiness, training load, sleep, hydration, and fuel tracked so you peak on race day.' },
      { icon: Brain, title: 'Mental Game', description: 'Check-ins and focus tracking that surface burnout before it costs you a season.' },
      { icon: HeartPulse, title: 'Injury + RTR Protocol', description: 'Concussion-aware injury log with a staged return-to-ride protocol. Included on every plan.' },
      { icon: TrendingUp, title: 'Progression Timeline', description: 'Every first ride, first jump, and first podium — the rider story, saved forever.' },
    ],
  },
  {
    tag: 'the-intelligence',
    title: 'The Intelligence',
    blurb: 'Four AI co-pilots that turn your data into an unfair advantage.',
    features: [
      { icon: Compass, title: 'Race Coach AI', description: 'A pocket coach that reads every module you log and tells you if you\u2019re truly race-ready.', highlight: true },
      { icon: Video, title: 'Video Analysis', description: 'Upload session footage and get timestamped coach notes tied directly to your performance.' },
      { icon: Sparkles, title: 'MD Intel AI', description: 'Ask your AI any setup question — "what was my spring Pala setup?" — and get the exact answer.' },
      { icon: DollarSign, title: 'Season Economics', description: 'Track every expense, sponsor deal, and cost-per-result. Know your true profitability.' },
    ],
  },
  {
    tag: 'the-hauler',
    title: 'The Hauler',
    blurb: 'The semi driver holds the whole operation together. Now they have a command center that matches the job.',
    features: [
      { icon: Truck, title: 'Rig Doctor AI', description: 'Class 8 diesel maintenance guidance. DPF regens, DEF levels, air brake care, DOT compliance, and PM schedules in plain English.', highlight: true },
      { icon: Wrench, title: 'PM Scheduler', description: 'Track A, B, and C service intervals by mileage and engine hours. Never miss a maintenance deadline.' },
      { icon: ClipboardList, title: 'Pre-Trip Inspection', description: 'DOT-aligned checklist. Driver logs status, defects, and clearance to roll before departure.' },
      { icon: CalendarDays, title: 'Haul Calendar + Race Sync', description: 'Race calendar integrated with truck schedule — departure times, fuel stops, load sequences, and gate-time targets.' },
    ],
  },
]

export default function MdFeatures() {
  return (
    <section id="features" className="bg-zinc-950 pt-12 pb-24 md:pt-16 md:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <MdReveal className="mb-16">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            &#47;&#47; platform-capabilities
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            }}
          >
            The Whole Program.{' '}
            <span className="text-lime-400">One Platform.</span>
          </h2>
          <p className="text-zinc-400 text-lg mt-4 max-w-2xl leading-relaxed">
            Built with factory teams, mechanics, and haulers — not product managers. Every module your crew chief, analyst, and engineering team touches during a 17-round SMX season, unified in one command center.
          </p>
        </MdReveal>

        {/* Pillars */}
        <div className="flex flex-col gap-16">
          {pillars.map((pillar) => (
            <div key={pillar.tag}>
              {/* Pillar header */}
              <MdReveal className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-zinc-800 pb-4">
                <div>
                  <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.25em] mb-2">
                    {pillar.tag}
                  </p>
                  <h3
                    className="text-zinc-100 text-3xl md:text-4xl uppercase leading-none"
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
                  >
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-zinc-500 text-sm max-w-md sm:text-right leading-relaxed">{pillar.blurb}</p>
              </MdReveal>

              {/* Feature grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800">
                {pillar.features.map((f, i) => {
                  const Icon = f.icon
                  return (
                    <MdReveal key={f.title} delay={i * 80}>
                      <div
                        className={`group relative flex h-full flex-col gap-4 p-6 transition-colors ${
                          f.highlight ? 'bg-zinc-900 border-l-2' : 'bg-zinc-950 hover:bg-zinc-900'
                        }`}
                        style={f.highlight ? { borderLeftColor: '#a3e635' } : undefined}
                      >
                        {f.highlight && (
                          <span className="absolute top-4 right-4 font-mono text-[10px] text-lime-400 uppercase tracking-widest border border-lime-400/40 px-2 py-0.5">
                            New
                          </span>
                        )}
                        <div className="w-10 h-10 flex items-center justify-center border border-zinc-800 group-hover:border-lime-400/40 transition-colors">
                          <Icon className="h-5 w-5 text-lime-400" aria-hidden="true" />
                        </div>
                        <h4
                          className="text-zinc-100 text-xl uppercase leading-tight"
                          style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800 }}
                        >
                          {f.title}
                        </h4>
                        <p className="text-zinc-400 text-sm leading-relaxed flex-1">{f.description}</p>
                      </div>
                    </MdReveal>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
