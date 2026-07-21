'use client'

import { useState, useEffect, useCallback } from 'react'
import { Brain, TrendingUp, Sparkles, Plus, ChevronDown, ChevronUp, BarChart2, Lock, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AiInsightPanel from './ai-insight-panel'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MentalEntry {
  id: string
  entryDate: string
  entryType: string
  mood: number | null
  focus: number | null
  anxiety: number | null
  confidence: number | null
  motivation: number | null
  notes: string | null
  linkedScheduleEventId: string | null
}

interface Props {
  tier?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ENTRY_TYPES = ['daily', 'pre-race', 'post-race', 'mid-week'] as const

const METRICS: { key: keyof MentalEntry; label: string; invert?: boolean; color: string }[] = [
  { key: 'mood',       label: 'Mood',        color: 'text-lime-400' },
  { key: 'focus',      label: 'Focus',       color: 'text-cyan-400' },
  { key: 'confidence', label: 'Confidence',  color: 'text-amber-400' },
  { key: 'motivation', label: 'Motivation',  color: 'text-violet-400' },
  { key: 'anxiety',    label: 'Anxiety',     invert: true, color: 'text-red-400' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(val: number, invert = false): string {
  const v = invert ? 11 - val : val
  if (v >= 8) return 'text-lime-400'
  if (v >= 5) return 'text-amber-400'
  return 'text-red-400'
}

function scoreBg(val: number, invert = false): string {
  const v = invert ? 11 - val : val
  if (v >= 8) return 'bg-lime-400/20'
  if (v >= 5) return 'bg-amber-400/20'
  return 'bg-red-400/20'
}

function barWidth(val: number | null, invert = false): string {
  if (val == null) return '0%'
  const v = invert ? 11 - val : val
  return `${(v / 10) * 100}%`
}

function avg(entries: MentalEntry[], key: keyof MentalEntry): number | null {
  const vals = entries
    .map(e => e[key])
    .filter((v): v is number => typeof v === 'number')
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function readinessScore(entry: MentalEntry | null): number {
  if (!entry) return 0
  const vals = [entry.mood, entry.focus, entry.confidence, entry.motivation]
    .filter((v): v is number => v != null)
  const anxietyPenalty = entry.anxiety != null ? (entry.anxiety - 5) * 0.5 : 0
  if (!vals.length) return 0
  const base = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.max(0, Math.min(10, base - Math.max(0, anxietyPenalty)))
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreSlider({ label, value, onChange, invert }: {
  label: string; value: number; onChange: (v: number) => void; invert?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${scoreColor(value, invert)}`}>{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-lime-400 h-1.5"
      />
      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>{invert ? 'Calm' : 'Low'}</span>
        <span>{invert ? 'Anxious' : 'High'}</span>
      </div>
    </div>
  )
}

function MiniBar({ val, max = 10, invert = false, color }: {
  val: number | null; max?: number; invert?: boolean; color: string
}) {
  if (val == null) return <div className="h-1.5 w-full rounded-full bg-zinc-800" />
  const pct = invert ? ((11 - val) / max) * 100 : (val / max) * 100
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color.replace('text-', 'bg-')}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function TrendChart({ entries, metricKey, invert }: {
  entries: MentalEntry[]; metricKey: keyof MentalEntry; invert?: boolean
}) {
  const last30 = [...entries].reverse().slice(-30)
  const vals = last30.map(e => {
    const v = e[metricKey]
    return typeof v === 'number' ? (invert ? 11 - v : v) : null
  })
  const max = 10
  const points = vals
    .map((v, i) => {
      if (v == null) return null
      const x = (i / (vals.length - 1 || 1)) * 200
      const y = 40 - (v / max) * 36
      return `${x},${y}`
    })
    .filter(Boolean)

  const pathData = points.length
    ? `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ')
    : ''

  return (
    <svg viewBox="0 0 200 40" className="w-full h-8" preserveAspectRatio="none">
      {pathData && (
        <path d={pathData} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ViewMental({ tier }: Props) {
  const isFactory = tier === 'factory_rig'
  const [entries, setEntries] = useState<MentalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'checkin' | 'trends' | 'program'>('checkin')
  const [showHistory, setShowHistory] = useState(false)

  // Check-in form state
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [entryType, setEntryType] = useState<string>('daily')
  const [mood, setMood] = useState(7)
  const [focus, setFocus] = useState(7)
  const [anxiety, setAnxiety] = useState(4)
  const [confidence, setConfidence] = useState(7)
  const [motivation, setMotivation] = useState(8)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [lastSavedData, setLastSavedData] = useState<Record<string, unknown> | null>(null)

  // AI program state
  const [focusArea, setFocusArea] = useState('')
  const [program, setProgram] = useState<string | null>(null)
  const [generatingProgram, setGeneratingProgram] = useState(false)
  const [programError, setProgramError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/md-mental?limit=90')
      if (!res.ok) return
      const data = await res.json() as { entries: MentalEntry[] }
      setEntries(data.entries ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/md-mental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryDate, entryType, mood, focus, anxiety, confidence, motivation, notes: notes || null }),
      })
      if (!res.ok) return
      setLastSavedData({ mood, focus, anxiety, confidence, motivation, notes: notes || null })
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
      setNotes('')
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/md-mental?id=${id}`, { method: 'DELETE' })
    await load()
  }

  async function handleGenerateProgram() {
    if (!isFactory) return
    setGeneratingProgram(true)
    setProgramError(null)
    setProgram(null)
    try {
      const res = await fetch('/api/md-mental-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus_area: focusArea || undefined }),
      })
      const data = await res.json() as { program?: string; error?: string }
      if (!res.ok || data.error) { setProgramError(data.error ?? 'Generation failed'); return }
      setProgram(data.program ?? null)
    } finally {
      setGeneratingProgram(false)
    }
  }

  const today = entries.find(e => e.entryDate === entryDate) ?? null
  const readiness = readinessScore(today ?? entries[0] ?? null)
  const last7 = entries.slice(0, 7)

  // ── Readiness ring color
  const ringColor = readiness >= 7.5 ? 'stroke-lime-400' : readiness >= 5 ? 'stroke-amber-400' : 'stroke-red-400'
  const ringLabel = readiness >= 7.5 ? 'Race Ready' : readiness >= 5 ? 'Moderate' : 'Off Day'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-400/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-lg">Mental Performance</h2>
            <p className="text-xs text-zinc-500">Track focus, anxiety, confidence + AI coaching programs</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-6 gap-1">
        {(['checkin', 'trends', 'program'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-violet-400 text-violet-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'checkin' ? 'Check-In' : tab === 'trends' ? 'Trends' : 'AI Program'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">

        {/* ── CHECK-IN TAB ── */}
        {activeTab === 'checkin' && (
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Readiness score */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 flex items-center gap-6">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    className={ringColor}
                    strokeWidth="8"
                    strokeDasharray={`${(readiness / 10) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-zinc-100">{readiness.toFixed(1)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Mental Readiness</p>
                <p className={`text-xl font-black ${readiness >= 7.5 ? 'text-lime-400' : readiness >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                  {ringLabel}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {entries.length > 0
                    ? `Based on ${today ? "today's" : "latest"} entry`
                    : 'Log your first check-in below'}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-5">
              <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="h-4 w-4 text-violet-400" />
                Log Check-In
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Entry Type</label>
                  <select
                    value={entryType}
                    onChange={e => setEntryType(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-400"
                  >
                    {ENTRY_TYPES.map(t => (
                      <option key={t} value={t} className="capitalize">{t.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                <ScoreSlider label="Mood" value={mood} onChange={setMood} />
                <ScoreSlider label="Focus" value={focus} onChange={setFocus} />
                <ScoreSlider label="Anxiety" value={anxiety} onChange={setAnxiety} invert />
                <ScoreSlider label="Confidence" value={confidence} onChange={setConfidence} />
                <ScoreSlider label="Motivation" value={motivation} onChange={setMotivation} />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How are you feeling heading into the session?"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-400 resize-none"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold"
              >
                {savedMsg ? 'Saved!' : saving ? 'Saving...' : 'Save Check-In'}
              </Button>
            </div>

            {lastSavedData && (
              <AiInsightPanel
                section="mental"
                data={lastSavedData}
                autoFetch
                onDismiss={() => setLastSavedData(null)}
              />
            )}

            {/* History */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <button
                onClick={() => setShowHistory(h => !h)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                <span>Recent Entries ({entries.length})</span>
                {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showHistory && (
                <div className="border-t border-zinc-800 divide-y divide-zinc-800">
                  {loading && (
                    <p className="text-center text-zinc-500 text-sm py-6">Loading...</p>
                  )}
                  {!loading && entries.length === 0 && (
                    <p className="text-center text-zinc-500 text-sm py-6">No entries yet.</p>
                  )}
                  {entries.slice(0, 10).map(e => (
                    <div key={e.id} className="px-6 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-zinc-200">{e.entryDate}</span>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                            {e.entryType}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {METRICS.map(m => (
                            <div key={m.key} className="text-center">
                              <p className={`text-xs font-bold tabular-nums ${m.color}`}>
                                {e[m.key] != null ? String(e[m.key]) : '—'}
                              </p>
                              <p className="text-[9px] text-zinc-600 uppercase">{m.label.slice(0, 3)}</p>
                            </div>
                          ))}
                        </div>
                        {e.notes && (
                          <p className="text-xs text-zinc-500 mt-2 truncate">{e.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-zinc-600 hover:text-red-400 text-xs shrink-0 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TRENDS TAB ── */}
        {activeTab === 'trends' && (
          <div className="max-w-2xl mx-auto space-y-5">

            {/* 7-day avg cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {METRICS.map(m => {
                const a = avg(last7, m.key)
                const display = m.invert && a != null ? (11 - a).toFixed(1) : a?.toFixed(1) ?? '—'
                return (
                  <div key={m.key} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{m.label}</p>
                    <p className={`text-2xl font-black tabular-nums ${a != null ? scoreColor(a, m.invert) : 'text-zinc-600'}`}>
                      {display}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">7-day avg</p>
                  </div>
                )
              })}
            </div>

            {/* Trend charts */}
            {entries.length > 1 && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-5">
                <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-400" />
                  30-Day Trends
                </h3>
                {METRICS.map(m => (
                  <div key={m.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-400 uppercase tracking-wider">{m.label}</span>
                      <span className={`text-xs font-bold ${m.color}`}>
                        {avg(entries.slice(0, 30), m.key)?.toFixed(1) ?? '—'}
                      </span>
                    </div>
                    <div className={m.color}>
                      <TrendChart entries={entries.slice(0, 30)} metricKey={m.key} invert={m.invert} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Per-entry bar breakdown */}
            {entries.length > 0 && (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                  <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-violet-400" />
                    Entry Breakdown
                  </h3>
                </div>
                <div className="divide-y divide-zinc-800">
                  {entries.slice(0, 14).map(e => (
                    <div key={e.id} className="px-6 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-300">{e.entryDate}</span>
                        <span className="text-[10px] text-zinc-600 uppercase">{e.entryType}</span>
                      </div>
                      <div className="space-y-1.5">
                        {METRICS.map(m => (
                          <div key={m.key} className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-600 w-16 uppercase">{m.label}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${m.color.replace('text-', 'bg-')}`}
                                style={{ width: barWidth(e[m.key] as number | null, m.invert) }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold tabular-nums w-5 text-right ${m.color}`}>
                              {e[m.key] ?? '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entries.length === 0 && !loading && (
              <div className="text-center py-16 text-zinc-500">
                <Brain className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
                <p className="text-sm">No entries yet. Start with the Check-In tab.</p>
              </div>
            )}
          </div>
        )}

        {/* ── AI PROGRAM TAB ── */}
        {activeTab === 'program' && (
          <div className="max-w-2xl mx-auto space-y-5">
            {!isFactory ? (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
                  <Lock className="h-7 w-7 text-zinc-600" />
                </div>
                <div>
                  <p className="font-black text-lg text-zinc-300">Factory Rig Required</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    AI-generated weekly mental performance programs are exclusive to Factory Rig teams.
                  </p>
                </div>
                <a
                  href="/data/pricing"
                  className="inline-block bg-lime-400 text-zinc-950 font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-lime-300 transition-colors"
                >
                  Upgrade to Factory Rig
                </a>
              </div>
            ) : (
              <>
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
                  <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                    Generate 7-Day Mental Program
                  </h3>
                  <p className="text-sm text-zinc-400">
                    AI analyses your last 14 check-ins and builds a dirt-specific weekly mental program targeting your weak points.
                  </p>

                  <div>
                    <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Focus Area (optional)</label>
                    <input
                      type="text"
                      value={focusArea}
                      onChange={e => setFocusArea(e.target.value)}
                      placeholder="e.g. pre-gate nerves, pass aggression, block passes"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-400"
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-zinc-800/60 rounded-xl p-4">
                    {METRICS.map(m => {
                      const a = avg(entries.slice(0, 14), m.key)
                      return (
                        <div key={m.key} className="flex-1 text-center">
                          <p className={`text-sm font-black ${a != null ? scoreColor(a, m.invert) : 'text-zinc-600'}`}>
                            {a != null ? a.toFixed(1) : '—'}
                          </p>
                          <p className="text-[9px] text-zinc-600 uppercase mt-0.5">{m.label.slice(0, 3)}</p>
                        </div>
                      )
                    })}
                  </div>

                  <Button
                    onClick={handleGenerateProgram}
                    disabled={generatingProgram || entries.length === 0}
                    className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold flex items-center justify-center gap-2"
                  >
                    {generatingProgram ? (
                      <>
                        <Zap className="h-4 w-4 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Program
                      </>
                    )}
                  </Button>
                  {entries.length === 0 && (
                    <p className="text-xs text-zinc-600 text-center">Log at least one check-in first.</p>
                  )}
                  {programError && (
                    <p className="text-xs text-red-400 text-center">{programError}</p>
                  )}
                </div>

                {program && (
                  <div className="bg-zinc-900 rounded-2xl border border-violet-500/20 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-4 w-4 text-violet-400" />
                      <h3 className="font-bold text-zinc-100">Your 7-Day Program</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      {program.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                          return <h3 key={i} className="text-violet-400 font-black text-sm uppercase tracking-wider mt-5 mb-2">{line.slice(3)}</h3>
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-bold text-zinc-200 text-sm">{line.slice(2, -2)}</p>
                        }
                        if (line.trim() === '') return <div key={i} className="h-2" />
                        return <p key={i} className="text-zinc-400 text-sm leading-relaxed">{line}</p>
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
