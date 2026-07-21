'use client'

import { createOrder } from '@/app/actions/orders'
import {
  calculateQuote,
  formatCurrency,
  printRunRatePerColor,
  type ShopRates,
} from '@/lib/pricing'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'

type Blank = {
  id: number
  styleNumber: string
  brand: string
  name: string
  category: string
  wholesaleCost: number
  colors: string | null
}

const PRINT_TYPES = [
  { value: 'screen_print', label: 'Screen Print' },
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'dtf', label: 'DTF Transfer' },
  { value: 'sublimation', label: 'Sublimation' },
] as const

const inputClass =
  'w-full bg-[#0d0d0d] border border-white/15 text-white px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors'
const labelClass =
  'block text-white/50 text-[11px] uppercase tracking-widest mb-1.5'

export default function QuoteBuilder({
  blanks,
  rates,
}: {
  blanks: Blank[]
  rates: ShopRates
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Customer
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Job
  const [blankId, setBlankId] = useState<number | ''>(blanks[0]?.id ?? '')
  const [printType, setPrintType] =
    useState<(typeof PRINT_TYPES)[number]['value']>('screen_print')
  const [quantity, setQuantity] = useState(24)
  const [numColors, setNumColors] = useState(1)
  const [printLocations, setPrintLocations] = useState(1)
  const [colorChanges, setColorChanges] = useState(0)
  const [sizeTags, setSizeTags] = useState(false)
  const [markup, setMarkup] = useState(rates.defaultMarkup)
  const [sizes, setSizes] = useState('')
  const [colors, setColors] = useState('')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')

  const selectedBlank = blanks.find((b) => b.id === blankId)
  const garmentCost = selectedBlank?.wholesaleCost ?? 0

  const quote = useMemo(
    () =>
      calculateQuote({
        quantity,
        garmentCost,
        numColors,
        printLocations,
        colorChanges,
        sizeTags,
        markup,
        rates,
      }),
    [
      quantity,
      garmentCost,
      numColors,
      printLocations,
      colorChanges,
      sizeTags,
      markup,
      rates,
    ],
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Customer name and email are required.')
      return
    }
    if (!selectedBlank) {
      setError('Select a garment blank.')
      return
    }
    startTransition(async () => {
      try {
        const order = await createOrder({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined,
          productType: `${selectedBlank.brand} ${selectedBlank.name} (${selectedBlank.styleNumber})`,
          printType,
          quantity,
          sizes: sizes.trim() || undefined,
          colors: colors.trim() || undefined,
          notes: notes.trim() || undefined,
          blankId: selectedBlank.id,
          numColors,
          printLocations,
          garmentCost,
          unitPrice: quote.suggestedUnitPrice,
          totalPrice: quote.suggestedTotal,
          breakdown: quote,
          dueDate: dueDate || undefined,
        })
        router.push(`/dashboard/orders/${order.id}`)
        router.refresh()
      } catch {
        setError('Something went wrong saving the order.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* ── Inputs ── */}
      <div className="space-y-6">
        {/* Customer */}
        <section className="bg-[#161616] border border-white/10 p-5">
          <h2
            className="text-white font-black uppercase text-lg mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Customer
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Name / Company</label>
              <input
                className={inputClass}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Desert Dawgs MX Club"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="club@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="801 555 0199"
              />
            </div>
          </div>
        </section>

        {/* Garment + print */}
        <section className="bg-[#161616] border border-white/10 p-5">
          <h2
            className="text-white font-black uppercase text-lg mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Garment & Print
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Blank</label>
              <select
                className={inputClass}
                value={blankId}
                onChange={(e) => setBlankId(Number(e.target.value))}
              >
                {blanks.length === 0 && <option value="">No blanks — add some in Settings</option>}
                {blanks.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#0d0d0d]">
                    {b.brand} {b.name} ({b.styleNumber}) — {formatCurrency(b.wholesaleCost)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Decoration</label>
              <select
                className={inputClass}
                value={printType}
                onChange={(e) =>
                  setPrintType(e.target.value as typeof printType)
                }
              >
                {PRINT_TYPES.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[#0d0d0d]">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div>
              <label className={labelClass}>Ink Colors</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={numColors}
                onChange={(e) => setNumColors(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div>
              <label className={labelClass}>Print Locations</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={printLocations}
                onChange={(e) =>
                  setPrintLocations(Math.max(1, Number(e.target.value)))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Color Changes</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={colorChanges}
                onChange={(e) =>
                  setColorChanges(Math.max(0, Number(e.target.value)))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Markup (×)</label>
              <input
                type="number"
                min={1}
                step={0.1}
                className={inputClass}
                value={markup}
                onChange={(e) => setMarkup(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                id="sizeTags"
                type="checkbox"
                checked={sizeTags}
                onChange={(e) => setSizeTags(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="sizeTags" className="text-white/70 text-sm">
                Printed size tags (+{formatCurrency(rates.sizeTagFee)}/pc)
              </label>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="bg-[#161616] border border-white/10 p-5">
          <h2
            className="text-white font-black uppercase text-lg mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Size Breakdown</label>
              <input
                className={inputClass}
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="S:4 M:12 L:12 XL:8"
              />
            </div>
            <div>
              <label className={labelClass}>Ink / PMS Colors</label>
              <input
                className={inputClass}
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="305C blue, 185C red, 2298C green"
              />
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                className={inputClass}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Production Notes</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Left chest 4.5in, back print 11in wide…"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ── Live quote ── */}
      <aside className="lg:sticky lg:top-6 space-y-4">
        <div className="bg-[#161616] border border-primary/30 p-5">
          <h2
            className="text-white font-black uppercase text-lg mb-1"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Live Quote
          </h2>
          <p className="text-white/40 text-xs mb-4">
            {quantity} pcs · {formatCurrency(printRunRatePerColor(quantity))}/color run rate
          </p>

          {/* Your cost */}
          <div className="space-y-1.5 text-sm border-b border-white/10 pb-4 mb-4">
            <Row label="Garment / pc" value={formatCurrency(quote.garmentCostPerPiece)} muted />
            <Row label="Print / pc" value={formatCurrency(quote.printCostPerPiece)} muted />
            {quote.tagCostPerPiece > 0 && (
              <Row label="Tag / pc" value={formatCurrency(quote.tagCostPerPiece)} muted />
            )}
            <Row label="Screen setup" value={formatCurrency(quote.screenSetupTotal)} muted />
            {quote.colorChangeTotal > 0 && (
              <Row label="Color changes" value={formatCurrency(quote.colorChangeTotal)} muted />
            )}
            <Row
              label="Your total cost"
              value={formatCurrency(quote.totalCost)}
              strong
            />
          </div>

          {/* Customer price */}
          <div className="space-y-1.5 text-sm">
            <Row label="Unit price" value={formatCurrency(quote.suggestedUnitPrice)} />
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-white/50 uppercase text-xs tracking-widest">
                Quote Total
              </span>
              <span
                className="text-primary font-black text-2xl leading-none"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                {formatCurrency(quote.suggestedTotal)}
              </span>
            </div>
          </div>

          {/* Margin */}
          <div className="mt-4 bg-[#0d0d0d] border border-white/10 p-3 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">
                Gross Profit
              </p>
              <p
                className="text-primary font-black text-lg leading-none mt-0.5"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                {formatCurrency(quote.grossProfit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[10px] uppercase tracking-widest">
                Margin
              </p>
              <p
                className="text-white font-black text-lg leading-none mt-0.5"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                {quote.marginPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary text-primary-foreground py-3 font-black uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {pending ? 'Saving…' : 'Save Order'}
        </button>
      </aside>
    </form>
  )
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string
  value: string
  muted?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          muted ? 'text-white/40' : strong ? 'text-white font-semibold' : 'text-white/70'
        }
      >
        {label}
      </span>
      <span
        className={
          strong ? 'text-white font-bold' : muted ? 'text-white/60' : 'text-white'
        }
      >
        {value}
      </span>
    </div>
  )
}
