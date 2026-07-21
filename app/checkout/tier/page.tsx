import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { isSquareConfigured } from '@/lib/square'
import { isMdPlanId } from '@/lib/md-plans'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import MdNav from '@/components/md-nav'
import TierCheckoutClient from '@/components/store/tier-checkout-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upgrade — Motorsport Data',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ tier?: string }>
}

export default async function TierCheckoutPage({ searchParams }: Props) {
  const { tier } = await searchParams

  // Must be signed in — carry tier through sign-in if not
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    const redirectParam = tier ? encodeURIComponent(`/checkout/tier?tier=${tier}`) : ''
    redirect(`/data/sign-in?mode=sign-up${redirectParam ? `&redirect=${redirectParam}` : ''}`)
  }

  // Validate tier — send to pricing if unknown
  if (!tier || !isMdPlanId(tier)) {
    redirect('/data/pricing')
  }

  // Free Rider doesn't need checkout — go straight to platform
  if (tier === 'rookie' || tier === 'fan') {
    redirect('/data')
  }

  const squareReady = isSquareConfigured()
  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? ''
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? ''

  // Prefill from session + profile
  let prefill: { email?: string; name?: string } = {
    email: session.user.email,
    name: session.user.name ?? undefined,
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (profile?.phone) {
    // Profile exists — email and name already set above
  }

  return (
    <>
      <MdNav />
      <main className="pt-16 min-h-screen bg-background">
        <TierCheckoutClient
          tier={tier}
          squareReady={squareReady}
          appId={appId}
          locationId={locationId}
          prefill={prefill}
        />
      </main>
    </>
  )
}
