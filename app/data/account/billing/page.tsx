import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import MdLogo from '@/components/md-logo'
import MdBillingManager from '@/components/data/md-billing-manager'
import { getMySubscription } from '@/app/actions/md-subscription'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Billing & Subscription — Motorsport Data',
  robots: { index: false, follow: false },
}

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/data/sign-in')

  const subscription = await getMySubscription()

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="flex h-16 items-center gap-4 border-b border-zinc-800 px-5 lg:px-8">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <span className="font-mono text-xs text-zinc-700">/</span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Billing &amp; Subscription
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-10">
        {subscription ? (
          <MdBillingManager subscription={subscription} />
        ) : (
          <div className="mx-auto mt-10 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <h1 className="text-xl font-bold text-zinc-100">No subscription found</h1>
            <p className="mt-2 text-sm text-zinc-400">
              You&apos;re not the owner of a team with a subscription, or your account isn&apos;t set up
              for billing yet.
            </p>
            <Link
              href="/data/pricing"
              className="mt-6 inline-block rounded-lg bg-lime-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-lime-300"
            >
              View plans
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
