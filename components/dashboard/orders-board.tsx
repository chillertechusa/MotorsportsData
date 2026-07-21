'use client'

import { updateOrderStatus } from '@/app/actions/orders'
import { formatCurrency } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState, useTransition } from 'react'

type Order = {
  id: number
  customerName: string
  productType: string
  quantity: number
  numColors: number | null
  status: string
  totalPrice: string | null
  breakdown: unknown
  createdAt: Date
}

const STATUSES = [
  'pending',
  'in_production',
  'quality_check',
  'ready',
  'shipped',
  'completed',
  'cancelled',
] as const

type Status = (typeof STATUSES)[number]

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_production: 'In Production',
  quality_check: 'Quality Check',
  ready: 'Ready',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  in_production: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  quality_check: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  ready: 'bg-primary/15 text-primary border-primary/30',
  shipped: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  completed: 'bg-white/10 text-white/60 border-white/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
}

function StatusSelect({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <select
      value={status}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value as Status
        startTransition(() => updateOrderStatus(id, next))
      }}
      className={cn(
        'text-[10px] uppercase tracking-wide px-2 py-1 border bg-transparent cursor-pointer outline-none',
        STATUS_COLORS[status],
        pending && 'opacity-50',
      )}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-[#161616] text-white">
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  )
}

export default function OrdersBoard({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<string>('active')

  const filtered = orders.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'active')
      return !['completed', 'cancelled'].includes(o.status)
    return o.status === filter
  })

  const filterTabs = [
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_production', label: 'In Production' },
    { key: 'ready', label: 'Ready' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'all', label: 'All' },
  ]

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filterTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              'px-3 py-1.5 text-xs uppercase tracking-wide font-medium border transition-colors',
              filter === t.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-white/50 border-white/10 hover:text-white hover:border-white/30',
            )}
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/10">
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-white/40 text-sm">No orders in this view.</p>
          </div>
        ) : (
          <>
            {/* Header row (desktop) */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/10 text-white/40 text-[10px] uppercase tracking-widest">
              <span>Customer / Job</span>
              <span className="w-20 text-right">Profit</span>
              <span className="w-24 text-right">Total</span>
              <span className="w-32 text-center">Status</span>
              <span className="w-12" />
            </div>

            <div className="divide-y divide-white/5">
              {filtered.map((o) => {
                const b = o.breakdown as { grossProfit?: number } | null
                const profit = b?.grossProfit ?? 0
                return (
                  <div
                    key={o.id}
                    className="grid grid-cols-2 md:grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 gap-y-2 px-5 py-4 items-center hover:bg-white/5 transition-colors"
                  >
                    <div className="min-w-0 col-span-2 md:col-span-1">
                      <Link
                        href={`/dashboard/orders/${o.id}`}
                        className="text-white font-medium text-sm hover:text-primary transition-colors truncate block"
                      >
                        {o.customerName}
                      </Link>
                      <p className="text-white/40 text-xs truncate">
                        {o.quantity}× {o.productType}
                        {o.numColors
                          ? ` · ${o.numColors} color${o.numColors > 1 ? 's' : ''}`
                          : ''}
                      </p>
                    </div>

                    <span className="w-20 text-right text-primary font-bold text-sm hidden md:block">
                      {formatCurrency(profit)}
                    </span>

                    <span
                      className="w-24 text-right text-white font-bold text-sm"
                      style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                    >
                      {formatCurrency(Number(o.totalPrice ?? 0))}
                    </span>

                    <div className="md:w-32 md:text-center">
                      <StatusSelect id={o.id} status={o.status} />
                    </div>

                    <Link
                      href={`/dashboard/orders/${o.id}`}
                      className="hidden md:block w-12 text-right text-white/30 hover:text-primary text-xs uppercase"
                    >
                      Open
                    </Link>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
