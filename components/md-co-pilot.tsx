'use client'

import { useState } from 'react'
import {
  Bot, Wrench, Users, HeartPulse, Truck, BarChart3, Crown,
  ArrowRight, Clock
} from 'lucide-react'

type ConsoleId = 'manager' | 'crewchief' | 'athlete' | 'logistics' | 'crm' | 'analyst'

type CoPilotSignal = {
  id: string
  console: ConsoleId
  consoleLabel: string
  consoleIcon: React.ElementType
  severity: 'alert' | 'advisory' | 'insight'
  timeAgo: string
  module: string
  message: string
  context: string
  action: string
}

const SIGNALS: CoPilotSignal[] = [
  {
    id: 'engine-hours',
    console: 'crewchief',
    consoleLabel: 'Crew Chief',
    consoleIcon: Wrench,
    severity: 'alert',
    timeAgo: '2 hrs ago',
    module: 'Fleet + Asset',
    message: 'Engine rebuild window approaching.',
    context: 'Machine #1 is at 38.4 engine hours. Your rebuild interval is set at 40hrs. Next event is in 6 days. You have enough time — but only if you start today.',
    action: 'Open work order',
  },
  {
    id: 'sponsor-deliverable',
    console: 'crm',
    consoleLabel: 'Team Manager',
    consoleIcon: Crown,
    severity: 'alert',
    timeAgo: '4 hrs ago',
    module: 'Sponsor CRM',
    message: 'Sponsor deliverable due in 3 days. Nothing posted.',
    context: 'Alpinestars contract requires 2 social posts per event week. Last event was 9 days ago. Contract requires 2 posts, 0 have been logged. Renewal is in 47 days.',
    action: 'Log deliverable',
  },
  {
    id: 'athlete-hrv',
    console: 'athlete',
    consoleLabel: 'Athlete / Family',
    consoleIcon: HeartPulse,
    severity: 'advisory',
    timeAgo: '7 hrs ago',
    module: 'Athlete Readiness',
    message: 'HRV 14% below 30-day baseline. Event in 4 days.',
    context: 'Average HRV over the last 30 days is 68. This morning\'s reading is 58. Sleep was 5.9hrs vs. 7.4hr average. Recommend reduced training intensity for 48hrs and prioritize sleep before gate drop.',
    action: 'View readiness log',
  },
  {
    id: 'fuel-budget',
    console: 'logistics',
    consoleLabel: 'Logistics',
    consoleIcon: Truck,
    severity: 'advisory',
    timeAgo: '1 day ago',
    module: 'Logistics + Accounting',
    message: '$4,200 over fuel budget. Alternate route saves $600.',
    context: 'Season fuel budget is $8,000. Current spend is $12,200 with 3 events remaining. Co-pilot identified an alternate route to Phoenix that avoids two interstate fuel stops and saves an estimated $580–$640 at current diesel prices.',
    action: 'View route options',
  },
  {
    id: 'contract-expiry',
    console: 'manager',
    consoleLabel: 'Team Manager',
    consoleIcon: Crown,
    severity: 'insight',
    timeAgo: '2 days ago',
    module: 'Deals + Contracts',
    message: 'Fox Racing deal expires in 30 days. No renewal conversation logged.',
    context: 'The Fox Racing gear agreement is valued at $14,400/yr in product + $3,000 cash. Expiry is September 14. There are no logged calls, emails, or notes about renewal in the Sponsor CRM. Last contact logged was 74 days ago.',
    action: 'Log a note',
  },
  {
    id: 'session-insight',
    console: 'analyst',
    consoleLabel: 'Data Analyst',
    consoleIcon: BarChart3,
    severity: 'insight',
    timeAgo: '3 days ago',
    module: 'Reporting + Sessions',
    message: 'Athlete improved 0.3s over 3 sessions. Tied to Tuesday setup change.',
    context: 'Lap time average dropped from 1:49.2 to 1:48.9 across the last 3 sessions. The compression clicker change logged on Tuesday correlates with the fastest times in sectors 2 and 3. Setup is repeatable — document it before the next event.',
    action: 'Save setup baseline',
  },
]

const SEVERITY_CONFIG = {
  alert:    { dot: 'bg-red-400', label: 'Alert',    border: 'border-red-400/30',   bg: 'bg-red-400/5',    text: 'text-red-400' },
  advisory: { dot: 'bg-amber-400', label: 'Advisory', border: 'border-amber-400/30', bg: 'bg-amber-400/5',  text: 'text-amber-400' },
  insight:  { dot: 'bg-sky-400',  label: 'Insight',  border: 'border-sky-400/30',   bg: 'bg-sky-400/5',    text: 'text-sky-400' },
}

