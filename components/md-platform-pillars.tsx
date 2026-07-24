'use client'

import { useState } from 'react'
import {
  FileText, DollarSign, TrendingUp, Users,
  Truck, Wrench, Bike, Shield,
  Radio, BarChart3, Heart, Compass,
  CalendarDays, PackageSearch,
} from 'lucide-react'

interface Pillar {
  id: string
  tag: string
  label: string
  headline: string
  blurb: string
  accent: string
  accentBg: string
  borderActive: string
  features: { icon: React.ElementType; title: string; body: string; highlight?: boolean }[]
}

const PILLARS: Pillar[] = [
  {
    id: 'money',
    tag: 'The Money',
    label: 'Deals + Finance',
    headline: 'Every dollar your program earns and spends. In one place.',
    blurb: 'Seat fees. Appearance contracts. Camp invoices. Rider pay. Full P&L. QuickBooks export. The financial engine that turns a racing dream into a traceable business.',
    accent: 'text-lime-400',
    accentBg: 'bg-lime-400/8',
    borderActive: 'border-lime-400/50',
    features: [
      {
        icon: FileText,
        title: 'Deals + Contracts',
        body: 'Create seat-fee agreements, appearance contracts, and camp invoices. Send via link. Collect via Square. Archive automatically.',
        highlight: true,
      },
      {
        icon: DollarSign,
        title: 'Accounting P&L',
        body: 'Full income vs. expense dashboard. Budget vs. actual. Category breakdown. CSV export. QuickBooks sync Q1 27.',
      },
      {
        icon: TrendingUp,
        title: 'Finance & Insurance',
        body: 'Season financing, bike and trailer insurance policies, coverage tracker, and expiry alerts — all in one panel.',
      },
      {
        icon: Users,
        title: 'Sponsor CRM',
        body: 'Pipeline stages, brand outreach log, deal values, ROI reporting, and payment schedule tracking for every sponsor relationship.',
      },
    ],
  },
  {
    id: 'operations',
    tag: 'The Operation',
    label: 'Logistics + Service',
    headline: 'The machine moves. So does everything around it.',
    blurb: 'The semi driver, the mechanic, the parts supplier — every moving piece of your operation lives in one system. Real DOT compliance. Real work orders. Real inventory.',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-400/5',
    borderActive: 'border-amber-400/50',
    features: [
      {
        icon: Truck,
        title: 'Rig Doctor AI + Logistics',
        body: 'Class 8 diesel guidance. DPF regens, DEF levels, DOT pre-trip checklists, PM scheduler, haul calendar, and fuel-stop routing for all 17 rounds.',
        highlight: true,
      },
      {
        icon: Wrench,
        title: 'Service Desk',
        body: 'Multi-bike work orders with live labor timer, suspension before/after sheets, part pulls from the vault, and a mechanic performance record the team owns.',
      },
      {
        icon: Bike,
        title: 'Fleet + Part Vault',
        body: 'Every bike profiled — engine hours, rebuild history, replacement cycles, stock alerts. From the PW50 to the factory 450.',
      },
      {
        icon: Shield,
        title: 'Warranty Tracker',
        body: 'Bike, frame, engine, gear, and helmet warranties logged. Claim filing, expiry alerts, and service history tied to every VIN.',
      },
    ],
  },
  {
    id: 'performance',
    tag: 'The Edge',
    label: 'AI + Race Intelligence',
    headline: 'Your data works harder than the competition.',
    blurb: 'Setup coaching during qualifying. Video analysis tied to lap data. Season setup trends across tracks. The platform learns your program every round and tells you what to do next.',
    accent: 'text-sky-400',
    accentBg: 'bg-sky-400/5',
    borderActive: 'border-sky-400/40',
    features: [
      {
        icon: Radio,
        title: 'Crew Chief AI',
        body: 'Live setup recommendations during practice and qualifying. Reads your full season dataset — every clicker, every PSI, every result. Answers in under 30 seconds.',
        highlight: true,
      },
      {
        icon: Compass,
        title: 'MD Intel AI',
        body: 'Ask anything. "What was my spring Pala setup last year?" "Which track suits my suspension the best?" AI pulls from your actual data, not a template.',
      },
      {
        icon: BarChart3,
        title: 'Reports + Analytics',
        body: 'Revenue, expenses, lap progression, sponsor ROI, rider readiness, season recap — all auto-generated after every round.',
      },
      {
        icon: PackageSearch,
        title: 'Setup Sheet Library',
        body: 'Every session logged. Clickers, mapping, PSI, sag, gearing, and rider feedback — a searchable history across every track your program has ever run.',
      },
    ],
  },
  {
    id: 'athlete',
    tag: 'The Athlete',
    label: 'Rider + Readiness',
    headline: 'Race-day performance starts 6 days before the gate drops.',
    blurb: 'Physical readiness, mental tracking, injury protocols, nutrition — all connected to the race result data. Know whether your rider peaks at the right moment.',
    accent: 'text-rose-400',
    accentBg: 'bg-rose-400/5',
    borderActive: 'border-rose-400/40',
    features: [
      {
        icon: Heart,
        title: 'Rider Readiness Score',
        body: 'HRV, sleep quality, training load, hydration, and nutrition tracked daily. Auto-generates a race-day readiness score every Saturday night.',
        highlight: true,
      },
      {
        icon: CalendarDays,
        title: 'Injury + RTR Protocol',
        body: 'Concussion-aware injury log with a staged return-to-ride protocol. Every incident documented, every clearance recorded.',
      },
      {
        icon: TrendingUp,
        title: 'Progression Timeline',
        body: 'Every first ride, first jump, first podium, and career milestone — the full rider story saved forever and surfaced to agents in 2028.',
      },
      {
        icon: Users,
        title: 'Multi-Rider Management',
        body: 'Race Team and above: manage every rider on the program from one command view. Readiness, results, and schedule side by side.',
      },
    ],
  },
  {
    id: 'calendar',
    tag: 'The Season',
    label: 'Schedule + Results',
    headline: 'Seventeen rounds. One system. Zero missed deadlines.',
    blurb: 'The full season calendar — entry fees, gate times, hotel blocks, load-out sequences — synced to the team schedule, the haul calendar, and the race result feed.',
    accent: 'text-violet-400',
    accentBg: 'bg-violet-400/5',
    borderActive: 'border-violet-400/40',
    features: [
      {
        icon: CalendarDays,
        title: 'Race Calendar',
        body: 'Full SMX and AMA Pro MX schedule with live weather pull per venue, entry deadlines, gate times, and result logging after every moto.',
        highlight: true,
      },
      {
        icon: BarChart3,
        title: 'Championship Standings',
        body: 'Points tracker updated after every round. Scenario modeling — what does your rider need in the next 3 rounds to take the title?',
      },
      {
        icon: Truck,
        title: 'Haul Calendar Sync',
        body: 'Race schedule auto-populates the hauler calendar. Departure times, fuel stops, load sequences, and gate-time targets for every venue.',
      },
      {
        icon: DollarSign,
        title: 'Season Budget vs. Actual',
        body: 'Entry fees, travel, hotels, fuel, parts — every line item tracked against budget. Know your cost-per-round before you leave for the next one.',
      },
    ],
  },
]

