'use client'

import {
  Truck,
  Wrench,
  Radio,
  BarChart3,
  Users,
  Bike,
  CalendarDays,
  DollarSign,
  Heart,
  Activity,
  Video,
  UserSearch,
  FileText,
  Shield,
  PackageSearch,
  TrendingUp,
} from 'lucide-react'

type ModuleStatus = 'live' | 'q1-27' | '2028'

interface Module {
  icon: React.ElementType
  name: string
  desc: string
  tier: string
  status: ModuleStatus
  accent?: string // optional icon accent for key modules
}

const MODULES: Module[] = [
  // ── Row 1 — Business core ─────────────────────────────────────────────
  {
    icon: FileText,
    name: 'Deals',
    desc: 'Seat fees, appearance contracts, camp invoices, rider payments. Create, send, collect.',
    tier: 'Race Team+',
    status: 'live',
    accent: 'text-lime-400',
  },
  {
    icon: DollarSign,
    name: 'Accounting',
    desc: 'Full P&L, income vs. expense, budget vs. actual, export to CSV. QuickBooks sync Q1 27.',
    tier: 'Race Team+',
    status: 'live',
    accent: 'text-lime-400',
  },
  {
    icon: TrendingUp,
    name: 'Finance & Insurance',
    desc: 'Season financing, bike and trailer insurance policies, coverage tracker, expiry alerts.',
    tier: 'Privateer+',
    status: 'live',
    accent: 'text-lime-400',
  },
  {
    icon: Users,
    name: 'Sponsor CRM',
    desc: 'Pipeline, deal stages, ROI reporting, brand outreach tracker, payment schedules.',
    tier: 'Privateer+',
    status: 'live',
  },
  // ── Row 2 — Operations ────────────────────────────────────────────────
  {
    icon: Truck,
    name: 'Logistics',
    desc: 'Haul calendar, load plans, DOT pre-trip checklists, fuel stops, rig PM scheduler.',
    tier: 'Race Team+',
    status: 'live',
  },
  {
    icon: Wrench,
    name: 'Service Desk',
    desc: 'Multi-bike work orders, labor timer, suspension before/after, mechanic career record.',
    tier: 'Race Team+',
    status: 'live',
  },
  {
    icon: Bike,
    name: 'Fleet + Parts',
    desc: 'Bike profiles, engine hours, Part Vault stock, replacement cycle alerts.',
    tier: 'Grassroots+',
    status: 'live',
  },
  {
    icon: Shield,
    name: 'Warranty',
    desc: 'Bike, frame, engine, gear, and helmet warranties. Claim filing, expiry alerts.',
    tier: 'Grassroots+',
    status: 'live',
  },
  // ── Row 3 — Performance ───────────────────────────────────────────────
  {
    icon: Radio,
    name: 'Crew Chief AI',
    desc: 'Live setup recommendations during practice and qualifying. Reads your full season data.',
    tier: 'Privateer+',
    status: 'live',
  },
  {
    icon: BarChart3,
    name: 'Reports',
    desc: 'Revenue, expenses, lap progression, sponsor ROI, season recap — auto-generated.',
    tier: 'Race Team+',
    status: 'live',
  },
  {
    icon: Heart,
    name: 'Rider Readiness',
    desc: 'HRV, sleep, injury log, nutrition, RTR protocol. Race-day readiness score.',
    tier: 'Privateer+',
    status: 'live',
  },
  {
    icon: CalendarDays,
    name: 'Race Calendar',
    desc: 'Full season schedule, entry fees, results log, weather pull per venue.',
    tier: 'Grassroots+',
    status: 'live',
  },
  // ── Row 4 — Future ────────────────────────────────────────────────────
  {
    icon: Activity,
    name: 'Live Telemetry',
    desc: 'Real-time speed, RPM, lean angle, throttle, brake, suspension travel per lap.',
    tier: 'Factory Command',
    status: 'q1-27',
  },
  {
    icon: Video,
    name: 'Syndication',
    desc: 'Rider content licensing — Instagram clips, sponsor tags, usage fees collected.',
    tier: 'Factory Command',
    status: 'q1-27',
  },
  {
    icon: PackageSearch,
    name: 'Rentals',
    desc: 'Track day management, bike rental by the day, training facility bookings.',
    tier: 'Factory Command',
    status: 'q1-27',
  },
  {
    icon: UserSearch,
    name: 'Agent Marketplace',
    desc: 'Verified rider profiles discoverable by agents, scouts, and factory teams.',
    tier: 'All tiers',
    status: '2028',
  },
]

