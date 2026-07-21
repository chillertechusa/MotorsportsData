'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { subscribeMdPlan } from '@/app/actions/md-billing'
import { MD_PLAN_LABELS, MD_PLAN_CENTS, MD_PLAN_CENTS_MONTHLY, isMdPlanId } from '@/lib/md-plans'
import type { MdPlanId } from '@/lib/md-plans'
import { Lock, CheckCircle2, ChevronDown, AlertCircle, Loader2 } from 'lucide-react'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { Square?: any }
}

type Prefill = {
  email?: string
  name?: string
}

type Props = {
  tier: string
  squareReady: boolean
  appId: string
  locationId: string
  prefill: Prefill
}

const BILLING_OPTIONS = [
  { value: 'annual' as const, label: 'Annual (save 15%)' },
  { value: 'monthly' as const, label: 'Monthly' },
]

export default function TierCheckoutClient({ tier, squareReady, appId, locationId, prefill }: Props) {
  const router = useRouter()

  const validTier = isMdPlanId(tier) ? (tier as MdPlanId) : null
  const tierLabel = validTier ? MD_PLAN_LABELS[validTier] : 'Unknown Plan'
  const annualCents = validTier ? MD_PLAN_CENTS[validTier] : 0
  const monthlyCents = validTier ? MD_PLAN_CENTS_MONTHLY[validTier] : 0

  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual')
  const totalCents = billing === 'annual' ? annualCents : monthlyCents

  const [form, setForm] = useState({ email: prefill.email ?? '', name: prefill.name ?? '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cardReady, setCardReady] = useState(false)

  const cardRef = useRef<any>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

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
        console.error('[v0] Square card init error:', err)
        setError('Could not load the card form. Please refresh and try again.')
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
        try { cardRef.current.destroy() } catch { /* ignore */ }
      }
    }
  }, [squareReady, appId, locationId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validTier) { setError('Invalid tier selected. Please start over.'); return }
    if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!form.name.trim()) { setError('Please enter your full name.'); return }

    setError(null)
    setSubmitting(true)

    try {
      let sourceId = 'FAKE_SOURCE_NOT_CONFIGURED'

      if (squareReady) {
        if (!cardRef.current) {
          setError('Card form is still loading. Please wait a moment and try again.')
          setSubmitting(false)
          return
        }
        const result = await cardRef.current.tokenize()
        if (result.status !== 'OK') {
          const cardError = result.errors?.[0]?.message ?? 'Please check your card details.'
          setError(`Card Error: ${cardError} Try a different card or contact your bank.`)
          setSubmitting(false)
          return
        }
        sourceId = result.token
      }

      const res = await subscribeMdPlan(validTier, {
        sourceId,
        email: form.email,
        name: form.name,
        frequency: billing,
      })

      if (res.ok) {
        setSuccess(true)
        // Brief pause so success state is visible before redirect
        setTimeout(() => {
          router.push('/data')
          router.refresh()
        }, 2500)
      } else {
        // Parse backend errors and make them user-friendly
        let friendlyError = res.error || 'Payment failed. Please try again.'
        if (res.error?.includes('declined')) {
          friendlyError = 'Your card was declined. Try a different card or contact your bank.'
        } else if (res.error?.includes('expired')) {
          friendlyError = 'Your card has expired. Please use a different card.'
        } else if (res.error?.includes('exists')) {
          friendlyError = 'This email is already in use. Try signing in instead.'
        }
        setError(friendlyError)
        setSubmitting(false)
      }
    } catch (err) {
      console.error('[v0] Tier checkout error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong on our end.'
      setError(`Error: ${errorMsg} Please refresh and try again.`)
      setSubmitting(false)
    }
  }

  if (!validTier) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-foreground text-3xl font-black uppercase mb-4">Invalid Plan</h1>
        <p className="text-muted-foreground mb-8">The tier you selected could not be found.</p>
        <a href="/data/pricing" className="text-lime-400 underline text-sm">View all plans</a>
      </div>
    )
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center flex flex-col items-center gap-6">
        <div className="flex items-center justify-center">
          <CheckCircle2 className="h-16 w-16 text-lime-400 animate-in fade-in duration-500" />
        </div>
        <h1 className="text-foreground text-3xl font-black uppercase">
          Welcome to {tierLabel}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your subscription is active. Your tier has been upgraded and all features are now available. Taking you to the platform now...
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecting...</span>
        </div>
      </div>
    )
  }

  const formatPrice = (cents: number) =>
    cents === 0 ? 'FREE' : `$${(cents / 100).toFixed(0)}`

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-lime-400 font-mono font-black mb-1">
          Subscription Checkout
        </p>
        <h1 className="text-foreground text-4xl font-black uppercase">
          {tierLabel}
        </h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left: form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Billing frequency toggle */}
          <section>
            <h2 className="text-foreground text-sm font-black uppercase tracking-widest mb-4">
              Billing Frequency
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {BILLING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBilling(opt.value)}
                  className={`border px-4 py-3 text-sm font-semibold text-left transition-colors ${
                    billing === opt.value
                      ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                      : 'border-border text-muted-foreground hover:border-lime-400/40'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-xs mt-0.5 font-mono">
                    {opt.value === 'annual'
                      ? `${formatPrice(annualCents)}/year`
                      : `${formatPrice(monthlyCents)}/mo`}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-foreground text-sm font-black uppercase tracking-widest mb-4">
              Account Details
            </h2>
            <div className="space-y-3">
              <input
                type="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-lime-400 focus:outline-none text-sm"
                aria-label="Email address"
              />
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-lime-400 focus:outline-none text-sm"
                aria-label="Full name"
              />
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="text-foreground text-sm font-black uppercase tracking-widest mb-4">
              Payment
            </h2>
            {squareReady ? (
              <>
                <div
                  ref={cardContainerRef}
                  id="tier-card-container"
                  className="min-h-14 border border-border bg-background p-2"
                />
                {!cardReady && (
                  <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                    Loading secure card form...
                  </p>
                )}
              </>
            ) : (
              <div className="border border-dashed border-lime-400/30 bg-card p-4">
                <p className="text-sm text-foreground font-semibold uppercase tracking-wide">
                  Card payments not configured
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Add Square API keys in project settings to accept cards.
                </p>
              </div>
            )}
          </section>

          {error && (
            <div className="flex gap-3 border border-destructive/40 bg-destructive/10 px-4 py-3 rounded">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  {error.includes('card') ? 'Card Error' : error.includes('email') ? 'Account Error' : 'Payment Error'}
                </p>
                <p className="text-sm text-destructive/80 mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || (squareReady && !cardReady)}
            className="w-full bg-lime-400 py-4 text-sm font-black uppercase tracking-widest text-zinc-950 transition-colors hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Charging {formatPrice(totalCents)}...</span>
              </>
            ) : (
              `Subscribe — ${billing === 'annual' ? formatPrice(annualCents) + '/year' : formatPrice(monthlyCents) + '/mo'}`
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secure checkout powered by Square</span>
          </div>
        </form>

        {/* Right: order summary */}
        <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="text-foreground text-sm font-black uppercase tracking-widest mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-foreground font-bold text-sm">{tierLabel}</p>
                <p className="text-muted-foreground text-xs mt-0.5 capitalize">{billing} subscription</p>
              </div>
              <p className="text-lime-400 font-black text-lg font-mono shrink-0">
                {billing === 'annual' ? formatPrice(annualCents) : formatPrice(monthlyCents)}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-widest text-xs">Total today</span>
              <span className="text-foreground font-black font-mono">
                {billing === 'annual' ? formatPrice(annualCents) : formatPrice(monthlyCents)}
              </span>
            </div>
            {billing === 'monthly' && (
              <p className="text-xs text-muted-foreground">
                Billed monthly. Cancel anytime.
              </p>
            )}
            {billing === 'annual' && (
              <p className="text-xs text-muted-foreground">
                Billed annually. Save 15% vs monthly.
              </p>
            )}
          </div>

          {/* What you get */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
              Included
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                Full platform access for {tierLabel}
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                Free Rider account always active
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                Data preserved if subscription lapses
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                Upgrade or downgrade anytime
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
