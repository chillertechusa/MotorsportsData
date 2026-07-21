'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle, Play, ArrowRight, Shield, Lock, Radio,
  Activity, TrendingUp, HeartPulse, Brain, ClipboardList,
  Wrench, Truck, Globe, Timer, CheckSquare, Star, AlertCircle,
  Users, Trophy, Zap, Cpu, Code2, BarChart3, Gauge, Clock,
  ChevronUp, ChevronDown, Wifi, Video, BookOpen,
  Package, Calendar, Bike, Target, Database,
  ChevronRight, Layers,
} from 'lucide-react'
import { TelemetryWaveform } from '@/components/data/telemetry-waveform'
import {
  DEMO_TRAINING_LOG,
  DEMO_BIOMETRIC_LOG,
  DEMO_READINESS_PROGRESSION,
  DEMO_COACH_TEMPLATES,
  DEMO_MULTI_RIDER_TELEMETRY,
} from '@/lib/md-demo-data'

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = ((ms % 60000) / 1000).toFixed(3).padStart(6, '0')
  return `${m}:${s}`
}

// ── Reusable primitives ───────────────────────────────────────────────────────
function SectionDivider({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px flex-1 bg-zinc-800" />
      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest px-3 shrink-0">
        {index} / {label}
      </p>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>
  )
}

function Block({ accent = 'border-zinc-700', children }: { accent?: string; children: React.ReactNode }) {
  return (
    <div className={`border-l-4 ${accent} bg-zinc-900 border border-zinc-800 p-6 md:p-8`}>
      {children}
    </div>
  )
}

