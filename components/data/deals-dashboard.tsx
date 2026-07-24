'use client'

import { useState } from 'react'
import {
  FileText, Plus, DollarSign, Clock, CheckCircle2, XCircle,
  ArrowRight, Download, Send, MoreHorizontal, Filter,
} from 'lucide-react'

type DealStatus = 'draft' | 'sent' | 'signed' | 'paid' | 'cancelled'
type DealType = 'seat_fee' | 'appearance_fee' | 'camp_invoice' | 'sponsor_payment' | 'ride_day'

interface Deal {
  id: string
  type: DealType
  title: string
  party: string
  amount: number
  status: DealStatus
  createdAt: string
  dueDate?: string
}

const TYPE_LABELS: Record<DealType, string> = {
  seat_fee: 'Seat Fee',
  appearance_fee: 'Appearance Fee',
  camp_invoice: 'Camp Invoice',
  sponsor_payment: 'Sponsor Payment',
  ride_day: 'Ride Day Charge',
}

const STATUS_CONFIG: Record<DealStatus, { label: string; classes: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', classes: 'bg-zinc-800 text-zinc-400 border-zinc-700', icon: FileText },
  sent: { label: 'Sent', classes: 'bg-amber-400/10 text-amber-400 border-amber-400/30', icon: Send },
  signed: { label: 'Signed', classes: 'bg-sky-400/10 text-sky-400 border-sky-400/30', icon: CheckCircle2 },
  paid: { label: 'Paid', classes: 'bg-lime-400/10 text-lime-400 border-lime-400/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', classes: 'bg-red-400/10 text-red-400 border-red-400/30', icon: XCircle },
}

// Sample data for the UI shell — real data comes from /api/md-deals once backend is wired
const SAMPLE_DEALS: Deal[] = [
  { id: '1', type: 'seat_fee', title: '2027 Seat Fee — #32 Jake Morrison', party: 'Morrison Racing Family', amount: 18000, status: 'signed', createdAt: '2026-07-01', dueDate: '2026-08-01' },
  { id: '2', type: 'appearance_fee', title: 'Iron Man MX Appearance — Round 4', party: 'Iron Man Motocross', amount: 2500, status: 'paid', createdAt: '2026-07-03', dueDate: '2026-07-15' },
  { id: '3', type: 'sponsor_payment', title: 'Q3 Sponsor Installment — Kicker Audio', party: 'Kicker Audio', amount: 12500, status: 'sent', createdAt: '2026-07-10', dueDate: '2026-07-31' },
  { id: '4', type: 'camp_invoice', title: 'Riding Camp — July Session (8 riders)', party: 'Team Camp Program', amount: 9600, status: 'draft', createdAt: '2026-07-18' },
  { id: '5', type: 'ride_day', title: 'Supercross Rd 9 Ride Day — #47 Daniels', party: 'Daniels Family', amount: 1200, status: 'paid', createdAt: '2026-06-28', dueDate: '2026-07-05' },
  { id: '6', type: 'seat_fee', title: '2027 Seat Fee — #8 Tyler Reeves', party: 'Reeves Motorsports', amount: 24000, status: 'sent', createdAt: '2026-07-12', dueDate: '2026-08-15' },
]

const SUMMARY_STATS = [
  { label: 'Total Pipeline', value: '$67,800', sub: '6 active deals', icon: DollarSign, accent: 'text-lime-400' },
  { label: 'Paid This Month', value: '$3,700', sub: '2 deals closed', icon: CheckCircle2, accent: 'text-lime-400' },
  { label: 'Awaiting Signature', value: '$42,000', sub: '2 deals sent', icon: Clock, accent: 'text-amber-400' },
  { label: 'Draft', value: '$9,600', sub: '1 not yet sent', icon: FileText, accent: 'text-zinc-400' },
]

const ALL_STATUSES: DealStatus[] = ['draft', 'sent', 'signed', 'paid', 'cancelled']

