'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Zap,
  Trees,
  Star,
  Circle,
  Map,
  Baby,
  Check,
  RefreshCw,
  ChevronRight,
  Brain,
  Dumbbell,
  Gauge,
  Flame,
  Mountain,
  Trophy,
} from 'lucide-react'
import { DISCIPLINES, type Discipline, type DisciplineId } from '@/lib/md-discipline'

// ── Icon map (Lucide doesn't support dynamic string names at runtime) ──────────

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Trees,
  Star,
  Circle,
  Map,
  Baby,
  Gauge,
  Flame,
  Mountain,
  Trophy,
}

function DisciplineIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Zap
  return <Icon className={className} />
}

// ── Discipline card ────────────────────────────────────────────────────────────

function DisciplineCard({
  discipline,
  selected,
  onClick,
}: {
  discipline: Discipline
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 transition-all focus:outline-none ${
        selected
          ? 'border-lime-500 bg-lime-950/30 ring-1 ring-lime-500/30'
          : 'border-zinc-700 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900/80'
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${discipline.accentColor}`}>
          <DisciplineIcon name={discipline.iconName} className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-zinc-100 text-sm">{discipline.label}</span>
            {selected && (
              <span className="flex items-center gap-1 text-xs font-bold text-lime-400 shrink-0">
                <Check className="h-3.5 w-3.5" />
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{discipline.description}</p>

          {/* Session types preview */}
          <div className="flex flex-wrap gap-1 mt-2">
            {discipline.sessionTypes.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Protocol preview ───────────────────────────────────────────────────────────

function ProtocolPreview({ discipline }: { discipline: Discipline }) {
  const lines = discipline.aiProtocolText
    .split('\n')
    .filter((l) => l.startsWith('- '))
    .slice(0, 4)
    .map((l) => l.replace(/^- /, ''))

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-zinc-500" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">AI Coach Protocol Preview</p>
      </div>
      <p className="text-xs text-zinc-500">
        When you select <span className="text-zinc-300 font-semibold">{discipline.label}</span>, all AI routes
        (Race Coach, MD Intel, Feature Chat) are grounded with discipline-specific knowledge:
      </p>
      <ul className="space-y-1">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-zinc-600" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 pt-1">
        <Dumbbell className="h-3.5 w-3.5 text-zinc-600" />
        <p className="text-xs text-zinc-600">
          Session types: {discipline.sessionTypes.join(', ')}
        </p>
      </div>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ViewDiscipline() {
  const [currentDiscipline, setCurrentDiscipline] = useState<DisciplineId | null>(null)
  const [selected, setSelected] = useState<DisciplineId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/md-team')
      if (!res.ok) return
      const data = await res.json()
      const disc = (data.discipline as DisciplineId) ?? null
      setCurrentDiscipline(disc)
      setSelected(disc)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/md-team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discipline: selected }),
      })
      if (res.ok) {
        setCurrentDiscipline(selected)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const hasChange = selected !== currentDiscipline
  const selectedDiscipline = DISCIPLINES.find((d) => d.id === selected) ?? DISCIPLINES[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 text-zinc-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">Discipline</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Set your primary motorsport discipline — all AI routes adapt their coaching language and protocols to match.
          </p>
        </div>
        {currentDiscipline && (
          <div className="text-right shrink-0">
            <p className="text-xs text-zinc-500">Current</p>
            <p className="text-sm font-bold text-lime-400">
              {DISCIPLINES.find((d) => d.id === currentDiscipline)?.label ?? currentDiscipline}
            </p>
          </div>
        )}
      </div>

      {/* Picker grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {DISCIPLINES.map((d) => (
          <DisciplineCard
            key={d.id}
            discipline={d}
            selected={selected === d.id}
            onClick={() => setSelected(d.id as DisciplineId)}
          />
        ))}
      </div>

      {/* AI protocol preview for selected */}
      {selectedDiscipline && (
        <ProtocolPreview discipline={selectedDiscipline} />
      )}

      {/* Save bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChange || saving}
          className={`px-6 py-3 font-black uppercase tracking-widest rounded text-sm transition-colors ${
            hasChange && !saving
              ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : 'Save Discipline'}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-lime-400 font-bold">
            <Check className="h-4 w-4" />
            Saved — AI routes updated
          </span>
        )}
        {!hasChange && !saved && currentDiscipline && (
          <span className="text-xs text-zinc-600">No changes</span>
        )}
      </div>

      {/* What changes callout */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs font-bold text-zinc-400 mb-2">What this setting affects</p>
        <ul className="space-y-1 text-xs text-zinc-500">
          <li className="flex items-start gap-2">
            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-zinc-600" />
            <span><span className="text-zinc-300">Race Coach AI</span> — system prompt grounded with discipline-specific coaching protocols, fitness framing, and race strategy language</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-zinc-600" />
            <span><span className="text-zinc-300">MD Intel (Factory)</span> — setup analysis references discipline-specific service priorities and setup ranges</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-zinc-600" />
            <span><span className="text-zinc-300">Feature chatbots</span> — all per-section AI assistants use discipline-aware terminology</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-zinc-600" />
            <span><span className="text-zinc-300">Session types</span> — discipline-specific session type suggestions when logging practice and race sessions</span>
          </li>
        </ul>
      </div>

    </div>
  )
}