function BlockHeader({ tag, tagColor, title, sub, cta, ctaHref }: {
  tag: string; tagColor: string; title: string; sub: string
  cta?: string; ctaHref?: string
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">
      <div className="max-w-2xl">
        <p className={`font-mono text-[10px] uppercase tracking-widest mb-1.5 ${tagColor}`}>{tag}</p>
        <h2 className="text-2xl md:text-3xl font-black uppercase text-zinc-50 leading-tight" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{title}</h2>
        <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{sub}</p>
      </div>
      {cta && ctaHref && (
        <Link href={ctaHref} className="shrink-0 self-start flex items-center gap-2 px-5 py-2.5 bg-lime-400 text-zinc-950 text-[11px] font-black uppercase tracking-widest hover:bg-lime-300 transition-colors font-mono">
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

function StatGrid({ stats }: { stats: { label: string; value: string; color: string }[] }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-px bg-zinc-800 mb-6`}>
      {stats.map(s => (
        <div key={s.label} className="bg-zinc-950 px-4 py-3">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
          <p className={`text-2xl font-black leading-none ${s.color}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function TerminalRow({ label, value, accent = 'text-zinc-300', badge }: { label: string; value: string; accent?: string; badge?: { text: string; color: string } }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800/60 last:border-0">
      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest w-32 shrink-0">{label}</span>
      <span className={`font-mono text-xs flex-1 ${accent}`}>{value}</span>
      {badge && <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase shrink-0 ${badge.color}`}>{badge.text}</span>}
    </div>
  )
}

function PanelHeader({ icon: Icon, label, color = 'text-zinc-400', right }: { icon: any; label: string; color?: string; right?: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">{label}</span>
      </div>
      {right}
    </div>
  )
}

// ── SECTIONS config ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'training',      label: 'Training Log' },
  { id: 'readiness',     label: 'Readiness / HRV' },
  { id: 'sessions',      label: 'Session Compare' },
  { id: 'setup-ai',      label: 'Setup AI' },
  { id: 'telemetry',     label: 'Live Telemetry' },
  { id: 'multi-rider',   label: 'Multi-Rider Overlay' },
  { id: 'mechanic',      label: 'Work Orders' },
  { id: 'part-vault',    label: 'Part Vault' },
  { id: 'mental',        label: 'Mental Log' },
  { id: 'injury',        label: 'Injury Log' },
  { id: 'schedule',      label: 'Race Schedule' },
  { id: 'standings',     label: 'Standings' },
  { id: 'accountability',label: 'Accountability' },
  { id: 'spec-book',     label: 'Spec Book' },
  { id: 'video',         label: 'Video Analysis' },
  { id: 'ip-vault',      label: 'Coach IP Vault' },
  { id: 'multiplayer',   label: 'Multiplayer' },
  { id: 'factory-rig',   label: 'Factory Rig' },
  { id: 'devices',       label: 'Devices' },
  { id: 'pwa',           label: 'Offline / PWA' },
  { id: 'owner',         label: 'Owner Analytics' },
  { id: 'api',           label: 'API Marketplace' },
  { id: 'discipline',    label: 'Disciplines' },
  { id: 'gear',          label: 'Gear Locker' },
  { id: 'plans',         label: 'Plans' },
]

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [activeSection, setActiveSection] = useState(0)
  const [lapTick, setLapTick] = useState(0)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setLapTick(p => p + 1)
      if (Math.random() > 0.65) setAlertCount(p => Math.min(p + 1, 5))
    }, 2600)
    return () => clearInterval(t)
  }, [])

  const hrData = DEMO_TRAINING_LOG.map((l, i) => ({ timestamp: i, heartRate: l.heartRateAvg }))
  const volData = DEMO_TRAINING_LOG.map((l, i) => ({ timestamp: i, heartRate: l.volume }))
  const readinessData = DEMO_READINESS_PROGRESSION.map((r, i) => ({ timestamp: i, heartRate: r.score }))
  const hrvData = DEMO_BIOMETRIC_LOG.map((b, i) => ({ timestamp: i, heartRate: b.hrv }))
  const bestLap = Math.min(...DEMO_MULTI_RIDER_TELEMETRY.map(r => Math.min(...r.laps.map(l => l.lapTime))))

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* ── Sticky header ── */}
      <div className="border-b border-zinc-800 bg-zinc-950/98 backdrop-blur-md sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-mono text-[9px] text-lime-400 uppercase tracking-widest">// platform demo</p>
            <h1 className="text-base font-black uppercase text-zinc-50 leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
              25 Features. All Live. No Filler.
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-green-950/60 border border-green-800/60 text-green-400 font-mono text-[10px] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> Live
            </span>
            <Link href="/data/pricing" className="flex items-center gap-1.5 px-4 py-2 bg-lime-400 text-zinc-950 text-[11px] font-black uppercase tracking-widest hover:bg-lime-300 transition-colors font-mono">
              Get Started <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        {/* Quick-jump rail */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-px border-t border-zinc-800/60 px-4 min-w-max">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(i)
                  document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`px-3 py-2 font-mono text-[9px] uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                  activeSection === i ? 'text-lime-400 border-lime-400' : 'text-zinc-600 border-transparent hover:text-zinc-300'
                }`}
              >
                {String(i + 1).padStart(2, '0')} {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">

        {/* ─────────────────────────────────────────────────────────────────────
            01 — TRAINING LOG
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-training">
          <SectionDivider index="01" label="training-log" />
          <Block accent="border-red-500">
            <BlockHeader
              tag="Fitness Tracker — All Tiers"
              tagColor="text-red-400"
              title="Every ride. Every moto. Every gym session. Logged and correlated with lap times."
              sub="The only fitness tracker that knows what lap times mean. Log HR, volume, training type, and notes. MD fuses training load with race-day outcomes to show what's actually working."
            />
            <StatGrid stats={[
              { label: 'Sessions', value: '14', color: 'text-red-400' },
              { label: 'Peak HR', value: '194 bpm', color: 'text-zinc-100' },
              { label: 'Race Days', value: '2', color: 'text-amber-400' },
              { label: 'Compliance', value: '96%', color: 'text-lime-400' },
            ]} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={Activity} label="Heart Rate — Build → Taper → Race" color="text-red-400" />
                <div className="p-4"><TelemetryWaveform data={hrData} metric="heartRate" color="#ef4444" label="HR bpm" /></div>
              </div>
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={TrendingUp} label="Training Volume — Progressive Overload → Peak" color="text-lime-400" />
                <div className="p-4"><TelemetryWaveform data={volData} metric="heartRate" color="#a3e635" label="Volume" /></div>
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 overflow-x-auto">
              <PanelHeader icon={ClipboardList} label="Recent Sessions" color="text-zinc-400" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Date', 'Day', 'Volume', 'Avg HR', 'Peak HR', 'Assignment', 'Status'].map(h => (
                      <th key={h} className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left px-4 py-2 first:pl-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {DEMO_TRAINING_LOG.slice(0, 7).map(l => (
                    <tr key={l.date} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{l.date}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300 uppercase">{l.day}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{l.volume}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-red-400">{l.heartRateAvg} bpm</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{l.heartRateMax} bpm</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400 max-w-xs truncate">{l.assignment}</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase ${l.completed ? 'text-lime-400 border-lime-400/40' : 'text-zinc-500 border-zinc-700'}`}>
                          {l.completed ? 'Done' : 'Missed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            02 — READINESS SCORE + HRV
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-readiness">
          <SectionDivider index="02" label="readiness-score-+-hrv" />
          <Block accent="border-sky-400">
            <BlockHeader
              tag="Readiness Engine — Privateer+"
              tagColor="text-sky-400"
              title="Know if you're actually ready before gate drop. Not a guess — a score."
              sub="Sleep quality, HRV trend, and resting HR fused into a single 0–100 readiness score. Tapering protocol adjusts your training load in the final week so you peak exactly on race day."
            />
            <StatGrid stats={[
              { label: 'Race-Day Score', value: '100 / 100', color: 'text-lime-400' },
              { label: 'Peak HRV', value: '65 ms', color: 'text-sky-400' },
              { label: 'Avg Sleep', value: '7.9 h', color: 'text-zinc-100' },
              { label: 'Confidence', value: '96%', color: 'text-amber-400' },
            ]} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={Star} label="Readiness 0–100 — Peaks race day" color="text-sky-400" />
                <div className="p-4"><TelemetryWaveform data={readinessData} metric="heartRate" color="#38bdf8" label="Readiness" /></div>
              </div>
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={HeartPulse} label="HRV Trend — Morning baseline" color="text-purple-400" />
                <div className="p-4"><TelemetryWaveform data={hrvData} metric="heartRate" color="#a855f7" label="HRV ms" /></div>
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 overflow-x-auto">
              <PanelHeader icon={BarChart3} label="Biometric Log + Readiness Score" color="text-zinc-400" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Date', 'Sleep', 'HRV', 'RHR', 'Readiness', 'Confidence'].map(h => (
                      <th key={h} className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {DEMO_BIOMETRIC_LOG.map((b, i) => {
                    const r = DEMO_READINESS_PROGRESSION[i]
                    const isRace = b.date === '2026-07-19'
                    return (
                      <tr key={b.date} className={isRace ? 'bg-lime-400/5' : 'hover:bg-zinc-800/30'}>
                        <td className={`px-4 py-2.5 font-mono text-xs ${isRace ? 'text-lime-400 font-bold' : 'text-zinc-400'}`}>{isRace ? '★ RACE DAY' : b.date}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{isRace ? '—' : `${b.sleep}h`}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-sky-400">{isRace ? '—' : `${b.hrv}ms`}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{isRace ? '—' : `${b.rhr}`}</td>
                        <td className={`px-4 py-2.5 font-mono text-xs font-bold ${r.score >= 90 ? 'text-lime-400' : r.score >= 80 ? 'text-sky-400' : 'text-zinc-300'}`}>{r.score}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{Math.round(r.confidence * 100)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            03 — SESSION COMPARISON
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-sessions">
          <SectionDivider index="03" label="session-comparison" />
          <Block accent="border-teal-400">
            <BlockHeader
              tag="Session Compare — Privateer+"
              tagColor="text-teal-400"
              title="This lap vs. your best lap. Side-by-side. No guessing what changed."
              sub="Select any two sessions and MD overlays every metric — lap time, heart rate, suspension settings, track conditions, and notes. The diff tells you exactly what moved the needle."
              cta="Open Compare" ctaHref="/data/fleet/session-compare"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Session A — Best Lap', date: '2026-07-14', lapTime: '20:38.221', track: 'Milestone MX', conditions: 'Tacky / 72°F', sag: '104mm', compression: '12 clicks', rebound: '10 clicks', badge: { text: 'Baseline', color: 'text-teal-400 border-teal-400/40' } },
                { label: 'Session B — Race Day', date: '2026-07-19', lapTime: '20:41.882', track: 'Milestone MX', conditions: 'Hard / 89°F', sag: '105mm', compression: '13 clicks', rebound: '11 clicks', badge: { text: 'Current', color: 'text-amber-400 border-amber-400/40' } },
              ].map(s => (
                <div key={s.label} className="border border-zinc-800 bg-zinc-950">
                  <div className="border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">{s.label}</span>
                    <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase ${s.badge.color}`}>{s.badge.text}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {[
                      { k: 'Date', v: s.date },
                      { k: 'Best Lap', v: s.lapTime },
                      { k: 'Track', v: s.track },
                      { k: 'Conditions', v: s.conditions },
                      { k: 'Sag', v: s.sag },
                      { k: 'Compression', v: s.compression },
                      { k: 'Rebound', v: s.rebound },
                    ].map(r => (
                      <div key={r.k} className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{r.k}</span>
                        <span className="font-mono text-xs text-zinc-200">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-4 flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-teal-400 shrink-0" />
              <div>
                <p className="font-mono text-[10px] text-teal-400 uppercase tracking-widest mb-0.5">Delta Analysis</p>
                <p className="text-zinc-300 text-sm">Race day was +3.661s slower. Hard track + 1 click more compression correlates with 87% of the gap. Try returning to 12 clicks on next hard-pack session.</p>
              </div>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            04 — SETUP AI
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-setup-ai">
          <SectionDivider index="04" label="setup-ai-recommender" />
          <Block accent="border-green-400">
            <BlockHeader
              tag="Setup AI — Race Team+"
              tagColor="text-green-400"
              title="Describe what the bike is doing. Get a setup recommendation in seconds."
              sub="AI analyzes your session history, track conditions, and current bike settings to recommend specific click changes. No generic advice — it knows your bike, your rider, and your track."
              cta="Try Setup AI" ctaHref="/data/fleet/setup-ai"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={Brain} label="Rider Input" color="text-green-400" />
                <div className="p-4 space-y-3">
                  <div className="bg-zinc-900 border border-zinc-700 p-3 text-sm text-zinc-300 leading-relaxed">
                    &quot;Bike is washing out in the ruts on the back straightaway. Rear end steps out on exits. Track is hard-pack, about 85°F.&quot;
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { k: 'Track Type', v: 'Hard-pack' },
                      { k: 'Temp', v: '85°F' },
                      { k: 'Current Sag', v: '104mm' },
                      { k: 'Rear Comp', v: '12 clicks' },
                    ].map(r => (
                      <div key={r.k} className="bg-zinc-900 border border-zinc-800 px-3 py-2">
                        <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{r.k}</p>
                        <p className="font-mono text-xs text-zinc-200 mt-0.5">{r.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={Zap} label="AI Recommendation" color="text-lime-400" />
                <div className="p-4 space-y-3">
                  {[
                    { change: 'Rear Compression', from: '12 clicks', to: '14 clicks', reason: 'More high-speed compression dampening to prevent rear pack-down in ruts.' },
                    { change: 'Rear Rebound', from: '10 clicks', to: '11 clicks', reason: 'Slightly slower rebound to prevent snap on corner exits.' },
                    { change: 'Rear Sag', from: '104mm', to: '106mm', reason: 'Unload the rear slightly for better traction on hard-pack.' },
                  ].map(r => (
                    <div key={r.change} className="bg-zinc-900 border border-zinc-800/60 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">{r.change}</span>
                        <span className="font-mono text-xs text-zinc-500">{r.from} <span className="text-lime-400">→ {r.to}</span></span>
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed">{r.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            05 — LIVE RACE-DAY TELEMETRY
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-telemetry">
          <SectionDivider index="05" label="live-race-day-telemetry" />
          <Block accent="border-lime-400">
            <BlockHeader
              tag="Live Coaching — Race Team+"
              tagColor="text-lime-400"
              title="Real-time coaching during the race. Not in the debrief. During."
              sub="Telemetry streams from device to coach in under 500ms. Alert thresholds fire on engine temp, pace drop, brake fade, and fuel level. Coach AI answers questions mid-session with full live context."
              cta="See Live View" ctaHref="/data/live"
            />
            <StatGrid stats={[
              { label: 'Stream Latency', value: '<500ms', color: 'text-lime-400' },
              { label: 'Alert Types', value: '6', color: 'text-amber-400' },
              { label: 'Devices Supported', value: '11+', color: 'text-sky-400' },
              { label: 'AI Response', value: '<2s', color: 'text-zinc-100' },
            ]} />
            <div className="border border-zinc-800 bg-zinc-950 mb-4">
              <div className="border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-lime-400 uppercase tracking-widest">Live lap feed — Rider #221</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">Lap {3 + (lapTick % 5)} / 15</span>
              </div>
              {[
                { offset: 0, lapBase: 3 }, { offset: 1, lapBase: 2 }, { offset: 2, lapBase: 1 },
              ].map(({ offset, lapBase }) => {
                const lap = lapBase + (lapTick % 5)
                const secs = (41 + offset * 3 - lapTick % 4).toString().padStart(2, '0')
                const ms = ((lapTick + offset) * 137 % 999).toString().padStart(3, '0')
                const delta = offset === 0 && lapTick % 4 === 0 ? 'BEST' : `+0.${((lapTick + offset * 300) % 999).toString().padStart(3, '0')}`
                const temp = 97 + offset * 2 + (lapTick % 4)
                return (
                  <div key={offset} className={`flex items-center gap-6 px-4 py-3 border-b border-zinc-800/40 last:border-0 ${offset === 0 ? 'bg-lime-400/5' : ''}`}>
                    <span className="font-mono text-[11px] text-zinc-500 w-8">L{lap}</span>
                    <span className={`font-mono text-sm font-bold tabular-nums ${offset === 0 ? 'text-zinc-100' : 'text-zinc-400'}`}>20:{secs}.{ms}</span>
                    <span className="font-mono text-[11px] text-zinc-500 hidden sm:block">{58 + offset} mph top</span>
                    <span className={`font-mono text-[11px] hidden sm:block ${temp > 100 ? 'text-amber-400' : 'text-zinc-500'}`}>{temp}°C</span>
                    <span className={`font-mono text-[11px] ml-auto font-bold ${delta === 'BEST' ? 'text-lime-400' : 'text-zinc-500'}`}>{delta}</span>
                  </div>
                )
              })}
            </div>
            <div className="border border-zinc-800 bg-zinc-950">
              <PanelHeader icon={AlertCircle} label="Active Alerts" color="text-amber-400"
                right={alertCount > 0 ? <span className="font-mono text-[9px] bg-amber-400/20 text-amber-400 border border-amber-400/40 px-2 py-0.5 uppercase">{alertCount} new</span> : undefined}
              />
              {[
                { type: 'PACE DROP', msg: 'L3 is +0.84s off best. Check rear traction entering turn 4.', badge: 'text-amber-400 border-amber-400/40' },
                { type: 'ENGINE TEMP', msg: `Running ${97 + alertCount}°C — approaching threshold. Monitor coolant.`, badge: 'text-orange-400 border-orange-400/40' },
                { type: 'COACH AI', msg: 'Based on L1–L3: rider is overbraking at T4. Recommend 1 click out rear compression and smooth entry.', badge: 'text-lime-400 border-lime-400/40' },
              ].map(a => (
                <div key={a.type} className="flex items-start gap-3 px-4 py-3 border-b border-zinc-800/40 last:border-0">
                  <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase shrink-0 mt-0.5 ${a.badge}`}>{a.type}</span>
                  <p className="text-zinc-300 text-sm leading-relaxed">{a.msg}</p>
                </div>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            06 — MULTI-RIDER TELEMETRY OVERLAY
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-multi-rider">
          <SectionDivider index="06" label="multi-rider-overlay" />
          <Block accent="border-amber-400">
            <BlockHeader
              tag="Team Telemetry — Race Team+"
              tagColor="text-amber-400"
              title="Every rider on the same screen. Lap-by-lap. No spreadsheets."
              sub="Coach sees who's gapping who, which rider is fading, which setup is working, and which needs a pit call — all without leaving the telemetry view."
              cta="Open Team View" ctaHref="/data/fleet"
            />
            <div className="border border-zinc-800 bg-zinc-950 overflow-x-auto">
              <PanelHeader icon={Users} label="Multi-Rider Lap Comparison" color="text-amber-400" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Rider', 'Lap 1', 'Lap 2', 'Lap 3', 'Best', 'Gap to P1', 'Peak HR', 'Max MPH', 'Peak Power'].map(h => (
                      <th key={h} className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {DEMO_MULTI_RIDER_TELEMETRY.map((rider, i) => {
                    const best = Math.min(...rider.laps.map(l => l.lapTime))
                    const gap = best - bestLap
                    return (
                      <tr key={rider.riderId} className={i === 0 ? 'bg-amber-400/5' : 'hover:bg-zinc-800/30'}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: rider.color }} />
                            <span className="font-bold text-zinc-100">{rider.riderName}</span>
                            {i === 0 && <span className="font-mono text-[9px] text-amber-400 border border-amber-400/40 px-1.5 py-0.5 uppercase">P1</span>}
                          </div>
                        </td>
                        {rider.laps.map(l => (
                          <td key={l.lapNumber} className="px-4 py-3 font-mono text-xs text-zinc-300">{fmt(l.lapTime)}</td>
                        ))}
                        <td className="px-4 py-3 font-mono text-xs font-bold text-amber-400">{fmt(best)}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <span className={gap === 0 ? 'text-lime-400 font-bold' : 'text-zinc-500'}>
                            {gap === 0 ? '—' : `+${(gap / 1000).toFixed(3)}s`}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-red-400">{rider.laps[0].peakHR} bpm</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-300">{rider.laps[0].maxSpeed} mph</td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-300">{rider.laps[0].peakPower}W</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            07 — MECHANIC WORK ORDERS
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-mechanic">
          <SectionDivider index="07" label="mechanic-work-orders-+-portfolio" />
          <Block accent="border-orange-400">
            <BlockHeader
              tag="Wrench Tier — $29/mo"
              tagColor="text-orange-400"
              title="Every setup change logged. Every lap-time result attributed. Your career, proven in data."
              sub="Work orders track bike, job, parts, labor, and outcome. Setup changes are linked to lap time deltas so the mechanic can prove exactly how much they improved the rider."
              cta="See Mechanic Plan" ctaHref="/data/pricing#wrench"
            />
            <StatGrid stats={[
              { label: 'Riders Served', value: '12', color: 'text-orange-400' },
              { label: 'Avg Lap Saving', value: '−0.8s', color: 'text-lime-400' },
              { label: 'Work Orders', value: '234', color: 'text-zinc-100' },
              { label: 'Accuracy', value: '91%', color: 'text-amber-400' },
            ]} />
            <div className="border border-zinc-800 bg-zinc-950 mb-4">
              <PanelHeader icon={ClipboardList} label="Open Work Orders" color="text-orange-400" />
              {[
                { bike: '#221 — 2025 KTM 450 SXF', job: 'Rear shock rebuild + revalve for hard-pack', status: 'IN PROGRESS', labor: '1h 42m', parts: 'Shock fluid, seals', statusColor: 'text-amber-400 border-amber-400/40' },
                { bike: '#7 — 2024 Husqvarna FC 350', job: 'Engine oil + filter, air filter, chain lube', status: 'OPEN', labor: '—', parts: 'Honda HP4 oil, Twin Air filter', statusColor: 'text-zinc-400 border-zinc-700' },
                { bike: '#51 — 2025 Honda CRF 450R', job: 'Front fork setup for sand track — softer spring', status: 'OPEN', labor: '—', parts: '0.46 springs', statusColor: 'text-zinc-400 border-zinc-700' },
                { bike: '#221 — 2025 KTM 450 SXF', job: 'Top end inspection — 35hr service due', status: 'COMPLETE', labor: '3h 10m', parts: 'Piston, rings, head gasket', statusColor: 'text-lime-400 border-lime-400/40' },
              ].map((wo, i) => (
                <div key={i} className="flex flex-wrap items-start gap-4 px-4 py-3 border-b border-zinc-800/40 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 text-sm font-bold truncate">{wo.bike}</p>
                    <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{wo.job}</p>
                    <p className="font-mono text-[10px] text-zinc-600 mt-0.5">Parts: {wo.parts}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {wo.labor !== '—' && <span className="font-mono text-[10px] text-zinc-500"><Clock className="h-3 w-3 inline mr-1" />{wo.labor}</span>}
                    <span className={`font-mono text-[9px] border px-2 py-0.5 uppercase ${wo.statusColor}`}>{wo.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-4">
              <p className="font-mono text-[10px] text-orange-400 uppercase tracking-widest mb-3">Recent Setup Deltas — Optimization Attribution</p>
              {[
                { change: 'Rear comp +2 clicks', lapDelta: '−0.42s', confidence: '88%', sessions: 3 },
                { change: 'Sag 104→106mm', lapDelta: '−0.31s', confidence: '79%', sessions: 2 },
                { change: 'Front fork oil level +5mm', lapDelta: '−0.19s', confidence: '71%', sessions: 2 },
              ].map(d => (
                <div key={d.change} className="flex items-center gap-4 py-2 border-b border-zinc-800/40 last:border-0">
                  <Wrench className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span className="text-zinc-300 text-sm flex-1">{d.change}</span>
                  <span className="font-mono text-xs text-lime-400 font-bold">{d.lapDelta}</span>
                  <span className="font-mono text-[10px] text-zinc-500">{d.sessions} sess.</span>
                  <span className="font-mono text-[10px] text-zinc-500">{d.confidence} conf.</span>
                </div>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            08 — PART VAULT
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-part-vault">
          <SectionDivider index="08" label="part-vault-+-inventory" />
          <Block accent="border-yellow-400">
            <BlockHeader
              tag="All Tiers"
              tagColor="text-yellow-400"
              title="Every part on every bike. Hours tracked. Replacements scheduled."
              sub="Log parts by bike. Track hours on pistons, chains, air filters, and fluids. MD fires replacement alerts before the part fails — not after."
            />
            <div className="border border-zinc-800 bg-zinc-950 overflow-x-auto">
              <PanelHeader icon={Package} label="Part Vault — #221 KTM 450 SXF" color="text-yellow-400" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Part', 'Installed', 'Hours Used', 'Replace At', 'Status'].map(h => (
                      <th key={h} className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    { part: 'Piston + Rings', installed: '2026-06-01', hours: 32, limit: 40, status: 'OK' },
                    { part: 'Air Filter', installed: '2026-07-01', hours: 8, limit: 10, status: 'REPLACE SOON' },
                    { part: 'Engine Oil', installed: '2026-07-08', hours: 4, limit: 5, status: 'REPLACE SOON' },
                    { part: 'Chain', installed: '2026-05-15', hours: 45, limit: 50, status: 'OK' },
                    { part: 'Brake Fluid', installed: '2026-04-01', hours: 80, limit: 80, status: 'OVERDUE' },
                    { part: 'Rear Shock Fluid', installed: '2026-07-12', hours: 2, limit: 30, status: 'OK' },
                  ].map(p => (
                    <tr key={p.part} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-100 font-medium">{p.part}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{p.installed}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{p.hours}h</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{p.limit}h</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase ${
                          p.status === 'OVERDUE' ? 'text-red-400 border-red-400/40' :
                          p.status === 'REPLACE SOON' ? 'text-amber-400 border-amber-400/40' :
                          'text-lime-400 border-lime-400/40'
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            09 — MENTAL LOG
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-mental">
          <SectionDivider index="09" label="mental-log" />
          <Block accent="border-rose-400">
            <BlockHeader
              tag="All Tiers"
              tagColor="text-rose-400"
              title="The mental side of racing is data too. Log it. Track it. Improve it."
              sub="Confidence, focus, anxiety, and post-race mental state tracked over time. AI Mental Coach identifies patterns — does bad sleep crush your confidence? Does track familiarity matter more than fitness?"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={Brain} label="Recent Mental Logs" color="text-rose-400" />
                {[
                  { date: '2026-07-19', event: 'Race Day — Gate drop', confidence: 9, focus: 8, anxiety: 6, note: 'Felt sharp. Slight nerves on main event start.' },
                  { date: '2026-07-18', event: 'Race Eve — Practice', confidence: 8, focus: 9, anxiety: 4, note: 'Best practice session of the week. Bike felt dialed.' },
                  { date: '2026-07-14', event: 'Mid-Week Moto', confidence: 7, focus: 7, anxiety: 5, note: 'Fatigued from Sunday. Focus dropped in the 3rd moto.' },
                ].map(l => (
                  <div key={l.date} className="px-4 py-3 border-b border-zinc-800/40 last:border-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-zinc-100 text-sm font-medium">{l.event}</p>
                        <p className="font-mono text-[10px] text-zinc-500">{l.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-mono text-[10px] text-green-400">C:{l.confidence}</span>
                        <span className="font-mono text-[10px] text-sky-400">F:{l.focus}</span>
                        <span className="font-mono text-[10px] text-red-400">A:{l.anxiety}</span>
                      </div>
                    </div>
                    <p className="text-zinc-500 text-xs italic">{l.note}</p>
                  </div>
                ))}
              </div>
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={Zap} label="AI Mental Coach Insight" color="text-lime-400" />
                <div className="p-4 space-y-3">
                  <div className="bg-zinc-900 border border-zinc-800 p-3">
                    <p className="font-mono text-[10px] text-lime-400 uppercase tracking-widest mb-2">Pattern Detected</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">&quot;Anxiety scores above 7 on race days correlate with a +1.4s average lap time gap vs. your best. The common factor: less than 7.5h sleep the night before.&quot;</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-3">
                    <p className="font-mono text-[10px] text-sky-400 uppercase tracking-widest mb-2">Recommendation</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">&quot;Prioritize sleep over extra motos the week before races. Your confidence score is strongly correlated with 8+ hours — and confidence is your most consistent predictor of gate-to-gate performance.&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            10 — INJURY LOG
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-injury">
          <SectionDivider index="10" label="injury-log" />
          <Block accent="border-red-600">
            <BlockHeader
              tag="All Tiers"
              tagColor="text-red-500"
              title="Injury history tracked. Return-to-ride timeline managed. Nothing missed."
              sub="Log every crash, strain, and surgery. Track recovery protocol, clearance dates, and performance impact. Coach sees exactly how injury affects training compliance and race outcomes."
            />
            <div className="border border-zinc-800 bg-zinc-950">
              <PanelHeader icon={Activity} label="Injury History + Recovery Status" color="text-red-500" />
              {[
                { injury: 'Left AC joint sprain', date: '2026-05-12', severity: 'MODERATE', cleared: '2026-06-01', impactDays: 20, status: 'CLEARED', note: 'Returned to full training June 1. No restrictions.' },
                { injury: 'Right thumb bruise (crash T4)', date: '2026-07-05', severity: 'MINOR', cleared: '2026-07-08', impactDays: 3, status: 'CLEARED', note: 'Full grip strength restored.' },
                { injury: 'Lower back soreness', date: '2026-07-17', severity: 'MINOR', cleared: null, impactDays: null, status: 'MONITORING', note: 'Monitoring pre-race. No riding restrictions.' },
              ].map(inj => (
                <div key={inj.injury} className="px-4 py-3 border-b border-zinc-800/40 last:border-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-zinc-100 font-medium">{inj.injury}</p>
                      <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{inj.date}{inj.impactDays ? ` — ${inj.impactDays} days impacted` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase ${
                        inj.severity === 'MODERATE' ? 'text-amber-400 border-amber-400/40' : 'text-zinc-400 border-zinc-700'
                      }`}>{inj.severity}</span>
                      <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase ${
                        inj.status === 'CLEARED' ? 'text-lime-400 border-lime-400/40' : 'text-sky-400 border-sky-400/40'
                      }`}>{inj.status}</span>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-xs">{inj.note}</p>
                </div>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            11 — RACE SCHEDULE
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-schedule">
          <SectionDivider index="11" label="race-schedule" />
          <Block accent="border-indigo-400">
            <BlockHeader
              tag="All Tiers"
              tagColor="text-indigo-400"
              title="Season schedule synced with training. Gate times. Travel. All in one place."
              sub="Add race weekends, practice days, and travel blocks. MD uses your schedule to auto-adjust training load — tapering the right amount of time before each gate drop."
            />
            <div className="border border-zinc-800 bg-zinc-950">
              <PanelHeader icon={Calendar} label="2026 Season Schedule" color="text-indigo-400" />
              {[
                { event: 'Spring Championship Round 1', track: 'Milestone MX, Riverside CA', date: 'July 19, 2026', type: 'RACE', result: '3rd / 15 riders', classes: 'Open A, 450 Open' },
                { event: 'Practice Day', track: 'Glen Helen Raceway', date: 'July 26, 2026', type: 'PRACTICE', result: null, classes: 'Open practice' },
                { event: 'Spring Championship Round 2', track: 'Pala Raceway, Pala CA', date: 'August 2, 2026', type: 'RACE', result: null, classes: 'Open A, 450 Open' },
                { event: 'Summer Classic', track: 'Competitive Edge MX', date: 'August 16, 2026', type: 'RACE', result: null, classes: 'Open A' },
              ].map(ev => (
                <div key={ev.event} className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-zinc-800/40 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 font-medium">{ev.event}</p>
                    <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{ev.track} · {ev.classes}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-zinc-400">{ev.date}</span>
                    <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase ${ev.type === 'RACE' ? 'text-amber-400 border-amber-400/40' : 'text-zinc-400 border-zinc-700'}`}>{ev.type}</span>
                    {ev.result && <span className="font-mono text-xs text-lime-400 font-bold">{ev.result}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            12 — CHAMPIONSHIP STANDINGS
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-standings">
          <SectionDivider index="12" label="championship-standings" />
          <Block accent="border-yellow-300">
            <BlockHeader
              tag="Privateer+"
              tagColor="text-yellow-300"
              title="Points, gaps, and championship math — always current."
              sub="Track points across the full field. MD calculates what you need to win the championship from any round. See who's within striking distance and who's out of reach."
            />
            <div className="border border-zinc-800 bg-zinc-950 overflow-x-auto">
              <PanelHeader icon={Trophy} label="Spring Championship — Open A Class — Round 1 of 6" color="text-yellow-300" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Pos', 'Rider', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'Total', 'Gap'].map(h => (
                      <th key={h} className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    { pos: 1, rider: 'Rider A (You)', pts: [22, 0, 0, 0, 0, 0], isYou: true },
                    { pos: 2, rider: 'Rider D', pts: [25, 0, 0, 0, 0, 0], isYou: false },
                    { pos: 3, rider: 'Rider E', pts: [20, 0, 0, 0, 0, 0], isYou: false },
                    { pos: 4, rider: 'Rider F', pts: [18, 0, 0, 0, 0, 0], isYou: false },
                    { pos: 5, rider: 'Rider G', pts: [16, 0, 0, 0, 0, 0], isYou: false },
                  ].map(r => {
                    const total = r.pts.reduce((a, b) => a + b, 0)
                    const gap = total - 25
                    return (
                      <tr key={r.rider} className={r.isYou ? 'bg-yellow-400/5' : 'hover:bg-zinc-800/30'}>
                        <td className={`px-4 py-3 font-mono text-sm font-black ${r.pos === 1 ? 'text-yellow-300' : 'text-zinc-500'}`}>{r.pos}</td>
                        <td className="px-4 py-3 font-bold text-zinc-100">{r.rider}</td>
                        {r.pts.map((p, i) => (
                          <td key={i} className={`px-4 py-3 font-mono text-xs ${p > 0 ? 'text-zinc-300' : 'text-zinc-700'}`}>{p > 0 ? p : '—'}</td>
                        ))}
                        <td className="px-4 py-3 font-mono text-sm font-bold text-yellow-300">{total}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          <span className={gap === 0 ? 'text-zinc-600' : gap > 0 ? 'text-lime-400' : 'text-red-400'}>{gap === 0 ? '—' : gap > 0 ? `+${gap}` : gap}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            13 — ACCOUNTABILITY AUDIT TRAILS
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-accountability">
          <SectionDivider index="13" label="accountability-audit-trails" />
          <Block accent="border-violet-400">
            <BlockHeader
              tag="Race Team+ — Coach Feature"
              tagColor="text-violet-400"
              title="Assignments sent. Acknowledged. Completed. Logged forever."
              sub="Coaches assign training protocols and compliance requirements. Every acknowledgment is timestamped and immutably logged. No 'I didn't see it' — the audit trail proves it."
            />
            <div className="border border-zinc-800 bg-zinc-950">
              <PanelHeader icon={Shield} label="Assignment Audit Log" color="text-violet-400" />
              {[
                { action: 'ASSIGNED', desc: 'Week 8 — 2x 45min cardio + 1 gym session', actor: 'Coach admin', to: 'Rider A', ts: '2026-07-11 08:00', compliant: true },
                { action: 'ACKNOWLEDGED', desc: 'Week 8 — 2x 45min cardio + 1 gym session', actor: 'Rider A', to: null, ts: '2026-07-11 08:05', compliant: null },
                { action: 'COMPLETED', desc: 'Cardio session 1 of 2 — 47min, avg HR 152', actor: 'Rider A', to: null, ts: '2026-07-12 09:22', compliant: true },
                { action: 'COMPLETED', desc: 'Gym session — 55min, deadlifts + core', actor: 'Rider A', to: null, ts: '2026-07-13 07:15', compliant: true },
                { action: 'MISSED', desc: 'Cardio session 2 of 2 — not logged by deadline', actor: 'System', to: null, ts: '2026-07-14 20:00', compliant: false },
              ].map((row, i) => (
                <div key={i} className="flex flex-wrap items-start gap-3 px-4 py-3 border-b border-zinc-800/40 last:border-0">
                  <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase shrink-0 mt-0.5 ${
                    row.action === 'ASSIGNED' ? 'text-violet-400 border-violet-400/40' :
                    row.action === 'ACKNOWLEDGED' ? 'text-sky-400 border-sky-400/40' :
                    row.action === 'COMPLETED' ? 'text-lime-400 border-lime-400/40' :
                    'text-red-400 border-red-400/40'
                  }`}>{row.action}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 text-sm">{row.desc}</p>
                    <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{row.actor}{row.to ? ` → ${row.to}` : ''}</p>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-600 shrink-0">{row.ts}</span>
                </div>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            14 — SPEC BOOK
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-spec-book">
          <SectionDivider index="14" label="spec-book" />
          <Block accent="border-zinc-400">
            <BlockHeader
              tag="All Tiers"
              tagColor="text-zinc-300"
              title="Every bike. Every spec. One place. No napkins."
              sub="Store complete bike specs — gearing, jetting, suspension settings, tire pressures. Retrieve the exact setup that won you a race in 30 seconds flat."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 px-4 py-2.5 flex items-center gap-2">
                  <Bike className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">#221 — 2025 KTM 450 SXF</span>
                </div>
                <div className="p-4 space-y-1">
                  {[
                    ['Front Fork Spring', '0.48 kg/mm'],
                    ['Fork Oil Level', '110mm'],
                    ['Fork Compression', '12 clicks'],
                    ['Fork Rebound', '12 clicks'],
                    ['Rear Spring', '5.4 kg/mm'],
                    ['Rear Sag', '104mm'],
                    ['Rear Compression', '14 clicks'],
                    ['Rear Rebound', '10 clicks'],
                    ['Front Sprocket', '13T'],
                    ['Rear Sprocket', '48T'],
                    ['Tire Pressure (F)', '12.5 psi'],
                    ['Tire Pressure (R)', '13 psi'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between py-1 border-b border-zinc-800/30 last:border-0">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{k}</span>
                      <span className="font-mono text-xs text-zinc-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-zinc-800 bg-zinc-950">
                <div className="border-b border-zinc-800 px-4 py-2.5 flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Saved Setup Snapshots</span>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { name: 'Milestone MX — Hard-pack Win', date: '2026-07-19', lapTime: '20:38.221', note: 'Best lap of the year. Track was hero dirt.' },
                    { name: 'Glen Helen — Sand Setup', date: '2026-06-28', lapTime: '21:04.556', note: 'Softer rear spring, lower tire pressure.' },
                    { name: 'Pala — Slick Baseline', date: '2026-06-01', lapTime: '20:49.102', note: 'Hard slick. Went +2 clicks comp everywhere.' },
                  ].map(s => (
                    <div key={s.name} className="bg-zinc-900 border border-zinc-800/60 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-zinc-100 text-sm font-medium">{s.name}</p>
                        <span className="font-mono text-xs text-lime-400">{s.lapTime}</span>
                      </div>
                      <p className="font-mono text-[10px] text-zinc-500">{s.date}</p>
                      <p className="text-zinc-500 text-xs mt-1">{s.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            15 — VIDEO ANALYSIS
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-video">
          <SectionDivider index="15" label="video-analysis" />
          <Block accent="border-pink-400">
            <BlockHeader
              tag="Race Team+ — Coach Feature"
              tagColor="text-pink-400"
              title="Video linked to lap data. Watch the moment, see the telemetry."
              sub="Upload session video. Tag timestamps to lap times. Coach attaches notes to specific moments so riders review exactly what went wrong — and what went right."
            />
            <div className="border border-zinc-800 bg-zinc-950">
              <PanelHeader icon={Video} label="Session Video — Race Day July 19" color="text-pink-400" />
              <div className="p-4">
                <div className="bg-zinc-800 aspect-video flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900" />
                  <div className="relative text-center">
                    <Play className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Race Day Onboard — Lap 3 / Gate-to-Gate</p>
                  </div>
                </div>
                {[
                  { ts: '0:41', lap: 'L1', note: 'Turn 4 entry — overbraking on entry causing rear to kick. Back off 10m earlier.', tag: 'COACH NOTE' },
                  { ts: '1:22', lap: 'L1', note: 'Jump combo section — rider is short on the 3rd tabletop. Check speed approach.', tag: 'COACH NOTE' },
                  { ts: '2:03', lap: 'L2', note: 'Best lap. Good drive out of whoops. Repeatable. Lock this in.', tag: 'HIGHLIGHT' },
                ].map(note => (
                  <div key={note.ts} className="flex items-start gap-3 py-2.5 border-b border-zinc-800/40 last:border-0">
                    <span className="font-mono text-xs text-pink-400 w-12 shrink-0">{note.ts}</span>
                    <span className="font-mono text-[10px] text-zinc-500 w-6 shrink-0">{note.lap}</span>
                    <p className="text-zinc-300 text-sm flex-1">{note.note}</p>
                    <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase shrink-0 ${note.tag === 'HIGHLIGHT' ? 'text-lime-400 border-lime-400/40' : 'text-pink-400 border-pink-400/40'}`}>{note.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            16 — COACH IP VAULT
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-ip-vault">
          <SectionDivider index="16" label="coach-ip-vault" />
          <Block accent="border-violet-500">
            <BlockHeader
              tag="Race Team — Coach Feature"
              tagColor="text-violet-400"
              title="Your methods stay yours. Encrypted. Audited. Permanent."
              sub="Coach periodization templates, HR zones, and training protocols live in an encrypted vault. Every access is logged. Immutable audit trail — no one uses your system without your knowledge."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {DEMO_COACH_TEMPLATES.map(t => (
                <div key={t.id} className="border border-zinc-800 bg-zinc-950 p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-mono text-[10px] text-violet-400 uppercase tracking-widest mb-1">{t.type}</p>
                      <p className="text-zinc-100 font-bold">{t.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-violet-400" />
                      <span className="font-mono text-[9px] text-violet-400 border border-violet-400/40 px-1.5 py-0.5 uppercase">Encrypted</span>
                    </div>
                  </div>
                  {'zones' in t && t.zones && (
                    <div className="space-y-1.5">
                      {Object.entries(t.zones as Record<string, { description: string; min: number; max: number }>).map(([key, zone]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase">{zone.description}</span>
                          <span className="font-mono text-[10px] text-zinc-300">{zone.min}–{zone.max} bpm</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {'phases' in t && Array.isArray(t.phases) && (
                    <div className="space-y-1.5">
                      {(t.phases as string[]).map((phase, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                          <span className="text-zinc-300 text-sm">{phase}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border border-zinc-800 bg-zinc-950">
              <PanelHeader icon={Shield} label="Immutable Access Log" color="text-violet-400" />
              {[
                { action: 'VIEWED', template: 'Elite Motocross HR Zones', actor: 'Rider #221', ts: '07:14 AM' },
                { action: 'ASSIGNED', template: '16-Week Supercross Periodization', actor: 'Coach admin', ts: '06:58 AM' },
                { action: 'ACKNOWLEDGED', template: 'Week 8 Assignment', actor: 'Rider #7', ts: '06:43 AM' },
              ].map(row => (
                <div key={row.ts} className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-zinc-800/40 last:border-0">
                  <span className="font-mono text-[9px] text-violet-400 border border-violet-400/40 px-1.5 py-0.5 uppercase">{row.action}</span>
                  <span className="text-zinc-300 text-xs flex-1">{row.template}</span>
                  <span className="font-mono text-[10px] text-zinc-500">{row.actor}</span>
                  <span className="font-mono text-[10px] text-zinc-600">{row.ts}</span>
                </div>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            17 — MULTIPLAYER RACING
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-multiplayer">
          <SectionDivider index="17" label="multiplayer-racing" />
          <Block accent="border-cyan-400">
            <BlockHeader
              tag="Race Team+ — Live Feature"
              tagColor="text-cyan-400"
              title="Every rider on your team on one live leaderboard. Strategy broadcast to all."
              sub="Coach sees all riders' live positions, lap splits, and pace trends from one screen. Broadcast callouts to every rider simultaneously. Replay any moment after the race is done."
              cta="See Multiplayer View" ctaHref="/data/live/multiplayer"
            />
            <div className="border border-zinc-800 bg-zinc-950 mb-4">
              <div className="border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">Live leaderboard — Race 2 / Lap {4 + (lapTick % 6)} / 20</span>
                </div>
              </div>
              {[
                { pos: 1, num: 221, name: 'Rider A', lap: '20:41.224', gap: '—', trend: 'up' },
                { pos: 2, num: 7, name: 'Rider B', lap: '20:44.066', gap: '+2.842s', trend: 'down' },
                { pos: 3, num: 51, name: 'Rider C', lap: '20:47.112', gap: '+5.888s', trend: null },
              ].map(r => (
                <div key={r.num} className={`flex items-center gap-4 px-4 py-3 border-b border-zinc-800/40 last:border-0 ${r.pos === 1 ? 'bg-cyan-400/5' : ''}`}>
                  <span className={`font-mono text-lg font-black w-6 text-center ${r.pos === 1 ? 'text-cyan-400' : 'text-zinc-600'}`}>{r.pos}</span>
                  <span className="font-mono text-xs text-zinc-500 w-8">#{r.num}</span>
                  <span className="font-bold text-zinc-100 flex-1">{r.name}</span>
                  <span className="font-mono text-sm text-zinc-300">{r.lap}</span>
                  <span className="font-mono text-xs text-zinc-500 w-20 text-right">{r.gap}</span>
                  {r.trend === 'up' ? <ChevronUp className="h-3.5 w-3.5 text-lime-400" /> : r.trend === 'down' ? <ChevronDown className="h-3.5 w-3.5 text-red-400" /> : <div className="h-3.5 w-3.5" />}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {['Pit now — fuel', 'Hold position', 'Push lap 5', 'Check rear traction', 'Close gap — 3s'].map(msg => (
                <div key={msg} className="flex items-center gap-2 px-3 py-2 border border-cyan-400/30 bg-cyan-400/5 text-cyan-300 font-mono text-[10px] uppercase tracking-widest">
                  <Radio className="h-3 w-3" />{msg}
                </div>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            18 — FACTORY RIG
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-factory-rig">
          <SectionDivider index="18" label="factory-rig-hauler" />
          <Block accent="border-purple-400">
            <BlockHeader
              tag="Factory Rig Tier — $799/mo"
              tagColor="text-purple-400"
              title="The rig driver holds the whole operation together. Now they have a command center."
              sub="Rig Doctor AI handles Class 8 diesel maintenance, DOT pre-trip checklists, DEF levels, and DPF regen windows. Race calendar synced with departure times and fuel stops."
              cta="See Factory Rig" ctaHref="/data/factory-rig"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Truck, label: 'Rig Doctor AI', body: 'Monitors PM intervals, DPF regens, DEF levels, and coolant temps. Plain-language alerts before something fails at 2am on I-10.', color: 'text-purple-400', border: 'border-purple-400/30' },
                { icon: CheckSquare, label: 'DOT Pre-Trip Log', body: 'DOT-compliant checklist built in. Driver logs brakes, lights, tires, and defects before every departure. Audit-ready record stored permanently.', color: 'text-violet-400', border: 'border-violet-400/30' },
                { icon: Timer, label: 'A/B/C Service Scheduler', body: 'Tracks mileage and engine hours. Fires PM alerts before the truck misses a service window.', color: 'text-zinc-100', border: 'border-zinc-700' },
                { icon: Globe, label: 'Haul Schedule', body: 'Race calendar synced with truck. Departure windows, fuel stops, weigh stations, and gate-time targets — the whole team on one schedule.', color: 'text-amber-400', border: 'border-amber-400/30' },
              ].map(f => {
                const Icon = f.icon
                return (
                  <div key={f.label} className={`border ${f.border} bg-zinc-950 p-5 flex flex-col gap-3`}>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${f.color}`} />
                      <h3 className={`font-black uppercase ${f.color}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{f.label}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{f.body}</p>
                  </div>
                )
              })}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            19 — TELEMETRY DEVICES
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-devices">
          <SectionDivider index="19" label="telemetry-device-integrations" />
          <Block accent="border-emerald-400">
            <BlockHeader
              tag="API Marketplace — Race Team+"
              tagColor="text-emerald-400"
              title="Every device you already own — plugged in. Zero new hardware required."
              sub="MD ingests data from 11+ telemetry devices via CSV, XML, GPX, FIT, TCX, and proprietary formats. Your RaceBox, AiM, Garmin, Polar, or Apple Watch all feed the same dashboard."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-zinc-800">
              {[
                { name: 'MyLaps TR2', category: 'Lap Timer', formats: 'CSV, XML', supported: true },
                { name: 'Westhold G3', category: 'Lap Timer', formats: 'CSV, TXT', supported: true },
                { name: 'AiM Solo / Solo 2', category: 'Data Logger', formats: 'XRK, CSV', supported: true },
                { name: 'RaceBox', category: 'GPS Logger', formats: 'JSON, CSV', supported: true },
                { name: 'Garmin Fenix', category: 'Wearable', formats: 'FIT, GPX', supported: true },
                { name: 'Apple Watch', category: 'Wearable', formats: 'Health API', supported: true },
                { name: 'Polar H10', category: 'HR Monitor', formats: 'FIT, TCX', supported: true },
                { name: 'Crossbox', category: 'Transponder', formats: 'CSV', supported: true },
                { name: 'Alpinestars Tech-Air', category: 'Safety', formats: 'Proprietary', supported: true },
                { name: 'Anubesport Stella', category: 'Data Logger', formats: 'CSV, JSON', supported: true },
                { name: 'Garmin Edge', category: 'GPS', formats: 'FIT, GPX', supported: true },
                { name: 'Custom / API', category: 'REST API', formats: 'JSON', supported: true },
              ].map(d => (
                <div key={d.name} className="bg-zinc-950 p-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-zinc-100 text-sm font-bold">{d.name}</span>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{d.category}</span>
                  <span className="font-mono text-[10px] text-zinc-600">{d.formats}</span>
                </div>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            20 — PWA / OFFLINE ACCESS
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-pwa">
          <SectionDivider index="20" label="offline-pwa-access" />
          <Block accent="border-lime-300">
            <BlockHeader
              tag="All Tiers — No App Store Required"
              tagColor="text-lime-300"
              title="No signal in the pits? Setup sheet still loads. Offline. Instantly."
              sub="MD is a Progressive Web App. Install it once — all your setup sheets, session data, and coaching notes are cached locally. No cell service needed in the pits."
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Wifi, label: 'Offline Caching', body: 'Setup sheets, session data, and coaching notes are pre-cached by the service worker. Open the app with zero bars and your data is right there.', color: 'text-lime-300', border: 'border-lime-300/30' },
                { icon: Zap, label: 'Instant Load', body: 'Cache-first strategy means the app opens in under 200ms from the home screen — faster than a native app on most devices.', color: 'text-amber-400', border: 'border-amber-400/30' },
                { icon: CheckCircle, label: 'No App Store', body: 'Install directly from the browser. No App Store approval. No update gates. Works on iOS and Android. Add to home screen and it runs like native.', color: 'text-sky-400', border: 'border-sky-400/30' },
              ].map(f => {
                const Icon = f.icon
                return (
                  <div key={f.label} className={`border ${f.border} bg-zinc-950 p-5`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-4 w-4 ${f.color}`} />
                      <h3 className={`font-black uppercase ${f.color}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{f.label}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{f.body}</p>
                  </div>
                )
              })}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            21 — OWNER ANALYTICS
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-owner">
          <SectionDivider index="21" label="owner-analytics-dashboard" />
          <Block accent="border-fuchsia-400">
            <BlockHeader
              tag="Race Team+ — Team Owner"
              tagColor="text-fuchsia-400"
              title="Full-team visibility. Who's improving. Who's at risk. Where to invest."
              sub="Team owners see training compliance, performance trends, injury history, and budget across every rider. Cohort analytics show which riders are churning, which are improving fastest, and which need intervention."
              cta="See Owner Analytics" ctaHref="/data/owner/analytics"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800 mb-4">
              {[
                { label: 'Active Riders', value: '8', color: 'text-fuchsia-400' },
                { label: 'Avg Compliance', value: '84%', color: 'text-lime-400' },
                { label: 'Team Improvement', value: '+1.2s', color: 'text-sky-400' },
                { label: 'At-Risk Riders', value: '2', color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-zinc-950 px-4 py-3">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-2xl font-black leading-none ${s.color}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="border border-zinc-800 bg-zinc-950">
              <PanelHeader icon={BarChart3} label="Rider Compliance + Performance — Last 30 Days" color="text-fuchsia-400" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Rider', 'Compliance', 'Sessions', 'Avg HR', 'Best Lap Δ', 'Readiness', 'Status'].map(h => (
                      <th key={h} className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    { rider: 'Rider A (#221)', compliance: 96, sessions: 14, hr: 172, lapDelta: '−0.8s', readiness: 92, status: 'ON TRACK' },
                    { rider: 'Rider B (#7)', compliance: 78, sessions: 11, hr: 168, lapDelta: '+0.2s', readiness: 81, status: 'WATCH' },
                    { rider: 'Rider C (#51)', compliance: 91, sessions: 13, hr: 165, lapDelta: '−0.5s', readiness: 88, status: 'ON TRACK' },
                    { rider: 'Rider D (#14)', compliance: 55, sessions: 7, hr: 160, lapDelta: '+1.1s', readiness: 68, status: 'AT RISK' },
                  ].map(r => (
                    <tr key={r.rider} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-100 font-medium">{r.rider}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        <span className={r.compliance >= 90 ? 'text-lime-400' : r.compliance >= 75 ? 'text-amber-400' : 'text-red-400'}>{r.compliance}%</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{r.sessions}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{r.hr} bpm</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        <span className={r.lapDelta.startsWith('−') ? 'text-lime-400' : 'text-red-400'}>{r.lapDelta}</span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-300">{r.readiness}</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase ${
                          r.status === 'AT RISK' ? 'text-red-400 border-red-400/40' :
                          r.status === 'WATCH' ? 'text-amber-400 border-amber-400/40' :
                          'text-lime-400 border-lime-400/40'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            22 — API MARKETPLACE
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-api">
          <SectionDivider index="22" label="api-marketplace" />
          <Block accent="border-zinc-300">
            <BlockHeader
              tag="API+ Tier — Partners & Developers"
              tagColor="text-zinc-300"
              title="Build on top of MD. REST API, webhooks, and official SDKs."
              sub="Third-party devices, apps, and services push and pull data through the MD API. Webhook events fire on session completion, telemetry receipt, and analysis ready. API+ tier starts at $199/mo."
              cta="See Integrations" ctaHref="/data/owner/integrations"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={Code2} label="REST API — v1 Endpoints" color="text-zinc-400" />
                <div className="p-4 space-y-2 font-mono text-xs">
                  {[
                    { method: 'GET', path: '/api/v1/sessions', desc: 'List team sessions with pagination' },
                    { method: 'POST', path: '/api/v1/telemetry/import', desc: 'Import telemetry from any device' },
                    { method: 'GET', path: '/api/v1/analysis', desc: 'Fetch coaching analysis for a session' },
                    { method: 'GET', path: '/api/v1/team/analytics', desc: 'Team-level performance metrics' },
                    { method: 'GET', path: '/api/v1/partner/health', desc: 'API health + uptime monitoring' },
                  ].map(e => (
                    <div key={e.path} className="flex items-start gap-3 py-2 border-b border-zinc-800/40 last:border-0">
                      <span className={`shrink-0 w-12 text-center border px-1 py-0.5 ${e.method === 'GET' ? 'text-sky-400 border-sky-400/40' : 'text-lime-400 border-lime-400/40'}`}>{e.method}</span>
                      <span className="text-zinc-300 flex-1">{e.path}</span>
                      <span className="text-zinc-600 hidden sm:block text-right shrink-0 max-w-[180px]">{e.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-zinc-800 bg-zinc-950">
                <PanelHeader icon={Zap} label="Webhook Events" color="text-zinc-400" />
                <div className="p-4 space-y-2">
                  {[
                    { event: 'telemetry:received', desc: 'New telemetry batch ingested from any device', color: 'text-emerald-400' },
                    { event: 'session:completed', desc: 'Session marked complete, data available', color: 'text-lime-400' },
                    { event: 'analysis:ready', desc: 'AI coaching analysis finished generating', color: 'text-sky-400' },
                    { event: 'alert:fired', desc: 'Threshold alert triggered during live session', color: 'text-amber-400' },
                    { event: 'team:member:added', desc: 'New rider or mechanic joined the team', color: 'text-violet-400' },
                  ].map(e => (
                    <div key={e.event} className="flex items-start gap-3 py-2 border-b border-zinc-800/40 last:border-0">
                      <span className={`font-mono text-[10px] border px-1.5 py-0.5 uppercase shrink-0 ${e.color} ${e.color.replace('text-', 'border-')}/40`}>{e.event}</span>
                      <span className="text-zinc-500 text-xs">{e.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            23 — DISCIPLINES
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-discipline">
          <SectionDivider index="23" label="multi-discipline" />
          <Block accent="border-amber-300">
            <BlockHeader
              tag="All Tiers — White-Label Ready"
              tagColor="text-amber-300"
              title="Motocross, enduro, flat track, FMX, karting, rally. All in the same platform."
              sub="Discipline-specific AI context, terminology, and track types. One account handles every discipline you compete in. White-label engine for NASCAR, NHRA, and other motorsports verticals."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-zinc-800">
              {[
                { label: 'Motocross / SX', icon: '⬛', color: 'text-lime-400' },
                { label: 'Enduro / GNCC', icon: '⬛', color: 'text-green-400' },
                { label: 'FMX / Freestyle', icon: '⬛', color: 'text-amber-400' },
                { label: 'Flat Track', icon: '⬛', color: 'text-orange-400' },
                { label: 'Rally / Off-Road', icon: '⬛', color: 'text-sky-400' },
                { label: 'Karting', icon: '⬛', color: 'text-violet-400' },
              ].map(d => (
                <div key={d.label} className="bg-zinc-950 p-5 text-center">
                  <Target className={`h-6 w-6 mx-auto mb-2 ${d.color}`} />
                  <p className={`font-mono text-[10px] uppercase tracking-widest font-bold ${d.color}`}>{d.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { href: '/nascar', label: 'NASCAR', desc: 'Stock car racing' },
                { href: '/drag', label: 'Drag Racing', desc: 'Quarter-mile timing' },
                { href: '/rally', label: 'Rally', desc: 'Stage racing' },
                { href: '/karting', label: 'Karting', desc: 'All kart classes' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="border border-zinc-800 hover:border-zinc-600 bg-zinc-900 p-4 flex items-center justify-between group transition-colors">
                  <div>
                    <p className="font-black uppercase text-zinc-100 font-mono text-sm">{l.label}</p>
                    <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{l.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-lime-400 transition-colors" />
                </Link>
              ))}
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            24 — GEAR LOCKER
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-gear">
          <SectionDivider index="24" label="gear-locker" />
          <Block accent="border-stone-400">
            <BlockHeader
              tag="All Tiers"
              tagColor="text-stone-300"
              title="Every helmet, boot, and goggle — tracked. Warranty dates. Replacement schedules."
              sub="Log all your gear with purchase date, manufacturer, model, and expiry. MD alerts you when safety gear reaches replacement age — helmets, airbag vests, neck braces, and protective gear."
            />
            <div className="border border-zinc-800 bg-zinc-950 overflow-x-auto">
              <PanelHeader icon={Layers} label="Gear Locker — Active Equipment" color="text-stone-400" />
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Item', 'Brand / Model', 'Purchased', 'Replace By', 'Status'].map(h => (
                      <th key={h} className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    { item: 'Helmet', model: 'Bell Moto-10 Spherical', purchased: '2025-03-01', replaceBy: '2030-03-01', status: 'OK' },
                    { item: 'Airbag Vest', model: 'Alpinestars Tech-Air 10', purchased: '2025-08-15', replaceBy: '2028-08-15', status: 'OK' },
                    { item: 'Neck Brace', model: 'Leatt GPX 6.5 Carbon', purchased: '2024-01-10', replaceBy: '2026-01-10', status: 'REPLACE SOON' },
                    { item: 'Goggles', model: 'Oakley Airbrake MX', purchased: '2025-06-01', replaceBy: null, status: 'OK' },
                    { item: 'Boots', model: 'Alpinestars Tech 10', purchased: '2024-09-01', replaceBy: '2027-09-01', status: 'OK' },
                  ].map(g => (
                    <tr key={g.item} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-zinc-100 font-medium">{g.item}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-sm">{g.model}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{g.purchased}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{g.replaceBy ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-mono text-[9px] border px-1.5 py-0.5 uppercase ${
                          g.status === 'REPLACE SOON' ? 'text-amber-400 border-amber-400/40' : 'text-lime-400 border-lime-400/40'
                        }`}>{g.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Block>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            25 — PLANS AT A GLANCE
        ───────────────────────────────────────────────────────────────────── */}
        <section id="sec-plans">
          <SectionDivider index="25" label="plans-at-a-glance" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-zinc-800">
            {[
              {
                tier: 'Wrench', price: '$29', role: 'For Mechanics', color: 'text-orange-400', border: 'border-orange-400', href: '/data/pricing#wrench',
                features: ['Work order queue', 'Setup delta tracking', 'Career portfolio', 'Lap-time attribution', 'Up to 3 vehicles'],
              },
              {
                tier: 'Rookie', price: '$49', role: 'Individual Rider', color: 'text-sky-400', border: 'border-sky-400', href: '/data/pricing',
                features: ['Training log', 'Session logging', 'Setup sheets', 'Spec book', 'Part Vault', 'Schedule + standings'],
              },
              {
                tier: 'Privateer', price: '$99', role: 'Serious Competitor', color: 'text-lime-400', border: 'border-lime-400', href: '/data/pricing',
                features: ['Everything in Rookie', 'Readiness score + HRV', 'Session comparison', 'Mental log', 'Injury tracking', 'Video analysis'],
              },
              {
                tier: 'Race Team', price: '$249', role: 'Full Team', color: 'text-amber-400', border: 'border-amber-400', href: '/data/pricing',
                features: ['Everything in Privateer', 'Live race telemetry', 'Multi-rider overlay', 'Coach IP Vault', 'Accountability trails', 'Multiplayer racing'],
              },
              {
                tier: 'Factory Rig', price: '$799', role: 'Pro Organization', color: 'text-purple-400', border: 'border-purple-400', href: '/data/pricing',
                features: ['Everything in Race Team', 'Rig Doctor AI (Class 8)', 'DOT pre-trip log', 'Haul schedule', 'API Marketplace', 'Dedicated support'],
              },
            ].map(plan => (
              <div key={plan.tier} className="bg-zinc-950 p-6 flex flex-col">
                <p className={`font-mono text-[10px] uppercase tracking-widest mb-1 ${plan.color}`}>{plan.role}</p>
                <p className="font-black text-3xl text-zinc-50 leading-none mb-0.5" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{plan.tier}</p>
                <p className={`font-mono text-lg font-bold mb-4 ${plan.color}`}>{plan.price}<span className="text-zinc-600 font-normal text-xs">/mo</span></p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                      <CheckCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${plan.color}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`w-full text-center px-4 py-2.5 border ${plan.border} ${plan.color} font-mono text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors`}>
                  Get {plan.tier}
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 border border-zinc-700 bg-zinc-900 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">// ready to start?</p>
              <p className="text-xl font-black uppercase text-zinc-50" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                25 features. Every one of them live. Get started in 5 minutes.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/data/sign-in" className="px-5 py-2.5 border border-zinc-700 text-zinc-300 font-mono text-[11px] font-bold uppercase tracking-widest hover:border-zinc-500 transition-colors">
                Sign In
              </Link>
              <Link href="/data/pricing" className="px-6 py-2.5 bg-lime-400 text-zinc-950 font-mono text-[11px] font-black uppercase tracking-widest hover:bg-lime-300 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
