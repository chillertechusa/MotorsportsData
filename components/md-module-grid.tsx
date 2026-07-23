import {
  Truck,
  Wrench,
  Radio,
  BarChart3,
  Users,
  TrendingUp,
  CalendarDays,
  DollarSign,
  Heart,
  Activity,
  Video,
  UserSearch,
} from 'lucide-react'

type ModuleStatus = 'live' | 'q1-27' | '2028'

interface Module {
  icon: React.ElementType
  name: string
  desc: string
  tier: string
  status: ModuleStatus
}

const MODULES: Module[] = [
  {
    icon: Truck,
    name: 'Rig Doctor AI',
    desc: 'DOT pre-trip, PM schedule, DEF + DPF alerts for the hauler.',
    tier: 'Race Team+',
    status: 'live',
  },
  {
    icon: Wrench,
    name: 'Work Orders',
    desc: 'Multi-bike queue, labor timer, suspension before/after.',
    tier: 'Race Team+',
    status: 'live',
  },
  {
    icon: Radio,
    name: 'Crew Chief AI',
    desc: 'Live setup recommendations during practice and qualifying.',
    tier: 'Privateer+',
    status: 'live',
  },
  {
    icon: BarChart3,
    name: 'Analyst Console',
    desc: 'Lap correlation, setup delta trending, championship projection.',
    tier: 'Race Team+',
    status: 'live',
  },
  {
    icon: Users,
    name: 'Team Command',
    desc: 'All riders, points standings, season spend — one screen.',
    tier: 'Race Team+',
    status: 'live',
  },
  {
    icon: TrendingUp,
    name: 'Fleet Garage',
    desc: 'Bike profiles, engine hours, maintenance history.',
    tier: 'Grassroots+',
    status: 'live',
  },
  {
    icon: CalendarDays,
    name: 'Race Calendar',
    desc: 'Season schedule, event results, entry fee tracker.',
    tier: 'Grassroots+',
    status: 'live',
  },
  {
    icon: DollarSign,
    name: 'Expense Tracker',
    desc: 'Full program spend, sponsor ROI, budget vs. actual.',
    tier: 'Grassroots+',
    status: 'live',
  },
  {
    icon: Heart,
    name: 'Rider Readiness',
    desc: 'HRV, sleep, injury log, RTR protocol compliance.',
    tier: 'Privateer+',
    status: 'live',
  },
  {
    icon: Activity,
    name: 'Telemetry Live',
    desc: 'Real-time speed, RPM, lean angle, suspension travel.',
    tier: 'Factory Command',
    status: 'q1-27',
  },
  {
    icon: Video,
    name: 'Video Analysis',
    desc: 'AI-tagged lap video synced to telemetry data.',
    tier: 'Privateer+',
    status: 'q1-27',
  },
  {
    icon: UserSearch,
    name: 'Agent Marketplace',
    desc: 'Verified rider profiles discoverable by agents and sponsors.',
    tier: 'All tiers',
    status: '2028',
  },
]

const STATUS_CONFIG: Record<ModuleStatus, { label: string; pill: string; card: string; dot: string }> = {
  live: {
    label: 'Live',
    pill: 'bg-lime-400/15 text-lime-400 border border-lime-400/30',
    card: 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70',
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
    dot: 'bg-sky-400',
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

        {/* Header bar — ClutchDMS style */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-lime-400" aria-hidden="true" />
              <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">
                // platform-modules
              </p>
            </div>
            <h2
              className="text-zinc-100 uppercase leading-none tracking-tight"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(1.6rem, 4vw, 2.75rem)',
              }}
            >
              One console for{' '}
              <span className="text-lime-400">every role on the team.</span>
            </h2>
          </div>

          {/* Live badge */}
          <div className="shrink-0 flex items-center gap-2 border border-zinc-800 bg-zinc-900/60 px-4 py-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-xs text-zinc-300 uppercase tracking-widest">
              {liveCount} modules live
            </span>
          </div>
        </div>

        {/* Module grid — 4 cols desktop, 2 cols mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            const cfg = STATUS_CONFIG[mod.status]
            return (
              <div
                key={mod.name}
                className={`relative flex flex-col gap-3 p-4 sm:p-5 border transition-all ${cfg.card}`}
              >
                {/* Status dot top-right */}
                <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />

                {/* Icon */}
                <div className="w-9 h-9 flex items-center justify-center border border-zinc-800 bg-zinc-950/60 shrink-0">
                  <Icon className="h-4 w-4 text-zinc-400" aria-hidden="true" />
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

                {/* 2028 special tooltip-style label */}
                {mod.status === '2028' && (
                  <p className="font-mono text-[9px] text-sky-400/70 uppercase tracking-wide leading-relaxed border-t border-sky-400/15 pt-2">
                    Powered by your data. Log now, get found later.
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-zinc-800/60">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                {cfg.label} {key === 'live' ? '— available now' : key === 'q1-27' ? '— Q1 2027 roadmap' : '— 2028 launch'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
