'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Package, ShoppingBag, TrendingUp, AlertTriangle,
  ChevronDown, ChevronUp, Truck, CheckCircle2, XCircle,
  RefreshCw, Eye, EyeOff, Edit3,
} from 'lucide-react'
import {
  updateOrderStatus, updateOrderTracking, toggleProductActive, updateVariantStock,
  type OrderRow, type ProductRow, type ShopStats, type OrderStatus,
} from '@/app/actions/md-shop-owner'

// ── Helpers ───────────────────────────────────────────────────────────────────

function dollars(cents: number) {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmt(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  pending_payment: 'Pending Payment',
  in_production: 'In Production',
  quality_check: 'Quality Check',
  ready: 'Ready',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_PILL: Record<string, string> = {
  paid:            'bg-sky-400/10 text-sky-400 border border-sky-400/20',
  pending_payment: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  in_production:   'bg-orange-400/10 text-orange-400 border border-orange-400/20',
  quality_check:   'bg-purple-400/10 text-purple-400 border border-purple-400/20',
  ready:           'bg-lime-400/10 text-lime-400 border border-lime-400/20',
  shipped:         'bg-blue-400/10 text-blue-400 border border-blue-400/20',
  completed:       'bg-zinc-400/10 text-zinc-400 border border-zinc-400/20',
  cancelled:       'bg-red-400/10 text-red-400 border border-red-400/20',
}

const ORDER_STATUS_FLOW: OrderStatus[] = [
  'paid', 'in_production', 'quality_check', 'ready', 'shipped', 'completed',
]

function StatCard({
  label, value, sub, icon: Icon, accent = 'lime',
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; accent?: 'lime' | 'sky' | 'orange' | 'red'
}) {
  const map = {
    lime:   'text-lime-400 bg-lime-400/10',
    sky:    'text-sky-400 bg-sky-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
    red:    'text-red-400 bg-red-400/10',
  }
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-zinc-100">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${map[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// ── Order row ──────────────────────────────────────────────────────────────────

function OrderCard({ order, onRefresh }: { order: OrderRow; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [tracking, setTracking] = useState({
    carrier: order.trackingCarrier ?? '',
    number: order.trackingNumber ?? '',
  })
  const [trackingMode, setTrackingMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function advanceStatus() {
    const idx = ORDER_STATUS_FLOW.indexOf(order.status as OrderStatus)
    const next = ORDER_STATUS_FLOW[idx + 1]
    if (!next) return
    setError(null)
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, next)
      if (!res.ok) setError(res.error)
      else onRefresh()
    })
  }

  function saveTracking() {
    setError(null)
    startTransition(async () => {
      const res = await updateOrderTracking(order.id, tracking.carrier, tracking.number)
      if (!res.ok) setError(res.error)
      else { setTrackingMode(false); onRefresh() }
    })
  }

  const nextStatus = ORDER_STATUS_FLOW[ORDER_STATUS_FLOW.indexOf(order.status as OrderStatus) + 1]
  const canAdvance = Boolean(nextStatus) && order.status !== 'cancelled'

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      {/* Header row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors rounded-lg"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Order</p>
            <p className="text-sm font-bold text-zinc-100 font-mono">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</p>
            <p className="text-sm text-zinc-300 truncate">{order.customerName}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total</p>
            <p className="text-sm font-semibold text-lime-400">{dollars(order.totalCents)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</p>
            <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_PILL[order.status] ?? STATUS_PILL.paid}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
        </div>
        <div className="text-zinc-500 shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-zinc-800 px-5 py-4 space-y-4">
          {/* Items */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Items</p>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">
                    {item.productName} — {item.color} / {item.size}
                    {item.quantity > 1 && <span className="text-zinc-500"> ×{item.quantity}</span>}
                  </span>
                  <span className="text-zinc-400">{dollars(item.unitPriceCents * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ship to */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Ship To</p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {order.customerName}<br />
                {order.shipAddress1}{order.shipAddress2 ? `, ${order.shipAddress2}` : ''}<br />
                {order.shipCity}, {order.shipState} {order.shipZip}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Contact</p>
              <p className="text-sm text-zinc-300">{order.email}</p>
              {order.phone && <p className="text-sm text-zinc-400">{order.phone}</p>}
              <p className="text-xs text-zinc-500 mt-1">Ordered {fmt(order.createdAt)}</p>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span><span>{dollars(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Shipping</span><span>{order.shippingCents === 0 ? 'FREE' : dollars(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Tax</span><span>{dollars(order.taxCents)}</span>
            </div>
            <div className="flex justify-between font-bold text-zinc-100 border-t border-zinc-800 pt-1 mt-1">
              <span>Total</span><span className="text-lime-400">{dollars(order.totalCents)}</span>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && !trackingMode && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Truck className="h-4 w-4" />
              <span>{order.trackingCarrier} — {order.trackingNumber}</span>
              <button onClick={() => setTrackingMode(true)} className="text-zinc-500 hover:text-zinc-300">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {trackingMode && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={tracking.carrier}
                  onChange={(e) => setTracking((t) => ({ ...t, carrier: e.target.value }))}
                  placeholder="Carrier (e.g. UPS)"
                  className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
                />
                <input
                  value={tracking.number}
                  onChange={(e) => setTracking((t) => ({ ...t, number: e.target.value }))}
                  placeholder="Tracking number"
                  className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveTracking}
                  disabled={isPending}
                  className="rounded bg-lime-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
                >
                  {isPending ? 'Saving…' : 'Save & Mark Shipped'}
                </button>
                <button
                  onClick={() => setTrackingMode(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!trackingMode && order.status !== 'shipped' && order.status !== 'completed' && order.status !== 'cancelled' && (
            <button
              onClick={() => setTrackingMode(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
            >
              <Truck className="h-3.5 w-3.5" />
              Add tracking
            </button>
          )}

          {error && (
            <p className="text-xs text-red-400 border border-red-400/20 bg-red-400/5 rounded px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {canAdvance && (
              <button
                onClick={advanceStatus}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded bg-lime-400 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {isPending ? 'Updating…' : `Mark ${STATUS_LABELS[nextStatus]}`}
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={() => {
                  setError(null)
                  startTransition(async () => {
                    const res = await updateOrderStatus(order.id, 'cancelled')
                    if (!res.ok) setError(res.error)
                    else onRefresh()
                  })
                }}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-400/10 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
            {order.status === 'completed' && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-lime-400" />
                Fulfilled
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Inventory row ─────────────────────────────────────────────────────────────

function ProductInventoryCard({ product, onRefresh }: { product: ProductRow; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [editingVariant, setEditingVariant] = useState<number | null>(null)
  const [stockValue, setStockValue] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  function startEditStock(variantId: number, current: number) {
    setEditingVariant(variantId)
    setStockValue(String(current))
  }

  function saveStock(variantId: number) {
    const n = parseInt(stockValue, 10)
    if (isNaN(n) || n < 0) { setError('Enter a valid stock number.'); return }
    setError(null)
    startTransition(async () => {
      const res = await updateVariantStock(variantId, n)
      if (!res.ok) setError(res.error)
      else { setEditingVariant(null); onRefresh() }
    })
  }

  function toggleActive() {
    startTransition(async () => {
      await toggleProductActive(product.id, !product.active)
      onRefresh()
    })
  }

  const lowStock = product.variants.some((v) => v.stock > 0 && v.stock <= 5)
  const outOfStock = product.totalStock === 0

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors rounded-lg"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-bold text-zinc-100 truncate">{product.name}</p>
            <p className="text-xs text-zinc-500 capitalize">{product.category}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Price</p>
            <p className="text-sm text-zinc-300">{dollars(product.priceCents)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Stock</p>
            <p className={`text-sm font-semibold ${outOfStock ? 'text-red-400' : lowStock ? 'text-yellow-400' : 'text-lime-400'}`}>
              {product.totalStock} units
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</p>
            <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${product.active ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
              {product.active ? 'Active' : 'Hidden'}
            </span>
          </div>
        </div>
        <div className="text-zinc-500 shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 px-5 py-4 space-y-4">
          {/* Variants table */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Inventory by Size</p>
            <div className="space-y-1">
              {product.variants.map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded px-3 py-2 bg-zinc-950">
                  <span className="w-20 text-xs font-mono text-zinc-500">{v.sku}</span>
                  <span className="w-16 text-xs text-zinc-400">{v.size}</span>
                  <span className="w-24 text-xs text-zinc-400">{v.color}</span>
                  <div className="flex flex-1 items-center justify-end gap-2">
                    {editingVariant === v.id ? (
                      <>
                        <input
                          type="number"
                          min={0}
                          value={stockValue}
                          onChange={(e) => setStockValue(e.target.value)}
                          className="w-20 rounded border border-lime-400/50 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') saveStock(v.id); if (e.key === 'Escape') setEditingVariant(null) }}
                        />
                        <button onClick={() => saveStock(v.id)} disabled={isPending} className="text-xs text-lime-400 hover:text-lime-300 font-semibold">Save</button>
                        <button onClick={() => setEditingVariant(null)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className={`text-sm font-semibold ${v.stock === 0 ? 'text-red-400' : v.stock <= 5 ? 'text-yellow-400' : 'text-zinc-200'}`}>
                          {v.stock}
                        </span>
                        <button onClick={() => startEditStock(v.id, v.stock)} className="text-zinc-600 hover:text-zinc-300">
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 border border-red-400/20 bg-red-400/5 rounded px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={toggleActive}
              disabled={isPending}
              className={`flex items-center gap-1.5 rounded border px-4 py-2 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-colors ${
                product.active
                  ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  : 'border-lime-400/30 text-lime-400 hover:bg-lime-400/10'
              }`}
            >
              {product.active ? <><EyeOff className="h-3.5 w-3.5" /> Hide from shop</> : <><Eye className="h-3.5 w-3.5" /> Show in shop</>}
            </button>
            <Link
              href={`/shop/${product.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 uppercase tracking-wider"
            >
              View in shop
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main client component ─────────────────────────────────────────────────────

export default function ShopManagementClient({
  stats: initialStats,
  orders: initialOrders,
  products: initialProducts,
}: {
  stats: ShopStats
  orders: OrderRow[]
  products: ProductRow[]
}) {
  const [tab, setTab] = useState<'orders' | 'inventory'>('orders')
  const [orders, setOrders] = useState(initialOrders)
  const [products, setProducts] = useState(initialProducts)
  const [stats, setStats] = useState(initialStats)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [, startTransition] = useTransition()

  // Re-fetch after mutations (router.refresh() is simpler but loses local state)
  function refresh() {
    startTransition(async () => {
      const { getShopOrders, getShopProducts, getShopStats } = await import('@/app/actions/md-shop-owner')
      const [o, p, s] = await Promise.all([getShopOrders(), getShopProducts(), getShopStats()])
      setOrders(o)
      setProducts(p)
      setStats(s)
    })
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/data/owner" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Shop Management</h1>
            <p className="text-sm text-zinc-500">Orders, fulfillment, and inventory</p>
          </div>
          <Link
            href="/shop"
            target="_blank"
            className="ml-auto rounded border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 uppercase tracking-wider"
          >
            View Shop
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Revenue" value={`$${Math.round(stats.totalRevenueCents / 100).toLocaleString()}`} icon={TrendingUp} accent="lime" />
          <StatCard label="Pending Orders" value={String(stats.pendingOrders)} sub="Need action" icon={Package} accent="orange" />
          <StatCard label="Shipped" value={String(stats.shippedOrders)} icon={Truck} accent="sky" />
          <StatCard label="Low Stock SKUs" value={String(stats.lowStockVariants)} sub="5 or fewer units" icon={AlertTriangle} accent="red" />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 w-fit">
          {(['orders', 'inventory'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === t
                  ? 'bg-lime-400 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t === 'orders' ? `Orders (${orders.length})` : `Inventory (${products.length})`}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {/* Status filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['all', 'paid', 'in_production', 'shipped', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    statusFilter === s
                      ? 'bg-lime-400 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_LABELS[s] ?? s}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm">
                  {orders.length === 0 ? 'No orders yet. Share the shop link to start selling.' : 'No orders match this filter.'}
                </p>
              </div>
            ) : (
              filteredOrders.map((o) => (
                <OrderCard key={o.id} order={o} onRefresh={refresh} />
              ))
            )}
          </div>
        )}

        {/* Inventory tab */}
        {tab === 'inventory' && (
          <div className="space-y-3">
            {products.map((p) => (
              <ProductInventoryCard key={p.id} product={p} onRefresh={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
