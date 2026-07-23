'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Truck, Wrench, Radio, Users, BarChart3,
  Pause, Play, CheckCircle2, AlertTriangle,
  TrendingUp, Flag, Activity, FileText,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────────
   ROLE DEFINITIONS
───────────────────────────────────────────────────────────────────────────── */
type RoleId = 'hauler' | 'mechanic' | 'crew_chief' | 'team_manager' | 'analyst'

const ROLES: {
  id: RoleId
  icon: React.ElementType
  title: string
  subtitle: string
  accent: string
  accentBorder: string
  accentBar: string
  accentDot: string
  accentBg: string
  acts: string[]
  nav: { icon: React.ElementType; label: string }[]
}[] = [
  {
    id: 'hauler',
    icon: Truck,
    title: 'Hauler Driver',
    subtitle: 'Rig Doctor AI',
    accent: 'text-amber-400',
    accentBorder: 'border-amber-400',
    accentBar: 'bg-amber-400',
    accentDot: 'bg-amber-400',
    accentBg: 'bg-amber-400/5',
    acts: ['Pre-Trip Inspection', 'PM Schedule', 'DEF Alert', 'Route Sync'],
    nav: [
      { icon: CheckCircle2, label: 'Pre-Trip' },
      { icon: Wrench, label: 'PM Schedule' },
      { icon: AlertTriangle, label: 'Alerts' },
      { icon: Flag, label: 'Route' },
    ],
  },
  {
    id: 'mechanic',
    icon: Wrench,
    title: 'Mechanic',
    subtitle: 'Wrench Console',
    accent: 'text-sky-400',
    accentBorder: 'border-sky-400',
    accentBar: 'bg-sky-400',
    accentDot: 'bg-sky-400',
    accentBg: 'bg-sky-400/5',
    acts: ['Work Order Queue', 'Setup Delta', 'Career Portfolio', 'Part Vault'],
    nav: [
      { icon: FileText, label: 'Work Orders' },
      { icon: Activity, label: 'Setup Delta' },
      { icon: TrendingUp, label: 'Portfolio' },
      { icon: Wrench, label: 'Parts' },
    ],
  },
  {
    id: 'crew_chief',
    icon: Radio,
    title: 'Crew Chief',
    subtitle: 'Race Weekend AI',
    accent: 'text-lime-400',
    accentBorder: 'border-lime-400',
    accentBar: 'bg-lime-400',
    accentDot: 'bg-lime-400',
    accentBg: 'bg-lime-400/5',
    acts: ['Live Race AI', 'Setup Recommendation', 'Between-Moto Call', 'Session Debrief'],
    nav: [
      { icon: Radio, label: 'Live AI' },
      { icon: Wrench, label: 'Setup' },
      { icon: Flag, label: 'Moto Call' },
      { icon: FileText, label: 'Debrief' },
    ],
  },
  {
    id: 'team_manager',
    icon: Users,
    title: 'Team Manager',
    subtitle: 'Command Dashboard',
    accent: 'text-violet-400',
    accentBorder: 'border-violet-400',
    accentBar: 'bg-violet-400',
    accentDot: 'bg-violet-400',
    accentBg: 'bg-violet-400/5',
    acts: ['Program Overview', 'Points Standings', 'Season Spend', 'Sponsor ROI'],
    nav: [
      { icon: Users, label: 'Overview' },
      { icon: TrendingUp, label: 'Standings' },
      { icon: Activity, label: 'Spend' },
      { icon: Flag, label: 'Sponsor' },
    ],
  },
  {
    id: 'analyst',
    icon: BarChart3,
    title: 'Data Analyst',
    subtitle: 'Analyst Console',
    accent: 'text-cyan-400',
    accentBorder: 'border-cyan-400',
    accentBar: 'bg-cyan-400',
    accentDot: 'bg-cyan-400',
    accentBg: 'bg-cyan-400/5',
    acts: ['Lap Correlation', 'Setup Trending', 'Cross-Rider Comp', 'Championship Model'],
    nav: [
      { icon: Activity, label: 'Laps' },
      { icon: TrendingUp, label: 'Trending' },
      { icon: Users, label: 'Compare' },
      { icon: Flag, label: 'Projection' },
    ],
  },
]

const ROLE_IDS: RoleId[] = ROLES.map((r) => r.id)
const ROLE_DURATION = 20000 // 20s per role

