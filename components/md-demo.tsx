'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Bike, Wrench, Flag, Trophy, Star,
  ClipboardList, Cloud, Compass, Video,
  TrendingUp, Sparkles, Play, Pause,
  Users, DollarSign, Truck, Zap, ShieldCheck,
  HeartPulse, Brain, Dumbbell, Activity,
  CheckCircle2, Circle,
  CalendarDays, MapPin, Fuel, AlertTriangle,
  Share2, Heart, Camera, Timer,
  BarChart3, FileText, Search,
} from 'lucide-react'

/* ── Tier definitions ── */
const TIERS = [
  {
    id: 'rookie',
    label: 'Free Rider',
    price: 'FREE',
    note: 'Any Rider · Any Bike',
    accent: 'text-lime-400',
    accentBg: 'bg-lime-400/10',
    accentBorder: 'border-lime-400',
    accentBar: 'bg-lime-400',
    accentDot: 'bg-lime-400',
    description: 'Track the bike, log every ride, save the story from day one.',
    href: '/rookie',
  },
  {
    id: 'privateer',
    label: 'The Privateer',
    price: '$79/mo',
    note: 'Solo Riders',
    accent: 'text-orange-400',
    accentBg: 'bg-orange-400/10',
    accentBorder: 'border-orange-400',
    accentBar: 'bg-orange-400',
    accentDot: 'bg-orange-400',
    description: 'Full telemetry, setup logs, AI coaching, fitness tracking, data export.',
    href: '/privateer',
  },
  {
    id: 'wrench',
    label: 'The Wrench',
    price: '$29/mo',
    note: 'Professional Mechanics',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-400/10',
    accentBorder: 'border-cyan-400',
    accentBar: 'bg-cyan-400',
    accentDot: 'bg-cyan-400',
    description: 'Career portfolio, setup optimization tracking, work order history, audit logs.',
    href: '/data/plans/wrench',
  },
  {
    id: 'race_team',
    label: 'Race Team',
    price: '$599/mo',
    note: 'Regional Teams',
    accent: 'text-purple-400',
    accentBg: 'bg-purple-400/10',
    accentBorder: 'border-purple-400',
    accentBar: 'bg-purple-400',
    accentDot: 'bg-purple-400',
    description: 'Multi-rider management, team analytics, coach assignments, fleet telemetry.',
    popular: true as const,
    href: '/race_team',
  },
  {
    id: 'factory_rig',
    label: 'Factory Rig',
    price: '$15,000/mo',
    note: 'Factory Operations',
    accent: 'text-red-400',
    accentBg: 'bg-red-400/10',
    accentBorder: 'border-red-400',
    accentBar: 'bg-red-400',
    accentDot: 'bg-red-400',
    description: 'Unlimited fleet, R&D analytics, custom integrations, dedicated support.',
    href: '/factory_rig',
  },
  {
    id: 'agent',
    label: 'Agent',
    price: '$999/mo',
    note: 'Contract Negotiation',
    accent: 'text-lime-400',
    accentBg: 'bg-lime-400/10',
    accentBorder: 'border-lime-400',
    accentBar: 'bg-lime-400',
    accentDot: 'bg-lime-400',
    description: 'Percentile ranking, salary benchmarking, prospect scouting, export reports.',
    href: '/agent',
  },
  {
    id: 'coach',
    label: 'Coach',
    price: '$249/mo',
    note: 'Training Coaches',
    accent: 'text-lime-400',
    accentBg: 'bg-lime-400/10',
    accentBorder: 'border-lime-400',
    accentBar: 'bg-lime-400',
    accentDot: 'bg-lime-400',
    description: 'Cross-team coaching access, video analysis, AI recommendations for your riders.',
    href: '/coach',
  },
] as const

type TierId = typeof TIERS[number]['id']

/* ── Per-tier scene timing (ms) ── */
const TIER_SCENE_DURATION: Record<TierId, number> = {
  rookie: 24000,      // 4 acts × 6s each
  wrench: 24000,      // 4 acts × 6s each
  privateer: 30000,   // 5 acts × 6s each
  race_team: 30000,   // 5 acts × 6s each
  factory_rig: 30000, // 5 acts × 6s each
  agent: 30000,       // 5 acts × 6s each
  coach: 24000,       // 4 acts × 6s each
}

/* ── Act label: which named act is playing given progress 0→1 ── */
function getAct(progress: number, acts: number): number {
  return Math.min(Math.floor(progress * acts), acts - 1)
}