export function DealsDashboard({
  teamId,
  teamName,
  userRole,
}: {
  teamId: string
  teamName: string
  userRole: string
}) {
  const [filter, setFilter] = useState<DealStatus | 'all'>('all')
  const [showNew, setShowNew] = useState(false)

  const filtered = filter === 'all' ? SAMPLE_DEALS : SAMPLE_DEALS.filter((d) => d.status === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px w-5 bg-lime-400" aria-hidden="true" />
            <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
              {teamName} — Deals
            </span>
          </div>
          <h1
            className="text-zinc-100 uppercase leading-none"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
          >
            Deals & Invoices
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Seat fees, appearance contracts, camp invoices, and sponsor payments.
          </p>
        </div>

        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-bold px-5 py-3 hover:bg-lime-300 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Deal
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {SUMMARY_STATS.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 flex items-center justify-center border border-zinc-800 bg-zinc-950/60">
                  <Icon className={`h-3.5 w-3.5 ${s.accent}`} aria-hidden="true" />
                </div>
              </div>
              <p
                className={`font-black leading-none mb-1 ${s.accent}`}
                style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '1.75rem' }}
              >
                {s.value}
              </p>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{s.label}</p>
              <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest mt-0.5">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        <Filter className="h-3.5 w-3.5 text-zinc-600 shrink-0" aria-hidden="true" />
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
            filter === 'all'
              ? 'border-lime-400/50 bg-lime-400/10 text-lime-400'
              : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
          }`}
        >
          All ({SAMPLE_DEALS.length})
        </button>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s]
          const count = SAMPLE_DEALS.filter((d) => d.status === s).length
          if (count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                filter === s ? cfg.classes : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
              }`}
            >
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Deals table */}
      <div className="border border-zinc-800 overflow-hidden mb-8">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_160px_120px_110px_88px] gap-4 px-5 py-3 bg-zinc-900/60 border-b border-zinc-800">
          {['Deal', 'Party', 'Amount', 'Due Date', 'Status'].map((h) => (
            <span key={h} className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <FileText className="h-8 w-8 text-zinc-700" aria-hidden="true" />
            <p className="text-zinc-500 text-sm">No deals found for this filter.</p>
            <button
              onClick={() => setShowNew(true)}
              className="font-mono text-xs text-lime-400 underline hover:no-underline"
            >
              Create your first deal
            </button>
          </div>
        ) : (
          <ul role="list">
            {filtered.map((deal, i) => {
              const cfg = STATUS_CONFIG[deal.status]
              const StatusIcon = cfg.icon
              return (
                <li
                  key={deal.id}
                  className={`grid grid-cols-1 sm:grid-cols-[1fr_160px_120px_110px_88px] gap-2 sm:gap-4 px-5 py-4 hover:bg-zinc-900/40 transition-colors cursor-pointer ${
                    i !== filtered.length - 1 ? 'border-b border-zinc-800/60' : ''
                  }`}
                >
                  {/* Deal title + type */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-zinc-100 text-sm font-medium truncate">{deal.title}</span>
                    <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                      {TYPE_LABELS[deal.type]}
                    </span>
                  </div>

                  {/* Party */}
                  <span className="text-zinc-400 text-xs truncate hidden sm:block self-center">
                    {deal.party}
                  </span>

                  {/* Amount */}
                  <span
                    className="hidden sm:block self-center font-black text-zinc-100"
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '1.1rem' }}
                  >
                    ${deal.amount.toLocaleString()}
                  </span>

                  {/* Due date */}
                  <span className="hidden sm:block self-center font-mono text-xs text-zinc-500">
                    {deal.dueDate ?? '—'}
                  </span>

                  {/* Status + actions */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 self-center">
                    <span className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest px-2 py-1 border ${cfg.classes}`}>
                      <StatusIcon className="h-2.5 w-2.5" aria-hidden="true" />
                      {cfg.label}
                    </span>
                    <button
                      aria-label="Deal actions"
                      className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Quick action bar */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-zinc-800/60">
        <button className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest px-4 py-2 hover:border-zinc-600 hover:text-zinc-300 transition-colors">
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export CSV
        </button>
        <button className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest px-4 py-2 hover:border-zinc-600 hover:text-zinc-300 transition-colors">
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          Send payment link
        </button>
        <a
          href="/data/accounting"
          className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest px-4 py-2 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
        >
          View in Accounting
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      {/* New Deal modal — minimal shell */}
      {showNew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="New Deal"
        >
          <div className="w-full max-w-lg border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-zinc-100 uppercase"
                style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.5rem' }}
              >
                New Deal
              </h2>
              <button
                onClick={() => setShowNew(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="Close"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Deal type */}
              <div>
                <label className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                  Deal type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.entries(TYPE_LABELS) as [DealType, string][]).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className="px-3 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-widest text-left hover:border-lime-400/40 hover:text-lime-400 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="deal-title" className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                  Deal title
                </label>
                <input
                  id="deal-title"
                  type="text"
                  placeholder="e.g. 2027 Seat Fee — #32 Jake Morrison"
                  className="w-full bg-zinc-950/60 border border-zinc-700 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-lime-400/40 transition-colors"
                />
              </div>

              {/* Party + Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="deal-party" className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    Party
                  </label>
                  <input
                    id="deal-party"
                    type="text"
                    placeholder="Rider / sponsor / team"
                    className="w-full bg-zinc-950/60 border border-zinc-700 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-lime-400/40 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="deal-amount" className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                    Amount ($)
                  </label>
                  <input
                    id="deal-amount"
                    type="number"
                    placeholder="0"
                    className="w-full bg-zinc-950/60 border border-zinc-700 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-lime-400/40 transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 bg-lime-400 text-zinc-950 font-bold px-5 py-3 hover:bg-lime-300 transition-colors"
                  onClick={() => setShowNew(false)}
                >
                  Save as Draft
                </button>
                <button
                  className="flex-1 border border-zinc-700 text-zinc-400 font-mono text-xs uppercase tracking-widest px-5 py-3 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
                  onClick={() => setShowNew(false)}
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
