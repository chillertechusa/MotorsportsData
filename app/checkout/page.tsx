import MdNav from '@/components/md-nav'
import CheckoutClient from '@/components/store/checkout-client'
import { isSquareConfigured } from '@/lib/square'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const metadata: Metadata = {
  title: 'Checkout — Moto D',
  description: 'Complete your Moto D order.',
}

export default async function CheckoutPage() {
  const squareReady = isSquareConfigured()
  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? ''
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? ''

  // Prefill from the signed-in user's saved profile when available.
  const session = await auth.api.getSession({ headers: await headers() })
  let prefill: {
    email?: string
    name?: string
    phone?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
  } = {}
  if (session?.user) {
    prefill.email = session.user.email
    prefill.name = session.user.name
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1)
    if (profile) {
      prefill = {
        ...prefill,
        phone: profile.phone ?? undefined,
        address1: profile.shipAddress1 ?? undefined,
        address2: profile.shipAddress2 ?? undefined,
        city: profile.shipCity ?? undefined,
        state: profile.shipState ?? undefined,
        zip: profile.shipZip ?? undefined,
      }
    }
  }

  return (
    <>
      <MdNav />
      <main className="pt-16 min-h-screen bg-background">
        <CheckoutClient
          squareReady={squareReady}
          appId={appId}
          locationId={locationId}
          prefill={prefill}
        />
      </main>
    </>
  )
}