export default function MdDemo() {
  const [activeTier, setActiveTier] = useState<TierId>('race_team')
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(true)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  const tier = TIERS.find((t) => t.id === activeTier)!

  const goToTier = useCallback((id: TierId) => {
    setActiveTier(id)
    setProgress(0)
    startRef.current = null
  }, [])

  useEffect(() => {
    if (!playing) return
    const duration = TIER_SCENE_DURATION[activeTier]
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      if (p >= 1) {
        // Cancel this RAF loop before triggering state changes — prevents stale closure crash
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        startRef.current = null
        const idx = TIERS.findIndex((t) => t.id === activeTier)
        const next = TIERS[(idx + 1) % TIERS.length]
        setActiveTier(next.id)
        setProgress(0)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [activeTier, playing])

  /* Which act label to show */
  const ACT_LABELS: Record<TierId, string[]> = {
    rookie: ['Your Bike', 'Ride Log', 'Progression', 'Share Story'],
    privateer: ['Track Conditions', 'Setup Sheet', 'Part Vault', 'MD Intel AI', 'Fitness Log'],
    race_team: ['Rider Roster', 'Race Coach AI', 'Schedule & Sponsors', 'Video Analysis', 'Team Analytics'],
    factory_rig: ['Fleet Health', 'Rig Doctor AI', 'Pre-Trip Checklist', 'Haul Schedule', 'Admin Console'],
    wrench: ['Career Portfolio', 'Setup Deltas', 'Client History', 'Audit Trail'],
    agent: ['Rider Percentiles', 'Salary Comps', 'Prospect Search', 'Export Report'],
    coach: ['My Riders', 'Session Analysis', 'Video Coaching', 'Performance Insights'],
  }
  const actCount = ACT_LABELS[activeTier].length
  const currentAct = getAct(progress, actCount)
  const actProgress = (progress * actCount) - currentAct // 0→1 within current act

  return (
    <section id="demo" className="bg-zinc-950 py-24 md:py-32 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,230,53,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.018) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            &#47;&#47; pick-your-stage
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            Every Stage of the Journey.{' '}
            <span className="text-lime-400">One Platform.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Start free forever. Track your bike, your rides, your story. Grow into AI coaching, multi-bike management, and full team operations as you're ready.
          </p>
        </div>

        {/* Tier selector tabs — responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-8">
          {TIERS.map((t) => {
            const isActive = t.id === activeTier
            return (
              <div key={t.id} className="relative">
                <button
                  onClick={() => goToTier(t.id)}
                  className={`relative w-full flex flex-col gap-1 p-3 sm:p-4 border text-left transition-all text-sm sm:text-base ${
                    isActive
                      ? `${t.accentBorder} ${t.accentBg}`
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  {'popular' in t && t.popular && (
                    <span className="absolute -top-px left-0 right-0 h-px bg-amber-400" />
                  )}
                  <span
                    className={`uppercase leading-none text-lg ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`}
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
                  >
                    {t.label}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-wider">{t.note}</span>

                  {/* View Program link — visible on active tab */}
                  {isActive && (
                    <Link
                      href={t.href}
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-2 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest font-bold ${t.accent} hover:opacity-70 transition-opacity`}
                    >
                      View Program
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  )}

                  {/* Subtle arrow on inactive tabs */}
                  {!isActive && (
                    <svg className="absolute bottom-2 right-2 h-3 w-3 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  )}

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800 overflow-hidden">
                      <span
                        className={`block h-full transition-none ${t.accentBar}`}
                        style={{ width: `${progress * 100}%` }}
                      />
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Description + controls */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className={`font-mono text-xs uppercase tracking-widest ${tier.accent}`}>
              {tier.description}
            </p>
            {/* Progress indicator dots */}
            <div className="flex items-center gap-1">
              {ACT_LABELS[activeTier].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i === currentAct
                      ? `${tier.accentBg} ${tier.accentDot} scale-125`
                      : i < currentAct
                        ? 'bg-zinc-700'
                        : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="flex items-center gap-1.5 h-7 px-3 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors font-mono text-[10px] uppercase tracking-widest"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>

        {/* Browser frame */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/70 overflow-hidden">
          <div className="flex items-center gap-3 px-4 h-11 border-b border-zinc-800 bg-zinc-950/80">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 h-6 px-3 rounded-md bg-zinc-900 border border-zinc-800 min-w-[240px] max-w-xs">
                <span className={`h-2 w-2 rounded-full ${tier.accentDot}`} />
                <span className="font-mono text-[11px] text-zinc-500 truncate">
                  motorsportsdata.io/data · {ACT_LABELS[activeTier][currentAct]}
                </span>
              </div>
            </div>
            <div className={`h-5 px-2 border font-mono text-[9px] uppercase tracking-widest flex items-center ${tier.accentBorder} ${tier.accent}`}>
              Live
            </div>
          </div>

          {/* Stage */}
          <div className="relative bg-zinc-950" style={{ minHeight: 'clamp(320px, 50vh, 520px)' }}>
            <div className="absolute inset-0 flex">
              {/* Sidebar */}
              <aside className="hidden sm:flex w-14 md:w-44 shrink-0 flex-col gap-0.5 border-r border-zinc-800 bg-zinc-900/50 p-2 md:p-3">
                <div className="flex items-center gap-2 px-1 pb-3 mb-1 border-b border-zinc-800">
                  <div className="h-7 w-7 bg-lime-400 flex items-center justify-center shrink-0">
                    <span className="text-zinc-950 font-black text-xs">MD</span>
                  </div>
                  <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-zinc-500 truncate">
                    {tier.label}
                  </span>
                </div>
                <NavItems tierId={activeTier} tierAccent={tier.accent} tierAccentBg={tier.accentBg} currentAct={currentAct} />
              </aside>

              {/* Content pane */}
              <div key={`${activeTier}-${currentAct}`} className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 h-10 px-4 border-b border-zinc-800 bg-zinc-900/40 shrink-0">
                  <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border ${tier.accentBorder} ${tier.accentBg} ${tier.accent}`}>
                    {tier.label}
                  </span>
                  <span
                    className="text-zinc-200 text-sm uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800 }}
                  >
                    {ACT_LABELS[activeTier][currentAct]}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    {/* Act step dots */}
                    {ACT_LABELS[activeTier].map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          i === currentAct ? tier.accentBar : i < currentAct ? 'bg-zinc-600' : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0 p-4 md:p-6 overflow-hidden">
                  {activeTier === 'rookie' && (
                    <SceneRookie act={currentAct} actProgress={actProgress} />
                  )}
                  {activeTier === 'privateer' && (
                    <ScenePrivateer act={currentAct} actProgress={actProgress} />
                  )}
                  {activeTier === 'race_team' && (
                    <SceneRaceTeam act={currentAct} actProgress={actProgress} />
                  )}
                  {activeTier === 'factory_rig' && (
                    <SceneFactoryRig act={currentAct} actProgress={actProgress} />
                  )}
                  {activeTier === 'wrench' && (
                    <SceneWrench act={currentAct} actProgress={actProgress} />
                  )}
                  {activeTier === 'agent' && (
                    <SceneAgent act={currentAct} actProgress={actProgress} />
                  )}
                  {activeTier === 'coach' && (
                    <SceneCoach act={currentAct} actProgress={actProgress} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center font-mono text-[11px] text-zinc-600 uppercase tracking-widest mt-5">
          Auto-cycles through all tiers · click any tab to explore · {ACT_LABELS[activeTier].length} acts per tier
        </p>
      </div>

      <style>{`
        @keyframes mdRise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes mdFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes mdBarGrow { from { width:0 !important; } }
        @keyframes mdBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes mdSlideRight { from { transform:translateX(-8px); opacity:0; } to { transform:none; opacity:1; } }
        @keyframes mdPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </section>
  )
}

/* ── Sidebar nav items per tier — active item follows the current act ── */
function NavItems({ tierId, tierAccent, tierAccentBg, currentAct }: {
  tierId: TierId; tierAccent: string; tierAccentBg: string; currentAct: number
}) {
  const navMap: Record<TierId, { icon: React.ElementType; label: string }[]> = {
    rookie: [
      { icon: Bike, label: 'Your Bike' },
      { icon: ClipboardList, label: 'Ride Log' },
      { icon: TrendingUp, label: 'Progression' },
      { icon: Share2, label: 'Share' },
    ],
    privateer: [
      { icon: Cloud, label: 'Conditions' },
      { icon: ClipboardList, label: 'Setup Sheet' },
      { icon: Wrench, label: 'Part Vault' },
      { icon: Sparkles, label: 'MD Intel' },
      { icon: HeartPulse, label: 'Fitness' },
    ],
    race_team: [
      { icon: Users, label: 'Roster' },
      { icon: Compass, label: 'Race Coach AI' },
      { icon: CalendarDays, label: 'Schedule' },
      { icon: Video, label: 'Video' },
      { icon: TrendingUp, label: 'Analytics' },
    ],
    factory_rig: [
      { icon: Bike, label: 'Fleet' },
      { icon: Truck, label: 'Rig Doctor' },
      { icon: CheckCircle2, label: 'Pre-Trip' },
      { icon: MapPin, label: 'Schedule' },
      { icon: Sparkles, label: 'Admin' },
    ],
    wrench: [
      { icon: Wrench, label: 'Portfolio' },
      { icon: Zap, label: 'Deltas' },
      { icon: ClipboardList, label: 'Work Orders' },
      { icon: ShieldCheck, label: 'Audit' },
    ],
    agent: [
      { icon: Users, label: 'Riders' },
      { icon: DollarSign, label: 'Comps' },
      { icon: Compass, label: 'Prospects' },
      { icon: Share2, label: 'Export' },
    ],
    coach: [
      { icon: Users, label: 'My Riders' },
      { icon: Video, label: 'Sessions' },
      { icon: Brain, label: 'Coaching' },
      { icon: TrendingUp, label: 'Performance' },
    ],
  }
  const items = navMap[tierId]
  return (
    <>
      {items.map((item, i) => {
        const Icon = item.icon
        const isActive = i === currentAct
        return (
          <div
            key={item.label}
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-300 ${
              isActive ? `${tierAccentBg} ${tierAccent}` : i < currentAct ? 'text-zinc-500' : 'text-zinc-700'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:block text-xs font-semibold truncate">{item.label}</span>
            {isActive && <span className={`ml-auto h-1.5 w-1.5 rounded-full ${tierAccentBg.replace('/10', '')} hidden md:block`} style={{ animation: 'mdPulse 1.5s ease-in-out infinite' }} />}
          </div>
        )
      })}
    </>
  )
}

/* ════════════════════════════════════════════════════
   SCENE: COACH — 4 acts (Premium Tier for Aldon Baker)
   Act 0: My Riders roster with stats
   Act 1: Session Analysis with performance delta
   Act 2: Video Coaching with telemetry overlay
   Act 3: Performance Insights & AI Recommendations
════════════════════════════════════════════════════ */

function SceneCoach({ act, actProgress: p }: { act: number; actProgress: number }) {
  const safeP = Math.min(p, 1)
  if (act === 0) {
    const show1 = safeP > 0.1, show2 = safeP > 0.4
    const riders = [
      { name: 'Tyler Marsh', number: '#17', age: 16, pb: '1:34.2', trend: '+0.8s', status: 'trending' },
      { name: 'Cody Rios', number: '#44', age: 17, pb: '1:31.6', trend: '-1.2s', status: 'improving' },
      { name: 'Danny Kosel', number: '#7', age: 15, pb: '1:36.8', trend: '+2.1s', status: 'recovery' },
    ]
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${show1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-lime-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">My Riders · Cross-Team Roster</p>
          </div>
          {riders.map((r) => (
            <div key={r.number} className="border border-zinc-800 bg-zinc-900/40 rounded-lg overflow-hidden mb-3">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <p className="text-zinc-100 text-sm font-bold">{r.name} {r.number} • {r.age}yo</p>
                  <p className="font-mono text-xs text-zinc-500 mt-2">PB: {r.pb} · Session: {r.trend}</p>
                </div>
                <div className={`text-right px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest ${r.status === 'improving' ? 'bg-lime-400/10 text-lime-400' : r.status === 'trending' ? 'bg-amber-400/10 text-amber-400' : 'bg-zinc-700/30 text-zinc-500'}`}>
                  {r.status}
                </div>
              </div>
            </div>
          ))}
        </div>
        {show2 && (
          <div className="border border-lime-400/20 bg-lime-400/5 rounded-lg p-4" style={{ animation: 'mdRise 0.4s ease-out both' }}>
            <p className="font-mono text-xs text-lime-400 uppercase tracking-widest mb-2">Live Coaching</p>
            <p className="text-zinc-300 text-sm">3 riders tracked · 12 sessions this week · All improving toward Regional Championship</p>
          </div>
        )}
      </div>
    )
  }
  if (act === 1) {
    const show1 = safeP > 0.1, show2 = safeP > 0.5
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${show1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Session Analysis · Unadilla 2024</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Lap Delta', value: '-0.84s', change: 'improvement', detail: 'vs. Practice Run 1' },
              { label: 'Speed (Avg)', value: '58.3 mph', change: 'same', detail: 'consistent pace' },
              { label: 'G-Force (Peak)', value: '1.7g', change: 'increase', detail: 'aggressive cornering' },
              { label: 'Throttle Ctrl', value: '94%', change: 'improvement', detail: 'smooth transitions' },
            ].map((m) => (
              <div key={m.label} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3">
                <p className={`text-sm font-bold ${m.change === 'improvement' ? 'text-lime-400' : m.change === 'increase' ? 'text-amber-400' : 'text-zinc-400'}`}>{m.value}</p>
                <p className="font-mono text-xs text-zinc-600 mt-1">{m.label}</p>
                <p className="font-mono text-xs text-zinc-700 mt-1">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
        {show2 && (
          <div className="border border-lime-400/20 bg-lime-400/5 rounded-lg p-4" style={{ animation: 'mdRise 0.4s ease-out both' }}>
            <p className="text-zinc-300 text-sm"><span className="font-bold text-lime-400">AI Coaching:</span> Tyler&apos;s line through Turn 3 is textbook. Share with Cody as reference.</p>
          </div>
        )}
      </div>
    )
  }
  if (act === 2) {
    const show1 = safeP > 0.1, show2 = safeP > 0.6
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${show1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-purple-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Video Analysis · Telemetry Overlay</p>
          </div>
          <div className="border border-purple-400/20 bg-purple-400/5 rounded-lg p-4">
            <div className="flex items-end gap-3 mb-3">
              <div className="flex-1 h-20 bg-zinc-900/60 rounded flex items-end gap-1 p-2">
                {[35, 48, 62, 71, 68, 55, 42, 38].map((h, i) => (
                  <div key={i} className="flex-1 bg-lime-400/40 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="text-right">
                <p className="text-lime-400 text-sm font-bold">G-Force</p>
                <p className="font-mono text-xs text-zinc-600">Braking Zone</p>
              </div>
            </div>
            <p className="font-mono text-sm text-zinc-400 leading-relaxed">Throttle control smooth through rhythm section. Body position holding. Reference quality footage for team playbook.</p>
          </div>
        </div>
        {show2 && (
          <div className="border border-lime-400/20 bg-lime-400/5 rounded-lg p-4" style={{ animation: 'mdRise 0.4s ease-out both' }}>
            <p className="text-zinc-300 text-sm"><strong>Coach Note:</strong> Save this for pre-race review with your team.</p>
          </div>
        )}
      </div>
    )
  }
  // Act 3
  return (
    <div className="h-full flex flex-col gap-5">
      <div className={`transition-all duration-500 ${safeP > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-lime-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">AI Insights · Championship Prep</p>
        </div>
        <div className="space-y-3">
          {[
            { title: 'Tyler Gap Analysis', desc: 'Closing the gap on Cody at the rhythm section. Add 100rpm on exit.' },
            { title: 'Danny Recovery Plan', desc: 'Fatigue noted in moto 2. Increase conditioning, focus on elbow position.' },
            { title: 'Team Strategy', desc: 'Your 3-rider roster complements each other. All trending toward Regional podiums.' },
          ].map((i) => (
            <div key={i.title} className="border border-lime-400/20 bg-lime-400/5 rounded-lg p-3">
              <p className="text-zinc-300 text-sm font-bold">{i.title}</p>
              <p className="text-zinc-400 text-sm mt-2">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE: WRENCH — 4 acts (Professional Mechanics)
   Act 0: Setup Deltas between riders
   Act 1: Parts inventory & supplier links
   Act 2: Work orders & job queue
   Act 3: Audit trail & client history
════════════════════════════════════════════════════ */

function SceneWrench({ act, actProgress: p }: { act: number; actProgress: number }) {
  if (act === 0) {
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${p > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amber-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Setup Deltas · Bike Comparison</p>
          </div>
          {[
            { param: 'Front Compression', ty: '12 clicks', co: '10 clicks', delta: 'Tyler: +2' },
            { param: 'Rear Rebound', ty: '8 clicks', co: '9 clicks', delta: 'Cody: +1' },
            { param: 'Ride Height', ty: '98mm', co: '96mm', delta: 'Tyler: +2mm' },
            { param: 'Tire Pressure (F)', ty: '12.2 psi', co: '11.8 psi', delta: 'Tyler: +0.4' },
          ].map((s) => (
            <div key={s.param} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-zinc-500 font-mono uppercase tracking-widest text-xs">{s.param}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-200 font-bold">Tyler: {s.ty}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-200 font-bold">Cody: {s.co}</span>
              </div>
              <div className="text-right text-amber-400 font-mono font-bold text-sm">{s.delta}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (act === 1) {
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${p > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="h-5 w-5 text-orange-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Parts Inventory</p>
          </div>
          <div className="space-y-3">
            {[
              { part: 'Fox Shock (36mm)', qty: 2, supplier: 'Bremtec', status: 'in stock' },
              { part: 'Domino Grips Red', qty: 4, supplier: 'Rockstar', status: 'in stock' },
              { part: 'Renthal Bars', qty: 6, supplier: 'Bremtec', status: 'order pending' },
              { part: 'Dunlop Tires MX', qty: 12, supplier: 'OEM Direct', status: 'arriving 3/18' },
            ].map((it) => (
              <div key={it.part} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-200 text-sm font-bold">{it.part}</p>
                    <p className="font-mono text-xs text-zinc-500 mt-1">{it.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lime-400 text-sm font-bold">×{it.qty}</p>
                    <p className={`font-mono text-xs ${it.status === 'in stock' ? 'text-lime-400' : it.status === 'order pending' ? 'text-amber-400' : 'text-zinc-500'}`}>{it.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (act === 2) {
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${p > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-orange-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Work Orders · This Week</p>
          </div>
          {[
            { id: 'WO-1847', bike: 'Tyler #17', job: 'Front shock rebuild + re-valve', due: 'Tue 3/12', status: 'in progress' },
            { id: 'WO-1848', bike: 'Cody #44', job: 'Tire rotation + balance', due: 'Mon 3/11', status: 'ready' },
            { id: 'WO-1849', bike: 'Danny #7', job: 'Chain service + sprocket check', due: 'Wed 3/13', status: 'queued' },
          ].map((w) => (
            <div key={w.id} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-xs text-zinc-500 font-bold">{w.id} • {w.bike}</p>
                <span className={`text-xs font-bold px-3 py-1 rounded ${w.status === 'ready' ? 'bg-lime-400/20 text-lime-400' : w.status === 'in progress' ? 'bg-amber-400/20 text-amber-400' : 'bg-zinc-700/30 text-zinc-500'}`}>{w.status}</span>
              </div>
              <p className="text-zinc-300 text-sm">{w.job}</p>
              <p className="font-mono text-xs text-zinc-600 mt-2">Due: {w.due}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  // Act 3
  return (
    <div className="h-full flex flex-col gap-5">
      <div className={`transition-all duration-500 ${p > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-orange-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Client History · Audit Trail</p>
        </div>
        <div className="space-y-3">
          {[
            { date: 'Mar 10', entry: 'Tyler #17: Pre-race suspension tune. Notes: smooth mid-stroke.' },
            { date: 'Mar 8', entry: 'All 3 bikes: Full service completed. New chains + brake pads.' },
            { date: 'Mar 5', entry: 'Cody #44: Valve replacement after practice crash.' },
            { date: 'Feb 28', entry: 'Danny #7: Comprehensive re-valve service. Spring change.' },
          ].map((e) => (
            <div key={e.entry} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3">
              <p className="font-mono text-xs text-zinc-500 font-bold mb-2">{e.date}</p>
              <p className="text-zinc-300 text-sm">{e.entry}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE: AGENT — 4 acts (Contract Negotiation + Scouting)
   Act 0: Rider Percentiles & Market Ranking
   Act 1: Salary Comps & Market Data
   Act 2: Prospect Search Results
   Act 3: Contract Export / Deal Closing
════════════════════════════════════════════════════ */

function SceneAgent({ act, actProgress: p }: { act: number; actProgress: number }) {
  if (act === 0) {
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${p > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Rider Percentiles · Market Ranking</p>
          </div>
          {[
            { rider: 'Tyler Marsh #17', skill: 'Consistency', pctl: '87th', market: 'Rising A-Class', value: '$15k-$22k/yr' },
            { rider: 'Cody Rios #44', skill: 'Speed', pctl: '94th', market: 'Premium Prospect', value: '$28k-$35k/yr' },
            { rider: 'Danny Kosel #7', skill: 'Smooth Line', pctl: '72nd', market: 'Developing B-Class', value: '$8k-$12k/yr' },
          ].map((r) => (
            <div key={r.rider} className="border border-blue-400/20 bg-blue-400/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-200 text-sm font-bold">{r.rider}</p>
                <span className="bg-blue-400/20 text-blue-400 text-xs px-3 py-1 rounded font-bold">{r.pctl}th %ile</span>
              </div>
              <p className="text-zinc-400 text-sm">{r.skill} • {r.market}</p>
              <p className="text-zinc-500 text-sm mt-2 font-mono">{r.value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (act === 1) {
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${p > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-green-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Salary Comps · Current Market</p>
          </div>
          <div className="border border-blue-400/20 bg-blue-400/5 rounded-lg p-4">
            <div className="space-y-3">
              {[
                { category: 'Factory Support Riders (16-17yo)', low: '$22k', high: '$42k', avg: '$32k' },
                { category: 'Regional Champions', low: '$18k', high: '$48k', avg: '$28k' },
                { category: 'Rookie Developing', low: '$5k', high: '$15k', avg: '$9k' },
              ].map((c) => (
                <div key={c.category} className="border-l-2 border-l-blue-400 pl-3">
                  <p className="text-zinc-300 text-sm font-bold">{c.category}</p>
                  <p className="text-zinc-500 text-sm mt-2">Range: {c.low} — {c.high} | Avg: <span className="text-green-400 font-bold">{c.avg}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (act === 2) {
    return (
      <div className="h-full flex flex-col gap-5">
        <div className={`transition-all duration-500 ${p > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-blue-400" />
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Prospect Search · A-Class Riders</p>
          </div>
          {[
            { name: 'Jacob Kosel', rank: '#3 at Southwick', age: 16, notes: 'Hungry. Connections to Rockstar Racing.' },
            { name: 'Austin Forkner Jr', rank: '#7 Central Region', age: 17, notes: 'Factory-ready. Team sponsoring tryout.' },
            { name: 'Jett Lawrence', rank: '#1 250 East', age: 18, notes: 'Premium prospect. Already committed.' },
          ].map((pr) => (
            <div key={pr.name} className="border border-blue-400/20 bg-blue-400/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-200 text-sm font-bold">{pr.name}</p>
                <span className="bg-green-400/20 text-green-400 text-xs px-3 py-1 rounded">{pr.age}yo</span>
              </div>
              <p className="text-zinc-400 text-sm">{pr.rank} • {pr.notes}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  // Act 3
  return (
    <div className="h-full flex flex-col gap-5">
      <div className={`transition-all duration-500 ${p > 0.15 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-green-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Contract Draft · Cody Rios #44</p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 space-y-3 text-sm font-mono text-zinc-300">
          <p><strong>Rider:</strong> Cody Rios #44 | <strong>Age:</strong> 17</p>
          <p><strong>Term:</strong> 2024-2025 Season | <strong>Duration:</strong> 12 months</p>
          <p className="text-green-400 font-bold"><strong>Compensation:</strong> $31,500</p>
          <p><strong>Contingencies:</strong> Regional Top 3 finish (bonus +$5k) | Factory interest (auto-upgrade)</p>
          <p className="border-t border-zinc-700 pt-3 mt-3"><strong>Status:</strong> Ready to present. Awaiting family review.</p>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE: ROOKIE — 4 acts
   Act 0: The Bike (health card + ride stats)
   Act 1: Ride History (recent sessions log)
   Act 2: Milestones (timeline reveals one by one)
   Act 3: Share the Story (parent sharing profile)
════════════════════════════════════════════════════ */
function SceneRookie({ act, actProgress }: { act: number; actProgress: number }) {
  if (act === 0) return <RookieAct0 p={actProgress} />
  if (act === 1) return <RookieAct1 p={actProgress} />
  if (act === 2) return <RookieAct2 p={actProgress} />
  return <RookieAct3 p={actProgress} />
}

function RookieAct0({ p }: { p: number }) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-4 border border-zinc-800 bg-zinc-900/50 rounded-lg px-4 py-3" style={{ animation: 'mdRise 0.5s ease-out both' }}>
        <div className="h-12 w-12 bg-sky-400/10 border border-sky-400/30 rounded flex items-center justify-center shrink-0">
          <Bike className="h-6 w-6 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-100 text-sm font-bold">Yamaha PW50 · #4 · Jake</p>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">2024 · Red · Salt Lake City, UT</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sky-400 text-2xl leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}>94%</p>
          <p className="font-mono text-[9px] text-zinc-600 uppercase">Bike Health</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ animation: 'mdRise 0.5s ease-out 0.15s both' }}>
        {[
          { label: 'Total Rides', value: '47', icon: Flag, color: 'text-sky-400' },
          { label: 'Hours Logged', value: '14.5', icon: Timer, color: 'text-sky-400' },
          { label: 'Milestones', value: '12', icon: Star, color: 'text-amber-400' },
          { label: 'This Month', value: '3', icon: Activity, color: 'text-lime-400' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3 text-center">
              <Icon className={`h-4 w-4 ${s.color} mx-auto mb-1.5`} />
              <p className="text-zinc-100 text-2xl leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}>{s.value}</p>
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          )
        })}
      </div>
      <div className="flex-1 border border-zinc-800 bg-zinc-900/40 rounded-lg p-4 flex flex-col gap-2" style={{ animation: 'mdRise 0.5s ease-out 0.3s both' }}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Maintenance Status</p>
        {[
          { label: 'Oil Change', due: '2.5 hrs remaining', pct: 72, ok: true },
          { label: 'Air Filter', due: 'Due now', pct: 100, ok: false },
          { label: 'Chain Lube', due: '6.1 hrs remaining', pct: 30, ok: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <p className={`text-xs w-24 shrink-0 ${item.ok ? 'text-zinc-300' : 'text-red-400 font-bold'}`}>{item.label}</p>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${item.ok ? 'bg-sky-400' : 'bg-red-500'}`}
                style={{ width: `${item.pct}%`, animation: 'mdBarGrow 0.8s ease-out 0.5s both' }} />
            </div>
            <p className={`font-mono text-[9px] w-28 text-right shrink-0 ${item.ok ? 'text-zinc-600' : 'text-red-400'}`}>{item.due}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RookieAct1({ p }: { p: number }) {
  const rides = [
    { date: 'Jul 8, 2026', duration: '38 min', location: 'Backyard', laps: 22, note: 'First time no speed wobble on the jump' },
    { date: 'Jul 5, 2026', duration: '45 min', location: 'Thunder Ridge MX', laps: 31, note: 'Gate practice with Dad — 3 clean starts' },
    { date: 'Jun 28, 2026', duration: '25 min', location: 'Backyard', laps: 14, note: 'Worked on cornering, dragged knee for the first time' },
    { date: 'Jun 22, 2026', duration: '52 min', location: 'Local Race — 50cc', laps: 0, note: '2nd place moto 1, DNS moto 2 (tip over, bike ok)' },
    { date: 'Jun 15, 2026', duration: '40 min', location: 'Thunder Ridge MX', laps: 28, note: 'First time on the big track — loved the rhythm section' },
  ]
  const shown = Math.floor(p * (rides.length + 1))
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between" style={{ animation: 'mdFadeIn 0.4s ease-out both' }}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Recent Ride Sessions</p>
        <span className="font-mono text-[9px] text-sky-400 border border-sky-400/30 bg-sky-400/5 px-2 py-0.5 uppercase">47 total rides logged</span>
      </div>
      {rides.map((r, i) => (
        <div
          key={r.date}
          className={`border border-zinc-800 bg-zinc-900/40 rounded-lg px-4 py-3 transition-all duration-500 ${shown > i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <p className="text-zinc-200 text-xs font-bold">{r.location}</p>
              {r.laps > 0 && <span className="font-mono text-[9px] text-zinc-600">{r.laps} laps</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-zinc-600">{r.duration}</span>
              <span className="font-mono text-[9px] text-zinc-700">{r.date}</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs italic">&quot;{r.note}&quot;</p>
        </div>
      ))}
    </div>
  )
}

function RookieAct2({ p }: { p: number }) {
  const milestones = [
    { age: 'Age 4', event: 'First ride — PW50 in the driveway', icon: Bike, note: 'Took 3 tries to get moving, cried when we said time to go in' },
    { age: 'Age 4', event: 'First ride without training wheels', icon: Star, note: 'Balance came fast — natural' },
    { age: 'Age 5', event: 'First race — 50cc Mini class, Thunder Ridge', icon: Flag, note: 'Gate dropped, he pinned it. Finished 6th of 8. Wanted to go again immediately' },
    { age: 'Age 5', event: 'First jump cleared — tabletop at local track', icon: TrendingUp, note: 'Scared beforehand, wouldn\'t stop talking about it after' },
    { age: 'Age 5', event: 'First podium — 2nd place', icon: Trophy, note: 'Cried on the podium. So did his mom.' },
    { age: 'Age 6', event: '10th race completed', icon: Activity, note: 'Starts improving gate reaction. Avg finish improving every month.' },
  ]
  const shown = Math.floor(p * (milestones.length + 1))
  return (
    <div className="h-full flex flex-col gap-2">
      <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest" style={{ animation: 'mdFadeIn 0.4s ease-out both' }}>
        Rider Milestones — Jake&apos;s Story
      </p>
      <div className="relative flex-1 flex flex-col gap-2">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800" />
        {milestones.map((m, i) => {
          const Icon = m.icon
          const visible = shown > i
          return (
            <div
              key={m.event}
              className={`flex items-start gap-3 transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
            >
              <div className={`h-10 w-10 rounded-full border flex items-center justify-center shrink-0 relative z-10 ${visible ? 'bg-sky-400/10 border-sky-400/30' : 'bg-zinc-900 border-zinc-800'}`}>
                <Icon className={`h-4 w-4 ${visible ? 'text-sky-400' : 'text-zinc-700'}`} />
              </div>
              <div className="flex-1 border border-zinc-800 bg-zinc-900/40 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-zinc-200 text-xs font-bold">{m.event}</p>
                  <span className="font-mono text-[9px] text-sky-400 shrink-0 ml-2">{m.age}</span>
                </div>
                <p className="text-zinc-500 text-xs italic">&quot;{m.note}&quot;</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RookieAct3({ p }: { p: number }) {
  const show1 = p > 0.1
  const show2 = p > 0.35
  const show3 = p > 0.6
  return (
    <div className="h-full flex flex-col gap-4">
      <div className={`border border-sky-400/20 bg-sky-400/5 rounded-lg px-4 py-3 transition-all duration-500 ${show1 ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-mono text-[9px] text-sky-400 uppercase tracking-widest mb-1">Rider Profile — Public Link</p>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-sky-400/10 border border-sky-400/30 rounded-full flex items-center justify-center shrink-0">
            <span className="text-sky-400 font-black text-sm">J</span>
          </div>
          <div>
            <p className="text-zinc-100 text-sm font-bold">Jake Padilla · #4</p>
            <p className="font-mono text-[10px] text-zinc-500">motorsportsdata.io/rider/jake-p · 47 rides · 12 milestones</p>
          </div>
          <button className="ml-auto flex items-center gap-1.5 border border-sky-400/30 bg-sky-400/10 text-sky-400 font-mono text-[10px] uppercase px-3 py-1.5 rounded">
            <Share2 className="h-3 w-3" /> Share
          </button>
        </div>
      </div>
      <div className={`flex gap-3 transition-all duration-500 ${show2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { platform: 'Instagram', handle: '@padillajake_mx', followers: '1.2K', action: 'Shared ride video', color: 'text-pink-400', border: 'border-pink-400/20', bg: 'bg-pink-400/5' },
          { platform: 'Facebook', handle: 'Jake Padilla Racing', followers: '340', action: 'Tagged milestone post', color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/5' },
        ].map((s) => (
          <div key={s.platform} className={`flex-1 border ${s.border} ${s.bg} rounded-lg px-3 py-3`}>
            <p className={`font-mono text-[9px] uppercase tracking-widest ${s.color} mb-1`}>{s.platform}</p>
            <p className="text-zinc-200 text-xs font-bold">{s.handle}</p>
            <p className="font-mono text-[9px] text-zinc-600 mt-0.5">{s.followers} followers · {s.action}</p>
          </div>
        ))}
      </div>
      <div className={`flex-1 border border-zinc-800 bg-zinc-900/40 rounded-lg p-4 transition-all duration-500 ${show3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-3">Dad&apos;s note — July 8, 2026</p>
        <p className="text-zinc-300 text-sm leading-relaxed italic">
          &quot;This platform is the best thing we did for Jake&apos;s racing. Every ride logged, every milestone saved. When he&apos;s 18 and looking back, he&apos;ll have every single moment from day one. Worth every penny.&quot;
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Heart className="h-4 w-4 text-red-400" style={{ animation: 'mdPulse 2s ease-in-out infinite' }} />
          <p className="font-mono text-[9px] text-zinc-600">12 families following Jake&apos;s journey</p>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE: PRIVATEER — 4 acts
   Act 0: Track Conditions (weather + site data)
   Act 1: Setup Sheet (fields filling in)
   Act 2: Part Vault (maintenance alerts)
   Act 3: MD Intel AI (full recall conversation)
════════════════════════════════════════════════════ */
function ScenePrivateer({ act, actProgress }: { act: number; actProgress: number }) {
  if (act === 0) return <PrivateerAct0 p={actProgress} />
  if (act === 1) return <PrivateerAct1 p={actProgress} />
  if (act === 2) return <PrivateerAct2 p={actProgress} />
  if (act === 3) return <PrivateerAct3 p={actProgress} />
  return <PrivateerAct4 p={actProgress} />
}

function PrivateerAct0({ p }: { p: number }) {
  const shown = Math.floor(p * 5)
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2 border border-lime-400/20 bg-lime-400/5 rounded-lg px-4 py-3" style={{ animation: 'mdRise 0.4s ease-out both' }}>
        <Cloud className="h-5 w-5 text-lime-400 shrink-0" />
        <div>
          <p className="text-zinc-200 text-sm font-bold">Pala Raceway · San Diego, CA</p>
          <p className="font-mono text-[10px] text-zinc-500">Race day — Moto 1 in 2h 14min</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-lime-400 text-xl font-black" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>94°F</p>
          <p className="font-mono text-[9px] text-zinc-600">Feels 101°F</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Humidity', value: '18%', note: 'Low — dry, hard pack forming', icon: Cloud, color: 'text-sky-400' },
          { label: 'Wind', value: '7 mph', note: 'SW · minimal factor', icon: Activity, color: 'text-zinc-400' },
          { label: 'Track Condition', value: 'Hardpack', note: 'Blue groove — slick off-line', icon: MapPin, color: 'text-amber-400' },
          { label: 'Pressure', value: '29.9 inHg', note: 'Stable — jet stays stock', icon: TrendingUp, color: 'text-lime-400' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className={`border border-zinc-800 bg-zinc-900/40 rounded-lg p-3 transition-all duration-500 ${shown > i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            >
              <Icon className={`h-4 w-4 ${s.color} mb-1.5`} />
              <p className="text-zinc-100 text-lg font-black leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
              <p className="text-zinc-500 text-[11px] mt-1 leading-tight">{s.note}</p>
            </div>
          )
        })}
      </div>
      <div className={`flex-1 border border-amber-400/20 bg-amber-400/5 rounded-lg px-4 py-3 transition-all duration-500 ${shown > 4 ? 'opacity-100' : 'opacity-0'}`}>
        <p className="font-mono text-[9px] text-amber-400 uppercase tracking-widest mb-1.5">MD Intel Pre-Race Tip</p>
        <p className="text-zinc-300 text-sm leading-relaxed">
          At Pala in heat over 90°F you typically ran one tooth less on the rear — consider dropping to 48T. Your last two hot-day races showed corner exit understeer consistent with over-gearing.
        </p>
      </div>
    </div>
  )
}

function PrivateerAct1({ p }: { p: number }) {
  const fields = [
    { label: 'Fork Compression', value: '12 clicks out', group: 'Suspension' },
    { label: 'Fork Rebound', value: '14 clicks out', group: 'Suspension' },
    { label: 'Shock Compression', value: '10 clicks out', group: 'Suspension' },
    { label: 'Shock Rebound', value: '8 clicks out', group: 'Suspension' },
    { label: 'Fuel Map', value: 'Map 2 · Aggressive', group: 'Engine' },
    { label: 'Jetting', value: '168 MJ · Stock pilot', group: 'Engine' },
    { label: 'Tire Pressure F/R', value: '13.0 / 12.5 psi', group: 'Tires' },
    { label: 'Sag', value: '105 mm', group: 'Suspension' },
    { label: 'Gearing', value: '13/49 · 3.769 ratio', group: 'Drivetrain' },
    { label: 'Bar Position', value: 'Clamp rearward', group: 'Ergonomics' },
  ]
  const shown = Math.floor(p * (fields.length + 1))
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Setup Sheet · Pala · Jul 8, 2026</p>
        <span className="font-mono text-[9px] text-lime-400 border border-lime-400/30 bg-lime-400/5 px-2 py-0.5">2025 YZ450F · #7</span>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {fields.map((f, i) => (
          <div
            key={f.label}
            className={`border border-zinc-800 bg-zinc-900/50 rounded-lg px-3 py-2 flex flex-col justify-center transition-all duration-400 ${shown > i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'}`}
          >
            <p className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest">{f.group} · {f.label}</p>
            <p className="text-zinc-100 text-sm font-bold mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PrivateerAct2({ p }: { p: number }) {
  const parts = [
    { name: 'Fork Seals', hours: '38.2', limit: '40', pct: 96, status: 'critical', note: 'Replace before next race — 1.8 hrs left' },
    { name: 'Air Filter', hours: '4.1', limit: '5', pct: 82, status: 'warn', note: 'Clean after today\'s moto' },
    { name: 'Chain', hours: '22.4', limit: '30', pct: 75, status: 'ok', note: 'Inspect stretch at 25h' },
    { name: 'Brake Pads F/R', hours: '18.7', limit: '40', pct: 47, status: 'ok', note: 'Good through the season' },
    { name: 'Engine Rebuild', hours: '41.0', limit: '80', pct: 51, status: 'ok', note: 'Schedule for offseason' },
  ]
  const shown = Math.floor(p * (parts.length + 1))
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Part Vault · Maintenance Tracker</p>
        <span className="font-mono text-[9px] text-red-400 border border-red-400/30 bg-red-400/5 px-2 py-0.5 uppercase">1 critical · 1 warning</span>
      </div>
      {parts.map((part, i) => (
        <div
          key={part.name}
          className={`border rounded-lg px-4 py-3 transition-all duration-500 ${
            part.status === 'critical' ? 'border-red-500/40 bg-red-500/5' :
            part.status === 'warn' ? 'border-amber-400/30 bg-amber-400/5' :
            'border-zinc-800 bg-zinc-900/40'
          } ${shown > i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wrench className={`h-3.5 w-3.5 ${part.status === 'critical' ? 'text-red-400' : part.status === 'warn' ? 'text-amber-400' : 'text-zinc-500'}`} />
              <p className={`text-sm font-bold ${part.status === 'critical' ? 'text-red-400' : part.status === 'warn' ? 'text-amber-300' : 'text-zinc-200'}`}>{part.name}</p>
            </div>
            <span className="font-mono text-[9px] text-zinc-600">{part.hours} / {part.limit} hrs</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full ${part.status === 'critical' ? 'bg-red-500' : part.status === 'warn' ? 'bg-amber-400' : 'bg-lime-400'}`}
              style={{ width: `${part.pct}%`, animation: `mdBarGrow 0.7s ease-out ${0.2 + i * 0.1}s both` }}
            />
          </div>
          <p className={`text-xs ${part.status === 'critical' ? 'text-red-400' : part.status === 'warn' ? 'text-amber-400' : 'text-zinc-500'}`}>{part.note}</p>
        </div>
      ))}
    </div>
  )
}

const INTEL_Q1 = "What did I run at Pala last time it was this hot?"
const INTEL_A1 = "Pala, June 2025 — 91°F, hardpack. You ran 10 clicks compression (softer than usual), Map 2, 13/49. You noted front pushed wide in the off-cambers but mid-corner drive was the best of the season. Finished 3rd overall."
const INTEL_Q2 = "Should I go softer on compression again today?"
const INTEL_A2 = "Yes. Track conditions are nearly identical but 3° hotter. Start at 10 clicks again. Last time you said 11 was slightly stiff for that track — trust the note."

function PrivateerAct3({ p }: { p: number }) {
  const phase1End = 0.25, phase2End = 0.55, phase3End = 0.75
  const chars1 = Math.floor(Math.min(p / phase1End, 1) * INTEL_A1.length)
  const showQ2 = p > phase2End
  const chars2 = showQ2 ? Math.floor(Math.min((p - phase3End) / (1 - phase3End), 1) * INTEL_A2.length) : 0
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-lime-400/10 border border-lime-400/30 rounded flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-lime-400" />
        </div>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">MD Intel AI · Your personal setup historian</p>
      </div>
      {/* Q1 */}
      <div className="flex justify-end" style={{ animation: 'mdFadeIn 0.4s ease-out both' }}>
        <div className="max-w-[85%] bg-zinc-800 rounded-2xl rounded-tr-sm px-3 py-2">
          <p className="text-zinc-200 text-xs">{INTEL_Q1}</p>
        </div>
      </div>
      {/* A1 */}
      <div className="flex gap-2 items-start">
        <div className="h-7 w-7 bg-lime-400/10 border border-lime-400/30 rounded flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-lime-400" />
        </div>
        <div className="flex-1 min-w-0 border border-zinc-800 bg-zinc-900/60 rounded-2xl rounded-tl-sm px-3 py-2.5">
          <p className="font-mono text-[8px] text-lime-400 uppercase tracking-widest mb-1.5">MD Intel · Gemini 2.5 Pro</p>
          <p className="text-zinc-300 text-xs leading-relaxed">
            {INTEL_A1.slice(0, chars1)}
            {chars1 < INTEL_A1.length && <span className="inline-block w-1 h-3 -mb-0.5 bg-lime-400 ml-0.5" style={{ animation: 'mdBlink 0.9s step-end infinite' }} />}
          </p>
        </div>
      </div>
      {/* Q2 */}
      {showQ2 && (
        <div className="flex justify-end" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
          <div className="max-w-[85%] bg-zinc-800 rounded-2xl rounded-tr-sm px-3 py-2">
            <p className="text-zinc-200 text-xs">{INTEL_Q2}</p>
          </div>
        </div>
      )}
      {/* A2 */}
      {showQ2 && chars2 > 0 && (
        <div className="flex gap-2 items-start" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
          <div className="h-7 w-7 bg-lime-400/10 border border-lime-400/30 rounded flex items-center justify-center shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-lime-400" />
          </div>
          <div className="flex-1 min-w-0 border border-zinc-800 bg-zinc-900/60 rounded-2xl rounded-tl-sm px-3 py-2.5">
            <p className="font-mono text-[8px] text-lime-400 uppercase tracking-widest mb-1.5">MD Intel</p>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {INTEL_A2.slice(0, chars2)}
              {chars2 < INTEL_A2.length && <span className="inline-block w-1 h-3 -mb-0.5 bg-lime-400 ml-0.5" style={{ animation: 'mdBlink 0.9s step-end infinite' }} />}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function PrivateerAct4({ p }: { p: number }) {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2 border border-lime-400/20 bg-lime-400/5 rounded-lg px-4 py-3">
        <HeartPulse className="h-5 w-5 text-lime-400 shrink-0" />
        <div>
          <p className="text-zinc-200 text-sm font-bold">Fitness Metrics</p>
          <p className="font-mono text-[10px] text-zinc-500">7-day rolling average</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'HRV', value: '52ms', trend: '+8%' },
          { label: 'RHR', value: '48 bpm', trend: '-3%' },
          { label: 'VO₂ Max', value: '58', trend: '+2%' },
        ].map((m) => (
          <div key={m.label} className="border border-zinc-800 bg-zinc-900/40 rounded p-3 text-center">
            <p className="text-zinc-500 text-xs">{m.label}</p>
            <p className="text-zinc-100 font-bold mt-1">{m.value}</p>
            <p className="text-lime-400 text-xs mt-1">{m.trend}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE: RACE TEAM — 5 acts
   Act 0: Rider Roster (readiness bars animate)
   Act 1: Race Coach AI (full answer)
   Act 2: Schedule + Sponsor Budget
   Act 3: Video Analysis clip card
═════════════════════════════════════════════���══════ */
function SceneRaceTeam({ act, actProgress }: { act: number; actProgress: number }) {
  if (act === 0) return <RaceTeamAct0 p={actProgress} />
  if (act === 1) return <RaceTeamAct1 p={actProgress} />
  if (act === 2) return <RaceTeamAct2 p={actProgress} />
  if (act === 3) return <RaceTeamAct3 p={actProgress} />
  return <RaceTeamAct4 p={actProgress} />
}

function RaceTeamAct0({ p }: { p: number }) {
  const riders = [
    { name: 'Tyler Marsh', number: '17', class: '450', ready: 89, tone: 'lime', status: 'Race Ready', sleep: 8.2, fitness: 91, injury: null },
    { name: 'Jake Padilla', number: '31', class: '250F', ready: 61, tone: 'amber', status: 'Caution', sleep: 6.1, fitness: 74, injury: 'Left shoulder RTR Stage 2' },
    { name: 'Cody Rios', number: '44', class: '450', ready: 95, tone: 'lime', status: 'Peak', sleep: 8.9, fitness: 97, injury: null },
    { name: 'Danny Watts', number: '8', class: '250F', ready: 77, tone: 'lime', status: 'Good', sleep: 7.4, fitness: 80, injury: null },
  ]
  const shown = Math.floor(p * (riders.length + 1))
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Rider Roster · Readiness Scores</p>
        <span className="font-mono text-[9px] text-amber-400 border border-amber-400/30 bg-amber-400/5 px-2 py-0.5 uppercase">Anaheim 1 · Sat</span>
      </div>
      {riders.map((r, i) => (
        <div
          key={r.name}
          className={`border border-zinc-800 bg-zinc-900/40 rounded-lg px-4 py-3 transition-all duration-500 ${shown > i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded font-black text-sm flex items-center justify-center shrink-0 ${r.tone === 'amber' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 'bg-lime-400/10 text-lime-400 border border-lime-400/30'}`}>
              {r.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-zinc-200 text-sm font-bold">{r.name}</p>
                <span className="font-mono text-[9px] text-zinc-600">{r.class}</span>
                {r.injury && <span className="font-mono text-[9px] text-red-400 border border-red-400/30 bg-red-400/5 px-1.5">{r.injury}</span>}
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden w-full">
                <div
                  className={`h-full rounded-full ${r.ready >= 85 ? 'bg-lime-400' : r.ready >= 70 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${r.ready}%`, animation: `mdBarGrow 1s ease-out ${0.3 + i * 0.12}s both` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className={`text-xl leading-none font-black ${r.tone === 'amber' ? 'text-amber-400' : 'text-lime-400'}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{r.ready}</p>
              <p className="font-mono text-[8px] text-zinc-600 uppercase">{r.status}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-2 ml-13">
            <div className="flex items-center gap-1.5 ml-12">
              <Brain className="h-3 w-3 text-zinc-600" />
              <span className="font-mono text-[9px] text-zinc-600">Sleep {r.sleep}h</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="h-3 w-3 text-zinc-600" />
              <span className="font-mono text-[9px] text-zinc-600">Fitness {r.fitness}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const COACH_A = "Tyler and Cody are clear to race — readiness 89 and 95 respectively. Cody is at peak fitness, best scores of the season. Tyler: watch the left foot peg — his video from last week shows heel dragging in the rutted lefts, tends to fatigue his hip flexor by moto 2. Jake needs to sit out: left shoulder RTR Stage 2, fitness dropped 12 points this week. He should not gate. Put Danny in the B main and move him up if Tyler needs rest between motos."

function RaceTeamAct1({ p }: { p: number }) {
  const chars = Math.floor(p * COACH_A.length)
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-amber-400/10 border border-amber-400/30 rounded flex items-center justify-center">
          <Compass className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Race Coach AI · Pre-race briefing</p>
      </div>
      <div className="flex justify-end" style={{ animation: 'mdFadeIn 0.4s ease-out both' }}>
        <div className="max-w-[85%] bg-zinc-800 rounded-2xl rounded-tr-sm px-3 py-2">
          <p className="text-zinc-200 text-xs">Who&apos;s racing this weekend and is there anything I should know?</p>
        </div>
      </div>
      <div className="flex gap-2 items-start flex-1">
        <div className="h-7 w-7 bg-amber-400/10 border border-amber-400/30 rounded flex items-center justify-center shrink-0">
          <Compass className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0 border border-zinc-800 bg-zinc-900/60 rounded-2xl rounded-tl-sm px-3 py-2.5">
          <p className="font-mono text-[8px] text-amber-400 uppercase tracking-widest mb-1.5">Race Coach · Gemini 2.5 Pro</p>
          <p className="text-zinc-300 text-xs leading-relaxed">
            {COACH_A.slice(0, chars)}
            {chars < COACH_A.length && <span className="inline-block w-1 h-3 -mb-0.5 bg-amber-400 ml-0.5" style={{ animation: 'mdBlink 0.9s step-end infinite' }} />}
          </p>
        </div>
      </div>
      {chars >= COACH_A.length && (
        <div className="grid grid-cols-3 gap-2" style={{ animation: 'mdRise 0.5s ease-out both' }}>
          {[
            { label: 'Race Ready', value: '2', color: 'text-lime-400', border: 'border-lime-400/20', bg: 'bg-lime-400/5' },
            { label: 'Sit Out', value: '1', color: 'text-red-400', border: 'border-red-400/20', bg: 'bg-red-400/5' },
            { label: 'Reserve', value: '1', color: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/5' },
          ].map((s) => (
            <div key={s.label} className={`border ${s.border} ${s.bg} rounded-lg p-3 text-center`}>
              <p className={`text-2xl font-black leading-none ${s.color}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RaceTeamAct2({ p }: { p: number }) {
  const show1 = p > 0.05, show2 = p > 0.3, show3 = p > 0.55
  const races = [
    { event: 'Anaheim 1', date: 'Jul 12', status: 'upcoming', note: 'Entry confirmed — 3 riders' },
    { event: 'San Diego SX', date: 'Jul 19', status: 'upcoming', note: 'Hotel booked · 4h drive' },
    { event: 'Anaheim 2', date: 'Jul 26', status: 'tentative', note: 'Entry pending Jake RTR clearance' },
  ]
  return (
    <div className="h-full flex flex-col gap-4">
      <div className={`transition-all duration-500 ${show1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-2">Race Schedule</p>
        <div className="flex flex-col gap-2">
          {races.map((r) => (
            <div key={r.event} className={`flex items-center gap-3 border rounded-lg px-3 py-2 ${r.status === 'upcoming' ? 'border-amber-400/20 bg-amber-400/5' : 'border-zinc-800 bg-zinc-900/40'}`}>
              <CalendarDays className={`h-4 w-4 shrink-0 ${r.status === 'upcoming' ? 'text-amber-400' : 'text-zinc-600'}`} />
              <div className="flex-1">
                <p className={`text-sm font-bold ${r.status === 'upcoming' ? 'text-zinc-100' : 'text-zinc-400'}`}>{r.event}</p>
                <p className="font-mono text-[9px] text-zinc-600">{r.note}</p>
              </div>
              <span className="font-mono text-[9px] text-zinc-500 shrink-0">{r.date}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`transition-all duration-500 ${show2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-2">Season Budget · Sponsor Tracker</p>
        <div className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-200 text-sm font-bold">Total Budget</p>
            <p className="text-lime-400 font-black text-lg" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>$84,200</p>
          </div>
          {[
            { label: 'Sponsor Revenue', value: '$62,000', pct: 74, color: 'bg-lime-400' },
            { label: 'Expenses to Date', value: '$41,800', pct: 50, color: 'bg-amber-400' },
            { label: 'Remaining', value: '$42,400', pct: 50, color: 'bg-sky-400' },
          ].map((b) => (
            <div key={b.label} className="mb-2">
              <div className="flex justify-between mb-0.5">
                <p className="font-mono text-[9px] text-zinc-500 uppercase">{b.label}</p>
                <p className="font-mono text-[9px] text-zinc-400">{b.value}</p>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%`, animation: 'mdBarGrow 0.8s ease-out 0.3s both' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {show3 && (
        <div className="border border-zinc-800 bg-zinc-900/40 rounded-lg px-3 py-2 flex items-center gap-2" style={{ animation: 'mdRise 0.4s ease-out both' }}>
          <DollarSign className="h-4 w-4 text-lime-400 shrink-0" />
          <p className="text-zinc-400 text-xs">New sponsor proposal: <span className="text-zinc-200 font-bold">Fly Racing — $8,000 gear deal</span> · response due Jul 14</p>
        </div>
      )}
    </div>
  )
}

function RaceTeamAct3({ p }: { p: number }) {
  const show1 = p > 0.05, show2 = p > 0.35, show3 = p > 0.65
  const clips = [
    { rider: 'Tyler Marsh #17', segment: 'Turn 3 — rutted left', score: 72, note: 'Heel dragging on entry — hip flexor fatigue risk by moto 2. Widen elbow, shift weight forward.', flag: true },
    { rider: 'Cody Rios #44', segment: 'Rhythm section lap 4', score: 94, note: 'Clean line selection. Best exit speed of the session. Reference footage for team.', flag: false },
  ]
  return (
    <div className="h-full flex flex-col gap-4">
      <div className={`transition-all duration-500 ${show1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Video className="h-4 w-4 text-amber-400" />
          <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Video Analysis · Anaheim 1 Practice</p>
        </div>
        {clips.map((c) => (
          <div key={c.rider} className={`border rounded-lg overflow-hidden mb-3 ${c.flag ? 'border-red-500/30' : 'border-lime-400/20'}`}>
            <div className={`flex items-center gap-3 px-3 py-2 ${c.flag ? 'bg-red-500/5' : 'bg-lime-400/5'}`}>
              <Camera className={`h-4 w-4 shrink-0 ${c.flag ? 'text-red-400' : 'text-lime-400'}`} />
              <div className="flex-1">
                <p className="text-zinc-200 text-xs font-bold">{c.rider}</p>
                <p className="font-mono text-[9px] text-zinc-500">{c.segment}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black leading-none ${c.flag ? 'text-red-400' : 'text-lime-400'}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{c.score}</p>
                <p className="font-mono text-[9px] text-zinc-600">/ 100</p>
              </div>
            </div>
            <div className="px-3 py-2 bg-zinc-900/60">
              <p className="text-zinc-400 text-xs leading-relaxed">{c.note}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-3 gap-3 transition-all duration-500 ${show2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'Clips Analyzed', value: '34', color: 'text-amber-400' },
          { label: 'Avg Score', value: '83', color: 'text-lime-400' },
          { label: 'Flags Raised', value: '6', color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3 text-center">
            <p className={`text-2xl font-black leading-none ${s.color}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {show3 && (
        <div className="border border-amber-400/20 bg-amber-400/5 rounded-lg px-3 py-2" style={{ animation: 'mdRise 0.4s ease-out both' }}>
          <p className="text-zinc-300 text-xs">Race Coach AI: <span className="text-zinc-200 font-bold">Cody&apos;s rhythm section clip flagged as team reference footage</span> — shared with Tyler and Danny for pre-race review.</p>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   SCENE: FACTORY RIG — 4 acts
   Act 0: Fleet Health dashboard
   Act 1: Rig Doctor AI (diesel conversation)
   Act 2: Pre-Trip DOT Checklist
   Act 3: Haul Schedule + departure countdown
   Act 4: Admin Console (user/legal/monitoring)
════════════════════════════════════════════════════ */

function RaceTeamAct4({ p }: { p: number }) {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2 border border-amber-400/20 bg-amber-400/5 rounded-lg px-4 py-3">
        <TrendingUp className="h-5 w-5 text-amber-400 shrink-0" />
        <div>
          <p className="text-zinc-200 text-sm font-bold">Team Analytics</p>
          <p className="font-mono text-[10px] text-zinc-500">Season overview</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Avg Lap Time', value: '1:34.2' },
          { label: 'Improvement', value: '+2.3s' },
          { label: 'Best Rider', value: '#22 Casey' },
          { label: 'Win Rate', value: '87%' },
        ].map((s) => (
          <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 rounded p-2">
            <p className="text-zinc-500 text-xs">{s.label}</p>
            <p className="text-zinc-100 font-bold text-sm mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function FactoryAct4({ p }: { p: number }) {
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2 border border-orange-400/20 bg-orange-400/5 rounded-lg px-4 py-3">
        <Sparkles className="h-5 w-5 text-orange-400 shrink-0" />
        <div>
          <p className="text-zinc-200 text-sm font-bold">Admin Console</p>
          <p className="font-mono text-[10px] text-zinc-500">Team management</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Users', value: '42', icon: Users },
          { label: 'Legal Docs', value: '3', icon: ShieldCheck },
          { label: 'Health', value: '99.8%', icon: Activity },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="border border-zinc-800 bg-zinc-900/40 rounded p-2">
              <Icon className="h-4 w-4 text-orange-400 mx-auto mb-1" />
              <p className="text-zinc-500 text-xs">{item.label}</p>
              <p className="text-zinc-100 font-bold text-sm">{item.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
function SceneFactoryRig({ act, actProgress }: { act: number; actProgress: number }) {
  if (act === 0) return <FactoryAct0 p={actProgress} />
  if (act === 1) return <FactoryAct1 p={actProgress} />
  if (act === 2) return <FactoryAct2 p={actProgress} />
  if (act === 3) return <FactoryAct3 p={actProgress} />
  return <FactoryAct4 p={actProgress} />
}

function FactoryAct0({ p }: { p: number }) {
  const fleet = [
    { name: 'YZ450F · #1 — Webb', type: 'Race', hours: '8.2', health: 91, alert: null },
    { name: 'YZ450F · #1 — Spare', type: 'Spare', hours: '3.1', health: 97, alert: null },
    { name: 'YZ250F · #51 — Forkner', type: 'Race', hours: '22.4', health: 58, alert: 'Engine hrs threshold' },
    { name: 'Practice 450 · #P1', type: 'Practice', hours: '41.0', health: 31, alert: 'Rebuild due' },
    { name: 'Practice 250 · #P2', type: 'Practice', hours: '18.6', health: 74, alert: null },
    { name: 'Kenworth T680 Hauler', type: 'Semi', hours: '847 mi since regen', health: 82, alert: 'DEF 31%' },
  ]
  const shown = Math.floor(p * (fleet.length + 1))
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Factory Fleet · All Assets</p>
        <span className="font-mono text-[9px] text-orange-400 border border-orange-400/30 bg-orange-400/5 px-2 py-0.5 uppercase">Anaheim 1 · 3 days</span>
      </div>
      {fleet.map((b, i) => (
        <div
          key={b.name}
          className={`flex items-center gap-3 border rounded-lg px-3 py-2 transition-all duration-400 ${
            b.alert ? 'border-red-500/30 bg-red-500/5' : 'border-zinc-800 bg-zinc-900/40'
          } ${shown > i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        >
          <div className="h-8 w-8 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center shrink-0">
            {b.type === 'Semi' ? <Truck className="h-4 w-4 text-orange-400" /> : <Bike className="h-4 w-4 text-zinc-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-200 text-xs font-bold truncate">{b.name}</p>
            {b.alert
              ? <p className="font-mono text-[9px] text-red-400">{b.alert}</p>
              : <p className="font-mono text-[9px] text-zinc-600">{b.hours} {b.type === 'Semi' ? '' : 'hrs since rebuild'}</p>
            }
          </div>
          <div className="w-24 shrink-0">
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={b.health < 40 ? 'h-full bg-red-500 rounded-full' : b.health < 65 ? 'h-full bg-amber-400 rounded-full' : 'h-full bg-orange-400 rounded-full'}
                style={{ width: `${b.health}%`, animation: `mdBarGrow 0.8s ease-out ${0.3 + i * 0.08}s both` }}
              />
            </div>
            <p className="font-mono text-[9px] text-zinc-600 text-right mt-0.5">{b.health}%</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const DIESEL_Q1 = "Anything I need to check before we load out for Anaheim?"
const DIESEL_A1 = "DEF level at 31% — fill before departure, you'll hit 400 miles and need a top-off mid-haul otherwise. DPF regen completed 847 miles ago, within normal range. Right front steer axle air bag showing a 2 psi variance from the left — inspect the airline fitting before you roll. No active DTC codes."
const DIESEL_Q2 = "What's the air bag fitting I'm looking for?"
const DIESEL_A2 = "On a T680 it's the 3/8\" push-to-connect fitting on the height control valve — driver side front. Common failure is the collar cracking from vibration. Press the collar in, pull the line, check for cracks. If it pops out clean with no sealant, just reseat it. If you see white powder residue, replace the fitting — $4 part, 10 minutes."

function FactoryAct1({ p }: { p: number }) {
  const p1end = 0.3, p2end = 0.58, p3end = 0.72
  const chars1 = Math.floor(Math.min(p / p1end, 1) * DIESEL_A1.length)
  const showQ2 = p > p2end
  const chars2 = showQ2 ? Math.floor(Math.min((p - p3end) / (1 - p3end), 1) * DIESEL_A2.length) : 0
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-orange-400/10 border border-orange-400/30 rounded flex items-center justify-center">
          <Truck className="h-3.5 w-3.5 text-orange-400" />
        </div>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Rig Doctor AI · Class 8 Diesel · Factory Exclusive</p>
      </div>
      <div className="flex justify-end" style={{ animation: 'mdFadeIn 0.4s ease-out both' }}>
        <div className="max-w-[85%] bg-zinc-800 rounded-2xl rounded-tr-sm px-3 py-2">
          <p className="text-zinc-200 text-xs">{DIESEL_Q1}</p>
        </div>
      </div>
      <div className="flex gap-2 items-start">
        <div className="h-7 w-7 bg-orange-400/10 border border-orange-400/30 rounded flex items-center justify-center shrink-0">
          <Zap className="h-3.5 w-3.5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0 border border-zinc-800 bg-zinc-900/60 rounded-2xl rounded-tl-sm px-3 py-2.5">
          <p className="font-mono text-[8px] text-orange-400 uppercase tracking-widest mb-1.5">Rig Doctor · Gemini 2.5 Pro</p>
          <p className="text-zinc-300 text-xs leading-relaxed">
            {DIESEL_A1.slice(0, chars1)}
            {chars1 < DIESEL_A1.length && <span className="inline-block w-1 h-3 -mb-0.5 bg-orange-400 ml-0.5" style={{ animation: 'mdBlink 0.9s step-end infinite' }} />}
          </p>
        </div>
      </div>
      {showQ2 && (
        <div className="flex justify-end" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
          <div className="max-w-[85%] bg-zinc-800 rounded-2xl rounded-tr-sm px-3 py-2">
            <p className="text-zinc-200 text-xs">{DIESEL_Q2}</p>
          </div>
        </div>
      )}
      {showQ2 && chars2 > 0 && (
        <div className="flex gap-2 items-start" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
          <div className="h-7 w-7 bg-orange-400/10 border border-orange-400/30 rounded flex items-center justify-center shrink-0">
            <Zap className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0 border border-zinc-800 bg-zinc-900/60 rounded-2xl rounded-tl-sm px-3 py-2.5">
            <p className="font-mono text-[8px] text-orange-400 uppercase tracking-widest mb-1.5">Rig Doctor</p>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {DIESEL_A2.slice(0, chars2)}
              {chars2 < DIESEL_A2.length && <span className="inline-block w-1 h-3 -mb-0.5 bg-orange-400 ml-0.5" style={{ animation: 'mdBlink 0.9s step-end infinite' }} />}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function FactoryAct2({ p }: { p: number }) {
  const checks = [
    { category: 'Brakes', item: 'Air pressure — both circuits ≥ 100 psi', done: true },
    { category: 'Brakes', item: 'Low air warning buzzer functional', done: true },
    { category: 'Lights', item: 'All marker, tail, and stop lights', done: true },
    { category: 'Lights', item: 'Turn signals and 4-way hazards', done: true },
    { category: 'Engine', item: 'Oil level — full, no visible leaks', done: true },
    { category: 'Engine', item: 'DEF level checked — topped off', done: true },
    { category: 'Tires', item: 'All 18 tires — visual, no bulges or cuts', done: true },
    { category: 'Tires', item: 'Steer axle tires — pressure verified 110 psi', done: true },
    { category: 'Coupling', item: 'Fifth wheel locked — pull test confirmed', done: true },
    { category: 'Coupling', item: 'Trailer air lines and electrical connected', done: true },
    { category: 'Cargo', item: '14 bikes secured — tie-down torque checked', done: true },
    { category: 'Cargo', item: 'Parts bins locked and chocked', done: false },
  ]
  const shown = Math.floor(p * (checks.length + 1))
  const completed = checks.filter((c, i) => i < shown && c.done).length
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between" style={{ animation: 'mdFadeIn 0.3s ease-out both' }}>
        <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">DOT Pre-Trip Inspection · Jul 12, 2026</p>
        <span className={`font-mono text-[9px] border px-2 py-0.5 uppercase tracking-widest ${completed >= checks.length ? 'text-lime-400 border-lime-400/30 bg-lime-400/5' : 'text-amber-400 border-amber-400/30 bg-amber-400/5'}`}>
          {completed} / {checks.length} complete
        </span>
      </div>
      <div className="flex-1 grid grid-cols-1 gap-1.5 overflow-hidden">
        {checks.map((c, i) => (
          <div
            key={c.item}
            className={`flex items-center gap-3 px-3 py-1.5 rounded border transition-all duration-300 ${
              shown > i
                ? c.done ? 'border-zinc-800 bg-zinc-900/40 opacity-100' : 'border-amber-400/30 bg-amber-400/5 opacity-100'
                : 'border-transparent opacity-0'
            }`}
          >
            {shown > i ? (
              c.done
                ? <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0" />
                : <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-zinc-800 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs truncate ${shown > i ? (c.done ? 'text-zinc-300' : 'text-amber-300 font-bold') : 'text-zinc-700'}`}>{c.item}</p>
            </div>
            <span className="font-mono text-[9px] text-zinc-700 shrink-0">{c.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FactoryAct3({ p }: { p: number }) {
  const show1 = p > 0.05, show2 = p > 0.35, show3 = p > 0.65
  const stops = [
    { location: 'Yamaha Factory — Corona, CA', time: 'Load out 0600', type: 'Origin', status: 'complete' },
    { location: 'Fuel ��� Barstow, CA', time: '0840 est', type: 'Fuel Stop', status: 'upcoming', note: '340 mi · DEF top-off here' },
    { location: 'Honda Center — Anaheim, CA', time: '1130 est', type: 'Destination', status: 'upcoming', note: 'Pit access opens 1200 · Gate B' },
  ]
  return (
    <div className="h-full flex flex-col gap-4">
      <div className={`transition-all duration-500 ${show1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Haul Schedule · Anaheim 1</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-lime-400" style={{ animation: 'mdPulse 1.5s ease-in-out infinite' }} />
            <span className="font-mono text-[9px] text-lime-400 uppercase">En Route</span>
          </div>
        </div>
        <div className="relative flex flex-col gap-2">
          <div className="absolute left-[19px] top-5 bottom-5 w-px bg-zinc-800" />
          {stops.map((s) => (
            <div key={s.location} className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded border flex items-center justify-center shrink-0 ${s.status === 'complete' ? 'bg-lime-400/10 border-lime-400/30' : 'bg-zinc-900 border-zinc-700'}`}>
                {s.type === 'Fuel Stop' ? <Fuel className={`h-4 w-4 ${s.status === 'complete' ? 'text-lime-400' : 'text-zinc-500'}`} /> : <MapPin className={`h-4 w-4 ${s.status === 'complete' ? 'text-lime-400' : 'text-zinc-500'}`} />}
              </div>
              <div className="flex-1 border border-zinc-800 bg-zinc-900/40 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold ${s.status === 'complete' ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>{s.location}</p>
                  <span className="font-mono text-[9px] text-zinc-600 shrink-0 ml-2">{s.time}</span>
                </div>
                {s.note && <p className="font-mono text-[9px] text-zinc-600 mt-0.5">{s.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`grid grid-cols-3 gap-3 transition-all duration-500 ${show2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'ETA Anaheim', value: '11:30', note: 'AM · on schedule', color: 'text-orange-400' },
          { label: 'Miles Remaining', value: '187', note: 'of 340 total', color: 'text-zinc-300' },
          { label: 'Bikes on Board', value: '14', note: 'all secured', color: 'text-lime-400' },
        ].map((s) => (
          <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3 text-center">
            <p className={`text-2xl font-black leading-none ${s.color}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
            <p className="font-mono text-[9px] text-zinc-700 mt-0.5">{s.note}</p>
          </div>
        ))}
      </div>
      {show3 && (
        <div className="border border-orange-400/20 bg-orange-400/5 rounded-lg px-4 py-3" style={{ animation: 'mdRise 0.4s ease-out both' }}>
          <p className="font-mono text-[9px] text-orange-400 uppercase tracking-widest mb-1">Driver Note — Carlos M.</p>
          <p className="text-zinc-300 text-xs leading-relaxed italic">
            &quot;First time running the full rig solo to a stadium race. This platform had everything — the checklist, the DEF reminder, the gate time. I didn&apos;t have to ask anyone anything. Just rolled.&quot;
          </p>
        </div>
      )}
    </div>
  )
}
