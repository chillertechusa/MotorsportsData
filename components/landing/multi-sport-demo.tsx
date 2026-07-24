'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import {
  Zap, Trees, Star, Circle, Map, Baby, Gauge, Flame, Mountain, Trophy,
  ArrowRight, Cpu, Activity, BarChart3, DollarSign, Users, Calendar,
  Flag, Wrench, TrendingUp, TrendingDown, ChevronRight, Timer, Radio,
  type LucideIcon,
} from 'lucide-react'
import { DISCIPLINES, type DisciplineId } from '@/lib/md-discipline'
import { ROLE_LENSES, STAGES, buildLensView, type RoleId, type StageId } from '@/lib/demo-lenses'

const DISC_ICONS: Record<string, LucideIcon> = {
  Zap, Trees, Star, Circle, Map, Baby, Gauge, Flame, Mountain, Trophy,
}

/* Accent colours hardcoded so Tailwind can tree-shake correctly */
const DISC_ACCENT: Record<DisciplineId, { text: string; border: string; bg: string; bar: string }> = {
  mx_sx:      { text: 'text-lime-400',   border: 'border-lime-400',   bg: 'bg-lime-400/10',   bar: 'bg-lime-400' },
  enduro:     { text: 'text-green-400',  border: 'border-green-400',  bg: 'bg-green-400/10',  bar: 'bg-green-400' },
  fmx:        { text: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400/10', bar: 'bg-orange-400' },
  flat_track: { text: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10', bar: 'bg-yellow-400' },
  trail:      { text: 'text-blue-400',   border: 'border-blue-400',   bg: 'bg-blue-400/10',   bar: 'bg-blue-400' },
  pit_bike:   { text: 'text-pink-400',   border: 'border-pink-400',   bg: 'bg-pink-400/10',   bar: 'bg-pink-400' },
  nascar:     { text: 'text-red-400',    border: 'border-red-400',    bg: 'bg-red-400/10',    bar: 'bg-red-400' },
  drag:       { text: 'text-orange-500', border: 'border-orange-500', bg: 'bg-orange-500/10', bar: 'bg-orange-500' },
  rally:      { text: 'text-sky-400',    border: 'border-sky-400',    bg: 'bg-sky-400/10',    bar: 'bg-sky-400' },
  karting:    { text: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10', bar: 'bg-purple-400' },
}

/* A thin animated bar that re-runs on key change */
function AnimatedBar({ pct, barClass }: { pct: number; barClass: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 60)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div className="h-1.5 w-full bg-zinc-800 overflow-hidden">
      <div
        className={`h-full transition-all duration-700 ease-out ${barClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

/* A single big stat tile — the hero metric */
function HeroStat({
  label, value, delta, positive, accent,
}: {
  label: string; value: string; delta?: string; positive?: boolean; accent: typeof DISC_ACCENT[DisciplineId]
}) {
  return (
    <div className={`border ${accent.border} ${accent.bg} p-5 flex flex-col gap-2`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p
        className={`leading-none ${accent.text}`}
        style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}
      >
        {value}
      </p>
      {delta && (
        <div className="flex items-center gap-1.5">
          {positive ? (
            <TrendingUp className={`h-3 w-3 ${accent.text}`} aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-400" aria-hidden="true" />
          )}
          <span className={`font-mono text-xs ${positive ? accent.text : 'text-red-400'}`}>{delta}</span>
        </div>
      )}
    </div>
  )
}

/* Smaller supporting stat */
function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 p-3.5">
      <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">{label}</p>
      <p
        className="text-zinc-100 leading-none"
        style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.25rem' }}
      >
        {value}
      </p>
      {sub && <p className="font-mono text-[9px] text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}

/* Live AI insight chip */
function AiInsight({ text, accent }: { text: string; accent: typeof DISC_ACCENT[DisciplineId] }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [text])

  return (
    <div
      className={`border-t border-zinc-800 ${accent.bg} px-6 py-4 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex items-center gap-1.5 shrink-0 mt-0.5`}>
          <span className={`h-1.5 w-1.5 rounded-full ${accent.bar} animate-pulse`} aria-hidden="true" />
          <Cpu className={`h-3.5 w-3.5 ${accent.text}`} aria-hidden="true" />
          <span className={`font-mono text-[9px] uppercase tracking-widest ${accent.text}`}>Rig Doctor AI</span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed text-pretty">&ldquo;{text}&rdquo;</p>
      </div>
    </div>
  )
}

/* The fake OS sidebar */
function AppSidebar({
  disciplineId,
  stage,
  onStage,
  accent,
}: {
  disciplineId: DisciplineId
  stage: StageId
  onStage: (s: StageId) => void
  accent: typeof DISC_ACCENT[DisciplineId]
}) {
  const sidebarItems: Array<{ id: StageId; icon: LucideIcon; label: string }> = [
    { id: 'capture', icon: Radio, label: 'Session Log' },
    { id: 'analyze', icon: Activity, label: 'Performance' },
    { id: 'coach', icon: BarChart3, label: 'Coaching' },
    { id: 'raceday', icon: Flag, label: 'Race Day' },
    { id: 'business', icon: DollarSign, label: 'Business' },
  ]

  return (
    <nav className="flex flex-col w-full h-full bg-zinc-950 border-r border-zinc-800" aria-label="App navigation">
      {/* Logo row */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-800">
        <div className={`h-6 w-6 flex items-center justify-center text-[10px] font-black ${accent.text} border ${accent.border}`}>
          MD
        </div>
        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest truncate">Motorsport Data</span>
      </div>

      {/* Discipline badge */}
      <div className="px-3 py-3 border-b border-zinc-800">
        <div className={`${accent.bg} border ${accent.border} px-2.5 py-2`}>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Active Discipline</p>
          <p className={`font-mono text-[10px] font-bold ${accent.text} uppercase tracking-wide leading-tight`}>
            {DISCIPLINES.find((d) => d.id === disciplineId)?.label ?? 'MX / SX'}
          </p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-0.5 p-2 flex-1">
        {sidebarItems.map((item) => {
          const active = item.id === stage
          return (
            <button
              key={item.id}
              onClick={() => onStage(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-left transition-all group ${
                active
                  ? `${accent.bg} ${accent.text}`
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-wider truncate">{item.label}</span>
              {active && <ChevronRight className={`h-3 w-3 ml-auto ${accent.text}`} aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      {/* Bottom mini-stats */}
      <div className="p-3 border-t border-zinc-800 space-y-1.5">
        {[
          { icon: Users, label: 'Roster', value: '4 active' },
          { icon: Calendar, label: 'Next event', value: '6 days' },
          { icon: Wrench, label: 'Parts log', value: '14 open' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <row.icon className="h-3 w-3 text-zinc-600 shrink-0" aria-hidden="true" />
            <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest flex-1">{row.label}</span>
            <span className="font-mono text-[9px] text-zinc-400">{row.value}</span>
          </div>
        ))}
      </div>
    </nav>
  )
}

export default function MultiSportDemo() {
  const [disciplineId, setDisciplineId] = useState<DisciplineId>('mx_sx')
  const [role, setRole] = useState<RoleId>('team')
  const [stage, setStage] = useState<StageId>('capture')
  const [animKey, setAnimKey] = useState(0)
  const prevDisc = useRef(disciplineId)

  // Re-trigger bar animations on discipline change
  useEffect(() => {
    if (prevDisc.current !== disciplineId) {
      setAnimKey((k) => k + 1)
      prevDisc.current = disciplineId
    }
  }, [disciplineId])

  const view = useMemo(() => buildLensView(disciplineId, role), [disciplineId, role])
  const activeStage = view.stages[stage]
  const accent = DISC_ACCENT[disciplineId] ?? DISC_ACCENT.mx_sx
  const discipline = DISCIPLINES.find((d) => d.id === disciplineId) ?? DISCIPLINES[0]

  /* Per-stage visual content */
  const stageContent = useMemo(() => {
    const d = discipline
    const tiles = activeStage.tiles

    if (stage === 'capture') {
      return {
        hero: { label: 'Session type', value: d.sessionTypes[0], delta: undefined, positive: undefined },
        bars: d.sessionTypes.slice(0, 4).map((s, i) => ({ label: s, pct: 100 - i * 18 })),
        stats: [
          { label: 'Event type', value: d.eventTypes[0], sub: d.description.split(' —')[0] },
          { label: 'Data channels', value: `${4 + (d.sessionTypes.length)}`, sub: 'live streams' },
          { label: 'Sync status', value: 'Live', sub: 'all systems green' },
        ],
      }
    }
    if (stage === 'analyze') {
      const pm = tiles[0]
      return {
        hero: { label: pm.label, value: pm.value, delta: pm.delta, positive: pm.positive },
        bars: [
          { label: 'Consistency', pct: 84 },
          { label: 'Sector 1', pct: 91 },
          { label: 'Sector 2', pct: 72 },
          { label: 'Sector 3', pct: 88 },
        ],
        stats: [
          { label: 'vs. last session', value: tiles[1]?.value ?? '—', sub: tiles[1]?.delta },
          { label: 'Improvement', value: tiles[2]?.value ?? '—', sub: 'this month' },
          { label: 'Data points', value: '12,400', sub: 'this session' },
        ],
      }
    }
    if (stage === 'coach') {
      return {
        hero: { label: 'AI confidence', value: '94%', delta: 'High signal', positive: true },
        bars: [
          { label: 'Skill gap identified', pct: 94 },
          { label: 'Plan adherence', pct: 78 },
          { label: 'Progress rate', pct: 62 },
          { label: 'Readiness score', pct: 88 },
        ],
        stats: [
          { label: 'Drills assigned', value: '3', sub: 'this week' },
          { label: 'Focus area', value: discipline.sessionTypes[0], sub: 'highest leverage' },
          { label: 'AI model', value: 'Rig Doctor', sub: `tuned for ${d.label.split(' /')[0]}` },
        ],
      }
    }
    if (stage === 'raceday') {
      return {
        hero: { label: 'Readiness', value: '94', delta: 'All systems go', positive: true },
        bars: [
          { label: 'Physical readiness', pct: 94 },
          { label: 'Equipment status', pct: 100 },
          { label: 'Mental prep', pct: 88 },
          { label: 'Weather score', pct: 76 },
        ],
        stats: [
          { label: 'Event', value: d.eventTypes[0], sub: 'this weekend' },
          { label: 'Entry status', value: 'Confirmed', sub: 'entry #24' },
          { label: 'Staff on site', value: '3', sub: 'mechanic, crew, coach' },
        ],
      }
    }
    // business
    if (role === 'coach') {
      return {
        hero: { label: 'Coach MRR', value: '$18,400', delta: '+$2,100', positive: true },
        bars: [
          { label: 'Roster utilization', pct: 87 },
          { label: 'Invoice collected', pct: 93 },
          { label: 'Session completion', pct: 78 },
          { label: 'Athlete retention', pct: 96 },
        ],
        stats: [
          { label: 'Active athletes', value: '14', sub: 'across 3 disciplines' },
          { label: 'Invoices due', value: '$4,200', sub: 'this cycle' },
          { label: 'Expenses logged', value: '$1,840', sub: 'this month' },
        ],
      }
    }
    if (role === 'team') {
      return {
        hero: { label: 'Season P&L', value: '+$42.6k', delta: 'vs. budget', positive: true },
        bars: [
          { label: 'Budget consumed', pct: 61 },
          { label: 'Sponsor delivered', pct: 88 },
          { label: 'Payroll on-time', pct: 100 },
          { label: 'Parts spend', pct: 54 },
        ],
        stats: [
          { label: 'Sponsor ROI', value: '3.8x', sub: 'verified deliverables' },
          { label: 'Payroll status', value: 'Synced', sub: 'ADP export ready' },
          { label: 'Invoices sent', value: '7', sub: 'this season' },
        ],
      }
    }
    return {
      hero: { label: 'Cost / event', value: '$1,240', delta: 'vs. $1,480 last yr', positive: true },
      bars: [
        { label: 'Budget used', pct: 42 },
        { label: 'Sponsor coverage', pct: 68 },
        { label: 'Entries covered', pct: 100 },
        { label: 'Travel costs', pct: 56 },
      ],
      stats: [
        { label: 'Sponsor billed', value: '$6,500', sub: 'this season' },
        { label: 'Budget remaining', value: '68%', sub: 'of annual' },
        { label: 'Total events', value: '12', sub: 'planned this year' },
      ],
    }
  }, [stage, disciplineId, role, discipline, activeStage.tiles])

  return (
    <section
      id="demo"
      className="bg-zinc-950 border-t border-zinc-800 py-20 md:py-28"
      aria-label="Interactive product demo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="max-w-3xl mb-12">
          <p className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.3em] mb-4">
            // one platform — every discipline — several lenses
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.2rem, 4.5vw, 4rem)' }}
          >
            Your Program. <span className="text-lime-400">Your Operating System.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Pick your discipline and your role — watch the platform re-skin its vocabulary, metrics, race-day playbook, and AI coaching to fit exactly how you race. Same platform, your lens.
          </p>
        </div>

        {/* Discipline selector — large pill grid */}
        <div className="mb-8">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.25em] mb-3">01 / Choose your discipline</p>
          <div role="tablist" aria-label="Select discipline" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {DISCIPLINES.map((d) => {
              const Icon = DISC_ICONS[d.iconName] ?? Zap
              const selected = d.id === disciplineId
              const a = DISC_ACCENT[d.id]
              return (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setDisciplineId(d.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 border text-left transition-all ${
                    selected
                      ? `${a.border} ${a.bg} ${a.text}`
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="font-mono text-[10px] uppercase tracking-wide leading-tight">{d.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Role selector */}
        <div className="mb-8">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.25em] mb-3">02 / Your role</p>
          <div role="tablist" aria-label="Select role" className="flex flex-wrap gap-2">
            {ROLE_LENSES.map((r) => {
              const selected = r.id === role
              return (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setRole(r.id)}
                  className={`px-6 py-3 border font-black text-sm uppercase tracking-widest transition-all ${
                    selected
                      ? 'bg-lime-400 text-zinc-950 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.2)]'
                      : 'text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
          <p className="text-zinc-500 text-sm mt-2.5 italic">{view.roleTagline}</p>
        </div>

        {/* ── FAKE OS CHROME ── */}
        <div className="border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/60">

          {/* Title bar */}
          <div className={`flex items-center justify-between border-b ${accent.border} border-opacity-30 px-5 py-3 bg-zinc-950`}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:inline">
                motorsportdata.io / dashboard
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 ${accent.bg} border ${accent.border} px-2.5 py-1`}>
                <span className={`h-1.5 w-1.5 rounded-full ${accent.bar} animate-pulse`} aria-hidden="true" />
                <span className={`font-mono text-[9px] uppercase tracking-widest ${accent.text}`}>
                  {discipline.label.split(' /')[0]} &mdash; {ROLE_LENSES.find((r) => r.id === role)?.label}
                </span>
              </div>
              <Timer className="h-3.5 w-3.5 text-zinc-600 hidden sm:block" aria-hidden="true" />
            </div>
          </div>

          {/* Body: sidebar + main */}
          <div className="flex min-h-[540px]">

            {/* Sidebar — hidden on mobile, visible md+ */}
            <div className="hidden md:flex md:w-48 lg:w-52 shrink-0">
              <AppSidebar
                disciplineId={disciplineId}
                stage={stage}
                onStage={setStage}
                accent={accent}
              />
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0 flex flex-col">

              {/* Mobile stage tabs */}
              <div className="md:hidden flex border-b border-zinc-800 overflow-x-auto">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStage(s.id)}
                    className={`shrink-0 px-3 py-3 font-mono text-[9px] uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                      stage === s.id
                        ? `${accent.text} border-current`
                        : 'text-zinc-600 border-transparent hover:text-zinc-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Page heading strip */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
                <div>
                  <h3
                    className={`${accent.text} uppercase leading-none`}
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.4rem' }}
                  >
                    {activeStage.title}
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1 leading-snug max-w-lg text-pretty">{activeStage.body}</p>
                </div>
                {(() => {
                  const DiscIcon = DISC_ICONS[discipline.iconName as string] ?? Zap
                  return (
                    <span className={`hidden lg:flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest ${accent.text}`}>
                      <DiscIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {STAGES.find((s) => s.id === stage)?.blurb}
                    </span>
                  )
                })()}
              </div>

              {/* Metrics grid */}
              <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 content-start">

                {/* Hero stat — full width on mobile, 1 col on desktop */}
                <div className="lg:col-span-1">
                  <HeroStat
                    key={`${disciplineId}-${stage}-${role}`}
                    label={stageContent.hero.label}
                    value={stageContent.hero.value}
                    delta={stageContent.hero.delta}
                    positive={stageContent.hero.positive}
                    accent={accent}
                  />
                </div>

                {/* Bar chart panel */}
                <div className="lg:col-span-2 border border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-3">
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Performance breakdown</p>
                  <div className="flex flex-col gap-3">
                    {stageContent.bars.map((bar) => (
                      <div key={`${animKey}-${bar.label}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">{bar.label}</span>
                          <span className={`font-mono text-[9px] ${accent.text}`}>{bar.pct}%</span>
                        </div>
                        <AnimatedBar pct={bar.pct} barClass={accent.bar} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supporting stat tiles */}
                {stageContent.stats.map((s) => (
                  <StatTile key={s.label} label={s.label} value={s.value} sub={s.sub} />
                ))}

              </div>

              {/* AI insight strip */}
              <AiInsight text={view.aiLine.replace(/^Rig Doctor AI.*?:\s*"?|"?$/g, '')} accent={accent} />

            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
              {DISCIPLINES.length} disciplines &mdash; {ROLE_LENSES.length} role lenses &mdash; 5 workflow stages
            </p>
            <p className="text-zinc-400 text-sm">Every program, one operating system. Founding access closes August 31.</p>
          </div>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-black text-sm uppercase tracking-widest px-8 py-4 hover:bg-lime-300 transition-colors shadow-[0_0_24px_rgba(163,230,53,0.25)] whitespace-nowrap"
          >
            Lock Your Founding Price
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
