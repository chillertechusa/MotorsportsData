'use client'

import { useState } from 'react'
import {
  BarChart3, Wrench, Truck, LineChart, User, Crown,
  ChevronRight, Lock
} from 'lucide-react'

type ConsoleRole = {
  id: string
  title: string
  who: string
  icon: React.ElementType
  minTier: string
  minTierColor: string
  accentColor: string
  hierarchy: number
  lens: string
  dataPoints: { label: string; example: string }[]
  cannotSee: string[]
}

const CONSOLES: ConsoleRole[] = [
  {
    id: 'manager',
    title: 'Team Manager',
    who: 'Owner / GM / Program Director',
    icon: Crown,
    minTier: 'Grassroots',
    minTierColor: 'text-zinc-400',
    accentColor: 'lime',
    hierarchy: 1,
    lens: 'The full operation. Every dollar, every deal, every person, every machine.',
    dataPoints: [
      { label: 'Season P&L', example: '$84,200 spent vs $91,500 budget — 8% under' },
      { label: 'Deals pipeline', example: '3 contracts open, $24K pending signature' },
      { label: 'Sponsor ROI', example: 'RedBull logo: 14 posts, 2.1M impressions' },
      { label: 'Roster status', example: '6 staff active, 2 events this month' },
      { label: 'Module access', example: 'All 14 modules — full visibility' },
    ],
    cannotSee: [],
  },
  {
    id: 'crewchief',
    title: 'Crew Chief',
    who: 'Head Tech / Race Day Lead',
    icon: BarChart3,
    minTier: 'Race Team',
    minTierColor: 'text-amber-400',
    accentColor: 'amber',
    hierarchy: 2,
    lens: 'Machine readiness and session performance. Race day decisions, backed by data.',
    dataPoints: [
      { label: 'Pre-event brief', example: 'Co-pilot flagged 3 items before gate drop' },
      { label: 'Setup delta', example: 'Compression 2 clicks out vs last session — 0.4s faster' },
      { label: 'Work order status', example: '2 open, 1 overdue — needs sign-off' },
      { label: 'Machine readiness', example: 'Engine hrs: 38/50 — rebuild window approaching' },
      { label: 'Athlete readiness', example: 'HRV 94, sleep 7.2hrs — green' },
    ],
    cannotSee: ['P&L totals', 'Contract values', 'Sponsor payment amounts'],
  },
  {
    id: 'mechanic',
    title: 'Mechanic / Tech',
    who: 'Shop Floor / Event Wrench',
    icon: Wrench,
    minTier: 'Race Team',
    minTierColor: 'text-amber-400',
    accentColor: 'zinc',
    hierarchy: 3,
    lens: 'The work queue and the machine. No distractions — just the job in front of you.',
    dataPoints: [
      { label: 'Work order queue', example: '4 open — suspension rebuild is priority 1' },
      { label: 'Parts vault', example: '2x Renthal bars in stock, low on chain' },
      { label: 'Spec sheet', example: 'Fork oil height: 120mm, sag: 104mm' },
      { label: 'Labor timer', example: 'Current task: 1h 22m — engine rebuild' },
      { label: 'Build log', example: '14 entries since last race — all documented' },
    ],
    cannotSee: ['P&L', 'Deals', 'Sponsor CRM', 'Athlete health data'],
  },
  {
    id: 'logistics',
    title: 'Logistics',
    who: 'Hauler Driver / Transport Coordinator',
    icon: Truck,
    minTier: 'Race Team',
    minTierColor: 'text-amber-400',
    accentColor: 'sky',
    hierarchy: 3,
    lens: 'Everything that moves. Route, load, compliance, and fuel — before the rig leaves.',
    dataPoints: [
      { label: 'Haul calendar', example: 'Next event: Phoenix, 847mi, departs Thursday 0600' },
      { label: 'Load manifest', example: '3 machines, 2 spare wheels, 1 generator — 94% capacity' },
      { label: 'DOT checklist', example: '11/12 complete — fire extinguisher needs inspection' },
      { label: 'Fuel log', example: '$620 diesel this trip — 4% over route budget' },
      { label: 'Rig maintenance', example: 'Trailer bearing service due in 1,200mi' },
    ],
    cannotSee: ['P&L', 'Deals', 'Sponsor CRM', 'Work orders', 'Athlete data'],
  },
  {
    id: 'analyst',
    title: 'Data Analyst',
    who: 'Contracted or Embedded Analyst',
    icon: LineChart,
    minTier: 'Factory Command',
    minTierColor: 'text-red-400',
    accentColor: 'violet',
    hierarchy: 3,
    lens: 'Session data at full depth. Lap splits, comparative analysis, championship math.',
    dataPoints: [
      { label: 'Lap delta', example: 'Sector 3 lost 0.18s — traction out of berm' },
      { label: 'Setup correlation', example: 'Tuesday clicker change = 0.3s per 10 laps' },
      { label: 'Championship scenario', example: '3 rounds left — must beat #47 by 8pts avg' },
      { label: 'Comparative analysis', example: 'Top-3 avg: 1:48.2, your athlete: 1:48.9' },
      { label: 'Session export', example: 'Full CSV + PDF brief — one click' },
    ],
    cannotSee: ['P&L', 'Deals', 'Contracts', 'Expense totals', 'Athlete injury log'],
  },
  {
    id: 'athlete',
    title: 'Athlete / Family',
    who: 'Driver, Rider, or Parent Account',
    icon: User,
    minTier: 'Grassroots',
    minTierColor: 'text-zinc-400',
    accentColor: 'green',
    hierarchy: 4,
    lens: 'Your program, your body, your season — without the noise of operations.',
    dataPoints: [
      { label: 'Event calendar', example: '4 events left — next: Anaheim, 18 days' },
      { label: 'Readiness score', example: 'Today: 82/100 — HRV strong, sleep slightly low' },
      { label: 'Injury log', example: '0 active — left shoulder cleared March 14' },
      { label: 'Progression', example: '3 fastest laps in the last 4 sessions' },
      { label: 'Budget view', example: '$4,200 remaining in season budget' },
    ],
    cannotSee: ['Staff P&L', 'Deals & contracts', 'Sponsor payments', 'Full setup library'],
  },
]