function getAct(progress: number, acts: number): number {
  return Math.min(Math.floor(progress * acts), acts - 1)
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCENE CONTENT
───────────────────────────────────────────────────────────────────────────── */
function HaulerScene({ act }: { act: number }) {
  const scenes = [
    // Act 0 — Pre-Trip Inspection
    <div key="pretip" className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-1">
        <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">Round 7 · Salt Lake City · Departure 04:30</p>
        <span className="font-mono text-[9px] text-zinc-600 border border-zinc-800 px-2 py-0.5">DOT PRE-TRIP</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Air Brakes', status: 'pass' },
          { label: 'Headlights / Markers', status: 'pass' },
          { label: 'Tire Pressure (18-wheel)', status: 'pass' },
          { label: 'DEF Level', status: 'warn', note: '12% — refill before I-15' },
          { label: 'DPF Regen Due', status: 'warn', note: '340 mi overdue' },
          { label: 'Fifth Wheel Coupling', status: 'pass' },
          { label: 'Trailer Seals', status: 'pass' },
          { label: 'Emergency Equipment', status: 'pass' },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-2 bg-zinc-900/60 border border-zinc-800 px-3 py-2">
            <span className={`mt-0.5 shrink-0 font-mono text-xs ${item.status === 'pass' ? 'text-lime-400' : 'text-amber-400'}`}>
              {item.status === 'pass' ? '✓' : '!'}
            </span>
            <div>
              <p className="text-zinc-300 text-xs">{item.label}</p>
              {item.note && <p className="text-amber-400 font-mono text-[10px] mt-0.5">{item.note}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="border border-amber-400/30 bg-amber-400/5 px-4 py-3 mt-1">
        <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-1">Rig Doctor AI</p>
        <p className="text-zinc-300 text-xs leading-relaxed">DEF at 12% will trigger derate on I-15 at mile marker ~218. Pilot Flying J SLC North has DEF in bulk — add it before merging on I-215. DPF regen can be forced during the highway run — no depower needed.</p>
      </div>
    </div>,

    // Act 1 — PM Schedule
    <div key="pm" className="flex flex-col gap-4">
      <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-1">2027 SMX Season · PM Schedule · 2019 Kenworth T680</p>
      <div className="space-y-2">
        {[
          { service: 'A Service (Oil + Filters)', interval: 'Every 15K mi', due: 'Round 9 — Foxboro', status: 'ok' },
          { service: 'B Service (Full Lube + Trans)', interval: 'Every 30K mi', due: 'Round 13 — Denver', status: 'ok' },
          { service: 'DPF Cleaning', interval: 'Every 200K mi', due: 'OVERDUE — 340 mi past', status: 'warn' },
          { service: 'Air Dryer Service', interval: 'Annual', due: 'Completed pre-season', status: 'done' },
          { service: 'Brake Reline (rear tandem)', interval: 'Every 100K mi', due: 'Round 11 — Detroit', status: 'ok' },
          { service: 'Coolant Flush', interval: 'Every 2 yrs', due: 'Completed pre-season', status: 'done' },
        ].map((row) => (
          <div key={row.service} className="flex items-center justify-between gap-3 border border-zinc-800 bg-zinc-900/40 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-zinc-200 text-xs font-semibold truncate">{row.service}</p>
              <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest">{row.interval}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-mono text-[10px] ${row.status === 'warn' ? 'text-amber-400' : row.status === 'done' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {row.due}
              </p>
            </div>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.status === 'warn' ? 'bg-amber-400' : row.status === 'done' ? 'bg-zinc-700' : 'bg-lime-400'}`} />
          </div>
        ))}
      </div>
    </div>,

    // Act 2 — DEF Alert
    <div key="def" className="flex flex-col gap-4">
      <div className="border border-amber-400 bg-amber-400/8 p-5">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-mono text-xs text-amber-400 uppercase tracking-widest font-bold">DEF Level Critical — 12%</p>
            <p className="text-zinc-400 text-xs mt-1">Derate will activate below 5%. Estimated derate at current consumption: mile marker 218, I-15 northbound.</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Rig Doctor AI — Recommended Action</p>
          <p className="text-zinc-300 text-xs leading-relaxed">Stop at Pilot Flying J, SLC North (exit 311, I-15 NB). Bulk DEF available. Add minimum 5 gallons to clear derate risk. Current consumption rate: 1.2 gal/100mi. Full tank recommended before Foxboro swing (2,340 mi total leg).</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[{ label: 'Current DEF', val: '12%' }, { label: 'Derate at', val: '5%' }, { label: 'Next stop', val: '41 mi' }].map((s) => (
            <div key={s.label} className="bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-center">
              <p className="text-amber-400 font-mono text-lg font-bold leading-none">{s.val}</p>
              <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>,

    // Act 3 — Route Sync
    <div key="route" className="flex flex-col gap-4">
      <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-1">Race Calendar · Haul Schedule · 2027 SMX</p>
      <div className="space-y-1.5">
        {[
          { round: 'R7', venue: 'Salt Lake City, UT', depart: 'Thu 04:30', miles: '0 mi', status: 'current' },
          { round: 'R8', venue: 'Denver, CO', depart: 'Mon 22:00', miles: '525 mi', status: 'next' },
          { round: 'R9', venue: 'Foxboro, MA', depart: 'Mon 22:00', miles: '1,983 mi', status: 'planned' },
          { round: 'R10', venue: 'Detroit, MI', depart: 'Mon 22:00', miles: '782 mi', status: 'planned' },
          { round: 'R11', venue: 'Indianapolis, IN', depart: 'Mon 22:00', miles: '296 mi', status: 'planned' },
        ].map((leg) => (
          <div key={leg.round} className={`flex items-center gap-4 px-4 py-2.5 border ${leg.status === 'current' ? 'border-amber-400 bg-amber-400/5' : 'border-zinc-800 bg-zinc-900/30'}`}>
            <span className={`font-mono text-[10px] uppercase tracking-widest w-8 shrink-0 ${leg.status === 'current' ? 'text-amber-400' : 'text-zinc-600'}`}>{leg.round}</span>
            <span className="text-zinc-300 text-xs flex-1">{leg.venue}</span>
            <span className="font-mono text-[10px] text-zinc-500">{leg.depart}</span>
            <span className="font-mono text-[10px] text-zinc-600 w-20 text-right">{leg.miles}</span>
          </div>
        ))}
      </div>
    </div>,
  ]
  return scenes[act] ?? scenes[0]
}

function MechanicScene({ act }: { act: number }) {
  const scenes = [
    // Act 0 — Work Order Queue
    <div key="wq" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-sky-400 uppercase tracking-widest mb-1">Round 7 · Work Order Queue · 3 Bikes</p>
      {[
        { id: 'WO-0441', rider: 'T. Hammaker #18', bike: '2027 KTM 450SXF', task: 'Full suspension rebuild — hard-pack setup', status: 'in-progress', labor: '4h 22m', priority: 'high' },
        { id: 'WO-0442', rider: 'C. Rios #44', bike: '2027 KTM 450SXF', task: 'Fork oil change + spring swap (+0.5N/mm)', status: 'open', labor: '—', priority: 'normal' },
        { id: 'WO-0443', rider: 'M. Voss #7', bike: '2026 KTM 450SXF', task: 'Engine inspection post-DNF moto 2', status: 'open', labor: '—', priority: 'high' },
      ].map((wo) => (
        <div key={wo.id} className={`border ${wo.priority === 'high' ? 'border-sky-400/40' : 'border-zinc-800'} bg-zinc-900/50 px-4 py-3`}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{wo.id} · {wo.rider}</p>
              <p className="text-zinc-200 text-sm font-semibold">{wo.task}</p>
            </div>
            <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 shrink-0 ${
              wo.status === 'in-progress' ? 'border-sky-400/40 text-sky-400' : 'border-zinc-700 text-zinc-600'
            }`}>{wo.status}</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-zinc-500 text-xs">{wo.bike}</p>
            {wo.labor !== '—' && <p className="font-mono text-[10px] text-sky-400">{wo.labor} active</p>}
          </div>
        </div>
      ))}
    </div>,

    // Act 1 — Setup Delta
    <div key="delta" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-sky-400 uppercase tracking-widest mb-1">T. Hammaker #18 · Setup Delta · R6 → R7</p>
      <div className="space-y-1.5">
        {[
          { param: 'Fork Spring Rate', r6: '4.6 N/mm', r7: '4.8 N/mm', delta: '+0.2', dir: 'up' },
          { param: 'Fork Compression (hi)', r6: '14 clicks', r7: '12 clicks', delta: '-2', dir: 'down' },
          { param: 'Fork Rebound', r6: '10 clicks', r7: '10 clicks', delta: '—', dir: 'flat' },
          { param: 'Shock Spring Rate', r6: '54 N/mm', r7: '56 N/mm', delta: '+2', dir: 'up' },
          { param: 'Shock Hi-Comp', r6: '1.5 turns', r7: '1.25 turns', delta: '-0.25', dir: 'down' },
          { param: 'Sag (race)', r6: '104mm', r7: '102mm', delta: '-2mm', dir: 'down' },
          { param: 'Mapping', r6: 'Map 2', r7: 'Map 3', delta: '+1 map', dir: 'up' },
          { param: 'Gearing', r6: '13/50', r7: '13/51', delta: '+1T rear', dir: 'up' },
        ].map((row) => (
          <div key={row.param} className="grid grid-cols-[1fr_72px_72px_52px] items-center gap-2 border border-zinc-800 bg-zinc-900/40 px-3 py-1.5">
            <p className="text-zinc-300 text-xs">{row.param}</p>
            <p className="font-mono text-[10px] text-zinc-500 text-right">{row.r6}</p>
            <p className="font-mono text-[10px] text-sky-300 text-right">{row.r7}</p>
            <p className={`font-mono text-[10px] text-right ${row.dir === 'up' ? 'text-lime-400' : row.dir === 'down' ? 'text-amber-400' : 'text-zinc-700'}`}>{row.delta}</p>
          </div>
        ))}
      </div>
    </div>,

    // Act 2 — Career Portfolio
    <div key="portfolio" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-sky-400 uppercase tracking-widest mb-1">Career Portfolio · Jake Morales · Mechanic</p>
      <div className="border border-sky-400/30 bg-sky-400/5 px-5 py-4 mb-2">
        <p className="text-zinc-100 text-sm font-semibold">This record travels with you. Not the team — you.</p>
        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">Every work order, setup change, and outcome you logged is permanently in your account. Export it to your next employer or use it to prove your work moved lap times.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { stat: '847', label: 'Work Orders Closed' },
          { stat: '6', label: 'Riders Serviced' },
          { stat: '23', label: 'Top-5 Results Correlated' },
          { stat: '5 yr', label: 'Career History' },
        ].map((s) => (
          <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <p className="text-sky-400 leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.75rem' }}>{s.stat}</p>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>,

    // Act 3 — Part Vault
    <div key="parts" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-sky-400 uppercase tracking-widest mb-1">Part Vault · WO-0441 Pull Request</p>
      {[
        { part: 'Fork Spring 4.8 N/mm (pair)', sku: 'WP-48000-010', stock: 4, pulled: 2, cost: '$186' },
        { part: 'Fork Oil — Motorex 5w (1L)', sku: 'MX-OIL-5W-1L', stock: 12, pulled: 2, cost: '$28' },
        { part: 'Dust Wiper Kit (48mm)', sku: 'WP-48DW-KIT', stock: 6, pulled: 2, cost: '$44' },
      ].map((p) => (
        <div key={p.sku} className="flex items-center gap-3 border border-zinc-800 bg-zinc-900/40 px-4 py-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-zinc-200 text-xs font-semibold truncate">{p.part}</p>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">{p.sku}</p>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">Stock: {p.stock}</span>
          <span className="font-mono text-[10px] text-sky-400">Pulled: {p.pulled}</span>
          <span className="font-mono text-[10px] text-zinc-400">{p.cost}</span>
        </div>
      ))}
      <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-1">
        <span className="text-zinc-500 text-xs">Total parts cost — WO-0441</span>
        <span className="font-mono text-sky-400 font-bold">$258 tracked automatically</span>
      </div>
    </div>,
  ]
  return scenes[act] ?? scenes[0]
}

function CrewChiefScene({ act }: { act: number }) {
  const scenes = [
    // Act 0 — Live Race AI
    <div key="live" className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
        <p className="font-mono text-[10px] text-lime-400 uppercase tracking-widest">Live · Round 7 SLC · Practice 2</p>
      </div>
      <div className="space-y-3">
        {[
          {
            role: 'Crew Chief',
            q: 'We are 0.4 down on P3. Last round Denver Rylee ran Map 3 in similar conditions — did that help?',
            a: 'Round 6 Denver: Map 3 vs Map 2 delta was +0.18s lap average, 6 laps sample. Biggest gain in S1. Temp today is 3°F higher — expect similar response. Recommend Map 3 for the next session.',
            good: true,
          },
          {
            role: 'Crew Chief',
            q: 'Front is washing mid-corner. Same feeling as Indy last year?',
            a: 'Indy R11 2026: front wash reported Round 3 practice. Fix was -2 clicks hi-comp, +1 click rebound. Lap improved 0.22s. Current setting is 14/10. Suggest 12/11 to match that correction.',
            good: true,
          },
        ].map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="bg-zinc-900/60 border border-zinc-800 px-4 py-2.5">
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-1">{item.role}</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{item.q}</p>
            </div>
            <div className="border border-lime-400/30 bg-lime-400/5 px-4 py-2.5">
              <p className="font-mono text-[9px] text-lime-400 uppercase tracking-widest mb-1">Race Weekend AI</p>
              <p className="text-zinc-200 text-sm leading-relaxed">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Act 1 — Setup Recommendation
    <div key="setup" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-lime-400 uppercase tracking-widest mb-1">Setup Recommendation · R7 SLC · T. Hammaker #18</p>
      <div className="border border-lime-400/30 bg-lime-400/5 px-5 py-4 mb-2">
        <p className="font-mono text-[9px] text-lime-400 uppercase tracking-widest mb-2">AI Setup Call — Confidence: HIGH</p>
        <p className="text-zinc-200 text-sm leading-relaxed">Based on 3 prior hard-pack rounds and current track conditions (dusty, loamy top layer). Recommend stiffer spring package front and rear vs Denver. Track conditions match Indy 2026 most closely — use that baseline.</p>
      </div>
      <div className="space-y-1.5">
        {[
          { param: 'Fork Spring', rec: '4.8 N/mm', reason: 'Hard-pack prefers stiffer — 3/3 fast rounds confirm' },
          { param: 'Fork Hi-Comp', rec: '12 clicks', reason: 'Wash complaint → softer by 2 from current' },
          { param: 'Shock Spring', rec: '56 N/mm', reason: 'Track temp +6°F vs baseline — stiffen to compensate' },
          { param: 'Mapping', rec: 'Map 3', reason: '+0.18s avg vs Map 2 on comparable conditions' },
        ].map((r) => (
          <div key={r.param} className="flex items-start gap-3 border border-zinc-800 bg-zinc-900/40 px-3 py-2">
            <div className="w-24 shrink-0">
              <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest">{r.param}</p>
              <p className="text-lime-400 font-mono text-sm font-bold">{r.rec}</p>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">{r.reason}</p>
          </div>
        ))}
      </div>
    </div>,

    // Act 2 — Between-Moto Call
    <div key="moto" className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">Between Moto 1 + Moto 2 · 20 min window</p>
      </div>
      <div className="border border-zinc-800 bg-zinc-900/40 px-5 py-4">
        <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Moto 1 Outcome</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ v: 'P3', l: 'Finish' }, { v: '-0.8s', l: 'Gap to P1' }, { v: '52.4', l: 'Best Lap' }].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-zinc-100 leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.5rem' }}>{s.v}</p>
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="border border-lime-400/30 bg-lime-400/5 px-4 py-3">
          <p className="font-mono text-[9px] text-lime-400 uppercase tracking-widest mb-1">AI Between-Moto Note</p>
          <p className="text-zinc-200 text-xs leading-relaxed">Lap 3–6 sector 2 delta widened +0.14s — matches front-end push pattern from practice. Reduce fork hi-comp 1 click (12→11). P1 running softer setup — current stiffer pack may be limiting mid-corner rotation. Low risk change.</p>
        </div>
      </div>
    </div>,

    // Act 3 — Session Debrief
    <div key="debrief" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-lime-400 uppercase tracking-widest mb-1">Post-Moto Debrief · Auto-Generated · R7 SLC M2</p>
      <div className="space-y-2">
        {[
          { section: 'Result', content: 'P2. Best lap 51.9. Gap to P1: 0.4s.' },
          { section: 'Setup Change Impact', content: 'Fork hi-comp -1 click improved S2 delta by 0.11s (laps 4–8). Confirmed positive correlation.' },
          { section: 'Map 3 Performance', content: 'Map 3 outperformed Map 2 by 0.17s avg — consistent with Denver. Lock Map 3 as SLC default.' },
          { section: 'Next Round Action', content: 'Denver hard-pack similar. Carry this setup baseline. Increase sag 1mm — rider feedback on whoops exit.' },
        ].map((item) => (
          <div key={item.section} className="border border-zinc-800 bg-zinc-900/40 px-4 py-2.5">
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-1">{item.section}</p>
            <p className="text-zinc-200 text-xs leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>,
  ]
  return scenes[act] ?? scenes[0]
}

function TeamManagerScene({ act }: { act: number }) {
  const scenes = [
    // Act 0 — Program Overview
    <div key="overview" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-violet-400 uppercase tracking-widest mb-1">SMX 2027 · Program Overview · Round 7 of 17</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Riders Active', val: '3', accent: 'text-violet-400' },
          { label: 'Team Points', val: '284', accent: 'text-violet-400' },
          { label: 'Open Work Orders', val: '3', accent: 'text-sky-400' },
          { label: 'Season Spend (YTD)', val: '$618K', accent: 'text-amber-400' },
          { label: 'Rounds Remaining', val: '10', accent: 'text-zinc-300' },
          { label: 'Sponsor Deal Status', val: 'Active', accent: 'text-lime-400' },
        ].map((s) => (
          <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <p className={`${s.accent} leading-none`} style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.75rem' }}>{s.val}</p>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>,

    // Act 1 — Points Standings
    <div key="points" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-violet-400 uppercase tracking-widest mb-1">450SX Class · Standings after Round 7</p>
      <div className="space-y-1.5">
        {[
          { pos: 1, name: 'J. Anderson', num: '#21', pts: 167, gap: '—', team: 'External' },
          { pos: 2, name: 'T. Hammaker', num: '#18', pts: 158, gap: '-9', team: 'Our Team', highlight: true },
          { pos: 3, name: 'C. Cooper', num: '#1', pts: 154, gap: '-13', team: 'External' },
          { pos: 4, name: 'C. Rios', num: '#44', pts: 126, gap: '-41', team: 'Our Team', highlight: true },
          { pos: 5, name: 'D. Ferrandis', num: '#14', pts: 118, gap: '-49', team: 'External' },
          { pos: 8, name: 'M. Voss', num: '#7', pts: 88, gap: '-79', team: 'Our Team', highlight: true },
        ].map((r) => (
          <div key={r.pos} className={`flex items-center gap-3 px-4 py-2 border ${r.highlight ? 'border-violet-400/30 bg-violet-400/5' : 'border-zinc-800 bg-zinc-900/30'}`}>
            <span className={`font-mono text-xs w-5 shrink-0 ${r.highlight ? 'text-violet-400' : 'text-zinc-600'}`}>P{r.pos}</span>
            <span className={`text-xs flex-1 ${r.highlight ? 'text-zinc-100 font-semibold' : 'text-zinc-400'}`}>{r.name} {r.num}</span>
            <span className={`font-mono text-xs ${r.highlight ? 'text-violet-400' : 'text-zinc-500'}`}>{r.pts}</span>
            <span className="font-mono text-[10px] text-zinc-600 w-10 text-right">{r.gap}</span>
          </div>
        ))}
      </div>
    </div>,

    // Act 2 — Season Spend
    <div key="spend" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-violet-400 uppercase tracking-widest mb-1">Season Spend Tracker · 7 of 17 Rounds</p>
      <div className="space-y-2">
        {[
          { category: 'Platform — Command Partner', budget: '$127,500', spent: '$52,500', pct: 41 },
          { category: 'Travel + Lodging', budget: '$120,000', spent: '$49,200', pct: 41 },
          { category: 'Parts + Consumables', budget: '$85,000', spent: '$38,600', pct: 45 },
          { category: 'Staff Salaries (prorated)', budget: '$310,000', spent: '$127,500', pct: 41 },
          { category: 'Fuel + Logistics', budget: '$44,000', spent: '$18,900', pct: 43 },
        ].map((row) => (
          <div key={row.category} className="border border-zinc-800 bg-zinc-900/30 px-4 py-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-zinc-300 text-xs">{row.category}</p>
              <p className="font-mono text-[10px] text-zinc-500">{row.spent} / {row.budget}</p>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-violet-400 rounded-full" style={{ width: `${row.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-zinc-800 pt-2">
        <span className="text-zinc-500 text-xs">Total YTD</span>
        <span className="font-mono text-violet-400 font-bold">$618,200 of $1.52M budget</span>
      </div>
    </div>,

    // Act 3 — Sponsor ROI
    <div key="sponsor" className="flex flex-col gap-4">
      <p className="font-mono text-[10px] text-violet-400 uppercase tracking-widest mb-1">Sponsor ROI Report · Monster Energy · Round 7</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Logo Exposure Hours', val: '142h', note: 'Live broadcast + stream' },
          { label: 'Social Impressions', val: '4.2M', note: 'Rounds 1–7 combined' },
          { label: 'Podium Appearances', val: '6', note: '#18 + #44 combined' },
          { label: 'Earned Media Value', val: '$2.1M', note: 'vs $800K direct spend' },
        ].map((s) => (
          <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <p className="text-violet-400 leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.5rem' }}>{s.val}</p>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5">{s.label}</p>
            <p className="text-zinc-500 text-[10px] mt-1">{s.note}</p>
          </div>
        ))}
      </div>
      <div className="border border-violet-400/30 bg-violet-400/5 px-4 py-3">
        <p className="font-mono text-[9px] text-violet-400 uppercase tracking-widest mb-1">Sponsor Brief — Ready to Export</p>
        <p className="text-zinc-300 text-xs leading-relaxed">Through Round 7: 2.6x earned media return on direct spend. Rider #18 currently P2 in championship — top-3 finish projects additional $400K earned media in final 10 rounds. Brief ready for Q3 sponsor call.</p>
      </div>
    </div>,
  ]
  return scenes[act] ?? scenes[0]
}

function AnalystScene({ act }: { act: number }) {
  const scenes = [
    // Act 0 — Lap Correlation
    <div key="laps" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-1">Lap Correlation Query · T. Hammaker #18 · All Rounds</p>
      <div className="border border-zinc-800 bg-zinc-900/40 px-4 py-3 font-mono text-xs text-zinc-400 mb-2">
        <span className="text-cyan-400">QUERY</span> SELECT round, track_type, fork_hi_comp, best_lap_s<br />
        FROM sessions WHERE rider_id = 18 AND year = 2027<br />
        ORDER BY best_lap_s ASC;
      </div>
      <div className="space-y-1">
        <div className="grid grid-cols-[40px_1fr_80px_60px_70px] gap-2 px-3 py-1">
          {['RD', 'VENUE', 'FORK HI', 'BEST LAP', 'DELTA P1'].map((h) => (
            <p key={h} className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">{h}</p>
          ))}
        </div>
        {[
          { rd: 'R6', venue: 'Denver', comp: '12', lap: '51.4', delta: '-0.3' },
          { rd: 'R3', venue: 'Arlington', comp: '12', lap: '51.7', delta: '-0.1' },
          { rd: 'R7', venue: 'Salt Lake', comp: '11', lap: '51.9', delta: '-0.4' },
          { rd: 'R4', venue: 'St. Louis', comp: '14', lap: '52.6', delta: '-0.8' },
          { rd: 'R5', venue: 'Atlanta', comp: '15', lap: '52.9', delta: '-1.1' },
        ].map((row) => (
          <div key={row.rd} className="grid grid-cols-[40px_1fr_80px_60px_70px] items-center gap-2 border border-zinc-800 bg-zinc-900/30 px-3 py-1.5">
            <span className="font-mono text-[10px] text-cyan-400">{row.rd}</span>
            <span className="text-zinc-300 text-xs">{row.venue}</span>
            <span className="font-mono text-[10px] text-zinc-400 text-center">{row.comp} clicks</span>
            <span className="font-mono text-[10px] text-lime-400">{row.lap}s</span>
            <span className="font-mono text-[10px] text-amber-400">{row.delta}s</span>
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-cyan-400">Finding: 12-click hi-comp correlates with best lap across 2/3 top rounds. 15-click settings show 0.8–1.1s gap.</p>
    </div>,

    // Act 1 — Setup Trending
    <div key="trend" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-1">Setup Trending · Fork Hi-Comp vs Lap Delta · 7 Rounds</p>
      <div className="space-y-2 mb-2">
        {[
          { label: 'Rounds with 11–12 click hi-comp', delta: '-0.2 to -0.4s vs P1', badge: 'Fast' },
          { label: 'Rounds with 14–15 click hi-comp', delta: '-0.8 to -1.1s vs P1', badge: 'Slow' },
          { label: 'Rounds on Map 3 vs Map 2', delta: '+0.17s avg improvement', badge: 'Map 3 wins' },
          { label: 'Soft front + stiff rear combo', delta: 'Best S2 performance', badge: 'Sector win' },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 border border-zinc-800 bg-zinc-900/40 px-4 py-2.5">
            <p className="text-zinc-300 text-xs flex-1">{r.label}</p>
            <span className="font-mono text-[10px] text-cyan-400 shrink-0">{r.badge}</span>
            <span className="font-mono text-[10px] text-zinc-500 text-right shrink-0 w-36">{r.delta}</span>
          </div>
        ))}
      </div>
      <div className="border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
        <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest mb-1">Analyst Note</p>
        <p className="text-zinc-200 text-xs leading-relaxed">7-round dataset shows strong inverse correlation between fork hi-comp setting and lap delta. Confidence interval sufficient to recommend 11–12 clicks as hard-pack default going into the back half of the season.</p>
      </div>
    </div>,

    // Act 2 — Cross-Rider Comparison
    <div key="compare" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-1">Cross-Rider · R7 SLC · #18 vs #44 Best Lap Sectors</p>
      <div className="space-y-1.5">
        {[
          { sector: 'S1 — Start to Turn 2', t18: '8.2s', t44: '8.6s', winner: '#18', delta: '+0.4' },
          { sector: 'S2 — Rhythm Section A', t18: '14.7s', t44: '14.4s', winner: '#44', delta: '-0.3' },
          { sector: 'S3 — Whoops + Triple', t18: '11.1s', t44: '11.5s', winner: '#18', delta: '+0.4' },
          { sector: 'S4 — Arena to Finish', t18: '17.9s', t44: '18.2s', winner: '#18', delta: '+0.3' },
          { sector: 'Full Lap', t18: '51.9s', t44: '52.7s', winner: '#18', delta: '+0.8' },
        ].map((r) => (
          <div key={r.sector} className="grid grid-cols-[1fr_60px_60px_60px] items-center gap-2 border border-zinc-800 bg-zinc-900/30 px-3 py-2">
            <p className="text-zinc-400 text-xs">{r.sector}</p>
            <p className={`font-mono text-[10px] text-center ${r.winner === '#18' ? 'text-lime-400' : 'text-zinc-500'}`}>{r.t18}</p>
            <p className={`font-mono text-[10px] text-center ${r.winner === '#44' ? 'text-cyan-400' : 'text-zinc-500'}`}>{r.t44}</p>
            <p className={`font-mono text-[10px] text-right ${r.winner === '#18' ? 'text-lime-400' : 'text-cyan-400'}`}>{r.winner} {r.delta}</p>
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-cyan-400">#44 faster in S2 — rhythm section technique. Share #44 S2 line data with #18 mechanic for setup review.</p>
    </div>,

    // Act 3 — Championship Projection
    <div key="projection" className="flex flex-col gap-4">
      <p className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-1">Championship Projection · #18 T. Hammaker · 10 Rounds Remain</p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {[
          { scenario: 'Current Pace', pts: '+183', final: '341', result: 'P1' },
          { scenario: 'P3 Average', pts: '+130', final: '288', result: 'P2' },
          { scenario: 'DNF 2 Rounds', pts: '+108', final: '266', result: 'P3' },
        ].map((s) => (
          <div key={s.scenario} className="border border-zinc-800 bg-zinc-900/40 px-3 py-3 text-center">
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mb-2">{s.scenario}</p>
            <p className="text-cyan-400 leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.75rem' }}>{s.final}</p>
            <p className="font-mono text-[9px] text-lime-400 mt-1">{s.result} projected</p>
            <p className="font-mono text-[9px] text-zinc-600 mt-0.5">{s.pts} pts needed</p>
          </div>
        ))}
      </div>
      <div className="border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
        <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest mb-1">AI Scenario Note</p>
        <p className="text-zinc-200 text-xs leading-relaxed">At current average finish (P2.3) with 10 rounds remaining, #18 projects to 341 pts — championship lead by Round 13. Closest competitor (#21, P1) needs to average P1 every remaining round to catch. Gap is manageable — protect the points.</p>
      </div>
    </div>,
  ]
  return scenes[act] ?? scenes[0]
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function MdDemo() {
  const [activeRole, setActiveRole] = useState<RoleId>('crew_chief')
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(true)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  const role = ROLES.find((r) => r.id === activeRole)!

  const goToRole = useCallback((id: RoleId) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    startRef.current = null
    setActiveRole(id)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (!playing) return
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const p = Math.min(elapsed / ROLE_DURATION, 1)
      setProgress(p)
      if (p >= 1) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        startRef.current = null
        const idx = ROLE_IDS.indexOf(activeRole)
        const next = ROLE_IDS[(idx + 1) % ROLE_IDS.length]
        setActiveRole(next)
        setProgress(0)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [activeRole, playing])

  const actCount = role.acts.length
  const currentAct = getAct(progress, actCount)
  const actProgress = (progress * actCount) - currentAct
  const RoleIcon = role.icon

  return (
    <section id="demo" className="bg-zinc-950 py-16 md:py-20 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,230,53,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            // racing-management-system — e2e-demo
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            Every role.{' '}
            <span className="text-lime-400">Every console. Live.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            This is not a teaser. Every screen below is a real workflow from the SMX 2027 season — hauler to analyst, gate drop to Vegas final.
          </p>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {ROLES.map((r) => {
            const Icon = r.icon
            const isActive = r.id === activeRole
            return (
              <button
                key={r.id}
                onClick={() => goToRole(r.id)}
                aria-pressed={isActive}
                className={`relative flex flex-col items-start gap-1.5 p-3.5 border text-left transition-all ${
                  isActive ? `${r.accentBorder} ${r.accentBg}` : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                }`}
              >
                {isActive && (
                  <span className={`absolute top-0 left-0 right-0 h-0.5 ${r.accentBar}`} aria-hidden="true" />
                )}
                <Icon className={`h-4 w-4 ${isActive ? r.accent : 'text-zinc-600'}`} aria-hidden="true" />
                <div>
                  <p className={`uppercase leading-none text-sm ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`}
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800 }}>
                    {r.title}
                  </p>
                  <p className={`font-mono text-[9px] uppercase tracking-widest mt-0.5 ${isActive ? r.accent : 'text-zinc-700'}`}>
                    {r.subtitle}
                  </p>
                </div>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800 overflow-hidden">
                    <span className={`block h-full transition-none ${r.accentBar}`} style={{ width: `${progress * 100}%` }} />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Main demo shell */}
        <div className={`border ${role.accentBorder} bg-zinc-950 overflow-hidden`}>
          {/* Window chrome */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[0,1,2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full bg-zinc-700" />)}
              </div>
              <div className="flex items-center gap-2">
                <RoleIcon className={`h-3.5 w-3.5 ${role.accent}`} aria-hidden />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  {role.subtitle} · motorsportsdata.io/data
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {role.acts.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentAct ? role.accentDot : 'bg-zinc-700'}`}
                  />
                ))}
              </div>
              <span className={`font-mono text-[9px] uppercase tracking-widest border px-2 py-0.5 ${role.accentBorder} ${role.accent}`}>LIVE</span>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-[180px_1fr] min-h-[480px]">
            {/* Sidebar */}
            <div className="border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
              {/* Role badge */}
              <div className={`px-4 py-4 border-b border-zinc-800 ${role.accentBg}`}>
                <div className={`w-8 h-8 flex items-center justify-center border ${role.accentBorder} mb-2`}>
                  <RoleIcon className={`h-4 w-4 ${role.accent}`} aria-hidden />
                </div>
                <p className={`font-mono text-[9px] uppercase tracking-widest ${role.accent}`}>{role.subtitle}</p>
                <p className="text-zinc-100 text-sm font-semibold mt-0.5" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                  {role.title}
                </p>
              </div>
              {/* Nav */}
              <nav className="flex-1 p-2" aria-label="Demo navigation">
                {role.nav.map((item, i) => {
                  const NavIcon = item.icon
                  const isActive = i === currentAct
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 mb-1 transition-colors ${
                        isActive ? `${role.accentBg} border-l-2 ${role.accentBorder}` : ''
                      }`}
                    >
                      <NavIcon className={`h-3.5 w-3.5 shrink-0 ${isActive ? role.accent : 'text-zinc-600'}`} aria-hidden />
                      <span className={`text-xs ${isActive ? 'text-zinc-100' : 'text-zinc-600'}`}>{item.label}</span>
                    </div>
                  )
                })}
              </nav>
              {/* Act progress */}
              <div className="p-4 border-t border-zinc-800">
                <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest mb-1.5">
                  Act {currentAct + 1} of {actCount}
                </p>
                <div className="h-0.5 bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-none ${role.accentBar}`}
                    style={{ width: `${actProgress * 100}%` }}
                  />
                </div>
                <p className={`font-mono text-[9px] mt-1 ${role.accent}`}>{role.acts[currentAct]}</p>
              </div>
            </div>

            {/* Content pane */}
            <div className="p-6 overflow-auto">
              {activeRole === 'hauler' && <HaulerScene act={currentAct} />}
              {activeRole === 'mechanic' && <MechanicScene act={currentAct} />}
              {activeRole === 'crew_chief' && <CrewChiefScene act={currentAct} />}
              {activeRole === 'team_manager' && <TeamManagerScene act={currentAct} />}
              {activeRole === 'analyst' && <AnalystScene act={currentAct} />}
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause demo' : 'Play demo'}
                className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 hover:text-zinc-300 border border-zinc-800 px-2.5 py-1 transition-colors"
              >
                {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {playing ? 'PAUSE' : 'PLAY'}
              </button>
              <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest hidden sm:block">
                Auto-cycles through all 5 roles · Every console · Every race weekend workflow
              </span>
            </div>
            <span className={`font-mono text-[10px] ${role.accent} uppercase tracking-widest`}>
              {role.acts[currentAct]}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
