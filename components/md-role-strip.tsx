'use client'

import { useState } from 'react'
import { Truck, Wrench, Radio, BarChart3, Users, TrendingUp } from 'lucide-react'

const ROLES = [
  {
    id: 'hauler',
    icon: Truck,
    title: 'Hauler Driver',
    accent: 'text-amber-400',
    accentBorder: 'border-amber-400',
    accentBg: 'bg-amber-400/8',
    accentDot: 'bg-amber-400',
    tagline: 'The most invisible person on the team.',
    value: 'Rig Doctor AI handles pre-trip, DOT compliance, PM schedules, and DEF alerts across 17 rounds. You move $2M of equipment. Now you have a console that respects that.',
    console: 'Rig Doctor AI',
    stat: '17 rounds',
    statLabel: 'pre-trip coverage',
  },
  {
    id: 'mechanic',
    icon: Wrench,
    title: 'Mechanic',
    accent: 'text-sky-400',
    accentBorder: 'border-sky-400',
    accentBg: 'bg-sky-400/8',
    accentDot: 'bg-sky-400',
    tagline: 'Your knowledge walks out the door with you.',
    value: 'Work Order Queue with live labor timer, setup deltas, and before/after suspension sheets. Career Portfolio that travels with you to the next team. Your work, forever yours.',
    console: 'Wrench Console',
    stat: '100%',
    statLabel: 'portable career record',
  },
  {
    id: 'crew-chief',
    icon: Radio,
    title: 'Crew Chief',
    accent: 'text-lime-400',
    accentBorder: 'border-lime-400',
    accentBg: 'bg-lime-400/8',
    accentDot: 'bg-lime-400',
    tagline: 'You make 30 calls a weekend with no data.',
    value: 'Live AI during practice and qualifying. Ask anything — "what clicker setting ran fastest on hard-pack last season?" — and get an answer from your actual race data, not a guess.',
    console: 'Race Weekend AI',
    stat: '<30s',
    statLabel: 'to a data-backed call',
  },
  {
    id: 'team-manager',
    icon: Users,
    title: 'Team Manager',
    accent: 'text-violet-400',
    accentBorder: 'border-violet-400',
    accentBg: 'bg-violet-400/8',
    accentDot: 'bg-violet-400',
    tagline: 'One screen before you call the sponsor.',
    value: 'Command Dashboard: 6 riders, points standings, season spend tracker, sponsor ROI in a single view. Know where your program stands before any call, any meeting, any decision.',
    console: 'Command Dashboard',
    stat: '1 screen',
    statLabel: 'entire program at a glance',
  },
  {
    id: 'analyst',
    icon: BarChart3,
    title: 'Data Analyst',
    accent: 'text-cyan-400',
    accentBorder: 'border-cyan-400',
    accentBg: 'bg-cyan-400/8',
    accentDot: 'bg-cyan-400',
    tagline: 'This would take a day in Excel.',
    value: 'Lap correlation queries, setup delta trending, cross-rider comparison, and championship projection modeling. All in seconds. All from your race data, not a template.',
    console: 'Analyst Console',
    stat: '17 rounds',
    statLabel: 'of queryable season data',
  },
  {
    id: 'rider',
    icon: TrendingUp,
    title: 'Rider',
    accent: 'text-rose-400',
    accentBorder: 'border-rose-400',
    accentBg: 'bg-rose-400/8',
    accentDot: 'bg-rose-400',
    tagline: 'Everyone watches them. This platform watches for them.',
    value: 'Readiness score, lap feedback, personal setup history, and progression timeline. Rider data is team-visible in Command programs — crew chief sees the full picture before the gate drops.',
    console: 'Rider Module',
    stat: 'Team-visible',
    statLabel: 'in Command + Factory',
  },
]

export default function MdRoleStrip() {
  const [activeRole, setActiveRole] = useState<string>('hauler')
  const active = ROLES.find((r) => r.id === activeRole)!
  const ActiveIcon = active.icon

  return (
    <section
      id="roles"
      className="bg-zinc-950 border-y border-zinc-800/60 py-20 md:py-28"
      aria-label="Team roles"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-lime-400" aria-hidden="true" />
            <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">
              // racing-management-system
            </p>
          </div>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            }}
          >
            Every role that makes the race happen{' '}
            <span className="text-lime-400">has a console.</span>
          </h2>
          <p className="text-zinc-500 text-base mt-3 max-w-2xl leading-relaxed">
            This is not a telemetry tool. It is a racing management system — built for every person on the team who never gets the helmet cam but makes every result possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          {/* Role selector grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROLES.map((role) => {
              const Icon = role.icon
              const isActive = role.id === activeRole
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  aria-pressed={isActive}
                  className={`group relative flex flex-col gap-3 p-5 border text-left transition-all ${
                    isActive
                      ? `${role.accentBorder} ${role.accentBg}`
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  {/* Active top bar */}
                  {isActive && (
                    <span className={`absolute top-0 left-0 right-0 h-0.5 ${role.accentDot}`} aria-hidden="true" />
                  )}
                  <div
                    className={`w-9 h-9 flex items-center justify-center border transition-colors ${
                      isActive ? `${role.accentBorder} ${role.accentBg}` : 'border-zinc-800'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-colors ${isActive ? role.accent : 'text-zinc-600'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p
                      className={`uppercase leading-none text-base transition-colors ${
                        isActive ? 'text-zinc-100' : 'text-zinc-500'
                      }`}
                      style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800 }}
                    >
                      {role.title}
                    </p>
                    <p className={`font-mono text-[9px] uppercase tracking-widest mt-0.5 transition-colors ${
                      isActive ? role.accent : 'text-zinc-700'
                    }`}>
                      {role.console}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active role detail card */}
          <div
            key={active.id}
            className={`relative flex flex-col gap-6 p-8 border ${active.accentBorder} ${active.accentBg}`}
            style={{ animation: 'mdFadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            {/* Top bar */}
            <span className={`absolute top-0 left-0 right-0 h-0.5 ${active.accentDot}`} aria-hidden="true" />

            {/* Role header */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 flex items-center justify-center border ${active.accentBorder} ${active.accentBg} shrink-0`}>
                <ActiveIcon className={`h-6 w-6 ${active.accent}`} aria-hidden="true" />
              </div>
              <div>
                <p
                  className="text-zinc-100 uppercase leading-none"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.6rem' }}
                >
                  {active.title}
                </p>
                <p className={`font-mono text-[10px] uppercase tracking-widest mt-0.5 ${active.accent}`}>
                  {active.console}
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-zinc-400 text-sm italic leading-relaxed border-l-2 border-zinc-700 pl-4">
              &ldquo;{active.tagline}&rdquo;
            </p>

            {/* Value prop */}
            <p className="text-zinc-300 text-sm leading-relaxed flex-1">
              {active.value}
            </p>

            {/* Stat */}
            <div className={`flex items-center gap-3 pt-4 border-t border-zinc-800`}>
              <div>
                <p
                  className={`${active.accent} leading-none`}
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '2rem' }}
                >
                  {active.stat}
                </p>
                <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5">
                  {active.statLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom anchor */}
        <div className="mt-10 flex items-center gap-4">
          <span className="h-px flex-1 bg-zinc-800" aria-hidden="true" />
          <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-[0.25em]">
            One platform · Every role · 17 rounds
          </p>
          <span className="h-px flex-1 bg-zinc-800" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