const ACCENT_CLASSES: Record<string, { border: string; text: string; bg: string; dot: string }> = {
  lime:   { border: 'border-lime-400/50',   text: 'text-lime-400',   bg: 'bg-lime-400/5',   dot: 'bg-lime-400' },
  amber:  { border: 'border-amber-400/50',  text: 'text-amber-400',  bg: 'bg-amber-400/5',  dot: 'bg-amber-400' },
  zinc:   { border: 'border-zinc-500/50',   text: 'text-zinc-300',   bg: 'bg-zinc-800/20',  dot: 'bg-zinc-400' },
  sky:    { border: 'border-sky-400/50',    text: 'text-sky-400',    bg: 'bg-sky-400/5',    dot: 'bg-sky-400' },
  violet: { border: 'border-violet-400/50', text: 'text-violet-400', bg: 'bg-violet-400/5', dot: 'bg-violet-400' },
  green:  { border: 'border-green-400/50',  text: 'text-green-400',  bg: 'bg-green-400/5',  dot: 'bg-green-400' },
}

export default function MdConsoleShowcase() {
  const [active, setActive] = useState('manager')
  const console = CONSOLES.find((c) => c.id === active)!
  const accent = ACCENT_CLASSES[console.accentColor]

  return (
    <section
      id="consoles"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="Console showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
            <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
              Consoles — Role Architecture
            </span>
          </div>
          <h2
            className="text-zinc-100 uppercase leading-none mb-4 text-balance max-w-3xl"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 5vw, 3.25rem)',
            }}
          >
            One login.{' '}
            <span className="text-lime-400">Six purpose-built consoles.</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Every person on your program gets their own lens on the platform. Not a shared screen with features stripped out — a console built for exactly what they do. Same data. Six surfaces. No duplicate entry.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Role selector */}
          <div className="lg:col-span-1 flex flex-col gap-1.5">
            {CONSOLES.map((c) => {
              const ca = ACCENT_CLASSES[c.accentColor]
              const isActive = c.id === active
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={[
                    'flex items-center gap-3 px-4 py-3.5 border text-left transition-all',
                    isActive
                      ? `${ca.border} ${ca.bg} border-l-2`
                      : 'border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/40',
                  ].join(' ')}
                  aria-pressed={isActive}
                  aria-label={`Select ${c.title} console`}
                >
                  <c.icon
                    className={`h-4 w-4 shrink-0 ${isActive ? ca.text : 'text-zinc-600'}`}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isActive ? ca.text : 'text-zinc-400'}`}>
                      {c.title}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-600 truncate">{c.who}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${c.minTierColor}`}>
                      {c.minTier}+
                    </span>
                    {isActive && (
                      <ChevronRight className={`h-3.5 w-3.5 ${ca.text}`} aria-hidden="true" />
                    )}
                  </div>
                </button>
              )
            })}

            {/* Hierarchy legend */}
            <div className="mt-4 p-4 border border-zinc-800/40 bg-zinc-900/30">
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-3">
                Permission Hierarchy
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'Team Manager', sub: 'Full access — all modules', color: 'text-lime-400' },
                  { label: 'Crew Chief', sub: 'Machine + athlete ops', color: 'text-amber-400' },
                  { label: 'Mechanic / Logistics / Analyst', sub: 'Role-scoped data only', color: 'text-zinc-400' },
                  { label: 'Athlete / Family', sub: 'Personal program view', color: 'text-green-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${row.color.replace('text-', 'bg-')}`} aria-hidden="true" />
                    <div>
                      <p className={`font-mono text-[10px] ${row.color}`}>{row.label}</p>
                      <p className="font-mono text-[9px] text-zinc-700">{row.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Console detail panel */}
          <div
            className={`lg:col-span-2 border ${accent.border} ${accent.bg} p-6 sm:p-8`}
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Console header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-zinc-800/60">
              <div className="flex items-center gap-4">
                <div className={`p-3 border ${accent.border} bg-zinc-950`}>
                  <console.icon className={`h-6 w-6 ${accent.text}`} aria-hidden="true" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-black uppercase ${accent.text}`}
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    {console.title}
                  </h3>
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    {console.who}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-mono text-[9px] uppercase tracking-widest ${console.minTierColor}`}>
                  Unlocks at
                </span>
                <p className={`font-bold text-sm ${console.minTierColor}`}>
                  {console.minTier}
                </p>
              </div>
            </div>

            {/* Lens statement */}
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 italic border-l-2 border-zinc-700 pl-4">
              &ldquo;{console.lens}&rdquo;
            </p>

            {/* Data points — what this console sees */}
            <div className="mb-6">
              <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-3">
                What this console surfaces
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {console.dataPoints.map((dp) => (
                  <div
                    key={dp.label}
                    className="flex flex-col gap-1 p-3 bg-zinc-950/60 border border-zinc-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-1 rounded-full shrink-0 ${accent.dot}`} aria-hidden="true" />
                      <p className={`font-mono text-[10px] uppercase tracking-widest ${accent.text}`}>
                        {dp.label}
                      </p>
                    </div>
                    <p className="text-zinc-400 text-xs leading-snug pl-3">
                      {dp.example}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cannot see — gated data */}
            {console.cannotSee.length > 0 && (
              <div className="pt-4 border-t border-zinc-800/40">
                <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Gated from this console
                </p>
                <div className="flex flex-wrap gap-2">
                  {console.cannotSee.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-[9px] text-zinc-700 border border-zinc-800/60 px-2 py-1 bg-zinc-900/40"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
