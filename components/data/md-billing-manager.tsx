'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { type SubscriptionStatus } from '@/app/actions/md-subscription'
import { cancelMySubscription, resumeMySubscription } from '@/app/actions/md-billing-actions'

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function MdBillingManager({ subscription }: { subscription: SubscriptionStatus }) {
  const [sub, setSub] = useState(subscription)
  const [isPending, startTransition] = useTransition()
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const isFree = sub.priceCents === 0

  function handleCancel() {
    setMsg(null)
    startTransition(async () => {
      const res = await cancelMySubscription()
      if (res.ok) {
        setSub({ ...sub, cancelAtPeriodEnd: true })
        setMsg({ kind: 'ok', text: res.message })
      } else {
        setMsg({ kind: 'error', text: res.error })
      }
      setConfirmingCancel(false)
    })
  }

  function handleResume() {
    setMsg(null)
    startTransition(async () => {
      const res = await resumeMySubscription()
      if (res.ok) {
        setSub({ ...sub, cancelAtPeriodEnd: false, canceledAt: null })
        setMsg({ kind: 'ok', text: res.message })
      } else {
        setMsg({ kind: 'error', text: res.error })
      }
    })
  }

  const statusColor =
    sub.paymentStatus === 'failed'
      ? 'text-red-400'
      : sub.cancelAtPeriodEnd
        ? 'text-amber-400'
        : sub.isActive
          ? 'text-lime-400'
          : 'text-zinc-400'

  const statusLabel =
    sub.paymentStatus === 'failed'
      ? 'Payment failed'
      : sub.cancelAtPeriodEnd
        ? 'Cancels at period end'
        : sub.isActive
          ? 'Active'
          : sub.status

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Plan summary */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Current plan</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-100">{sub.tierLabel}</h2>
          </div>
          <span className={`shrink-0 font-mono text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-zinc-500">Price</dt>
            <dd className="mt-0.5 font-semibold text-zinc-200">
              {isFree ? 'Free' : `${formatMoney(sub.priceCents)} / ${sub.frequency === 'annual' ? 'year' : 'month'}`}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Billing cycle</dt>
            <dd className="mt-0.5 font-semibold text-zinc-200 capitalize">{sub.frequency}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">{sub.cancelAtPeriodEnd ? 'Access until' : 'Renews on'}</dt>
            <dd className="mt-0.5 font-semibold text-zinc-200">{formatDate(sub.periodEnd)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Days remaining</dt>
            <dd className="mt-0.5 font-semibold text-zinc-200">{sub.daysRemaining ?? '—'}</dd>
          </div>
        </dl>
      </section>

      {/* Inline status message */}
      {msg && (
        <div
          role="status"
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            msg.kind === 'ok'
              ? 'border-lime-500/30 bg-lime-500/10 text-lime-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Payment-failed dunning banner */}
      {sub.paymentStatus === 'failed' && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <p className="font-semibold">We couldn&apos;t process your last payment.</p>
          <p className="mt-1 text-red-300/80">
            Update your card below to keep your subscription active and avoid losing access.
          </p>
        </div>
      )}

      {/* Cancel-scheduled banner + resume */}
      {sub.cancelAtPeriodEnd && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Your subscription is set to cancel on <strong>{formatDate(sub.periodEnd)}</strong>.
          </span>
          <Button
            onClick={handleResume}
            disabled={isPending}
            className="bg-amber-400 text-zinc-950 hover:bg-amber-300"
          >
            {isPending ? 'Working…' : 'Resume subscription'}
          </Button>
        </div>
      )}

      {/* Actions */}
      {!isFree && (
        <section className="mt-6 space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Manage</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/data/pricing"
              className={buttonVariants({
                variant: 'outline',
                className: 'flex-1 border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800',
              })}
            >
              Change plan
            </Link>

            <Link
              href={`/checkout/tier?tier=${sub.tier}`}
              className={buttonVariants({
                variant: 'outline',
                className: 'flex-1 border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800',
              })}
            >
              {sub.cardOnFile ? 'Update card' : 'Add a card'}
            </Link>
          </div>

          {/* Cancel with inline confirm */}
          {!sub.cancelAtPeriodEnd && sub.hasSubscription && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
              {!confirmingCancel ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-zinc-400">
                    Cancel your subscription. You keep access until {formatDate(sub.periodEnd)}.
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmingCancel(true)}
                    className="shrink-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Cancel plan
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-zinc-200">
                    Are you sure? Your plan will not renew and access ends {formatDate(sub.periodEnd)}.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCancel}
                      disabled={isPending}
                      className="bg-red-500 text-white hover:bg-red-400"
                    >
                      {isPending ? 'Canceling…' : 'Yes, cancel'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmingCancel(false)}
                      disabled={isPending}
                      className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800"
                    >
                      Keep my plan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Free tier upsell */}
      {isFree && (
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
          <p className="text-sm text-zinc-400">
            You&apos;re on the free tier. Upgrade to unlock the full platform.
          </p>
          <Link
            href="/data/pricing"
            className={buttonVariants({ className: 'mt-4 bg-lime-400 text-zinc-950 hover:bg-lime-300' })}
          >
            View plans
          </Link>
        </section>
      )}
    </div>
  )
}
