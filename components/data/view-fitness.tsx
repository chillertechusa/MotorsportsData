'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, Moon, Zap, Droplets, Utensils, TrendingUp, Plus, X, Search, Loader2, Trash2, ChevronDown } from 'lucide-react'
import AiInsightPanel from './ai-insight-panel'

// ── Types ───────────────────────────────────────────────────────────────────

interface ReadinessEntry {
  id: string
  entryDate: string
  sleepHours: string | null
  sleepScore: number | null
  hrv: number | null
  restingHr: number | null
  energy: number | null
  fatigue: number | null
  notes: string | null
  source: string
}

interface NutritionEntry {
  id: string
  logDate: string
  mealType: string
  foodName: string
  quantityGrams: string | null
  calories: string | null
  proteinG: string | null
  carbsG: string | null
  fatG: string | null
  waterMl: number | null
}

interface HydrationEntry {
  id: string
  logDate: string
  preRideWeightKg: string | null
  postRideWeightKg: string | null
  waterConsumedMl: number
  notes: string | null
}

interface FoodResult {
  fdcId: string
  name: string
  brand: string | null
  per100g: { calories: number; proteinG: number; carbsG: number; fatG: number }
}

type Tab = 'readiness' | 'nutrition' | 'hydration'
type ReadinessField = 'sleepHours' | 'sleepScore' | 'hrv' | 'restingHr' | 'energy' | 'fatigue'

// ── Helpers ─────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10)

function scoreColor(val: number | null, field: ReadinessField): string {
  if (val == null) return 'text-zinc-500'
  const isInverse = field === 'fatigue' || field === 'restingHr'
  const pct = field === 'sleepHours' ? (val / 9) * 100
    : field === 'restingHr' ? (1 - ((val - 40) / 60)) * 100
    : field === 'hrv' ? Math.min(val / 80, 1) * 100
    : val
  const normalized = isInverse && field !== 'restingHr' ? 100 - pct : pct
  if (normalized >= 70) return 'text-lime-400'
  if (normalized >= 45) return 'text-amber-400'
  return 'text-red-400'
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const MEAL_TYPES = ['breakfast', 'pre-ride', 'intra-ride', 'post-ride', 'lunch', 'dinner', 'snack', 'supplement']
const MEAL_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-500/20 text-amber-400',
  'pre-ride': 'bg-lime-500/20 text-lime-400',
  'intra-ride': 'bg-cyan-500/20 text-cyan-400',
  'post-ride': 'bg-blue-500/20 text-blue-400',
  lunch: 'bg-orange-500/20 text-orange-400',
  dinner: 'bg-purple-500/20 text-purple-400',
  snack: 'bg-zinc-500/20 text-zinc-400',
  supplement: 'bg-pink-500/20 text-pink-400',
}

// ── Readiness Check-In Modal ─────────────────────────────────────────────────

