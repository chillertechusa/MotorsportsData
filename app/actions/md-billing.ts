'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getSessionTeamId } from '@/lib/md-auth'
import { isSquareConfigured, getSquareClient, squareLocationId } from '@/lib/square'
import { getPlanVariationId } from '@/lib/square-catalog'
import { getPricingCents, MD_PLAN_LABELS, type MdPlanId, isMdPlanId } from '@/lib/md-plans'
import { sendMdReceiptEmail } from '@/lib/md-email'
import { markCheckoutConverted } from '@/app/actions/md-abandoned-checkout'
import { trackCheckout, trackSignup } from '@/lib/analytics'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { allocateFoundingSlot } from '@/app/actions/founding-rigs'

/**
 * Idempotent — if the signed-in user already belongs to a team, returns that
 * teamId. If not (brand-new user coming straight from pricing), creates a team
 * named after the user and adds them as owner. Called at the top of
 * subscribeMdPlan so new users never hit a 403 on first checkout.
 */
async function ensureMdTeam(userId: string, userName: string): Promise<string | null> {
  // Check for existing membership first.
  const [existing] = await db
    .select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers)
    .where(eq(mdTeamMembers.userId, userId))
    .limit(1)
  if (existing?.teamId) return existing.teamId

  // No team yet — create one.
  const teamName = userName.trim() || 'My Team'
  const [team] = await db
    .insert(mdTeams)
    .values({ name: teamName })
    .returning({ id: mdTeams.id })
  if (!team?.id) return null

  await db.insert(mdTeamMembers).values({
    teamId: team.id,
    userId,
    role: 'owner',
  })

  return team.id
}

export type SubscribeMdPlanResult =
  | { ok: true; transactionId: string; valueDollars: number; currency: string }
  | { ok: false; error: string }

