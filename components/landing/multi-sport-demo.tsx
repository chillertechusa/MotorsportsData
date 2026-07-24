'use client'

import { useMemo, useState } from 'react'
import {
  Zap, Trees, Star, Circle, Map, Baby, Gauge, Flame, Mountain, Trophy,
  ArrowRight, CheckCircle2, Cpu, type LucideIcon,
} from 'lucide-react'
import { DISCIPLINES, type DisciplineId } from '@/lib/md-discipline'
import {
  ROLE_LENSES, STAGES, buildLensView, type RoleId, type StageId,
} from '@/lib/demo-lenses'

const ICONS: Record<string, LucideIcon> = {
  Zap, Trees, Star, Circle, Map, Baby, Gauge, Flame, Mountain, Trophy,
}

export default function MultiSportDemo() {
  const [disciplineId, setDisciplineId] = useState<DisciplineId>('mx_sx')
  const [role, setRole] = useState<RoleId>('team')
  const [stage, setStage] = useState<StageId>('capture')

  const view = useMemo(() => buildLensView(disciplineId, role), [disciplineId, role])
  const activeStage = view.stages[stage]

  return (
    <section
      id="demo"
      className="bg-zinc-950 border-t border-zinc-800 py-24 md:py-28"
      aria-label="Interactive product demo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            // one platform, every discipline
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-5"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            See It Through <span className="text-lime-400">Your Lens</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed text-pretty">
            One operating system. Pick a discipline and a role&mdash;watch the same platform
            re-skin its vocabulary, metrics, race-day playbook, and AI coaching to fit exactly
            how you race.
          </p>
        </div>

        {/* Discipline selector */}
        <div className="mb-6">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
            Discipline
          </p>
          <div role="tablist" aria-label="Select discipline" className="flex flex-wrap gap-2">
            {DISCIPLINES.map((d) => {
              const Icon = ICONS[d.iconName] ?? Zap
              const selected = d.id === disciplineId
              return (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setDisciplineId(d.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 border font-mono text-[11px] uppercase tracking-wider transition-colors ${
                    selected
                      ? 'text-lime-400 border-lime-400 bg-zinc-900'
                      : 'text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Role selector */}
        <div className="mb-8">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
            Your role
          </p>
          <div role="tablist" aria-label="Select role" className="flex flex-wrap gap-2">
            {ROLE_LENSES.map((r) => {
              const selected = r.id === role
              return (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setRole(r.id)}
                  className={`px-5 py-2.5 border font-black text-xs uppercase tracking-widest transition-colors ${
                    selected
                      ? 'bg-lime-400 text-zinc-950 border-lime-400'
                      : 'text-zinc-400 border-zinc-800 hover:border-lime-400/40 hover:text-zinc-100'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
          <p className="text-zinc-500 text-sm mt-3">{view.roleTagline}</p>
        </div>

        {/* Demo frame */}
        <div className="border border-zinc-800 bg-zinc-900">
          {/* Frame header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-lime-400" aria-hidden="true" />
              <span className="font-mono text-xs text-zinc-300 uppercase tracking-widest">
                {view.disciplineLabel} &middot; {view.roleLabel} view
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest hidden sm:inline">
              Live demo
            </span>
          </div>

          {/* Stage stepper */}
          <div
            role="tablist"
            aria-label="Workflow stage"
            className="grid grid-cols-2 sm:grid-cols-5 border-b border-zinc-800"
          >
            {STAGES.map((s, i) => {
              const selected = s.id === stage
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setStage(s.id)}
                  className={`flex flex-col items-start gap-1 px-4 py-3.5 border-r border-zinc-800 text-left transition-colors ${
                    selected ? 'bg-zinc-950' : 'hover:bg-zinc-950/50'
                  }`}
                >
                  <span className={`font-mono text-[10px] uppercase tracking-widest ${selected ? 'text-lime-400' : 'text-zinc-600'}`}>
                    {String(i + 1).padStart(2, '0')} / {s.label}
                  </span>
                  <span className={`text-xs ${selected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {s.blurb}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Stage panel */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-px bg-zinc-800">
            {/* Narrative */}
            <div className="lg:col-span-3 bg-zinc-900 p-6 sm:p-8">
              <h3
                className="text-zinc-100 text-2xl uppercase leading-tight mb-4"
                style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800 }}
              >
                {activeStage.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed text-pretty mb-6">{activeStage.body}</p>

              {/* Channels appear on capture stage */}
              {stage === 'capture' && (
                <div className="flex flex-wrap gap-2">
                  {(DISCIPLINES.find((d) => d.id === disciplineId)?.sessionTypes ?? []).slice(0, 5).map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500"
                    >
                      <CheckCircle2 className="h-3 w-3 text-lime-400" aria-hidden="true" />
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metric tiles */}
            <div className="lg:col-span-2 bg-zinc-900 p-6 sm:p-8 flex flex-col gap-3">
              {activeStage.tiles.map((t) => (
                <div key={t.label} className="border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">
                    {t.label}
                  </p>
                  <div className="flex items-end justify-between gap-2">
                    <span
                      className="text-zinc-100 text-xl leading-none"
                      style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
                    >
                      {t.value}
                    </span>
                    {t.delta && (
                      <span className={`font-mono text-[11px] ${t.positive ? 'text-lime-400' : 'text-zinc-500'}`}>
                        {t.delta}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI footer */}
          <div className="flex items-start gap-3 border-t border-zinc-800 bg-lime-400/5 px-5 sm:px-8 py-4">
            <Cpu className="h-4 w-4 mt-0.5 shrink-0 text-lime-400" aria-hidden="true" />
            <p className="text-zinc-300 text-sm leading-relaxed text-pretty">{view.aiLine}</p>
          </div>
        </div>

        {/* CTA under demo */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-black text-sm uppercase tracking-widest px-8 py-4 hover:bg-lime-300 transition-colors"
          >
            Lock Your Founding Price
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
            Riders &middot; Teams &middot; Coaches &mdash; one platform, {DISCIPLINES.length} disciplines
          </p>
        </div>
      </div>
    </section>
  )
}