function ReadinessModal({ onClose, onSaved, existing }: {
  onClose: () => void
  onSaved: (data: Record<string, unknown>) => void
  existing?: ReadinessEntry | null
}) {
  const [date, setDate] = useState(existing?.entryDate ?? today())
  const [sleepHours, setSleepHours] = useState(existing?.sleepHours ?? '')
  const [sleepScore, setSleepScore] = useState(String(existing?.sleepScore ?? ''))
  const [hrv, setHrv] = useState(String(existing?.hrv ?? ''))
  const [restingHr, setRestingHr] = useState(String(existing?.restingHr ?? ''))
  const [energy, setEnergy] = useState(String(existing?.energy ?? ''))
  const [fatigue, setFatigue] = useState(String(existing?.fatigue ?? ''))
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true); setError('')
    const res = await fetch('/api/md-readiness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryDate: date,
        sleepHours: sleepHours ? Number(sleepHours) : null,
        sleepScore: sleepScore ? Number(sleepScore) : null,
        hrv: hrv ? Number(hrv) : null,
        restingHr: restingHr ? Number(restingHr) : null,
        energy: energy ? Number(energy) : null,
        fatigue: fatigue ? Number(fatigue) : null,
        notes: notes || null,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!data.success) { setError(data.error ?? 'Failed'); return }
    onSaved({
      sleepHours: sleepHours ? Number(sleepHours) : null,
      sleepScore: sleepScore ? Number(sleepScore) : null,
      hrv: hrv ? Number(hrv) : null,
      restingHr: restingHr ? Number(restingHr) : null,
      energy: energy ? Number(energy) : null,
      fatigue: fatigue ? Number(fatigue) : null,
      notes: notes || null,
    })
    onClose()
  }

  const Slider = ({ label, value, onChange, min = 1, max = 10, unit = '' }: {
    label: string; value: string; onChange: (v: string) => void; min?: number; max?: number; unit?: string
  }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
        <span className="text-xs font-mono text-lime-400">{value ? `${value}${unit}` : '—'}</span>
      </div>
      <input type="range" min={min} max={max} step={min < 1 ? 0.5 : 1}
        value={value || min}
        onChange={e => onChange(e.target.value)}
        className="w-full accent-lime-400 h-1.5"
      />
      <div className="flex justify-between text-[10px] text-zinc-700 mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
          <h2 className="font-black uppercase tracking-wider text-zinc-100 text-lg">Daily Check-In</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-zinc-500" /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Sleep (hrs)</label>
              <input type="number" min="0" max="14" step="0.5" value={sleepHours} onChange={e => setSleepHours(e.target.value)}
                placeholder="8.0"
                className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Resting HR (bpm)</label>
              <input type="number" min="30" max="120" value={restingHr} onChange={e => setRestingHr(e.target.value)}
                placeholder="48"
                className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">HRV (ms) — morning measurement</label>
            <input type="number" min="0" max="200" value={hrv} onChange={e => setHrv(e.target.value)}
              placeholder="65"
              className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
          </div>

          <Slider label="Energy level" value={energy} onChange={setEnergy} />
          <Slider label="Fatigue level" value={fatigue} onChange={setFatigue} />
          <Slider label="Sleep quality score" value={sleepScore} onChange={setSleepScore} />

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Sore legs, late night, travel day..."
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none resize-none" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <div className="px-6 pb-5">
          <button onClick={save} disabled={saving}
            className="w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wider text-sm hover:bg-lime-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Check-In'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Nutrition Log Modal ───────────────────────────────────────────────────────

function NutritionModal({ onClose, onSaved, date: initialDate }: {
  onClose: () => void
  onSaved: () => void
  date: string
}) {
  const [logDate, setLogDate] = useState(initialDate)
  const [mealType, setMealType] = useState('breakfast')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<FoodResult | null>(null)
  const [qty, setQty] = useState('100')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    const res = await fetch(`/api/md-food-search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.foods ?? [])
    setSearching(false)
  }

  function macrosForQty(food: FoodResult) {
    const g = Number(qty) || 100
    const ratio = g / 100
    return {
      calories: +(food.per100g.calories * ratio).toFixed(1),
      proteinG: +(food.per100g.proteinG * ratio).toFixed(1),
      carbsG: +(food.per100g.carbsG * ratio).toFixed(1),
      fatG: +(food.per100g.fatG * ratio).toFixed(1),
    }
  }

  async function save() {
    if (!selected) return
    setSaving(true); setError('')
    const macros = macrosForQty(selected)
    const res = await fetch('/api/md-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logDate,
        mealType,
        foodName: selected.name,
        quantityGrams: Number(qty),
        ...macros,
        fdcId: selected.fdcId,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!data.success) { setError(data.error ?? 'Failed'); return }
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
          <h2 className="font-black uppercase tracking-wider text-zinc-100 text-lg">Log Food</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-zinc-500" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Date</label>
              <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
                className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Meal</label>
              <div className="relative">
                <select value={mealType} onChange={e => setMealType(e.target.value)}
                  className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none appearance-none">
                  {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Search Food (USDA database)</label>
            <div className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) search() }}
                placeholder="chicken breast, rice, banana..."
                className="flex-1 h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
              <button onClick={search} disabled={searching}
                className="h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-2">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {results.map(f => (
                <button key={f.fdcId} onClick={() => { setSelected(f); setResults([]) }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                    selected?.fdcId === f.fdcId
                      ? 'bg-lime-400/10 border-lime-400/30 text-lime-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}>
                  <p className="text-sm font-semibold truncate">{f.name}</p>
                  <p className="text-xs text-zinc-500">
                    {f.per100g.calories.toFixed(0)} kcal · {f.per100g.proteinG.toFixed(1)}g protein per 100g
                  </p>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="bg-zinc-950 border border-lime-400/20 rounded-xl p-4 space-y-3">
              <p className="text-sm font-bold text-zinc-100 truncate">{selected.name}</p>
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Quantity (grams)</label>
                <input type="number" min="1" max="2000" value={qty} onChange={e => setQty(e.target.value)}
                  className="w-32 h-10 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
              </div>
              {qty && (
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Cal', val: macrosForQty(selected).calories },
                    { label: 'Protein', val: `${macrosForQty(selected).proteinG}g` },
                    { label: 'Carbs', val: `${macrosForQty(selected).carbsG}g` },
                    { label: 'Fat', val: `${macrosForQty(selected).fatG}g` },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-zinc-900 rounded-lg py-2">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-bold text-zinc-100 font-mono">{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <div className="px-6 pb-5">
          <button onClick={save} disabled={saving || !selected}
            className="w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wider text-sm hover:bg-lime-300 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : 'Log Food'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Readiness Tab ─────────────────────────────────────────────────────────────

function ReadinessTab() {
  const [entries, setEntries] = useState<ReadinessEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ReadinessEntry | null>(null)
  const [lastSavedData, setLastSavedData] = useState<Record<string, unknown> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
    const res = await fetch(`/api/md-readiness?from=${from}`)
    const data = await res.json()
    setEntries(data.entries ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function del(id: string) {
    await fetch(`/api/md-readiness?id=${id}`, { method: 'DELETE' })
    load()
  }

  const todayEntry = entries.find(e => e.entryDate === today())
  const avg = (field: ReadinessField) => {
    const vals = entries.map(e => Number(e[field])).filter(v => v > 0)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
  }

  const readinessScore = (e: ReadinessEntry): number => {
    const parts: number[] = []
    if (e.energy) parts.push(e.energy * 10)
    if (e.fatigue) parts.push((10 - e.fatigue) * 10)
    if (e.sleepScore) parts.push(e.sleepScore * 10)
    if (e.hrv) parts.push(Math.min(e.hrv / 80 * 100, 100))
    return parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0
  }

  return (
    <div className="space-y-6">
      {(showModal || editing) && (
        <ReadinessModal
          existing={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSaved={(data) => { setLastSavedData(data); load() }}
        />
      )}

      {lastSavedData && (
        <AiInsightPanel
          section="fitness"
          data={lastSavedData}
          autoFetch
          onDismiss={() => setLastSavedData(null)}
        />
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Energy', val: avg('energy'), suffix: '/10', icon: Zap, color: 'text-lime-400' },
          { label: 'Avg HRV', val: avg('hrv'), suffix: ' ms', icon: Activity, color: 'text-cyan-400' },
          { label: 'Avg Sleep', val: avg('sleepHours'), suffix: ' hrs', icon: Moon, color: 'text-blue-400' },
          { label: 'Avg Fatigue', val: avg('fatigue'), suffix: '/10', icon: TrendingUp, color: 'text-amber-400' },
        ].map(({ label, val, suffix, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
            </div>
            <p className={`text-2xl font-black font-mono ${val ? color : 'text-zinc-700'}`}>
              {val ? `${val}${suffix}` : '—'}
            </p>
          </div>
        ))}
      </div>

      {/* Today's readiness + CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black uppercase tracking-wide text-zinc-100">Daily Readiness</h3>
          {todayEntry && (
            <p className="text-xs text-zinc-500 mt-0.5">
              Today: score <span className="text-lime-400 font-mono font-bold">{readinessScore(todayEntry)}</span>
            </p>
          )}
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm uppercase tracking-wider hover:bg-lime-300 transition-colors">
          <Plus className="h-4 w-4" />
          Check In
        </button>
      </div>

      {/* Entry list */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-zinc-600" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
          <Activity className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-semibold">No check-ins yet</p>
          <p className="text-xs text-zinc-600 mt-1">Track sleep, HRV, and energy daily to see trends</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => {
            const score = readinessScore(e)
            const scoreClr = score >= 70 ? 'text-lime-400' : score >= 45 ? 'text-amber-400' : 'text-red-400'
            return (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className="w-14 text-center shrink-0">
                  <p className={`text-2xl font-black font-mono ${scoreClr}`}>{score > 0 ? score : '—'}</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">score</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-100">{fmtDate(e.entryDate)}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {e.sleepHours && <span className="text-xs text-zinc-400"><span className="text-zinc-600">Sleep</span> {e.sleepHours}h</span>}
                    {e.hrv && <span className="text-xs text-zinc-400"><span className="text-zinc-600">HRV</span> {e.hrv}ms</span>}
                    {e.restingHr && <span className="text-xs text-zinc-400"><span className="text-zinc-600">RHR</span> {e.restingHr}bpm</span>}
                    {e.energy && <span className={`text-xs ${scoreColor(e.energy, 'energy')}`}>Energy {e.energy}/10</span>}
                    {e.fatigue && <span className={`text-xs ${scoreColor(e.fatigue, 'fatigue')}`}>Fatigue {e.fatigue}/10</span>}
                  </div>
                  {e.notes && <p className="text-xs text-zinc-500 mt-1 truncate">{e.notes}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditing(e)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Activity className="h-4 w-4" />
                  </button>
                  <button onClick={() => del(e.id)} className="p-2 rounded-lg hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Nutrition Tab ─────────────────────────────────────────────────────────────

function NutritionTab() {
  const [entries, setEntries] = useState<NutritionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(today())
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/md-nutrition?date=${viewDate}`)
    const data = await res.json()
    setEntries(data.entries ?? [])
    setLoading(false)
  }, [viewDate])

  useEffect(() => { load() }, [load])

  async function del(id: string) {
    await fetch(`/api/md-nutrition?id=${id}`, { method: 'DELETE' })
    load()
  }

  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + Number(e.calories ?? 0),
    protein: acc.protein + Number(e.proteinG ?? 0),
    carbs: acc.carbs + Number(e.carbsG ?? 0),
    fat: acc.fat + Number(e.fatG ?? 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const byMeal = MEAL_TYPES.reduce((acc, m) => {
    acc[m] = entries.filter(e => e.mealType === m)
    return acc
  }, {} as Record<string, NutritionEntry[]>)

  return (
    <div className="space-y-5">
      {showModal && <NutritionModal onClose={() => setShowModal(false)} onSaved={load} date={viewDate} />}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)}
            className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
          <button onClick={() => setViewDate(today())} className="h-10 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 uppercase tracking-wider">Today</button>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm uppercase tracking-wider hover:bg-lime-300 transition-colors">
          <Plus className="h-4 w-4" />
          Log Food
        </button>
      </div>

      {/* Daily totals */}
      {entries.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Calories', val: `${Math.round(totals.calories)}`, unit: 'kcal', color: 'text-amber-400' },
            { label: 'Protein', val: `${totals.protein.toFixed(1)}`, unit: 'g', color: 'text-lime-400' },
            { label: 'Carbs', val: `${totals.carbs.toFixed(1)}`, unit: 'g', color: 'text-cyan-400' },
            { label: 'Fat', val: `${totals.fat.toFixed(1)}`, unit: 'g', color: 'text-purple-400' },
          ].map(({ label, val, unit, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{label}</p>
              <p className={`text-lg font-black font-mono ${color}`}>{val}</p>
              <p className="text-[10px] text-zinc-600">{unit}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-zinc-600" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
          <Utensils className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-semibold">Nothing logged for this day</p>
          <p className="text-xs text-zinc-600 mt-1">Search the USDA database to add foods</p>
        </div>
      ) : (
        <div className="space-y-3">
          {MEAL_TYPES.filter(m => byMeal[m]?.length > 0).map(mealType => (
            <div key={mealType}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${MEAL_COLORS[mealType] ?? 'bg-zinc-800 text-zinc-400'}`}>
                  {mealType}
                </span>
                <span className="text-xs text-zinc-600 font-mono">
                  {Math.round(byMeal[mealType].reduce((a, e) => a + Number(e.calories ?? 0), 0))} kcal
                </span>
              </div>
              <div className="space-y-1.5">
                {byMeal[mealType].map(e => (
                  <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">{e.foodName}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                        {e.quantityGrams}g · {Number(e.calories ?? 0).toFixed(0)} kcal · {Number(e.proteinG ?? 0).toFixed(1)}g P · {Number(e.carbsG ?? 0).toFixed(1)}g C · {Number(e.fatG ?? 0).toFixed(1)}g F
                      </p>
                    </div>
                    <button onClick={() => del(e.id)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Hydration Tab ─────────────────────────────────────────────────────────────

function HydrationTab() {
  const [entries, setEntries] = useState<HydrationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [logDate, setLogDate] = useState(today())
  const [preWeight, setPreWeight] = useState('')
  const [postWeight, setPostWeight] = useState('')
  const [waterMl, setWaterMl] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const from = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)
    const res = await fetch(`/api/md-nutrition?type=hydration&from=${from}`)
    const data = await res.json()
    setEntries(data.entries ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    await fetch('/api/md-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'hydration',
        logDate,
        preRideWeightKg: preWeight ? Number(preWeight) : null,
        postRideWeightKg: postWeight ? Number(postWeight) : null,
        waterConsumedMl: waterMl ? Number(waterMl) : 0,
        notes: notes || null,
      }),
    })
    setSaving(false)
    setPreWeight(''); setPostWeight(''); setWaterMl(''); setNotes('')
    load()
  }

  const sweatLoss = (e: HydrationEntry) => {
    if (!e.preRideWeightKg || !e.postRideWeightKg) return null
    const diff = (Number(e.preRideWeightKg) - Number(e.postRideWeightKg)) * 1000
    const net = diff - e.waterConsumedMl
    return net
  }

  return (
    <div className="space-y-5">
      {/* Log form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="font-black uppercase tracking-wide text-zinc-100 text-sm">Log Ride Hydration</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Date', type: 'date', value: logDate, set: setLogDate },
            { label: 'Pre-ride weight (kg)', type: 'number', value: preWeight, set: setPreWeight, placeholder: '75.2' },
            { label: 'Post-ride weight (kg)', type: 'number', value: postWeight, set: setPostWeight, placeholder: '74.5' },
            { label: 'Water consumed (ml)', type: 'number', value: waterMl, set: setWaterMl, placeholder: '1500' },
          ].map(({ label, type, value, set, placeholder }) => (
            <div key={label}>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1.5">{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                step={type === 'number' ? '0.1' : undefined}
                className="w-full h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Hot day, 2-hour moto..."
            className="flex-1 h-11 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none" />
          <button onClick={save} disabled={saving}
            className="h-11 px-5 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm uppercase tracking-wider hover:bg-lime-300 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
        {preWeight && postWeight && (
          <div className="bg-zinc-950 border border-cyan-500/20 rounded-xl p-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Est. Net Sweat Loss</p>
            <p className="text-2xl font-black font-mono text-cyan-400 mt-0.5">
              {((Number(preWeight) - Number(postWeight)) * 1000 - (Number(waterMl) || 0)).toFixed(0)} ml
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">Weight loss × 1000 − water consumed</p>
          </div>
        )}
      </div>

      {/* History */}
      {loading ? (
        <div className="flex items-center justify-center h-24"><Loader2 className="h-5 w-5 animate-spin text-zinc-600" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
          <Droplets className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-semibold">No hydration logs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => {
            const net = sweatLoss(e)
            return (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
                <Droplets className="h-5 w-5 text-cyan-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-100">{fmtDate(e.logDate)}</p>
                  <div className="flex flex-wrap gap-x-4 text-xs text-zinc-400 mt-0.5">
                    {e.preRideWeightKg && <span><span className="text-zinc-600">Pre</span> {e.preRideWeightKg}kg</span>}
                    {e.postRideWeightKg && <span><span className="text-zinc-600">Post</span> {e.postRideWeightKg}kg</span>}
                    {e.waterConsumedMl > 0 && <span><span className="text-zinc-600">Consumed</span> {e.waterConsumedMl}ml</span>}
                    {net != null && <span className="text-cyan-400"><span className="text-zinc-600">Net loss</span> {net.toFixed(0)}ml</span>}
                  </div>
                  {e.notes && <p className="text-xs text-zinc-500 mt-0.5">{e.notes}</p>}
                </div>
                <button onClick={async () => {
                  await fetch(`/api/md-nutrition?id=${e.id}&type=hydration`, { method: 'DELETE' })
                  load()
                }} className="p-2 rounded-lg hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Root Component ────────────────────────────────────────────────────────────

export default function ViewFitness() {
  const [tab, setTab] = useState<Tab>('readiness')

  const tabs: { key: Tab; label: string; icon: typeof Activity }[] = [
    { key: 'readiness', label: 'Readiness', icon: Activity },
    { key: 'nutrition', label: 'Nutrition', icon: Utensils },
    { key: 'hydration', label: 'Hydration', icon: Droplets },
  ]

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
              tab === key ? 'bg-lime-400 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === 'readiness' && <ReadinessTab />}
      {tab === 'nutrition' && <NutritionTab />}
      {tab === 'hydration' && <HydrationTab />}
    </div>
  )
}
