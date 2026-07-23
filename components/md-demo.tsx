'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Users, Zap, Pause, Play, BarChart3, Wrench,
  CalendarDays, MapPin, Sparkles, Radio, TrendingUp,
  ShieldCheck, Truck, Activity, Flag, FileText, CheckCircle2,
} from 'lucide-react'
import { SMX_ELITE_PLANS, SMX_ELITE_PLAN_IDS, type SmxElitePlanId } from '@/lib/md-plans'

/* ── Tier display config for the demo ── */
const DEMO_TIERS: {
  id: SmxElitePlanId
  accentBorder: string
  accentBar: string
  accentDot: string
}[] = [
  {
    id: 'smx_team_partner',
    accentBorder: 'border-amber-400',
    accentBar: 'bg-amber-400',
    accentDot: 'bg-amber-400',
  },
  {
    id: 'smx_command_partner',
    accentBorder: 'border-lime-400',
    accentBar: 'bg-lime-400',
    accentDot: 'bg-lime-400',
  },
  {
    id: 'smx_factory_command',
    accentBorder: 'border-red-400',
    accentBar: 'bg-red-400',
    accentDot: 'bg-red-400',
  },
]

/* ── Act labels per tier ── */
const ACT_LABELS: Record<SmxElitePlanId, string[]> = {
  smx_team_partner: ['Rider Roster', 'Setup Delta', 'Race Weekend AI', 'Post-Moto Debrief'],
  smx_command_partner: ['Command Roster', 'Live Race Ops', 'Analyst Console', 'Season Intelligence'],
  smx_factory_command: ['Fleet Dashboard', 'Factory AI', 'Private Data Ops', 'Championship Model'],
}

const TIER_DURATION: Record<SmxElitePlanId, number> = {
  smx_team_partner: 24000,
  smx_command_partner: 24000,
  smx_factory_command: 24000,
}

function getAct(progress: number, acts: number): number {
  return Math.min(Math.floor(progress * acts), acts - 1)
}

/* ── Sidebar nav items per tier ── */
const NAV_ITEMS: Record<SmxElitePlanId, { icon: React.ElementType; label: string }[]> = {
  smx_team_partner: [
    { icon: Users, label: 'Roster' },
    { icon: Wrench, label: 'Setup' },
    { icon: Radio, label: 'Race AI' },
    { icon: FileText, label: 'Debrief' },
  ],
  smx_command_partner: [
    { icon: Users, label: 'Command' },
    { icon: Activity, label: 'Live Ops' },
    { icon: Sparkles, label: 'Analyst' },
    { icon: TrendingUp, label: 'Season' },
  ],
  smx_factory_command: [
    { icon: Truck, label: 'Fleet' },
    { icon: Zap, label: 'Factory AI' },
    { icon: ShieldCheck, label: 'Private Ops' },
    { icon: Flag, label: 'Championship' },
  ],
}