const STATUS_CONFIG: Record<ModuleStatus, { label: string; pill: string; card: string; dot: string }> = {
  live: {
    label: 'Live',
    pill: 'bg-lime-400/15 text-lime-400 border border-lime-400/30',
    card: 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60',
    dot: 'bg-lime-400',
  },
  'q1-27': {
    label: 'Q1 27',
    pill: 'bg-amber-400/10 text-amber-400 border border-amber-400/25',
    card: 'border-zinc-800/60 bg-zinc-900/20 opacity-70 hover:opacity-90',
    dot: 'bg-amber-400',
  },
  '2028': {
    label: '2028',
    pill: 'bg-sky-400/10 text-sky-400 border border-sky-400/25',
    card: 'border-sky-400/20 bg-sky-400/5 opacity-75 hover:opacity-95',
    dot: 'bg-sky-400 animate-pulse',
  },
}

const liveCount = MODULES.filter((m) => m.status === 'live').length

export default function MdModuleGrid() {
  return (
    <section
      id="modules"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-20"
      aria-label="Platform modules"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — ClutchDMS style */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-lime-400" aria-hidden="true" />
              <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">
                One login — every role on the team
              </p>
            </div>
            <h2
              className="text-zinc-100 uppercase leading-none tracking-tight text-balance"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
              }}
            >
              The full operating system{' '}
              <span className="text-lime-400">for your racing business.</span>
            </h2>
          </div>

          {/* Live count badge — ClutchDMS style */}
          <div className="shrink-0 flex items-center gap-2 border border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-xs text-zinc-300 uppercase tracking-widest">
              {liveCount} modules live
            </span>
          </div>
        </div>

        {/* Module grid — 4 cols desktop, 2 mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            const cfg = STATUS_CONFIG[mod.status]
            return (
              <div
                key={mod.name}
                className={`relative flex flex-col gap-3 p-4 sm:p-5 border transition-all duration-150 ${cfg.card}`}
              >
                {/* Status dot */}
                <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />

                {/* Icon */}
                <div className="w-9 h-9 flex items-center justify-center border border-zinc-800 bg-zinc-950/60 shrink-0">
                  <Icon
                    className={`h-4 w-4 ${mod.accent ?? 'text-zinc-400'}`}
                    aria-hidden="true"
                  />
                </div>

                {/* Name + desc */}
                <div className="flex-1">
                  <p
                    className="text-zinc-100 leading-tight mb-1"
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, fontSize: '1.05rem' }}
                  >
                    {mod.name}
                  </p>
                  <p className="text-zinc-500 text-xs leading-relaxed hidden sm:block">
                    {mod.desc}
                  </p>
                </div>

                {/* Footer: tier + status pill */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                    {mod.tier}
                  </span>
                  <span className={`font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 ${cfg.pill}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* 2028 hook */}
                {mod.status === '2028' && (
                  <p className="font-mono text-[9px] text-sky-400/70 uppercase tracking-wide leading-relaxed border-t border-sky-400/15 pt-2">
                    Log now. Get found later.
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pt-6 border-t border-zinc-800/60">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                {cfg.label}
                {key === 'live' ? ' — available now' : key === 'q1-27' ? ' — Q1 2027 roadmap' : ' — 2028 launch'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
