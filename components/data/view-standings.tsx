'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Trophy, Plus, Pencil, Trash2, X, Loader2, ChevronUp,
  ChevronDown, Medal, Crown, Flag, RefreshCw, Check,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StandingRow {
  id?: string
  rank: number
  riderName: string
  riderNumber: number | null
  teamName: string | null
  points: number
  lastResult: string | null
}

interface Series {
  id: string
  seriesName: string
  discipline: string
  year: number
  currentRound: number
  totalRounds: number
  updatedAt: string
}

interface SeriesWithStandings {
  series: Series
  standings: StandingRow[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISCIPLINES = [
  { value: 'supercross', label: 'AMA Supercross' },
  { value: 'supercross_250', label: 'AMA Supercross 250' },
  { value: 'pro_motocross', label: 'Pro Motocross 450' },
  { value: 'pro_motocross_250', label: 'Pro Motocross 250' },
  { value: 'smx', label: 'SuperMotocross' },
  { value: 'gncc', label: 'GNCC' },
  { value: 'enduro', label: 'Enduro' },
  { value: 'flat_track', label: 'Flat Track' },
  { value: 'other', label: 'Other' },
]

const LAST_RESULTS = [
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th',
  'DNF', 'DNS', 'DSQ',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />
  if (rank === 2) return <Medal className="h-4 w-4 text-zinc-300" />
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
  return null
}

function lastResultColor(result: string | null) {
  if (!result) return 'text-zinc-600'
  if (result === '1st') return 'text-yellow-400'
  if (['2nd', '3rd'].includes(result)) return 'text-lime-400'
  if (['DNF', 'DNS', 'DSQ'].includes(result)) return 'text-red-400'
  return 'text-zinc-400'
}

function pointsFromLeader(standings: StandingRow[], rank: number) {
  const leader = standings.find((s) => s.rank === 1)
  const rider = standings.find((s) => s.rank === rank)
  if (!leader || !rider) return null
  const diff = leader.points - rider.points
  if (diff === 0) return null
  return diff
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full border border-lime-400/20 bg-lime-400/5">
        <Trophy className="h-9 w-9 text-lime-400" />
      </div>
      <h2 className="mb-2 text-xl font-black uppercase tracking-wide text-zinc-100">
        No Championships Tracked
      </h2>
      <p className="mb-8 max-w-sm text-sm text-zinc-500 leading-relaxed">
        Add a championship series to track points, see the leader, and know exactly where your riders stand after every round.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Championship
      </button>
    </div>
  )
}

// ─── Series form ──────────────────────────────────────────────────────────────

interface SeriesFormProps {
  initial?: Series | null
  onSave: (data: Omit<Series, 'id' | 'updatedAt'>) => void
  onCancel: () => void
}

function SeriesForm({ initial, onSave, onCancel }: SeriesFormProps) {
  const [seriesName, setSeriesName] = useState(initial?.seriesName ?? '')
  const [discipline, setDiscipline] = useState(initial?.discipline ?? 'supercross')
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear())
  const [currentRound, setCurrentRound] = useState(initial?.currentRound ?? 1)
  const [totalRounds, setTotalRounds] = useState(initial?.totalRounds ?? 17)

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
        {initial ? 'Edit Series' : 'New Championship Series'}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Series Name</label>
          <input
            value={seriesName}
            onChange={(e) => setSeriesName(e.target.value)}
            placeholder="e.g. 2025 AMA Supercross 450"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Discipline</label>
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
          >
            {DISCIPLINES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={2020}
            max={2030}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Current Round</label>
          <input
            type="number"
            value={currentRound}
            onChange={(e) => setCurrentRound(Number(e.target.value))}
            min={1}
            max={totalRounds}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Total Rounds</label>
          <input
            type="number"
            value={totalRounds}
            onChange={(e) => setTotalRounds(Number(e.target.value))}
            min={1}
            max={30}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          onClick={() => onSave({ seriesName, discipline, year, currentRound, totalRounds })}
          disabled={!seriesName.trim()}
          className="flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="h-4 w-4" />
          {initial ? 'Save Changes' : 'Create Series'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Standings editor ─────────────────────────────────────────────────────────

interface StandingsEditorProps {
  seriesId: string
  initial: StandingRow[]
  onSaved: () => void
  onCancel: () => void
}

function StandingsEditor({ seriesId, initial, onSaved, onCancel }: StandingsEditorProps) {
  const [rows, setRows] = useState<StandingRow[]>(
    initial.length > 0
      ? initial
      : Array.from({ length: 5 }, (_, i) => ({
          rank: i + 1,
          riderName: '',
          riderNumber: null,
          teamName: null,
          points: 0,
          lastResult: null,
        }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateRow(index: number, field: keyof StandingRow, value: string | number | null) {
    setRows((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r))
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { rank: prev.length + 1, riderName: '', riderNumber: null, teamName: null, points: 0, lastResult: null },
    ])
  }

  function removeRow(index: number) {
    setRows((prev) =>
      prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, rank: i + 1 }))
    )
  }

  async function handleSave() {
    const valid = rows.filter((r) => r.riderName.trim())
    if (!valid.length) { setError('Add at least one rider.'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/md-standings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId, standings: valid }),
      })
      if (!res.ok) throw new Error('Save failed')
      onSaved()
    } catch {
      setError('Could not save standings. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-[2.5rem_1fr_5rem_1fr_5rem_6rem_2.5rem] gap-2 px-2">
        {['#', 'Rider', 'No.', 'Team', 'Pts', 'Last', ''].map((h) => (
          <span key={h} className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">{h}</span>
        ))}
      </div>

      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[2.5rem_1fr_1fr] sm:grid-cols-[2.5rem_1fr_5rem_1fr_5rem_6rem_2.5rem] gap-2 items-center">
          {/* Rank */}
          <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-zinc-800 text-xs font-black text-zinc-400 tabular-nums">
            {row.rank}
          </span>
          {/* Rider name */}
          <input
            value={row.riderName}
            onChange={(e) => updateRow(i, 'riderName', e.target.value)}
            placeholder="Rider name"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none col-span-1"
          />
          {/* Rider number */}
          <input
            type="number"
            value={row.riderNumber ?? ''}
            onChange={(e) => updateRow(i, 'riderNumber', e.target.value ? Number(e.target.value) : null)}
            placeholder="No."
            className="hidden sm:block rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
          />
          {/* Team name */}
          <input
            value={row.teamName ?? ''}
            onChange={(e) => updateRow(i, 'teamName', e.target.value || null)}
            placeholder="Team"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
          />
          {/* Points */}
          <input
            type="number"
            value={row.points}
            onChange={(e) => updateRow(i, 'points', Number(e.target.value))}
            placeholder="Pts"
            className="hidden sm:block rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
          />
          {/* Last result */}
          <select
            value={row.lastResult ?? ''}
            onChange={(e) => updateRow(i, 'lastResult', e.target.value || null)}
            className="hidden sm:block rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
          >
            <option value="">—</option>
            {LAST_RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {/* Remove */}
          <button
            onClick={() => removeRow(i)}
            className="hidden sm:flex items-center justify-center h-9 w-9 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        onClick={addRow}
        className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-700 px-4 py-2.5 text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors w-full justify-center"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Rider
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save Standings
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Series card ──────────────────────────────────────────────────────────────

interface SeriesCardProps {
  data: SeriesWithStandings
  onEdit: () => void
  onDelete: () => void
  onEditStandings: () => void
}

function SeriesCard({ data, onEdit, onDelete, onEditStandings }: SeriesCardProps) {
  const { series, standings } = data
  const [expanded, setExpanded] = useState(true)

  const leader = standings[0] ?? null
  const roundsLeft = series.totalRounds - series.currentRound
  const discLabel = DISCIPLINES.find((d) => d.value === series.discipline)?.label ?? series.discipline

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Card header */}
      <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Trophy className="h-4 w-4 text-lime-400 shrink-0" />
            <h3 className="text-base font-black uppercase tracking-wide text-zinc-100 truncate">
              {series.seriesName}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-2 py-0.5 font-medium">
              <Flag className="h-3 w-3" />
              {discLabel}
            </span>
            <span>Round {series.currentRound} of {series.totalRounds}</span>
            <span>{roundsLeft} round{roundsLeft === 1 ? '' : 's'} remaining</span>
            <span className="text-zinc-700">Updated {timeAgo(series.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEditStandings}
            title="Update standings"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-lime-400 hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            title="Edit series"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            title="Delete series"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Points leader callout */}
      {leader && (
        <div className="mx-5 mb-4 flex items-center gap-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3">
          <Crown className="h-5 w-5 text-yellow-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-0.5">Points Leader</p>
            <p className="text-base font-black uppercase tracking-wide text-zinc-100 truncate">
              {leader.riderNumber ? `#${leader.riderNumber} ` : ''}{leader.riderName}
            </p>
            {leader.teamName && <p className="text-xs text-zinc-500 truncate">{leader.teamName}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-lime-400 tabular-nums leading-none">{leader.points}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">pts</p>
          </div>
        </div>
      )}

      {/* Full standings table */}
      {expanded && standings.length > 0 && (
        <div className="px-5 pb-5">
          <div className="rounded-xl overflow-hidden border border-zinc-800">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[2.5rem_2.5rem_1fr_1fr_4.5rem_4rem] bg-zinc-950 px-4 py-2 gap-3">
              {['Pos', 'No.', 'Rider', 'Team', 'Points', 'Last'].map((h) => (
                <span key={h} className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">{h}</span>
              ))}
            </div>
            {standings.map((row, i) => {
              const deficit = pointsFromLeader(standings, row.rank)
              return (
                <div
                  key={row.id ?? i}
                  className={`grid grid-cols-[2.5rem_1fr_4rem] sm:grid-cols-[2.5rem_2.5rem_1fr_1fr_4.5rem_4rem] gap-3 items-center px-4 py-3 border-t border-zinc-800/50 ${
                    row.rank === 1 ? 'bg-yellow-400/5' : i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-950'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tabular-nums text-zinc-400">{row.rank}</span>
                    {rankIcon(row.rank)}
                  </div>
                  {/* Number */}
                  <span className="hidden sm:block text-xs font-mono text-zinc-500 tabular-nums">
                    {row.riderNumber ? `#${row.riderNumber}` : '—'}
                  </span>
                  {/* Rider */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-100 truncate">{row.riderName}</p>
                    {deficit !== null && (
                      <p className="text-[10px] text-zinc-600 tabular-nums">-{deficit} pts</p>
                    )}
                  </div>
                  {/* Team */}
                  <p className="hidden sm:block text-xs text-zinc-500 truncate">{row.teamName ?? '—'}</p>
                  {/* Points */}
                  <span className={`text-sm font-black tabular-nums ${row.rank === 1 ? 'text-lime-400' : 'text-zinc-300'}`}>
                    {row.points}
                  </span>
                  {/* Last result */}
                  <span className={`text-xs font-bold tabular-nums ${lastResultColor(row.lastResult)}`}>
                    {row.lastResult ?? '—'}
                  </span>
                </div>
              )
            })}
          </div>
          {standings.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-600">No standings entered yet.</p>
          )}
        </div>
      )}

      {!expanded && standings.length > 0 && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Show {standings.length} riders
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ViewStandings() {
  const [data, setData] = useState<SeriesWithStandings[]>([])
  const [loading, setLoading] = useState(true)
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [editingStandingsFor, setEditingStandingsFor] = useState<SeriesWithStandings | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/md-standings')
      const json = await res.json()
      setData(json.series ?? [])
    } catch {
      /* offline — leave last known state */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreateSeries(fields: Omit<Series, 'id' | 'updatedAt'>) {
    try {
      await fetch('/api/md-standings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, standings: [] }),
      })
      setShowSeriesForm(false)
      load()
    } catch { /* noop */ }
  }

  async function handleUpdateSeries(seriesId: string, fields: Omit<Series, 'id' | 'updatedAt'>) {
    const existing = data.find((d) => d.series.id === seriesId)
    try {
      await fetch('/api/md-standings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId, ...fields, standings: existing?.standings ?? [] }),
      })
      setEditingSeries(null)
      load()
    } catch { /* noop */ }
  }

  async function handleDeleteSeries(seriesId: string) {
    if (!confirm('Delete this championship and all its standings?')) return
    await fetch(`/api/md-standings?seriesId=${seriesId}`, { method: 'DELETE' })
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
      </div>
    )
  }

  // Editing standings for a specific series
  if (editingStandingsFor) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditingStandingsFor(null)}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors"
          >
            <ChevronUp className="h-3.5 w-3.5 rotate-[270deg]" />
            Back
          </button>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wide text-zinc-100">
              Update Standings
            </h2>
            <p className="text-xs text-zinc-500">{editingStandingsFor.series.seriesName} · Round {editingStandingsFor.series.currentRound}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <StandingsEditor
            seriesId={editingStandingsFor.series.id}
            initial={editingStandingsFor.standings}
            onSaved={() => { setEditingStandingsFor(null); load() }}
            onCancel={() => setEditingStandingsFor(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Page actions */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {data.length === 0
            ? 'Track points leaders across any series.'
            : `${data.length} series tracked`}
        </p>
        {!showSeriesForm && (
          <button
            onClick={() => setShowSeriesForm(true)}
            className="flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Series
          </button>
        )}
      </div>

      {/* Create new series form */}
      {showSeriesForm && (
        <SeriesForm
          onSave={handleCreateSeries}
          onCancel={() => setShowSeriesForm(false)}
        />
      )}

      {/* Edit series form */}
      {editingSeries && (
        <SeriesForm
          initial={editingSeries}
          onSave={(fields) => handleUpdateSeries(editingSeries.id, fields)}
          onCancel={() => setEditingSeries(null)}
        />
      )}

      {/* Empty state */}
      {data.length === 0 && !showSeriesForm && (
        <EmptyState onAdd={() => setShowSeriesForm(true)} />
      )}

      {/* Series cards */}
      {data.map((item) => (
        <SeriesCard
          key={item.series.id}
          data={item}
          onEdit={() => setEditingSeries(item.series)}
          onDelete={() => handleDeleteSeries(item.series.id)}
          onEditStandings={() => setEditingStandingsFor(item)}
        />
      ))}
    </div>
  )
}
