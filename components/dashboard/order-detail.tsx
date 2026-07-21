'use client'

import { deleteOrder, updateOrderStatus } from '@/app/actions/orders'
import type { QuoteBreakdown } from '@/lib/pricing'
import { formatCurrency } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Order = {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string | null
  productType: string
  printType: string
  quantity: number
  numColors: number | null
  printLocations: number | null
  sizes: string | null
  colors: string | null
  notes: string | null
  status: string
  garmentCost: number | null
  unitPrice: number | null
  totalPrice: number | null
  breakdown: unknown
  dueDate: string | null
  createdAt: string
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

const PRINT_LABELS: Record<string, string> = {
  screen_print: 'Screen Print',
  embroidery: 'Embroidery',
  dtf: 'DTF Transfer',
  sublimation: 'Sublimation',
}

export default function OrderDetail({ order }: { order: Order }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState(order.status)
  const b = order.breakdown as QuoteBreakdown | null

  function changeStatus(next: Status) {
    setStatus(next)
    startTransition(() => updateOrderStatus(order.id, next))
  }

  function handleDelete() {
    if (!confirm('Delete this order permanently?')) return
    startTransition(async () => {
      await deleteOrder(order.id)
      router.push('/dashboard/orders')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary text-xs uppercase tracking-widest mb-1">
            Order #{order.id}
          </p>
          <h1
            className="text-white font-black uppercase text-3xl lg:text-4xl leading-none"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            {order.customerName}
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {order.customerEmail}
            {order.customerPhone ? ` · ${order.customerPhone}` : ''}
          </p>
        </div>
        <div
          className="text-right"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Quote Total
          </p>
          <p className="text-primary font-black text-3xl leading-none mt-1">
            {formatCurrency(order.totalPrice ?? 0)}
          </p>
        </div>
      </div>

      {/* Status control */}
      <div className="bg-[#161616] border border-white/10 p-5">
        <p className="text-white/50 text-[11px] uppercase tracking-widest mb-3">
          Production Status
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={pending}
              onClick={() => changeStatus(s)}
              className={cn(
                'px-3 py-2 text-xs uppercase tracking-wide font-medium border transition-colors',
                status === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-white/50 border-white/10 hover:text-white hover:border-white/30',
              )}
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Job spec */}
        <div className="bg-[#161616] border border-white/10 p-5">
          <h2
            className="text-white font-black uppercase text-lg mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Job Spec
          </h2>
          <dl className="space-y-3 text-sm">
            <Spec label="Garment" value={order.productType} />
            <Spec label="Decoration" value={PRINT_LABELS[order.printType] ?? order.printType} />
            <Spec label="Quantity" value={`${order.quantity} pcs`} />
            <Spec
              label="Colors / Locations"
              value={`${order.numColors ?? 1} color${(order.numColors ?? 1) > 1 ? 's' : ''} · ${order.printLocations ?? 1} location${(order.printLocations ?? 1) > 1 ? 's' : ''}`}
            />
            {order.sizes && <Spec label="Sizes" value={order.sizes} />}
            {order.colors && <Spec label="Ink / PMS" value={order.colors} />}
            {order.dueDate && (
              <Spec
                label="Due"
                value={new Date(order.dueDate).toLocaleDateString()}
              />
            )}
            {order.notes && <Spec label="Notes" value={order.notes} />}
          </dl>
        </div>

        {/* Cost breakdown */}
        <div className="bg-[#161616] border border-white/10 p-5">
          <h2
            className="text-white font-black uppercase text-lg mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Cost & Margin
          </h2>
          {b ? (
            <dl className="space-y-2.5 text-sm">
              <Spec label="Garment / pc" value={formatCurrency(b.garmentCostPerPiece)} />
              <Spec label="Print / pc" value={formatCurrency(b.printCostPerPiece)} />
              {b.tagCostPerPiece > 0 && (
                <Spec label="Tag / pc" value={formatCurrency(b.tagCostPerPiece)} />
              )}
              <Spec label="Screen setup" value={formatCurrency(b.screenSetupTotal)} />
              {b.colorChangeTotal > 0 && (
                <Spec label="Color changes" value={formatCurrency(b.colorChangeTotal)} />
              )}
              <div className="border-t border-white/10 my-2" />
              <Spec label="Your cost" value={formatCurrency(b.totalCost)} strong />
              <Spec label="Unit price" value={formatCurrency(b.suggestedUnitPrice)} />
              <Spec label="Quote total" value={formatCurrency(b.suggestedTotal)} strong />
              <div className="border-t border-white/10 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-white/50 uppercase text-xs tracking-widest">
                  Profit
                </span>
                <span className="text-primary font-bold">
                  {formatCurrency(b.grossProfit)} ({b.marginPercent.toFixed(1)}%)
                </span>
              </div>
            </dl>
          ) : (
            <p className="text-white/40 text-sm">
              No cost breakdown stored for this order.
            </p>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="flex justify-end">
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-red-400/70 hover:text-red-400 text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          Delete Order
        </button>
      </div>
    </div>
  )
}

function Spec({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-white/40 shrink-0">{label}</dt>
      <dd
        className={cn(
          'text-right',
          strong ? 'text-white font-bold' : 'text-white/80',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
