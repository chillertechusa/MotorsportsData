import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import MdConversionTracker from '@/components/data/md-conversion-tracker'
import { isMdPlanId, MD_PLAN_LABELS } from '@/lib/md-plans'

export const metadata = { title: 'Subscription Active — Motorsport Data' }

export default async function MdCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string
    txn?: string
    value?: string
    currency?: string
    email?: string
  }>
}) {
  const { plan: planParam, txn, value, currency, email } = await searchParams
  const isPlan = planParam && isMdPlanId(planParam)
  const planLabel = isPlan ? MD_PLAN_LABELS[planParam] : 'Your Plan'
  const valueDollars = value ? Number(value) : 0
  const currencyCode = currency ?? 'USD'
  // All signups are new customers (first-time users on this plan)
  const isNewCustomer = true

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {txn && valueDollars >= 0 && (
        <MdConversionTracker
          transactionId={txn}
          valueDollars={valueDollars}
          currency={currencyCode}
          planId={isPlan ? planParam : undefined}
          isNewCustomer={isNewCustomer}
        />
      )}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-lime-400/10 border border-lime-400/20">
            <CheckCircle className="h-10 w-10 text-lime-400" />
          </div>

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-400 mb-3">
            Subscription Active
          </p>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-50 mb-4 text-balance">
            Welcome to {planLabel}
          </h1>
          <p className="text-zinc-400 leading-relaxed mb-8 text-pretty">
            Your team is now active. Head into the platform to start logging sessions, tracking
            parts, and running your rig smarter.
          </p>

          {/*
            Order confirmation details — rendered as identifiable DOM elements so
            Google Ads' automatic page-scan tool ("Add order information") can map
            each value. Each field carries a stable id + data-order-* attribute.
          */}
          <div
            id="order-confirmation"
            className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-left"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-4">
              Order Confirmation
            </p>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Transaction ID</dt>
                <dd
                  id="order-transaction-id"
                  data-order-transaction-id={txn ?? ''}
                  className="font-mono text-zinc-200 truncate max-w-[220px]"
                >
                  {txn ?? '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Order Value</dt>
                <dd
                  id="order-value"
                  data-order-value={valueDollars}
                  className="font-mono text-zinc-200"
                >
                  {valueDollars.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Currency</dt>
                <dd
                  id="order-currency"
                  data-order-currency={currencyCode}
                  className="font-mono text-zinc-200"
                >
                  {currencyCode}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">Email</dt>
                <dd
                  id="order-email"
                  data-order-email={email ?? ''}
                  className="font-mono text-zinc-200 truncate max-w-[220px]"
                >
                  {email ?? '—'}
                </dd>
              </div>
            </dl>
          </div>

          <Link
            href="/data"
            className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-8 py-4 text-sm font-black uppercase tracking-wider text-zinc-950 hover:bg-lime-300 transition-colors"
          >
            Go to Platform
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-6 text-xs text-zinc-600">
            A receipt will be sent to your email. Your subscription renews in 30 days.
          </p>
        </div>
      </main>
    </div>
  )
}
