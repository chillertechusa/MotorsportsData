'use client'

import { useCart, formatCents } from '@/lib/cart-context'
import { createOrder } from '@/app/actions/store'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Square?: any
  }
}

const SHIPPING_FLAT_CENTS = 800
const FREE_SHIP_THRESHOLD_CENTS = 10000
// Salt Lake City, Utah sales tax rate (6.85%)
const TAX_RATE = 0.0685

type Prefill = {
  email?: string
  name?: string
  phone?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
}

export default function CheckoutClient({
  squareReady,
  appId,
  locationId,
  prefill,
}: {
  squareReady: boolean
  appId: string
  locationId: string
  prefill: Prefill
}) {
  const { items, subtotalCents, clear } = useCart()
  const router = useRouter()

  const [form, setForm] = useState({
    email: prefill.email ?? '',
    name: prefill.name ?? '',
    phone: prefill.phone ?? '',
    address1: prefill.address1 ?? '',
    address2: prefill.address2 ?? '',
    city: prefill.city ?? '',
    state: prefill.state ?? '',
    zip: prefill.zip ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardReady, setCardReady] = useState(false)

  const cardRef = useRef<any>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  const shippingCents = subtotalCents >= FREE_SHIP_THRESHOLD_CENTS ? 0 : subtotalCents > 0 ? SHIPPING_FLAT_CENTS : 0
  const taxCents = Math.round(subtotalCents * TAX_RATE)
  const totalCents = subtotalCents + shippingCents + taxCents

  // Load Square Web Payments SDK + attach a card input when configured.
  useEffect(() => {
    if (!squareReady || !appId || !locationId) return
    const isSandbox = appId.startsWith('sandbox-')
    const src = isSandbox
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js'

    let cancelled = false

    async function initCard() {
      if (!window.Square || cancelled) return
      try {
        const payments = window.Square.payments(appId, locationId)
        const card = await payments.card()
        if (cancelled) return
        await card.attach(cardContainerRef.current)
        cardRef.current = card
        setCardReady(true)
      } catch (err) {
        console.log('[v0] Square card init error:', err)
        setError('Could not load the card form. Please refresh.')
      }
    }

    if (window.Square) {
      initCard()
    } else {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = initCard
      document.body.appendChild(script)
    }

    return () => {
      cancelled = true
      if (cardRef.current) {
        try {
          cardRef.current.destroy()
        } catch {
          // ignore
        }
      }
    }
  }, [squareReady, appId, locationId])

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate(): string | null {
    if (!form.email.includes('@')) return 'Enter a valid email.'
    if (!form.name.trim()) return 'Enter your name.'
    if (!form.address1.trim()) return 'Enter your street address.'
    if (!form.city.trim()) return 'Enter your city.'
    if (!form.state.trim()) return 'Enter your state.'
    if (!form.zip.trim()) return 'Enter your ZIP code.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      let sourceId: string | null = null

      if (squareReady) {
        if (!cardRef.current) {
          setError('Card form is still loading. Please wait a moment.')
          setSubmitting(false)
          return
        }
        const result = await cardRef.current.tokenize()
        if (result.status !== 'OK') {
          setError('Please check your card details and try again.')
          setSubmitting(false)
          return
        }
        sourceId = result.token
      }

      const res = await createOrder({
        sourceId,
        contact: {
          email: form.email,
          name: form.name,
          phone: form.phone || undefined,
          address1: form.address1,
          address2: form.address2 || undefined,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      })

      if (res.ok) {
        clear()
        router.push(`/order/${res.orderNumber}`)
      } else {
        setError(res.error)
        setSubmitting(false)
      }
    } catch (err) {
      console.log('[v0] Checkout error:', err)
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-24 text-center">
        <h1
          className="text-foreground text-4xl font-black uppercase"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Your Cart Is Empty
        </h1>
        <p className="text-muted-foreground">Add some gear before checking out.</p>
        <Link
          href="/shop"
          className="bg-primary px-8 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Shop Gear
        </Link>
      </div>
    )
  }

  const inputClass =
    'w-full border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1
        className="mb-8 text-foreground text-4xl font-black uppercase md:text-5xl"
        style={{ fontFamily: 'var(--font-barlow-condensed)' }}
      >
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Left: forms */}
        <div className="space-y-8">
          <section>
            <h2
              className="mb-4 text-foreground text-xl font-black uppercase"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Contact
            </h2>
            <div className="grid gap-3">
              <input
                type="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
                aria-label="Email"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className={inputClass}
                  aria-label="Full name"
                />
                <input
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={inputClass}
                  aria-label="Phone"
                />
              </div>
            </div>
          </section>

          <section>
            <h2
              className="mb-4 text-foreground text-xl font-black uppercase"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Shipping Address
            </h2>
            <div className="grid gap-3">
              <input
                required
                placeholder="Street address"
                value={form.address1}
                onChange={(e) => update('address1', e.target.value)}
                className={inputClass}
                aria-label="Street address"
              />
              <input
                placeholder="Apt, suite, etc. (optional)"
                value={form.address2}
                onChange={(e) => update('address2', e.target.value)}
                className={inputClass}
                aria-label="Apartment or suite"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className={`${inputClass} sm:col-span-1`}
                  aria-label="City"
                />
                <input
                  required
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => update('state', e.target.value)}
                  className={inputClass}
                  aria-label="State"
                />
                <input
                  required
                  placeholder="ZIP"
                  value={form.zip}
                  onChange={(e) => update('zip', e.target.value)}
                  className={inputClass}
                  aria-label="ZIP code"
                />
              </div>
            </div>
          </section>

          <section>
            <h2
              className="mb-4 text-foreground text-xl font-black uppercase"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Payment
            </h2>
            {squareReady ? (
              <>
                <div
                  ref={cardContainerRef}
                  id="card-container"
                  className="min-h-14 border border-border bg-background p-2"
                />
                {!cardReady && (
                  <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                    Loading secure card form…
                  </p>
                )}
              </>
            ) : (
              <div className="border border-dashed border-primary/40 bg-card p-4">
                <p className="text-sm text-foreground font-semibold uppercase tracking-wide">
                  Card payments not configured yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Add your Square API keys in project settings to accept cards. For now you can
                  place a test order — it will be recorded as pending payment and reserve stock.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right: summary */}
        <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2
            className="mb-4 text-foreground text-xl font-black uppercase"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Order Summary
          </h2>
          <ul className="mb-4 space-y-3">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-white">
                  {item.image && <Image src={item.image} alt={item.productName} fill className="object-contain" sizes="56px" />}
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-black text-primary-foreground">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-foreground text-xs font-bold uppercase leading-tight" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                    {item.productName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.color} · {item.size}
                  </p>
                </div>
                <span className="text-foreground text-sm font-semibold">{formatCents(item.priceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <Row label="Subtotal" value={formatCents(subtotalCents)} />
            <Row label="Shipping" value={shippingCents === 0 ? 'FREE' : formatCents(shippingCents)} />
            <Row label="Tax" value={formatCents(taxCents)} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-foreground text-sm font-bold uppercase tracking-widest">Total</span>
            <span className="text-primary text-2xl font-black" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
              {formatCents(totalCents)}
            </span>
          </div>

          {error && (
            <p className="mt-4 border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            {submitting ? 'Processing…' : squareReady ? `Pay ${formatCents(totalCents)}` : 'Place Order'}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Secure checkout powered by Square</p>
        </aside>
      </form>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground uppercase tracking-widest text-xs">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}
