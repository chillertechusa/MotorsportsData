import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { isSquareConfigured, verifySquareLocation } from '@/lib/square'
import { isMdPlanId, MD_PLAN_LABELS, type MdPlanId } from '@/lib/md-plans'
import MdCheckoutClient from '@/components/data/md-checkout-client'
import MdLogo from '@/components/md-logo'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { recordCheckoutIntent } from '@/app/actions/md-abandoned-checkout'

export const metadata = { title: 'Checkout — Motorsport Data' }

function PaymentsNotConfigured({ plan }: { plan: MdPlanId }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
          {MD_PLAN_LABELS[plan]}
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-50 mb-3">
          Payments Not Yet Configured
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Square API credentials have not been added to this environment yet. Add{' '}
          <code className="text-lime-400 font-mono text-xs">SQUARE_ACCESS_TOKEN</code>,{' '}
          <code className="text-lime-400 font-mono text-xs">SQUARE_LOCATION_ID</code>, and{' '}
          <code className="text-lime-400 font-mono text-xs">NEXT_PUBLIC_SQUARE_APPLICATION_ID</code>{' '}
          to Vercel environment variables to enable card checkout.
        </p>
        <Link
          href="/data/pricing"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Link>
      </div>
    </div>
  )
}

function PaymentsMisconfigured({ plan, reason }: { plan: MdPlanId; reason: string }) {
  const detail =
    reason === 'environment_mismatch'
      ? 'The Square location ID belongs to a different environment than the API credentials (for example a sandbox location paired with production keys). Update SQUARE_LOCATION_ID and NEXT_PUBLIC_SQUARE_APPLICATION_ID so all Square values come from the same environment.'
      : reason === 'location_not_found'
        ? 'The configured Square location could not be found for these credentials. Verify SQUARE_LOCATION_ID matches your Square account.'
        : 'Square payment credentials are incomplete. Verify all Square environment variables are set.'
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
          {MD_PLAN_LABELS[plan]}
        </p>
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-50 mb-3">
          Payment Setup Needs Attention
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">{detail}</p>
        <Link
          href="/data/pricing"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Link>
      </div>
    </div>
  )
}

export default async function MdCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; frequency?: string }>
}) {
  const { plan: planParam, frequency: frequencyParam } = await searchParams

  if (!planParam || !isMdPlanId(planParam)) notFound()
  const plan = planParam as MdPlanId
  const frequency = (frequencyParam === 'monthly' ? 'monthly' : 'annual') as 'annual' | 'monthly'

  // Rookie is free — no checkout needed, send straight to sign-up
  if (plan === 'rookie') redirect('/data/sign-in?mode=sign-up&redirect=/data')

  const squareReady = isSquareConfigured()
  if (!squareReady) return <PaymentsNotConfigured plan={plan} />

  // Verify the location id matches the credential environment before rendering
  // the card form — prevents the vague client-side "Could not load the card
  // form" error and stops a customer from wasting a real card attempt.
  const locationCheck = await verifySquareLocation()
  if (!locationCheck.ok) return <PaymentsMisconfigured plan={plan} reason={locationCheck.reason} />

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect(`/data/sign-in?redirect=${encodeURIComponent(`/data/checkout?plan=${plan}&frequency=${frequency}`)}`)
  }

  // Record checkout intent for abandoned-checkout recovery (non-blocking)
  void recordCheckoutIntent(plan)

  const prefill = {
    email: session?.user?.email ?? '',
    name: session?.user?.name ?? '',
  }

  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? ''
  const locationId = process.env.SQUARE_LOCATION_ID ?? ''

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <header className="flex items-center gap-4 h-16 px-5 lg:px-8 border-b border-zinc-800">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <span className="text-zinc-700 font-mono text-xs">/</span>
        <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-mono">Checkout</span>
        <div className="ml-auto">
          <Link
            href="/data/pricing"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Pricing
          </Link>
        </div>
      </header>

      <MdCheckoutClient
        plan={plan}
        appId={appId}
        locationId={locationId}
        prefill={prefill}
      />
    </div>
  )
}
