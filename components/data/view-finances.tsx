'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign, Plus, Trash2, X, TrendingUp, TrendingDown,
  Receipt, Users, ChevronDown, BarChart3, Tag, CalendarDays, Bike
} from 'lucide-react'
import type { Vehicle } from './rig-shell'

// ── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  'Entry Fees', 'Parts', 'Fuel', 'Travel', 'Lodging',
  'Tires', 'Gear', 'Bikes', 'Medical', 'Coaching', 'Other',
] as const

type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

const CATEGORY_COLORS: Record<ExpenseCategory | 'Other', string> = {
  'Entry Fees': 'bg-lime-400/15 text-lime-400 border-lime-400/30',
  'Parts':      'bg-amber-400/15 text-amber-400 border-amber-400/30',
  'Fuel':       'bg-orange-400/15 text-orange-400 border-orange-400/30',
  'Travel':     'bg-sky-400/15 text-sky-400 border-sky-400/30',
  'Lodging':    'bg-indigo-400/15 text-indigo-400 border-indigo-400/30',
  'Tires':      'bg-red-400/15 text-red-400 border-red-400/30',
  'Gear':       'bg-purple-400/15 text-purple-400 border-purple-400/30',
  'Bikes':      'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  'Medical':    'bg-rose-400/15 text-rose-400 border-rose-400/30',
  'Coaching':   'bg-cyan-400/15 text-cyan-400 border-cyan-400/30',
  'Other':      'bg-zinc-400/15 text-zinc-400 border-zinc-400/30',
}

const SPONSOR_TYPES = ['cash', 'product', 'contingency', 'service'] as const

const SPONSOR_TYPE_LABEL: Record<string, string> = {
  cash: 'Cash',
  product: 'Product',
  contingency: 'Contingency',
  service: 'Service',
}

const fmt = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)

// ── Types ────────────────────────────────────────────────────────────────────

interface Expense {
  id: string
  category: string
  amountCents: number
  expenseDate: string
  description: string | null
  vehicleId: string | null
  linkedScheduleEventId: string | null
}

interface Sponsor {
  id: string
  sponsorName: string
  sponsorType: string
  valueCents: number
  season: string | null
  status: string
  deliverables: string[]
  notes: string | null
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CategoryPill({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category as ExpenseCategory] ?? CATEGORY_COLORS.Other
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${cls}`}>
      {category}
    </span>
  )
}

function KpiCard({ label, value, sub, icon: Icon, accent = false }: {
  label: string; value: string; sub?: string; icon: typeof DollarSign; accent?: boolean
}) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-1 ${accent ? 'bg-lime-400/5 border-lime-400/30' : 'bg-zinc-900 border-zinc-800'}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
        <Icon className={`h-4 w-4 ${accent ? 'text-lime-400' : 'text-zinc-600'}`} />
      </div>
      <p className={`text-2xl font-black font-mono ${accent ? 'text-lime-400' : 'text-zinc-100'}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
    </div>
  )
}

// ── Add Expense Modal ────────────────────────────────────────────────────────