export async function subscribeMdPlan(
  plan: MdPlanId,
  payload: {
    sourceId: string
    verificationToken?: string
    email: string
    name: string
    smsOptIn?: boolean
    frequency?: 'annual' | 'monthly'
  },
): Promise<SubscribeMdPlanResult> {
  // 1. Auth — resolve session directly so we can also call ensureMdTeam for
  //    brand-new users who have no team membership yet.
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { ok: false, error: 'You must be signed in to subscribe.' }
  }
  const userId = session.user.id

  // 2. Ensure a team exists (no-op for existing users, creates one for new).
  const rawTeamId = await ensureMdTeam(userId, session.user.name ?? payload.name)
  if (!rawTeamId) {
    return { ok: false, error: 'Could not create your team. Please try again.' }
  }

  // Verify membership via the standard helper so role/permissions are consistent.
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return { ok: false, error: 'You must be signed in to subscribe.' }
  }
  const { teamId } = authResult

  // 2. Validate plan
  if (!isMdPlanId(plan)) {
    return { ok: false, error: 'Invalid plan.' }
  }

  // 3. Square configured?
  if (!isSquareConfigured()) {
    return { ok: false, error: 'Payments are not yet configured for this environment.' }
  }

  const frequency = payload.frequency ?? 'annual'
  const amountCents = getPricingCents(plan, frequency)
  const planLabel = MD_PLAN_LABELS[plan]

  try {
    const client = getSquareClient()

    // Load the team so we can reuse an existing Square customer on upgrades.
    const [teamRow] = await db.select().from(mdTeams).where(eq(mdTeams.id, teamId)).limit(1)

    // 4. Resolve (or create) the Square customer for this team.
    let customerId = teamRow?.squareCustomerId ?? null
    if (!customerId) {
      const custRes: any = await client.customers.create({
        idempotencyKey: `cust:${teamId}:${Date.now()}`,
        emailAddress: payload.email,
        givenName: (session.user.name ?? payload.name ?? '').trim() || undefined,
        referenceId: teamId,
      })
      customerId = custRes.customer?.id ?? custRes.result?.customer?.id ?? null
      if (!customerId) {
        return { ok: false, error: 'Could not create your billing profile. Please try again.' }
      }
    }

    // 5. Save the card on file from the Web Payments SDK nonce. This vaulted
    //    card is what Square auto-charges each billing period.
    const cardRes: any = await client.cards.create({
      idempotencyKey: `card:${teamId}:${Date.now()}`,
      sourceId: payload.sourceId,
      ...(payload.verificationToken && { verificationToken: payload.verificationToken }),
      card: {
        customerId,
        cardholderName: (session.user.name ?? payload.name ?? '').trim() || undefined,
        referenceId: teamId,
      },
    })
    const cardId: string | null = cardRes.card?.id ?? cardRes.result?.card?.id ?? null
    if (!cardId) {
      return { ok: false, error: 'We could not save your card. Please try a different card.' }
    }

    // 6. Look up the Square catalog plan-variation for this tier + frequency
    //    (bootstraps the catalog on first ever checkout).
    const variation = await getPlanVariationId(plan, frequency)
    if (!variation) {
      return { ok: false, error: 'This plan is not available for subscription yet. Please contact support.' }
    }

    // 7. Create the recurring subscription. Square generates the first invoice
    //    immediately and charges the card on file; renewals happen automatically.
    const subRes: any = await client.subscriptions.create({
      idempotencyKey: `sub:${teamId}:${plan}:${Date.now()}`,
      locationId: squareLocationId(),
      planVariationId: variation.variationId,
      customerId,
      cardId,
    })
    const subscription = subRes.subscription ?? subRes.result?.subscription
    const subscriptionId: string | null = subscription?.id ?? null
    if (!subscriptionId) {
      return { ok: false, error: 'Subscription could not be created. Please try again.' }
    }

    // 8. Flip tier + activate subscription in DB. Status is set optimistically
    //    to active; the invoice/subscription webhooks reconcile the true state.
    const now = new Date()
    const periodEnd = new Date(now)
    if (frequency === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setDate(periodEnd.getDate() + 30)
    }

    await db
      .update(mdTeams)
      .set({
        subscriptionTier: plan,
        subscriptionStatus: 'active',
        paymentStatus: 'active',
        paymentFailureCount: 0,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        squareCustomerId: customerId,
        squareCardId: cardId,
        squareSubscriptionId: subscriptionId,
        squarePlanVariationId: variation.variationId,
        billingFrequency: frequency,
        cancelAtPeriodEnd: false,
        subscriptionCanceledAt: null,
      })
      .where(eq(mdTeams.id, teamId))

    const payment = { id: subscriptionId }

    // Store SMS opt-in preference if user provided consent (non-blocking)
    // This allows Twilio to check user preferences before sending SMS
    if (payload.smsOptIn) {
      // SMS opt-in is stored via Better Auth metadata or user preferences
      // Can be accessed later via getUserSession() -> user.metadata.smsOptIn
      // For now, we log it for audit purposes
      console.log(`[md-billing] SMS opt-in enabled for user ${userId}`)
    }

    // Allocate a founding rig slot for Race Team / Factory Rig plans (non-blocking)
    void allocateFoundingSlot(teamId, plan, amountCents, frequency)

    // Mark any pending abandoned-checkout rows as converted (non-blocking)
    void markCheckoutConverted(userId)

    // Track checkout event for analytics
    void trackCheckout(userId, teamId, plan, frequency, amountCents)

    // Branded receipt — safe no-op until Resend keys are set, never throws, and
    // is awaited so it completes before the serverless function is frozen.
    await sendMdReceiptEmail({
      to: payload.email,
      riderOrTeamName: session.user.name ?? payload.name,
      planLabel,
      amountCents,
      periodStart: now,
      periodEnd,
      transactionId: String(payment.id ?? ''),
    })

    // Return the Square payment (transaction) id + normalized amount for the
    // Google Ads conversion. transaction_id lets Google de-duplicate conversions.
    return {
      ok: true,
      transactionId: String(payment.id ?? ''),
      valueDollars: Number(amountCents) / 100,
      currency: 'USD',
    }
  } catch (err) {
    console.error('[md-billing] subscribeMdPlan error:', err instanceof Error ? err.message : err)
    // Surface Square's decline message if available, otherwise generic
    const msg =
      err instanceof Error && err.message.toLowerCase().includes('card')
        ? err.message
        : 'Payment failed. Please check your card details and try again.'
    return { ok: false, error: msg }
  }
}
