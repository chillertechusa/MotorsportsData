'use client'

import { useState } from 'react'
import {
  DollarSign, FileText, PiggyBank, Truck, Wrench, Package,
  ShieldCheck, Users, BarChart3, Cpu, HeartPulse, Calendar,
  Radio, Share2, Bot
} from 'lucide-react'

type ModuleStatus = 'live' | 'q127' | '2028'
type TierName = 'Grassroots' | 'Privateer' | 'Race Team' | 'Factory Command'

type RmsModule = {
  id: string
  name: string
  icon: React.ElementType
  tagline: string
  status: ModuleStatus
  minTier: TierName
  copilot: boolean
  features: string[]
  discipline: string // what it's called in different disciplines
}

const MODULES: RmsModule[] = [
  {
    id: 'deals',
    name: 'Deals + Contracts',
    icon: FileText,
    tagline: 'Close the deal. Send the invoice. Get paid.',
    status: 'live',
    minTier: 'Race Team',
    copilot: true,
    features: [
      'Seat fees, appearance fees, camp invoices, ride fees',
      'Square payment links — paid in minutes, not weeks',
      'PDF contract generation + digital signature ready',
      'Deal pipeline with status tracking (Draft → Signed → Paid)',
      'Co-pilot alerts: contract expiry, unsigned deals, overdue payments',
    ],
    discipline: 'MX: ride fees + seat contracts / NASCAR: sponsorship deals / Karting: camp invoices',
  },
  {
    id: 'accounting',
    name: 'Accounting + P&L',
    icon: PiggyBank,
    tagline: 'Every dollar in. Every dollar out. Real-time.',
    status: 'live',
    minTier: 'Race Team',
    copilot: true,
    features: [
      'Full income and expense ledger — every transaction categorized',
      'Season P&L by category: fuel, parts, travel, labor, entry fees',
      'Budget vs. actual with variance alerts',
      'Multi-machine expense allocation — know cost per asset',
      'QuickBooks sync — Q1 27',
    ],
    discipline: 'Universal — every program has expenses and needs to know where the money went',
  },
  {
    id: 'crm',
    name: 'Sponsor CRM',
    icon: Users,
    tagline: 'Your sponsor relationships are a revenue stream. Treat them like one.',
    status: 'live',
    minTier: 'Privateer',
    copilot: true,
    features: [
      'Sponsor pipeline — prospect to signed, all in one view',
      'Deliverable tracker: logo placements, posts, appearances, activations',
      'ROI dashboard: impressions, reach, event visibility per sponsor',
      'Renewal forecasting — know who is up for renewal 60 days early',
      'Co-pilot alerts: deliverable due, sponsor meeting overdue, contract expiry',
    ],
    discipline: 'MX: RedBull / Fox / gear sponsors / NASCAR: primary + associate sponsors / Karting: local shop deals',
  },
  {
    id: 'fi',
    name: 'Finance + Insurance',
    icon: ShieldCheck,
    tagline: 'Policies, premiums, and claims — managed, not forgotten.',
    status: 'live',
    minTier: 'Privateer',
    copilot: true,
    features: [
      'Insurance policy vault: liability, event, equipment, medical',
      'Premium payment log with expiry alerts',
      'Claim filing log — document every incident with photos + notes',
      'Coverage gap alerts: event coming up, policy expires before it',
      'Co-pilot flags: uninsured events, lapsing coverage, open claims',
    ],
    discipline: 'Universal — every competitive program carries insurance. Most forget to track it.',
  },
  {
    id: 'fleet',
    name: 'Fleet + Asset Management',
    icon: Package,
    tagline: 'Your machines are assets. Manage them like it.',
    status: 'live',
    minTier: 'Grassroots',
    copilot: true,
    features: [
      'Machine garage: specs, purchase date, value, VIN/serial',
      'Maintenance lifecycle: hours-based + date-based service intervals',
      'Modification log — every change documented and timestamped',
      'Asset cost tracking: total spend per machine across its life',
      'Co-pilot alerts: service due, hours threshold approaching, warranty expiry',
    ],
    discipline: 'MX: bikes / NASCAR: car + spares / Karting: kart chassis / Boats: hull + engine',
  },
  {
    id: 'service',
    name: 'Service Desk',
    icon: Wrench,
    tagline: 'The shop floor, digitized. Work orders from open to closed.',
    status: 'live',
    minTier: 'Race Team',
    copilot: false,
    features: [
      'Work order queue: open, in-progress, complete — all machines',
      'Labor timer: clock in, clock out, auto-calculate hours per tech',
      'Parts consumed per work order — links to Parts Vault inventory',
      'Before/after spec sheet attached to every job',
      'Mechanic console — purpose-built, no P&L noise',
    ],
    discipline: 'Universal — every competitive program has someone turning wrenches',
  },
  {
    id: 'parts',
    name: 'Parts Vault',
    icon: Package,
    tagline: 'Know what you have before you need it.',
    status: 'live',
    minTier: 'Grassroots',
    copilot: true,
    features: [
      'Full parts inventory with quantity, location, reorder threshold',
      'Parts consumed tracking — linked to work orders automatically',
      'Low stock alerts before you run out at the event',
      'Supplier log with part numbers and lead times',
      'Co-pilot: reorder alerts, parts consumed rate, event prep checklist',
    ],
    discipline: 'Universal — chains, sprockets, brakes, filters, fluids. Every program burns through parts.',
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: Truck,
    tagline: 'From your shop to the gate. Nothing left behind.',
    status: 'live',
    minTier: 'Race Team',
    copilot: true,
    features: [
      'Haul calendar: departure times, routes, fuel stops, ETA',
      'Load manifest: every item that goes on the trailer, verified',
      'DOT compliance checklist — inspection-ready every trip',
      'Fuel + toll log — expenses tied to Accounting automatically',
      'Rig maintenance tracker: service intervals, mileage alerts',
    ],
    discipline: 'MX: trailer + hauler / NASCAR: 18-wheeler rig / Karting: cargo van / Boats: trailer',
  },
  {
    id: 'warranty',
    name: 'Warranty Tracker',
    icon: ShieldCheck,
    tagline: 'Stop leaving warranty money on the table.',
    status: 'live',
    minTier: 'Race Team',
    copilot: true,
    features: [
      'Machine, component, and gear warranty log with expiry dates',
      'Claim filing log: date, item, issue, outcome',
      'Expiry alerts 30 days before coverage ends',
      'Linked to Fleet module — every asset has a warranty record',
      'Co-pilot: upcoming expiry, open claims, claim outcomes',
    ],
    discipline: 'Universal — frame warranties, suspension warranties, safety gear, helmets, electronics',
  },
  {
    id: 'reporting',
    name: 'Reporting',
    icon: BarChart3,
    tagline: 'The numbers that run the business, not just the lap times.',
    status: 'live',
    minTier: 'Privateer',
    copilot: false,
    features: [
      'Season summary: wins, starts, DNFs, cost per event, sponsor ROI',
      'P&L report by month, by event, by machine, by category',
      'Sponsor deliverable completion rate',
      'Athlete progression over the season',
      'One-click PDF export — send to sponsors, investors, family backers',
    ],
    discipline: 'Universal — every program needs to justify its budget to someone',
  },
  {
    id: 'ai',
    name: 'MD Co-Pilot AI',
    icon: Cpu,
    tagline: 'Acts before you ask. Thinks across all 14 modules.',
    status: 'live',
    minTier: 'Grassroots',
    copilot: false,
    features: [
      'Pre-event brief — surface everything that needs attention before gate drop',
      'Cross-module insights: budget + schedule + machine readiness in one view',
      'Natural language queries: "What did we spend on fuel in Q1?"',
      'Setup coaching: correlate session data to lap time improvements',
      'Proactive alerts — see the problems before they become expensive',
    ],
    discipline: 'Universal — the same intelligence engine runs regardless of discipline',
  },
  {
    id: 'readiness',
    name: 'Athlete Readiness',
    icon: HeartPulse,
    tagline: 'The athlete is part of the machine. Treat the data accordingly.',
    status: 'live',
    minTier: 'Grassroots',
    copilot: true,
    features: [
      'Daily readiness score: HRV, sleep, nutrition, soreness',
      'Injury log: incident, treatment, clearance — full history',
      'Training load tracker — avoid peak burnout before key events',
      'Event readiness flag: green/yellow/red status 48hrs before',
      'Co-pilot: baseline drop alerts, event proximity warnings',
    ],
    discipline: 'Universal — driver fitness, rider health, jockey conditioning. Bodies break down under racing load.',
  },
  {
    id: 'liverace',
    name: 'Live Race Console',
    icon: Radio,
    tagline: 'Real-time strategy board for the event.',
    status: 'q127',
    minTier: 'Factory Command',
    copilot: true,
    features: [
      'Live timing feed integration — real positions, gaps, sector splits',
      'Pit board communication — digital signals to the athlete',
      'Strategy board: lap-by-lap adjustments, fuel windows, pit calls',
      'Post-race debrief auto-generated by co-pilot',
      'Championship impact calculator — live points shift as race runs',
    ],
    discipline: 'MX: moto timing / NASCAR: track position / Karting: live sector times',
  },
  {
    id: 'syndication',
    name: 'Syndication',
    icon: Share2,
    tagline: 'Your content is a revenue stream. Start treating it like one.',
    status: 'q127',
    minTier: 'Factory Command',
    copilot: false,
    features: [
      'Content rights management — who owns the clip, who gets the license fee',
      'Instagram / TikTok clip monetization tracking',
      'Media kit builder — auto-generates from Sponsor CRM data',
      'Appearance fee invoicing linked to Deals module',
      'Distribution log: where content went, what it generated',
    ],
    discipline: 'Any athlete with a social following — MX, NASCAR, drift, karting, off-road',
  },
]