export default function MdDemo() {
  const [activeTier, setActiveTier] = useState<SmxElitePlanId>('smx_command_partner')
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(true)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  const demoTier = DEMO_TIERS.find((t) => t.id === activeTier)!
  const plan = SMX_ELITE_PLANS[activeTier]

  const goToTier = useCallback((id: SmxElitePlanId) => {
    setActiveTier(id)
    setProgress(0)
    startRef.current = null
  }, [])

  useEffect(() => {
    if (!playing) return
    const duration = TIER_DURATION[activeTier]
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      if (p >= 1) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        startRef.current = null
        const idx = SMX_ELITE_PLAN_IDS.indexOf(activeTier)
        const next = SMX_ELITE_PLAN_IDS[(idx + 1) % SMX_ELITE_PLAN_IDS.length]
        setActiveTier(next)
        setProgress(0)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [activeTier, playing])

  const actLabels = ACT_LABELS[activeTier]
  const actCount = actLabels.length
  const currentAct = getAct(progress, actCount)
  const actProgress = (progress * actCount) - currentAct

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
            // smx-2027-command-center
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            The SMX 2027{' '}
            <span className="text-lime-400">Command Center. Live.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Three elite programs. Each act below is a real workflow your crew chief, analyst, or engineering team runs every race weekend — Anaheim through Las Vegas.
          </p>
        </div>

        {/* Tier selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8">
          {DEMO_TIERS.map((t) => {
            const p = SMX_ELITE_PLANS[t.id]
            const isActive = t.id === activeTier
            return (
              <button
                key={t.id}
                onClick={() => goToTier(t.id)}
                className={`relative w-full flex flex-col gap-1 p-4 border text-left transition-all ${
                  isActive
                    ? `${t.accentBorder} ${p.accentBg}`
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-px left-0 right-0 h-px bg-lime-400" />
                )}
                <span
                  className={`uppercase leading-none text-xl ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`}
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
                >
                  {p.label}
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-widest ${isActive ? p.accentText : 'text-zinc-700'}`}>
                  ${p.monthlyPrice.toLocaleString()}/mo &middot; ${p.seasonTotal.toLocaleString()} season
                </span>
                {/* Progress bar */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800 overflow-hidden">
                    <span
                      className={`block h-full transition-none ${t.accentBar}`}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className={`font-mono text-xs uppercase tracking-widest ${plan.accentText}`}>
              {plan.who}
            </p>
            <div className="flex items-center gap-1">
              {actLabels.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i === currentAct
                      ? `${demoTier.accentDot} scale-125`
                      : i < currentAct ? 'bg-zinc-700' : 'bg-zinc-800'
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
          {/* Tab bar */}
          <div className="flex items-center gap-3 px-4 h-11 border-b border-zinc-800 bg-zinc-950/80">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
              <span className="h-3 w-3 rounded-full bg-zinc-700" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 h-6 px-3 rounded-md bg-zinc-900 border border-zinc-800 min-w-[260px] max-w-xs">
                <span className={`h-2 w-2 rounded-full ${demoTier.accentDot}`} />
                <span className="font-mono text-[11px] text-zinc-500 truncate">
                  motorsportsdata.io/command · {actLabels[currentAct]}
                </span>
              </div>
            </div>
            <div className={`h-5 px-2 border font-mono text-[9px] uppercase tracking-widest flex items-center gap-1 ${demoTier.accentBorder} ${plan.accentText}`}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'currentColor' }} />
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
                    {plan.label}
                  </span>
                </div>
                {NAV_ITEMS[activeTier].map((item, i) => {
                  const Icon = item.icon
                  const isActive = i === currentAct
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-2 py-1.5 transition-all duration-300 ${
                        isActive ? `${plan.accentBg} ${plan.accentText}` : i < currentAct ? 'text-zinc-500' : 'text-zinc-700'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden md:block text-xs font-semibold truncate">{item.label}</span>
                      {isActive && (
                        <span
                          className={`ml-auto h-1.5 w-1.5 rounded-full hidden md:block ${demoTier.accentDot}`}
                          style={{ animation: 'mdPulse 1.5s ease-in-out infinite' }}
                        />
                      )}
                    </div>
                  )
                })}
              </aside>

              {/* Content pane */}
              <div key={`${activeTier}-${currentAct}`} className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 h-10 px-4 border-b border-zinc-800 bg-zinc-900/40 shrink-0">
                  <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border ${demoTier.accentBorder} ${plan.accentBg} ${plan.accentText}`}>
                    {plan.label}
                  </span>
                  <span
                    className="text-zinc-200 text-sm uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800 }}
                  >
                    {actLabels[currentAct]}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    {actLabels.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          i === currentAct ? demoTier.accentBar : i < currentAct ? 'bg-zinc-600' : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-0 p-4 md:p-6 overflow-hidden">
                  {activeTier === 'smx_team_partner' && (
                    <SceneTeamPartner act={currentAct} actProgress={actProgress} />
                  )}
                  {activeTier === 'smx_command_partner' && (
                    <SceneCommandPartner act={currentAct} actProgress={actProgress} />
                  )}
                  {activeTier === 'smx_factory_command' && (
                    <SceneFactoryCommand act={currentAct} actProgress={actProgress} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center font-mono text-[11px] text-zinc-600 uppercase tracking-widest mt-5">
          Auto-cycles through all 3 programs &middot; click any tab to explore &middot; 4 acts per program
        </p>
      </div>

      <style>{`
        @keyframes mdRise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes mdFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes mdBarGrow { from { width:0 !important; } }
        @keyframes mdBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes mdPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════
   SCENE: TEAM PARTNER — 4 acts
   Act 0: Rider Roster with lap delta + readiness
   Act 1: Setup Delta — this round vs. last round
   Act 2: Race Weekend AI — crew chief live chat
   Act 3: Post-Moto Debrief — auto-generated
══════════════════════════════════════════════════════════ */
function SceneTeamPartner({ act, actProgress: p }: { act: number; actProgress: number }) {
  const show = p > 0.15

  if (act === 0) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-amber-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Rider Roster · SMX 2027 Round 4 — Glendale</p>
        </div>
        {[
          { name: 'Chase Harmon', num: '#21', class: '450 SX', last: '1:02.4', delta: '-0.8s', ready: 97, status: 'Race Ready' },
          { name: 'Tyler Marsh', num: '#44', class: '250 SX', last: '1:08.1', delta: '-1.4s', ready: 91, status: 'Race Ready' },
          { name: 'Kyle Reyes', num: '#7', class: '450 SX', last: '1:03.9', delta: '+0.3s', status: 'Monitor', ready: 74 },
        ].map((r) => (
          <div key={r.num} className="border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-zinc-100 text-sm font-bold">{r.name}</span>
                <span className="font-mono text-xs text-zinc-600 ml-2">{r.num} · {r.class}</span>
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${r.status === 'Race Ready' ? 'border-amber-400/40 text-amber-400 bg-amber-400/5' : 'border-zinc-700 text-zinc-500'}`}>
                {r.status}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-mono text-[10px] text-zinc-600 uppercase">Last lap</p>
                <p className="text-amber-400 text-sm font-bold">{r.last}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-zinc-600 uppercase">Delta</p>
                <p className={`text-sm font-bold font-mono ${r.delta.startsWith('-') ? 'text-lime-400' : 'text-red-400'}`}>{r.delta}</p>
              </div>
              <div className="flex-1">
                <p className="font-mono text-[10px] text-zinc-600 uppercase mb-1">Readiness</p>
                <div className="h-1.5 bg-zinc-800 w-full">
                  <div className="h-full bg-amber-400" style={{ width: `${r.ready}%`, animation: 'mdBarGrow 0.8s ease-out both' }} />
                </div>
              </div>
              <p className="font-mono text-xs text-amber-400 font-bold">{r.ready}%</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (act === 1) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="h-4 w-4 text-amber-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Setup Delta · R4 Glendale vs R3 Anaheim</p>
        </div>
        <div className="space-y-2">
          {[
            { param: 'Front Comp', r3: '12 clicks', r4: '10 clicks', flag: 'Adjusted', rider: 'Chase #21' },
            { param: 'Rear Rebound', r3: '9 clicks', r4: '9 clicks', flag: 'Unchanged', rider: 'All' },
            { param: 'Sag', r3: '105mm', r4: '103mm', flag: 'Adjusted', rider: 'Kyle #7' },
            { param: 'Tire Pressure (F)', r3: '12.0 psi', r4: '12.4 psi', flag: 'Adjusted', rider: 'Tyler #44' },
            { param: 'Bar Height', r3: '+3mm', r4: '+5mm', flag: 'Adjusted', rider: 'Chase #21' },
          ].map((s) => (
            <div key={s.param} className="border border-zinc-800 bg-zinc-900/40 p-3 grid grid-cols-4 gap-2 text-sm items-center">
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wide">{s.param}</p>
              <p className="text-zinc-500 font-mono text-xs">{s.r3}</p>
              <p className="text-amber-400 font-bold font-mono text-xs">{s.r4}</p>
              <span className={`font-mono text-[9px] uppercase tracking-widest justify-self-end ${s.flag === 'Adjusted' ? 'text-amber-400' : 'text-zinc-700'}`}>{s.flag}</span>
            </div>
          ))}
        </div>
        {p > 0.6 && (
          <div className="border border-lime-400/20 bg-lime-400/5 p-3" style={{ animation: 'mdRise 0.4s ease-out both' }}>
            <p className="text-zinc-300 text-sm"><span className="text-lime-400 font-bold">AI Note:</span> Glendale hard pack favors lower front comp. Chase&apos;s R4 setup mirrors his fastest ever lap at indoor supercross.</p>
          </div>
        )}
      </div>
    )
  }

  if (act === 2) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Radio className="h-4 w-4 text-lime-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Race Weekend AI · Crew Chief Console · Live</p>
          <span className="ml-auto font-mono text-[9px] text-lime-400 uppercase" style={{ animation: 'mdBlink 1.2s ease-in-out infinite' }}>● Live</span>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {[
            { role: 'CREW CHIEF', text: 'What were Chase\'s best sectors last year on a hard pack track?', accent: 'text-zinc-400' },
            { role: 'MD AI', text: 'Chase\'s best hard pack splits: S1 22.1s (Glendale 2026), S2 18.4s (Atlanta 2026). Recommend targeting S1 < 22.0s tonight based on current setup.', accent: 'text-lime-400' },
            { role: 'CREW CHIEF', text: 'Kyle is reporting arm pump. Any correlation to suspension?', accent: 'text-zinc-400' },
            { role: 'MD AI', text: 'Yes — R3 data shows Kyle\'s arm pump events correlate with high rear rebound in braking zones. Reducing rear rebound 1 click resolved it at Houston 2025.', accent: 'text-lime-400' },
          ].map((msg, i) => (
            <div key={i} className={`border border-zinc-800 bg-zinc-900/40 p-3 ${i > 1 && p < 0.7 ? 'opacity-0' : ''}`} style={i > 1 ? { animation: 'mdRise 0.4s ease-out both' } : {}}>
              <p className={`font-mono text-[9px] uppercase tracking-widest mb-1 ${msg.accent}`}>{msg.role}</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Act 3 — Post-Moto Debrief
  return (
    <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-amber-400" />
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Post-Moto Debrief · Moto 1 · Auto-Generated</p>
      </div>
      <div className="border border-amber-400/20 bg-amber-400/5 p-4">
        <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-3">Chase Harmon #21 — 450 SX · Moto 1 Result: P3</p>
        <div className="space-y-2">
          {[
            { label: 'Best Lap', value: '1:01.8', note: 'Lap 7 — new season best' },
            { label: 'Avg Lap', value: '1:02.6', note: '+0.8s off best pace' },
            { label: 'Start Position', value: 'P7', note: 'Gained 4 positions by Lap 3' },
            { label: 'Peak Speed', value: '61.4 mph', note: 'Main straight, Lap 7' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-zinc-800/60">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">{s.label}</span>
              <div className="text-right">
                <span className="text-amber-400 font-bold text-sm">{s.value}</span>
                <span className="font-mono text-[10px] text-zinc-600 ml-2">{s.note}</span>
              </div>
            </div>
          ))}
        </div>
        {p > 0.6 && (
          <div className="mt-3 pt-3 border-t border-amber-400/20" style={{ animation: 'mdRise 0.4s ease-out both' }}>
            <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-1">AI Recommendation</p>
            <p className="text-zinc-300 text-sm">Chase consistently loses time in the rhythm section (S2). Front comp at 10 clicks limited absorption on square-edge. Suggest returning to 11 clicks for Moto 2.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   SCENE: COMMAND PARTNER — 4 acts
   Act 0: Command Roster — multi-rider full program view
   Act 1: Live Race Ops — rig active, analyst notes
   Act 2: Analyst Console — dedicated analyst workflow
   Act 3: Season Intelligence — cross-round trending
══════════════════════════════════════════════════════════ */
function SceneCommandPartner({ act, actProgress: p }: { act: number; actProgress: number }) {
  const show = p > 0.15

  if (act === 0) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-lime-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Command Roster · 6 Riders · Round 8 — Oakland</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Chase Harmon', num: '#21', class: '450 SX', pts: 142, pos: 'P2', trend: '↑' },
            { name: 'Tyler Marsh', num: '#44', class: '250 SX', pts: 118, pos: 'P4', trend: '↑' },
            { name: 'Kyle Reyes', num: '#7', class: '450 SX', pts: 98, pos: 'P6', trend: '→' },
            { name: 'Austin Forde', num: '#55', class: '250 SX', pts: 87, pos: 'P8', trend: '↑' },
            { name: 'Dean Park', num: '#18', class: '450 SX', pts: 74, pos: 'P10', trend: '↓' },
            { name: 'Nico Vera', num: '#31', class: '250 SX', pts: 61, pos: 'P13', trend: '↑' },
          ].map((r) => (
            <div key={r.num} className="border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="flex items-center justify-between">
                <p className="text-zinc-200 text-sm font-bold truncate">{r.name}</p>
                <span className="font-mono text-[10px] text-lime-400">{r.trend}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-[10px] text-zinc-600">{r.num} · {r.class}</span>
                <span className="font-mono text-xs text-zinc-400 font-bold">{r.pts} pts</span>
                <span className="font-mono text-[10px] text-lime-400">{r.pos}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (act === 1) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-lime-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Command Rig · Live Race Ops · Oakland Round 8</p>
          <span className="ml-auto font-mono text-[9px] text-lime-400 uppercase tracking-widest" style={{ animation: 'mdBlink 1.2s ease-in-out infinite' }}>● Rig Active</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'Riders On Track', value: '6', accent: 'text-lime-400' },
            { label: 'Active Queries', value: '12', accent: 'text-amber-400' },
            { label: 'AI Responses', value: '47', accent: 'text-lime-400' },
          ].map((s) => (
            <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 p-3 text-center">
              <p className={`text-2xl font-black ${s.accent}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { time: '20:14:32', rider: 'Chase #21', note: 'Setup lock confirmed. Front comp at 10. Go.' },
            { time: '20:15:01', rider: 'Tyler #44', note: 'Lap delta improved 0.6s vs. R7. Pace is there.' },
            { time: '20:15:44', rider: 'Kyle #7', note: 'Flag arm pump risk. Reduce rear rebound 1 click before Moto 2.' },
          ].map((e) => (
            <div key={e.time} className="border border-zinc-800 bg-zinc-900/40 p-2 flex items-start gap-3">
              <span className="font-mono text-[10px] text-zinc-600 shrink-0 mt-0.5">{e.time}</span>
              <div>
                <span className="font-mono text-[10px] text-lime-400 font-bold">{e.rider}</span>
                <p className="text-zinc-300 text-xs mt-0.5">{e.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (act === 2) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-lime-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Analyst Console · MD Command Partner Analyst</p>
        </div>
        <div className="border border-lime-400/20 bg-lime-400/5 p-4 mb-3">
          <p className="font-mono text-[10px] text-lime-400 uppercase tracking-widest mb-2">Analyst — Round 8 Oakland</p>
          <p className="text-zinc-300 text-sm leading-relaxed">Working from the rig. Chase&apos;s S2 rhythm section time has improved 0.4s from R5→R8 with the new front comp tune. Kyle&apos;s arm pump window is Laps 6–9. We have a moto 2 fix locked.</p>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Sessions Analyzed', value: '48' },
            { label: 'Setup Changes Logged', value: '23' },
            { label: 'AI Recommendations', value: '61', highlight: true },
            { label: 'Rounds Remaining', value: '9' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">{s.label}</span>
              <span className={`font-bold text-sm ${s.highlight ? 'text-lime-400' : 'text-zinc-300'}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Act 3 — Season Intelligence
  return (
    <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-lime-400" />
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Season Intelligence · R1–R8 Trending</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Chase Avg Lap Improvement', value: '-1.2s', note: 'vs. R1 baseline', good: true },
          { label: 'Tyler Points Trajectory', value: 'P4 → P2', note: 'projected by R13', good: true },
          { label: 'Kyle Arm Pump Events', value: '-3', note: 'rounds since fix', good: true },
          { label: 'Team Points Lead', value: '+47 pts', note: 'vs. 2nd place team', good: true },
        ].map((s) => (
          <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 p-3">
            <p className={`text-xl font-black ${s.good ? 'text-lime-400' : 'text-red-400'}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-1">{s.label}</p>
            <p className="font-mono text-[9px] text-zinc-700 mt-0.5">{s.note}</p>
          </div>
        ))}
      </div>
      {p > 0.6 && (
        <div className="border border-lime-400/20 bg-lime-400/5 p-3" style={{ animation: 'mdRise 0.4s ease-out both' }}>
          <p className="text-zinc-300 text-sm"><span className="text-lime-400 font-bold">AI Projection:</span> If current lap delta trend holds, Chase is on pace for a championship challenge in the final 4 rounds.</p>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   SCENE: FACTORY COMMAND — 4 acts
   Act 0: Fleet Dashboard — all bikes, all programs
   Act 1: Factory AI — manufacturer R&D data layer
   Act 2: Private Data Ops — air-gapped infrastructure
   Act 3: Championship Model — points + scenario engine
══════════════════════════════════════════════════════════ */
function SceneFactoryCommand({ act, actProgress: p }: { act: number; actProgress: number }) {
  const show = p > 0.15

  if (act === 0) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Truck className="h-4 w-4 text-red-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Fleet Dashboard · 3 Programs · 11 Riders</p>
        </div>
        <div className="space-y-2">
          {[
            { program: '450 SX Factory', riders: 4, bikes: 8, status: 'Race Active', rounds: 'R1–R17', accent: 'border-red-400/40 text-red-400' },
            { program: '250 SX East', riders: 4, bikes: 6, status: 'Race Active', rounds: 'R1–R8', accent: 'border-red-400/40 text-red-400' },
            { program: '250 SX West', riders: 3, bikes: 5, status: 'Race Active', rounds: 'R1–R9', accent: 'border-red-400/40 text-red-400' },
          ].map((prog) => (
            <div key={prog.program} className={`border ${prog.accent.split(' ')[0]} bg-red-400/5 p-3`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`font-bold text-sm ${prog.accent.split(' ')[1]}`}>{prog.program}</p>
                <span className="font-mono text-[9px] text-zinc-600 uppercase">{prog.status}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-xs text-zinc-400">{prog.riders} Riders</span>
                <span className="font-mono text-xs text-zinc-400">{prog.bikes} Bikes</span>
                <span className="font-mono text-xs text-zinc-600">{prog.rounds}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[
            { label: 'Total Laps', value: '2,847' },
            { label: 'Setup Logs', value: '341' },
            { label: 'AI Queries', value: '1,204' },
          ].map((s) => (
            <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 p-2 text-center">
              <p className="text-red-400 text-lg font-black" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (act === 1) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-red-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Factory AI · Manufacturer R&D Data Layer</p>
        </div>
        <div className="border border-red-400/20 bg-red-400/5 p-4">
          <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-3">Active R&D Program · SMX 2027</p>
          <div className="space-y-3">
            {[
              { query: 'Frame flex correlation to lap delta — all 450 riders, R1–R8', result: 'High flex programs 12ms slower in S1. Stiffer builds trending +0.3s/lap across 2,100 data points.' },
              { query: 'Suspension valve data — hard pack vs. soft terrain split', result: 'Glendale/Oakland (hard) favor -2 front comp vs. Atlanta/Houston (soft). Confirmed across 3 programs.' },
            ].map((item, i) => (
              <div key={i} className="border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="font-mono text-[10px] text-zinc-500 mb-1">QUERY</p>
                <p className="text-zinc-300 text-xs mb-2">{item.query}</p>
                <p className="font-mono text-[10px] text-red-400 mb-1">RESULT</p>
                <p className="text-zinc-400 text-xs">{item.result}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (act === 2) {
    return (
      <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-red-400" />
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Private Data Ops · Air-Gapped Infrastructure</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Data Isolation', value: 'Active', note: 'Air-gapped from all other teams', ok: true },
            { label: 'Encryption', value: 'AES-256', note: 'At rest + in transit', ok: true },
            { label: 'Data Ownership', value: '100% Yours', note: 'Full export on request', ok: true },
            { label: 'Third-Party Access', value: 'None', note: 'Never shared, never sold', ok: true },
          ].map((s) => (
            <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-3 w-3 text-lime-400 shrink-0" />
                <p className="text-lime-400 text-sm font-bold">{s.value}</p>
              </div>
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{s.label}</p>
              <p className="font-mono text-[9px] text-zinc-700 mt-0.5">{s.note}</p>
            </div>
          ))}
        </div>
        {p > 0.6 && (
          <div className="border border-red-400/20 bg-red-400/5 p-3" style={{ animation: 'mdRise 0.4s ease-out both' }}>
            <p className="text-zinc-300 text-sm"><span className="text-red-400 font-bold">Manufacturer Note:</span> All R&D query results, setup data, and telemetry remain proprietary to your program. No competitive intelligence leaves your account.</p>
          </div>
        )}
      </div>
    )
  }

  // Act 3 — Championship Model
  return (
    <div className={`h-full flex flex-col gap-4 transition-all duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Flag className="h-4 w-4 text-red-400" />
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Championship Model · Points Scenario Engine</p>
      </div>
      <div className="border border-red-400/20 bg-red-400/5 p-4 mb-3">
        <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-3">450 SX Championship — R8 of 17</p>
        <div className="space-y-2">
          {[
            { rider: 'Chase Harmon #21', pts: 142, gap: 'Leader', proj: 'P1 if pace holds' },
            { rider: 'J. Barcia #51', pts: 138, gap: '-4', proj: 'Championship contender' },
            { rider: 'T. Canard #41', pts: 127, gap: '-15', proj: 'Must win next 3' },
          ].map((r) => (
            <div key={r.rider} className="flex items-center justify-between py-1.5 border-b border-red-400/10">
              <div>
                <p className="text-zinc-200 text-sm font-bold">{r.rider}</p>
                <p className="font-mono text-[9px] text-zinc-600 mt-0.5">{r.proj}</p>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-black text-lg" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{r.pts}</p>
                <p className="font-mono text-[9px] text-zinc-600">{r.gap}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {p > 0.5 && (
        <div className="border border-lime-400/20 bg-lime-400/5 p-3" style={{ animation: 'mdRise 0.4s ease-out both' }}>
          <p className="text-zinc-300 text-sm"><span className="text-lime-400 font-bold">Scenario:</span> Chase needs avg P2 or better in R9–R12 to clinch before Las Vegas Final. Current pace puts that at 73% probability.</p>
        </div>
      )}
    </div>
  )
}