function AddExpenseModal({
  vehicles, onClose, onAdded,
}: { vehicles: Vehicle[]; onClose: () => void; onAdded: () => void }) {
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const dollars = parseFloat(amount)
    if (!dollars || dollars <= 0) { setError('Enter a valid amount'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/md-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        amountCents: Math.round(dollars * 100),
        expenseDate: date,
        description: description.trim() || null,
        vehicleId: vehicleId || null,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!data.success) { setError(data.error ?? 'Failed to save'); return }
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70">
      <div className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-wide text-zinc-100">Log Expense</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => setCategory(c)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    category === c
                      ? 'bg-lime-400 text-zinc-950 border-lime-400'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Amount ($)</label>
              <input
                type="number" min="0.01" step="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)} required placeholder="0.00"
                className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-lg font-bold text-zinc-100 focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Date</label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Description (optional)</label>
            <input
              type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Piston kit, gate fee, fuel stop"
              className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
            />
          </div>

          {/* Vehicle */}
          {vehicles.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Vehicle (optional)</label>
              <select
                value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}
                className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none appearance-none"
              >
                <option value="">All / Team</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit" disabled={saving}
            className="w-full h-13 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wide text-sm hover:bg-lime-300 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Log Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Add Sponsor Modal ────────────────────────────────────────────────────────

function AddSponsorModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorType, setSponsorType] = useState('cash')
  const [value, setValue] = useState('')
  const [season, setSeason] = useState(new Date().getFullYear().toString())
  const [deliverable, setDeliverable] = useState('')
  const [deliverables, setDeliverables] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addDeliverable() {
    const d = deliverable.trim()
    if (d && !deliverables.includes(d)) { setDeliverables([...deliverables, d]); setDeliverable('') }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!sponsorName.trim()) { setError('Sponsor name required'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/md-sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sponsorName: sponsorName.trim(),
        sponsorType,
        valueCents: Math.round((parseFloat(value) || 0) * 100),
        season: season || null,
        deliverables,
        notes: notes.trim() || null,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!data.success) { setError(data.error ?? 'Failed'); return }
    onAdded(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70">
      <div className="w-full sm:max-w-md bg-zinc-950 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-wide text-zinc-100">Add Sponsor</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Sponsor Name</label>
            <input
              type="text" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} required
              placeholder="e.g. Rocky Mountain ATV/MC"
              className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Type</label>
              <select
                value={sponsorType} onChange={(e) => setSponsorType(e.target.value)}
                className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none appearance-none"
              >
                {SPONSOR_TYPES.map((t) => <option key={t} value={t}>{SPONSOR_TYPE_LABEL[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Value ($)</label>
              <input
                type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-lg font-bold text-zinc-100 focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Season</label>
            <input
              type="text" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="2026"
              className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Deliverables</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={deliverable} onChange={(e) => setDeliverable(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable() } }}
                placeholder="e.g. Decal on #80 panel"
                className="flex-1 h-10 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
              />
              <button
                type="button" onClick={addDeliverable}
                className="px-4 h-10 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
              >Add</button>
            </div>
            {deliverables.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {deliverables.map((d) => (
                  <span key={d} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs">
                    {d}
                    <button type="button" onClick={() => setDeliverables(deliverables.filter((x) => x !== d))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Notes</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Contract details, contact info..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit" disabled={saving}
            className="w-full h-13 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wide text-sm hover:bg-lime-300 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Add Sponsor'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'expenses' | 'sponsors'

interface ViewFinancesProps {
  vehicles: Vehicle[]
  tier?: string
}

export default function ViewFinances({ vehicles, tier }: ViewFinancesProps) {
  const [tab, setTab] = useState<Tab>('overview')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddSponsor, setShowAddSponsor] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('All')
  const [filterVehicle, setFilterVehicle] = useState<string>('All')

  const currentYear = new Date().getFullYear().toString()
  const isFactoryRig = tier === 'factory_rig'

  const load = useCallback(async () => {
    setLoading(true)
    const [eRes, sRes] = await Promise.all([
      fetch('/api/md-expenses'),
      fetch('/api/md-sponsors'),
    ])
    const [eData, sData] = await Promise.all([eRes.json(), sRes.json()])
    if (eData.success) setExpenses(eData.expenses)
    if (sData.success) setSponsors(sData.sponsors)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const currentYearExpenses = expenses.filter((e) => e.expenseDate.startsWith(currentYear))
  const totalSpentCents = currentYearExpenses.reduce((s, e) => s + e.amountCents, 0)
  const activeSponsorValue = sponsors.filter((s) => s.status === 'active').reduce((s, sp) => s + sp.valueCents, 0)
  const netCents = activeSponsorValue - totalSpentCents

  const byCategory = EXPENSE_CATEGORIES.reduce((acc, c) => {
    acc[c] = currentYearExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amountCents, 0)
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]

  // cost per race
  const raceExpenses = currentYearExpenses.filter((e) => e.linkedScheduleEventId)
  const uniqueRaces = new Set(raceExpenses.map((e) => e.linkedScheduleEventId)).size
  const costPerRace = uniqueRaces > 0 ? Math.round(totalSpentCents / uniqueRaces) : 0

  // filtered expenses for list
  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory !== 'All' && e.category !== filterCategory) return false
    if (filterVehicle !== 'All' && e.vehicleId !== filterVehicle) return false
    return true
  })

  async function deleteExpense(id: string) {
    setDeletingId(id)
    await fetch(`/api/md-expenses?id=${id}`, { method: 'DELETE' })
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    setDeletingId(null)
  }

  async function deleteSponsor(id: string) {
    setDeletingId(id)
    await fetch(`/api/md-sponsors?id=${id}`, { method: 'DELETE' })
    setSponsors((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Finances</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">{currentYear} Season</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddSponsor(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wide hover:bg-zinc-700 transition-colors"
          >
            <Users className="h-4 w-4" /> Sponsor
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-lime-400 text-zinc-950 text-xs font-black uppercase tracking-wide hover:bg-lime-300 transition-colors"
          >
            <Plus className="h-4 w-4" /> Expense
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800 w-fit">
        {(['overview', 'expenses', 'sponsors'] as Tab[]).map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`px-4 h-8 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
              tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard label="Season Spend" value={fmt(totalSpentCents)} sub={`${currentYear} YTD`} icon={TrendingDown} />
            <KpiCard label="Sponsor Value" value={fmt(activeSponsorValue)} sub={`${sponsors.filter(s => s.status === 'active').length} active`} icon={TrendingUp} accent />
            <KpiCard
              label="Net Position"
              value={fmt(Math.abs(netCents))}
              sub={netCents >= 0 ? 'Covered by sponsors' : 'Out of pocket'}
              icon={netCents >= 0 ? TrendingUp : TrendingDown}
            />
            {isFactoryRig && costPerRace > 0
              ? <KpiCard label="Cost / Race" value={fmt(costPerRace)} sub={`Across ${uniqueRaces} event${uniqueRaces !== 1 ? 's' : ''}`} icon={BarChart3} />
              : <KpiCard label="Expenses" value={`${currentYearExpenses.length}`} sub="logged this year" icon={Receipt} />
            }
          </div>

          {/* Spending breakdown */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Spending by Category</h2>
            {EXPENSE_CATEGORIES.filter((c) => byCategory[c] > 0).length === 0 ? (
              <p className="text-sm text-zinc-600 py-4 text-center">No expenses logged yet — tap &ldquo;+ Expense&rdquo; to start.</p>
            ) : (
              <div className="space-y-2.5">
                {EXPENSE_CATEGORIES
                  .filter((c) => byCategory[c] > 0)
                  .sort((a, b) => byCategory[b] - byCategory[a])
                  .map((c) => {
                    const pct = totalSpentCents > 0 ? Math.round((byCategory[c] / totalSpentCents) * 100) : 0
                    return (
                      <div key={c} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-300">{c}</span>
                          <span className="font-mono text-zinc-400">{fmt(byCategory[c])} <span className="text-zinc-600">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-lime-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Recent expenses */}
          {expenses.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Recent Expenses</h2>
              <div className="space-y-2">
                {expenses.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 py-2 border-b border-zinc-800 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryPill category={e.category} />
                      <span className="text-sm text-zinc-300 truncate">{e.description ?? e.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold font-mono text-zinc-100">{fmt(e.amountCents)}</p>
                      <p className="text-[10px] text-zinc-600">{e.expenseDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXPENSES TAB */}
      {tab === 'expenses' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="h-9 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-xs font-semibold text-zinc-300 focus:border-lime-400 focus:outline-none appearance-none pr-7"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {vehicles.length > 0 && (
              <select
                value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}
                className="h-9 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-xs font-semibold text-zinc-300 focus:border-lime-400 focus:outline-none appearance-none pr-7"
              >
                <option value="All">All Vehicles</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            )}
            <div className="ml-auto text-xs text-zinc-500 self-center font-mono">
              {fmt(filteredExpenses.reduce((s, e) => s + e.amountCents, 0))} total
            </div>
          </div>

          {/* Expense list */}
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Receipt className="h-10 w-10 text-zinc-700" />
              <p className="text-zinc-500 text-sm text-center">No expenses logged yet.<br />Start tracking your season costs.</p>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-lime-400 text-zinc-950 text-xs font-black uppercase tracking-wide"
              >
                <Plus className="h-4 w-4" /> Log First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExpenses.map((e) => {
                const vehicle = vehicles.find((v) => v.id === e.vehicleId)
                return (
                  <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CategoryPill category={e.category} />
                        {vehicle && (
                          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                            <Bike className="h-3 w-3" /> {vehicle.name}
                          </span>
                        )}
                        {e.linkedScheduleEventId && (
                          <span className="flex items-center gap-1 text-[11px] text-lime-600">
                            <CalendarDays className="h-3 w-3" /> Race event
                          </span>
                        )}
                      </div>
                      {e.description && <p className="text-sm text-zinc-300 truncate">{e.description}</p>}
                      <p className="text-[11px] text-zinc-600 font-mono">{e.expenseDate}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-2">
                      <p className="text-lg font-black font-mono text-zinc-100">{fmt(e.amountCents)}</p>
                      <button
                        onClick={() => deleteExpense(e.id)}
                        disabled={deletingId === e.id}
                        className="text-zinc-700 hover:text-red-400 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* SPONSORS TAB */}
      {tab === 'sponsors' && (
        <div className="space-y-4">
          {sponsors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Users className="h-10 w-10 text-zinc-700" />
              <p className="text-zinc-500 text-sm text-center">No sponsors tracked yet.<br />Add your first sponsor to start managing deliverables.</p>
              <button
                onClick={() => setShowAddSponsor(true)}
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-lime-400 text-zinc-950 text-xs font-black uppercase tracking-wide"
              >
                <Plus className="h-4 w-4" /> Add First Sponsor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sponsors.map((s) => (
                <div key={s.id} className={`rounded-xl border p-4 space-y-3 ${s.status === 'active' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-900 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-zinc-100 uppercase tracking-wide">{s.sponsorName}</p>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                          s.status === 'active'
                            ? 'bg-lime-400/10 text-lime-400 border-lime-400/30'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}>{s.status}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {SPONSOR_TYPE_LABEL[s.sponsorType] ?? s.sponsorType}
                        </span>
                      </div>
                      <p className="text-xl font-black font-mono text-lime-400">{fmt(s.valueCents)}</p>
                      {s.season && <p className="text-[11px] text-zinc-500">{s.season} season</p>}
                    </div>
                    <button
                      onClick={() => deleteSponsor(s.id)}
                      disabled={deletingId === s.id}
                      className="text-zinc-700 hover:text-red-400 transition-colors shrink-0 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {s.deliverables && s.deliverables.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Deliverables</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.deliverables.map((d) => (
                          <span key={d} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs border border-zinc-700">
                            <Tag className="h-2.5 w-2.5" /> {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.notes && <p className="text-xs text-zinc-500 border-t border-zinc-800 pt-2 mt-1">{s.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal vehicles={vehicles} onClose={() => setShowAddExpense(false)} onAdded={load} />
      )}
      {showAddSponsor && (
        <AddSponsorModal onClose={() => setShowAddSponsor(false)} onAdded={load} />
      )}
    </div>
  )
}