const CONSOLE_TABS: { id: ConsoleId | 'all'; label: string }[] = [
  { id: 'all',        label: 'All signals' },
  { id: 'manager',   label: 'Team Manager' },
  { id: 'crewchief', label: 'Crew Chief' },
  { id: 'crm',       label: 'Sponsor CRM' },
  { id: 'athlete',   label: 'Athlete' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'analyst',   label: 'Analyst' },
]

export default function MdCoPilot() {
  const [activeConsole, setActiveConsole] = useState<ConsoleId | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>('engine-hours')

  const visible = activeConsole === 'all'
    ? SIGNALS
    : SIGNALS.filter((s) => s.console === activeConsole || s.consoleLabel === 'Team Manager')

  return (
    <section
      id="copilot"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="MD Co-Pilot AI"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-0.5 w-6 bg-sky-400" aria-hidden="true" />
              <span className="font-mono text-[10px] text-sky-400 uppercase tracking-[0.25em]">
                MD Co-Pilot — Forward Intelligence
              </span>
            </div>
            <h2
              className="text-zinc-100 uppercase leading-none mb-4 text-balance"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(1.75rem, 5vw, 3.25rem)',
              }}
            >
              The co-pilot that{' '}
              <span className="text-sky-400">acts before you ask.</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              MD Intel watches your entire operation across all 14 modules. It surfaces the right signal to the right console before the problem becomes expensive, the deadline passes, or the opportunity closes.
            </p>
          </div>

          {/* Capability callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Bot,       label: 'Cross-module thinking', sub: 'Connects budget, schedule, machine health, and athlete data in one view' },
              { icon: Clock,     label: 'Proactive timing',      sub: 'Surfaces signals hours or days before the window closes — not after' },
              { icon: Users,     label: 'Console-specific',      sub: 'Each role sees only the signals relevant to their work — no noise' },
              { icon: ArrowRight,label: 'Always actionable',     sub: 'Every signal has a next step. Not a report — a trigger for a decision' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex gap-3 p-4 border border-zinc-800/60 bg-zinc-900/30">
                <Icon className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-zinc-200 text-sm font-semibold mb-1">{label}</p>
                  <p className="text-zinc-500 text-xs leading-snug">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Console filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CONSOLE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveConsole(tab.id)}
              className={[
                'font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors',
                activeConsole === tab.id
                  ? 'bg-sky-400/10 text-sky-400 border-sky-400/40'
                  : 'text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Signal feed */}
        <div className="flex flex-col gap-3" aria-live="polite">
          {visible.map((signal) => {
            const sc = SEVERITY_CONFIG[signal.severity]
            const isExpanded = expanded === signal.id
            return (
              <div
                key={signal.id}
                className={[
                  'border transition-all',
                  isExpanded ? `${sc.border} ${sc.bg}` : 'border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700',
                ].join(' ')}
              >
                {/* Signal row */}
                <button
                  className="w-full flex items-start gap-4 p-4 sm:p-5 text-left"
                  onClick={() => setExpanded(isExpanded ? null : signal.id)}
                  aria-expanded={isExpanded}
                >
                  {/* Severity dot */}
                  <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${sc.dot} ${signal.severity === 'alert' ? 'animate-pulse' : ''}`} aria-hidden="true" />
                  </div>

                  {/* Console icon */}
                  <div className="shrink-0 hidden sm:block">
                    <signal.consoleIcon className="h-4 w-4 text-zinc-600" aria-hidden="true" />
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                      <span className={`font-mono text-[9px] uppercase tracking-widest ${sc.text}`}>
                        {sc.label}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                        {signal.module}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
                        {signal.consoleLabel} console
                      </span>
                    </div>
                    <p className="text-zinc-200 text-sm font-semibold leading-snug">
                      {signal.message}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="shrink-0 text-right">
                    <span className="font-mono text-[10px] text-zinc-700">{signal.timeAgo}</span>
                  </div>
                </button>

                {/* Expanded context */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-zinc-800/40">
                    <div className="flex gap-4">
                      <div className="w-2 shrink-0" aria-hidden="true" />
                      <div className="hidden sm:block w-4 shrink-0" aria-hidden="true" />
                      <div className="flex-1">
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                          {signal.context}
                        </p>
                        <div className="flex items-center gap-3">
                          <button className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border ${sc.border} ${sc.text} hover:${sc.bg} transition-colors`}>
                            {signal.action}
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
                            Powered by MD Co-Pilot
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="mt-8 flex items-center gap-3 p-4 border border-sky-400/20 bg-sky-400/5">
          <Bot className="h-5 w-5 text-sky-400 shrink-0" aria-hidden="true" />
          <p className="text-zinc-400 text-sm leading-relaxed">
            <span className="text-sky-400 font-semibold">MD Co-Pilot Basic</span> is included on every plan.{' '}
            <span className="text-zinc-300">Full Co-Pilot</span> — cross-module insights, setup coaching, and pre-event briefs — unlocks at Privateer and above.
          </p>
        </div>
      </div>
    </section>
  )
}
