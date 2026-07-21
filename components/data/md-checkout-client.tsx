'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Lock } from 'lucide-react'
import { subscribeMdPlan } from '@/app/actions/md-billing'
import { MD_PLAN_CENTS, MD_PLAN_CENTS_MONTHLY, MD_PLAN_LABELS, type MdPlanId, formatPricingDisplay, getPricingCents } from '@/lib/md-plans'
import { useAnalytics } from '@/lib/use-analytics'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { Square?: any }
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}

type Prefill = { email?: string; name?: string }

export default function MdCheckoutClient({
  plan,
  appId,
  locationId,
  prefill,
}: {
  plan: MdPlanId
  appId: string
  locationId: string
  prefill: Prefill
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const analytics = useAnalytics()
  
  // Read frequency from URL query param, default to 'annual'
  const queryFrequency = (searchParams.get('frequency') ?? 'annual') as 'annual' | 'monthly'
  
  const [form, setForm] = useState({
    email: prefill.email ?? '',
    name: prefill.name ?? '',
    smsOptIn: false,
  })
  const [frequency, setFrequency] = useState<'annual' | 'monthly'>(queryFrequency)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardReady, setCardReady] = useState(false)
  const cardRef = useRef<any>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  const isSandbox = appId.startsWith('sandbox-')
  const sdkSrc = isSandbox
    ? 'https://sandbox.web.squarecdn.com/v1/square.js'
    : 'https://web.squarecdn.com/v1/square.js'

  const isFreeAccount = plan === 'rookie' // Rookie tier is free
  const amountCents = getPricingCents(plan, frequency)
  const annualCents = MD_PLAN_CENTS[plan]
  const monthlyCents = MD_PLAN_CENTS_MONTHLY[plan]
  const savingsPercent = frequency === 'annual' && monthlyCents > 0 
    ? Math.round(((monthlyCents * 12 - annualCents) / (monthlyCents * 12)) * 100)
    : 0

  useEffect(() => {
    // Skip Square initialization for free tier
    if (isFreeAccount) {
      setCardReady(true)
      setError(null)
      return
    }

    let cancelled = false
    let retryCount = 0
    const MAX_RETRIES = 3

    // Guard: the Square Web Payments SDK needs BOTH a public application id and
    // a location id from the SAME environment. If either is missing (e.g. the
    // NEXT_PUBLIC_ var wasn't inlined into the deployed build) the SDK throws a
    // vague error, so we fail fast with an actionable message instead.
    if (!appId) {
      setError('Payment configuration is incomplete (missing application ID). Please contact support.')
      return
    }
    if (!locationId) {
      setError('Payment configuration is incomplete (missing location ID). Please contact support.')
      return
    }

    async function initCard(attempt = 1) {
      if (cancelled) return
      if (!window.Square) {
        setError('Could not reach the payment provider. Please disable ad blockers and refresh.')
        return
      }
      try {
        if (!window.Square.payments) {
          throw new Error('Square.payments is not available. Square SDK may not have loaded correctly.')
        }
        const payments = window.Square.payments(appId, locationId)
        if (!payments) {
          throw new Error('Failed to initialize Square payments. Check application ID and location ID.')
        }
        const card = await payments.card({
          style: {
            '.input-container': { borderRadius: '12px', borderColor: '#3f3f46' },
            '.input-container.is-focus': { borderColor: '#a3e635' },
            input: { color: '#f4f4f5', backgroundColor: '#18181b' },
            'input::placeholder': { color: '#71717a' },
          },
        })
        if (cancelled) return
        if (!cardContainerRef.current) {
          throw new Error('Card container ref is not available. Component may have unmounted.')
        }
        await card.attach(cardContainerRef.current)
        if (cancelled) { try { card.destroy() } catch { /* ignore */ } ; return }
        cardRef.current = card
        setError(null)
        setCardReady(true)
      } catch (err) {
        // Surface the REAL Square error — the common cause is an environment
        // mismatch between the application id and the location id.
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[md-checkout] card init error (attempt ${attempt}/${MAX_RETRIES}):`, msg, err)
        
        // Retry transient errors
        const isTransient = /timeout|network|unavailable|square/i.test(msg) || (err instanceof Error && err.message.includes('Cannot'))
        if (isTransient && attempt < MAX_RETRIES && !cancelled) {
          console.info(`[md-checkout] Retrying card initialization in 1s...`)
          await new Promise(r => setTimeout(r, 1000))
          return initCard(attempt + 1)
        }
        
        const mismatch = /environment|location|application|payments/i.test(msg)
        setError(
          mismatch
            ? 'Payment setup error: the Square application ID and location ID may be from different environments or invalid. Please contact support.'
            : `Could not load the card form: ${msg || 'unknown error'}. Please refresh the page.`,
        )
      }
    }

    // Reuse an existing SDK <script> if one is already on the page instead of
    // appending a duplicate (which happens under React StrictMode double-mount).
    if (window.Square) {
      initCard()
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${sdkSrc}"]`)
      if (existing) {
        existing.addEventListener('load', initCard, { once: true })
        existing.addEventListener(
          'error',
          () => !cancelled && setError('Could not load the payment provider. Please refresh.'),
          { once: true },
        )
      } else {
        const script = document.createElement('script')
        script.src = sdkSrc
        script.async = true
        script.addEventListener('load', initCard, { once: true })
        script.addEventListener(
          'error',
          () => !cancelled && setError('Could not load the payment provider. Please refresh.'),
          { once: true },
        )
        document.body.appendChild(script)
      }
    }

    return () => {
      cancelled = true
      try { cardRef.current?.destroy() } catch { /* ignore */ }
      cardRef.current = null
    }
  }, [appId, locationId, sdkSrc])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.email.includes('@')) { setError('Enter a valid email address.'); return }
    if (!form.name.trim()) { setError('Enter your name.'); return }

    // Track billing frequency selection in analytics
    analytics.trackBillingFrequency(plan, frequency)

    // For free tier, no card required
    if (isFreeAccount) {
      setSubmitting(true)
      try {
        const result = await subscribeMdPlan(plan, {
          sourceId: '', // No card needed for free tier
          email: form.email,
          name: form.name,
          smsOptIn: form.smsOptIn,
          frequency,
        })

        if (result.ok) {
          const params = new URLSearchParams({
            plan,
            txn: result.transactionId,
            value: '0',
            currency: 'USD',
            email: form.email,
            frequency,
          })
          router.push(`/data/checkout/success?${params.toString()}`)
        } else {
          setError(result.error)
          setSubmitting(false)
        }
      } catch (err) {
        console.error('[md-checkout] free tier submit error:', err)
        setError('Something went wrong. Please try again.')
        setSubmitting(false)
      }
      return
    }

    // For paid tiers, require card
    if (!cardRef.current) { setError('Card form is still loading. Please wait a moment.'); return }

    setSubmitting(true)
    try {
      const tokenResult = await cardRef.current.tokenize()
      if (tokenResult.status !== 'OK') {
        setError('Check your card details and try again.')
        setSubmitting(false)
        return
      }

      const result = await subscribeMdPlan(plan, {
        sourceId: tokenResult.token,
        email: form.email,
        name: form.name,
        smsOptIn: form.smsOptIn,
        frequency,
      })

      if (result.ok) {
        // Pass the conversion params so the confirmation page can fire the
        // Google Ads purchase conversion (transaction_id de-duplicates it).
        const params = new URLSearchParams({
          plan,
          txn: result.transactionId,
          value: String(result.valueDollars),
          currency: result.currency,
          email: form.email,
          frequency,
        })
        router.push(`/data/checkout/success?${params.toString()}`)
      } else {
        setError(result.error)
        setSubmitting(false)
      }
    } catch (err) {
      console.error('[md-checkout] submit error:', err)
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const planLabel = MD_PLAN_LABELS[plan]

  const inputClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-50 placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none transition-colors text-sm'

  return (
    <main className="mx-auto max-w-5xl px-5 lg:px-8 py-12 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] items-start">

        {/* Left — form */}
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-400 mb-2">
            Subscription Checkout
          </p>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-50 mb-8">
            {planLabel}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Contact
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={inputClass}
                  aria-label="Email address"
                />
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  aria-label="Full name"
                />
              </div>
            </section>

            {/* Billing Frequency Toggle */}
            {!isFreeAccount && (
              <section>
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  Billing Frequency
                </h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFrequency('annual')}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                      frequency === 'annual'
                        ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    Annual
                    {savingsPercent > 0 && (
                      <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                        Save {savingsPercent}%
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('monthly')}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                      frequency === 'monthly'
                        ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </section>
            )}

            {/* SMS Opt-In */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.smsOptIn}
                  onChange={(e) => setForm((f) => ({ ...f, smsOptIn: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-zinc-600 accent-lime-400 cursor-pointer"
                  aria-label="Opt in to SMS communications"
                />
                <div className="flex-1 text-sm">
                  <p className="text-zinc-50 font-medium mb-1">
                    Opt in to SMS updates about your account, sessions, and coaching tips
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-2.5">
                    You&apos;ll receive up to 2 messages per month. Message and data rates may apply. Reply{' '}
                    <span className="font-mono text-zinc-300">HELP</span> for help or{' '}
                    <span className="font-mono text-zinc-300">STOP</span> to unsubscribe anytime.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <a
                      href="/legal/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lime-400 hover:text-lime-300 underline transition-colors"
                    >
                      Privacy Policy
                    </a>
                    <a
                      href="/legal/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lime-400 hover:text-lime-300 underline transition-colors"
                    >
                      Terms of Service
                    </a>
                  </div>
                </div>
              </label>
            </section>

            {!isFreeAccount && (
              <section>
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  Payment
                </h2>
                <div
                  ref={cardContainerRef}
                  id="md-card-container"
                  className="min-h-[56px] rounded-xl border border-zinc-700 bg-zinc-900 p-3"
                />
                {!cardReady && (
                  <p className="mt-2 text-xs font-mono uppercase tracking-widest text-zinc-600">
                    Loading secure card form...
                  </p>
                )}
              </section>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (!isFreeAccount && !cardReady)}
              className="w-full h-14 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wider text-lg hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin" />
                  {isFreeAccount ? 'Activating...' : 'Processing...'}
                </>
              ) : (
                <>
                  {isFreeAccount ? (
                    <>
                      <span className="h-4 w-4">✓</span>
                      Activate Free Account
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay {formatCents(amountCents)} / {frequency === 'annual' ? 'yr' : 'mo'}
                    </>
                  )}
                </>
              )}
            </button>

            {isFreeAccount ? (
              <p className="text-center text-xs text-zinc-600 leading-relaxed">
                Free account includes Rookie tier features. Upgrade anytime from your account settings.
              </p>
            ) : (
              <p className="text-center text-xs text-zinc-600 leading-relaxed">
                By completing your purchase, you agree to our{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lime-400 hover:text-lime-300 underline transition-colors"
                >
                  Terms of Service
                </a>{' '}
                and authorize Motorsport Data to charge your card{' '}
                <strong className="text-zinc-500">
                  {formatCents(amountCents)}/{frequency === 'annual' ? 'year' : 'month'}
                </strong>{' '}
                on a recurring basis until you cancel. Cancel anytime from your account settings.
              </p>
            )}
            <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured by Square. Your card data never touches our servers.
            </p>
          </form>
        </div>

        {/* Right — order summary */}
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 lg:sticky lg:top-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-5">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-zinc-50 font-bold text-sm">{planLabel}</p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {frequency === 'annual' ? 'Annual subscription · auto-renews yearly' : 'Monthly subscription · auto-renews in 30 days'}
                </p>
              </div>
              <span className="text-zinc-50 font-bold text-sm whitespace-nowrap">
                {formatCents(amountCents)}
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Total due today</span>
            <span className="text-lime-400 text-2xl font-black">{formatCents(amountCents)}</span>
          </div>

          <div className="mt-6 space-y-2.5">
            {[
              'Instant platform activation',
              'Cancel anytime from account settings',
              'Secured by Square Payments',
            ].map((line) => (
              <div key={line} className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shrink-0" />
                {line}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