const TIER_COLORS: Record<TierName, string> = {
  'Grassroots':      'text-zinc-400 border-zinc-700',
  'Privateer':       'text-lime-400 border-lime-400/40',
  'Race Team':       'text-amber-400 border-amber-400/40',
  'Factory Command': 'text-red-400 border-red-400/40',
}

const STATUS_CONFIG: Record<ModuleStatus, { label: string; color: string; bg: string; border: string }> = {
  live:  { label: 'Live',   color: 'text-lime-400',  bg: 'bg-lime-400/10',  border: 'border-lime-400/20' },
  q127:  { label: 'Q1 27',  color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  '2028':{ label: '2028',   color: 'text-sky-400',   bg: 'bg-sky-400/10',   border: 'border-sky-400/20' },
}

const TIERS: TierName[] = ['Grassroots', 'Privateer', 'Race Team', 'Factory Command']

export default function MdModuleShowcase() {
  const [activeTier, setActiveTier] = useState<TierName | 'all'>('all')
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const filtered = activeTier === 'all'
    ? MODULES
    : MODULES.filter((m) => {
        const tIdx = TIERS.indexOf(m.minTier)
        const fIdx = TIERS.indexOf(activeTier as TierName)
        return tIdx <= fIdx
      })

  const selected = activeModule ? MODULES.find((m) => m.id === activeModule) : null

  return (
    <section
      id="platform"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="Platform modules"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
            <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
              Platform — 14 Business Modules
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
            Every tool a{' '}
            <span className="text-lime-400">racing business needs.</span>{' '}
            Unlocked to fit any program.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            From the family pit running their first full season to a factory program managing a $2M budget. Every module works for your discipline — MX, NASCAR, karting, drag, off-road, or anything that competes.
          </p>
        </div>

        {/* Tier filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTier('all')}
            className={[
              'font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors',
              activeTier === 'all'
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'text-zinc-400 border-zinc-700 hover:border-zinc-500',
            ].join(' ')}
          >
            All modules
          </button>
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={[
                'font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors',
                activeTier === tier
                  ? `${TIER_COLORS[tier].split(' ')[0]} ${TIER_COLORS[tier].split(' ')[1]} bg-zinc-900`
                  : 'text-zinc-500 border-zinc-800 hover:border-zinc-600',
              ].join(' ')}
            >
              {tier}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Module grid */}
          <div className={selected ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className={`grid gap-3 ${selected ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'}`}>
              {filtered.map((mod) => {
                const sc = STATUS_CONFIG[mod.status]
                const tc = TIER_COLORS[mod.minTier]
                const isActive = activeModule === mod.id
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(isActive ? null : mod.id)}
                    className={[
                      'group flex flex-col gap-3 p-4 border text-left transition-all',
                      isActive
                        ? 'border-lime-400/40 bg-lime-400/5'
                        : 'border-zinc-800/60 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60',
                      mod.status !== 'live' ? 'opacity-70' : '',
                    ].join(' ')}
                    aria-pressed={isActive}
                    aria-label={`${mod.name} — ${mod.status === 'live' ? 'live' : mod.status}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <mod.icon
                          className={`h-4 w-4 shrink-0 ${isActive ? 'text-lime-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}
                          aria-hidden="true"
                        />
                        <p className={`text-sm font-semibold ${isActive ? 'text-lime-400' : 'text-zinc-200'}`}>
                          {mod.name}
                        </p>
                      </div>
                      <span className={`shrink-0 font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border ${sc.color} ${sc.bg} ${sc.border}`}>
                        {sc.label}
                      </span>
                    </div>

                    <p className="text-zinc-500 text-xs leading-snug">
                      {mod.tagline}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800/40">
                      <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 ${tc}`}>
                        {mod.minTier}+
                      </span>
                      {mod.copilot && (
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3 text-sky-400" aria-hidden="true" />
                          <span className="font-mono text-[9px] text-sky-400 uppercase tracking-widest">
                            Co-Pilot
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Module detail panel */}
          {selected && (
            <div className="lg:col-span-1 border border-lime-400/30 bg-lime-400/5 p-5 sm:p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 border border-lime-400/30 bg-zinc-950">
                    <selected.icon className="h-5 w-5 text-lime-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-black uppercase text-lime-400"
                      style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                    >
                      {selected.name}
                    </h3>
                    <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 ${TIER_COLORS[selected.minTier]}`}>
                      {selected.minTier}+
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModule(null)}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors font-mono text-xs"
                  aria-label="Close module detail"
                >
                  close
                </button>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed mb-5 italic">
                &ldquo;{selected.tagline}&rdquo;
              </p>

              <div className="mb-5 flex-1">
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-3">
                  What it does
                </p>
                <ul className="flex flex-col gap-2.5">
                  {selected.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-lime-400 shrink-0 mt-2" aria-hidden="true" />
                      <span className="text-zinc-300 text-xs leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-zinc-800/40">
                <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-1">
                  Works for
                </p>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  {selected.discipline}
                </p>
                {selected.copilot && (
                  <div className="flex items-center gap-2 mt-3">
                    <Bot className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                    <span className="font-mono text-[9px] text-sky-400 uppercase tracking-widest">
                      MD Co-Pilot active in this module
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
