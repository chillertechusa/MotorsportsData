'use client'

import { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, Download, Plus, ArrowRight,
  CheckCircle2, AlertTriangle, BarChart3, RefreshCw,
} from 'lucide-react'

type EntryType = 'income' | 'expense'
type Category =
  | 'seat_fee' | 'appearance_fee' | 'sponsorship' | 'camp_revenue'
  | 'entry_fees' | 'parts' | 'labor' | 'travel' | 'fuel' | 'lodging' | 'gear' | 'other'

interface LedgerEntry {
  id: string
  type: EntryType
  category: Category
  description: string
  amount: number
  date: string
  status: 'cleared' | 'pending'
}

const INCOME_CATEGORIES: Category[] = ['seat_fee', 'appearance_fee', 'sponsorship', 'camp_revenue']
const EXPENSE_CATEGORIES: Category[] = ['entry_fees', 'parts', 'labor', 'travel', 'fuel', 'lodging', 'gear', 'other']

const CATEGORY_LABELS: Record<Category, string> = {
  seat_fee: 'Seat Fee', appearance_fee: 'Appearance Fee', sponsorship: 'Sponsorship',
  camp_revenue: 'Camp Revenue', entry_fees: 'Entry Fees', parts: 'Parts & Supplies',
  labor: 'Labor', travel: 'Travel', fuel: 'Fuel', lodging: 'Lodging', gear: 'Gear', other: 'Other',
}

// Sample ledger — real data wired via /api/md-accounting once backend is built
const SAMPLE_LEDGER: LedgerEntry[] = [
  { id: '1', type: 'income', category: 'seat_fee', description: '2027 Seat Fee — #32 Jake Morrison (50% deposit)', amount: 9000, date: '2026-07-01', status: 'cleared' },
  { id: '2', type: 'income', category: 'sponsorship', description: 'Kicker Audio Q3 installment', amount: 12500, date: '2026-07-10', status: 'pending' },
  { id: '3', type: 'income', category: 'appearance_fee', description: 'Iron Man MX Rd 4 appearance', amount: 2500, date: '2026-07-15', status: 'cleared' },
  { id: '4', type: 'expense', category: 'parts', description: 'Piston + rings — #32 bike rebuild', amount: 1480, date: '2026-07-05', status: 'cleared' },
  { id: '5', type: 'expense', category: 'entry_fees', description: 'SMX Rd 9 — 2 riders', amount: 950, date: '2026-07-08', status: 'cleared' },
  { id: '6', type: 'expense', category: 'fuel', description: 'Hauler diesel — LA to Phoenix run', amount: 640, date: '2026-07-12', status: 'cleared' },
  { id: '7', type: 'expense', category: 'lodging', description: 'Hotel block — Phoenix venue (3 nights)', amount: 1260, date: '2026-07-14', status: 'cleared' },
  { id: '8', type: 'expense', category: 'labor', description: 'Mechanic weekend labor — Rd 9', amount: 1800, date: '2026-07-16', status: 'pending' },
  { id: '9', type: 'income', category: 'camp_revenue', description: 'July riding camp — 8 riders', amount: 9600, date: '2026-07-18', status: 'pending' },
  { id: '10', type: 'expense', category: 'gear', description: 'Helmets + gear — 2 new riders', amount: 3200, date: '2026-07-19', status: 'cleared' },
]

const BUDGET = {
  income: 85000,
  expense: 52000,
}

// P&L by category (for breakdown bars)
const PL_BY_CATEGORY = [
  { label: 'Sponsorship', income: 42500, expense: 0 },
  { label: 'Seat Fees', income: 18000, expense: 0 },
  { label: 'Camp Revenue', income: 9600, expense: 0 },
  { label: 'Appearance Fees', income: 2500, expense: 0 },
  { label: 'Parts & Supplies', income: 0, expense: 9800 },
  { label: 'Labor', income: 0, expense: 8400 },
  { label: 'Travel + Fuel', income: 0, expense: 5600 },
  { label: 'Entry Fees', income: 0, expense: 3800 },
  { label: 'Lodging', income: 0, expense: 4200 },
  { label: 'Gear', income: 0, expense: 3200 },
]