export default function MdPlatformPillars() {
  const [active, setActive] = useState(PILLARS[0].id)
  const pillar = PILLARS.find((p) => p.id === active) ?? PILLARS[0]

  return (
    <section
      id="platform"
      className="bg-zinc-900/30 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="Platform capabilities"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-lime-400" aria-hidden="true" />
            <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">Platform depth</p>
          </div>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
            }}
          >
            Built for every part of the business.{' '}
            <span className="text-lime-400">Not just the bike.</span>
          </h2>
        </div>

        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Platform pillars">
          {PILLARS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={active === p.id}
              aria-controls={`panel-${p.id}`}
              onClick={() => setActive(p.id)}
              className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 border transition-all duration-150 ${
                active === p.id
                  ? `${p.borderActive} ${p.accent} ${p.accentBg}`
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 bg-transparent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Active pillar panel */}
        <div
          id={`panel-${pillar.id}`}
          role="tabpanel"
          aria-label={pillar.label}
          className={`border ${pillar.borderActive} ${pillar.accentBg} p-0 sm:p-0`}
        >
          {/* Pillar header */}
          <div className="border-b border-zinc-800/60 px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className={`font-mono text-[10px] uppercase tracking-[0.3em] mb-2 ${pillar.accent}`}>
                  {pillar.tag}
                </p>
                <h3
                  className="text-zinc-100 leading-tight text-balance"
                  style={{
                    fontFamily: 'var(--font-barlow-condensed)',
                    fontWeight: 800,
                    fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
                  }}
                >
                  {pillar.headline}
                </h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm text-pretty shrink-0">
                {pillar.blurb}
              </p>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {pillar.features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className={`p-6 sm:p-7 flex flex-col gap-4 ${
                    i < pillar.features.length - 1
                      ? 'border-b sm:border-b-0 sm:border-r border-zinc-800/60 last:border-0'
                      : ''
                  }`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center border ${
                    f.highlight ? `${pillar.borderActive} ${pillar.accentBg}` : 'border-zinc-800 bg-zinc-950/40'
                  }`}>
                    <Icon className={`h-5 w-5 ${f.highlight ? pillar.accent : 'text-zinc-400'}`} aria-hidden="true" />
                  </div>
                  <div>
                    <p
                      className={`mb-2 leading-tight ${f.highlight ? pillar.accent : 'text-zinc-100'}`}
                      style={{
                        fontFamily: 'var(--font-barlow-condensed)',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                      }}
                    >
                      {f.title}
                    </p>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      {f.body}
                    </p>
                  </div>
                  {f.highlight && (
                    <span className={`self-start font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border ${pillar.borderActive} ${pillar.accent}`}>
                      Core Module
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800/60">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            Every module available on Race Team and above — see all tiers below
          </p>
          <a
            href="#pricing"
            className="font-mono text-xs text-lime-400 uppercase tracking-widest hover:text-lime-300 transition-colors border border-lime-400/30 px-4 py-2 hover:border-lime-400/50"
          >
            Compare tiers &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