export function AccountingDashboard({
  teamId,
  teamName,
  userRole,
}: {
  teamId: string
  teamName: string
  userRole: string
}) {
  const [view, setView] = useState<'pl' | 'ledger'>('pl')
  const [showAdd, setShowAdd] = useState(false)
  const [entryType, setEntryType] = useState<EntryType>('income')

  const totalIncome = SAMPLE_LEDGER.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpense = SAMPLE_LEDGER.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const netPL = totalIncome - totalExpense
  const incomePct = Math.round((totalIncome / BUDGET.income) * 100)
  const expensePct = Math.round((totalExpense / BUDGET.expense) * 100)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-5 bg-lime-400" aria-hidden="true" />
            <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
              {teamName} — Accounting
            </span>
          </div>
          <h1
            className="text-zinc-100 uppercase leading-none"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
          >
            P&L Dashboard
          </h1>
          <p className="text-zinc-500 text-sm mt-1">2026 Season — YTD as of July 23</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-bold px-5 py-2.5 hover:bg-lime-300 transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Entry
          </button>
          <button className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest px-4 py-2.5 hover:border-zinc-600 hover:text-zinc-300 transition-colors">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {/* Net P&L */}
        <div className={`border p-5 col-span-1 ${netPL >= 0 ? 'border-lime-400/30 bg-lime-400/5' : 'border-red-400/30 bg-red-400/5'}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-950/60">
              {netPL >= 0
                ? <TrendingUp className="h-3.5 w-3.5 text-lime-400" aria-hidden="true" />
                : <TrendingDown className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />}
            </div>
            <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${netPL >= 0 ? 'text-lime-400 border-lime-400/30 bg-lime-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
              {netPL >= 0 ? 'Profitable' : 'Deficit'}
            </span>
          </div>
          <p
            className={`font-black leading-none mb-1 ${netPL >= 0 ? 'text-lime-400' : 'text-red-400'}`}
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2.25rem' }}
          >
            {netPL >= 0 ? '+' : '-'}${Math.abs(netPL).toLocaleString()}
          </p>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Net P&L — YTD</p>
        </div>

        {/* Total Income */}
        <div className="border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-950/60">
              <TrendingUp className="h-3.5 w-3.5 text-lime-400" aria-hidden="true" />
            </div>
            <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
              {incomePct}% of budget
            </span>
          </div>
          <p
            className="text-zinc-100 font-black leading-none mb-1"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2.25rem' }}
          >
            ${totalIncome.toLocaleString()}
          </p>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Total Income</p>
          {/* Budget bar */}
          <div className="h-1 w-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-lime-400 transition-all" style={{ width: `${Math.min(incomePct, 100)}%` }} />
          </div>
          <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest mt-1">
            Budget: ${BUDGET.income.toLocaleString()}
          </p>
        </div>

        {/* Total Expense */}
        <div className="border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-950/60">
              <TrendingDown className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
            </div>
            <span className={`font-mono text-[10px] uppercase tracking-widest ${expensePct > 90 ? 'text-amber-400' : 'text-zinc-600'}`}>
              {expensePct}% of budget
            </span>
          </div>
          <p
            className="text-zinc-100 font-black leading-none mb-1"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2.25rem' }}
          >
            ${totalExpense.toLocaleString()}
          </p>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Total Expense</p>
          <div className="h-1 w-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all ${expensePct > 90 ? 'bg-amber-400' : 'bg-red-500/60'}`}
              style={{ width: `${Math.min(expensePct, 100)}%` }}
            />
          </div>
          <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest mt-1">
            Budget: ${BUDGET.expense.toLocaleString()}
          </p>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 border border-zinc-800 bg-zinc-900/40 p-1 self-start inline-flex mb-6">
        {(['pl', 'ledger'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              view === v ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {v === 'pl' ? 'P&L Breakdown' : 'Ledger'}
          </button>
        ))}
      </div>

      {view === 'pl' ? (
        /* P&L Category breakdown */
        <div className="border border-zinc-800 overflow-hidden mb-8">
          <div className="grid grid-cols-[1fr_120px_120px] gap-4 px-5 py-3 bg-zinc-900/60 border-b border-zinc-800">
            {['Category', 'Income', 'Expense'].map((h) => (
              <span key={h} className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                {h}
              </span>
            ))}
          </div>
          {PL_BY_CATEGORY.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_120px_120px] gap-4 px-5 py-3.5 hover:bg-zinc-900/30 transition-colors ${
                i !== PL_BY_CATEGORY.length - 1 ? 'border-b border-zinc-800/50' : ''
              }`}
            >
              <span className="text-zinc-300 text-sm">{row.label}</span>
              <span className={`font-mono text-sm ${row.income > 0 ? 'text-lime-400' : 'text-zinc-700'}`}>
                {row.income > 0 ? `+$${row.income.toLocaleString()}` : '—'}
              </span>
              <span className={`font-mono text-sm ${row.expense > 0 ? 'text-red-400' : 'text-zinc-700'}`}>
                {row.expense > 0 ? `-$${row.expense.toLocaleString()}` : '—'}
              </span>
            </div>
          ))}
          {/* Totals row */}
          <div className="grid grid-cols-[1fr_120px_120px] gap-4 px-5 py-4 bg-zinc-900/60 border-t border-zinc-800 font-bold">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Total</span>
            <span className="font-mono text-sm text-lime-400">+${totalIncome.toLocaleString()}</span>
            <span className="font-mono text-sm text-red-400">-${totalExpense.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        /* Ledger view */
        <div className="border border-zinc-800 overflow-hidden mb-8">
          <div className="hidden sm:grid grid-cols-[90px_1fr_140px_100px_80px] gap-4 px-5 py-3 bg-zinc-900/60 border-b border-zinc-800">
            {['Date', 'Description', 'Category', 'Amount', 'Status'].map((h) => (
              <span key={h} className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                {h}
              </span>
            ))}
          </div>
          <ul role="list">
            {SAMPLE_LEDGER.map((entry, i) => (
              <li
                key={entry.id}
                className={`grid grid-cols-1 sm:grid-cols-[90px_1fr_140px_100px_80px] gap-1 sm:gap-4 px-5 py-4 hover:bg-zinc-900/30 transition-colors ${
                  i !== SAMPLE_LEDGER.length - 1 ? 'border-b border-zinc-800/50' : ''
                }`}
              >
                <span className="font-mono text-xs text-zinc-600">{entry.date}</span>
                <span className="text-zinc-300 text-sm">{entry.description}</span>
                <span className="hidden sm:block font-mono text-[10px] text-zinc-500 uppercase tracking-widest self-center">
                  {CATEGORY_LABELS[entry.category]}
                </span>
                <span className={`font-mono text-sm font-bold self-center ${entry.type === 'income' ? 'text-lime-400' : 'text-red-400'}`}>
                  {entry.type === 'income' ? '+' : '-'}${entry.amount.toLocaleString()}
                </span>
                <span className="hidden sm:flex items-center gap-1.5 self-center">
                  {entry.status === 'cleared'
                    ? <CheckCircle2 className="h-3 w-3 text-lime-400" aria-hidden="true" />
                    : <AlertTriangle className="h-3 w-3 text-amber-400" aria-hidden="true" />}
                  <span className={`font-mono text-[9px] uppercase tracking-widest ${entry.status === 'cleared' ? 'text-zinc-500' : 'text-amber-400'}`}>
                    {entry.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action row + QB teaser */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-zinc-800/60">
        <div className="flex flex-wrap gap-3">
          <a
            href="/data/deals"
            className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest px-4 py-2 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            Open Deals
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <button className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest px-4 py-2 hover:border-zinc-600 hover:text-zinc-300 transition-colors">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            Reports
          </button>
        </div>

        {/* QuickBooks teaser */}
        <div className="flex items-center gap-3 border border-amber-400/20 bg-amber-400/5 px-4 py-2">
          <RefreshCw className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">QuickBooks sync — Q1 27</p>
            <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Entries are staged. OAuth integration ships Q1 2027.</p>
          </div>
        </div>
      </div>

      {/* Add entry modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add entry"
        >
          <div className="w-full max-w-lg border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-zinc-100 uppercase"
                style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.5rem' }}
              >
                Add Entry
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors font-mono text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              {/* Income / Expense toggle */}
              <div className="flex border border-zinc-700 p-1 gap-1">
                {(['income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEntryType(t)}
                    className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                      entryType === t
                        ? t === 'income'
                          ? 'bg-lime-400 text-zinc-950'
                          : 'bg-red-500/80 text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Category */}
              <div>
                <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                  Category
                </label>
                <select className="w-full bg-zinc-950/60 border border-zinc-700 text-zinc-100 px-4 py-3 text-sm focus:outline-none focus:border-lime-400/40 transition-colors">
                  {(entryType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              {/* Description + Amount */}
              <div>
                <label htmlFor="entry-desc" className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                  Description
                </label>
                <input
                  id="entry-desc"
                  type="text"
                  placeholder="e.g. Piston + rings — #32 rebuild"
                  className="w-full bg-zinc-950/60 border border-zinc-700 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-lime-400/40 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="entry-amount" className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    Amount ($)
                  </label>
                  <input
                    id="entry-amount"
                    type="number"
                    placeholder="0"
                    className="w-full bg-zinc-950/60 border border-zinc-700 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-lime-400/40 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="entry-date" className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    Date
                  </label>
                  <input
                    id="entry-date"
                    type="date"
                    className="w-full bg-zinc-950/60 border border-zinc-700 text-zinc-100 px-4 py-3 text-sm focus:outline-none focus:border-lime-400/40 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 bg-lime-400 text-zinc-950 font-bold px-5 py-3 hover:bg-lime-300 transition-colors"
                  onClick={() => setShowAdd(false)}
                >
                  Save Entry
                </button>
                <button
                  className="border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest px-5 py-3 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
