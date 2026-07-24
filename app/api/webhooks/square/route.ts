import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTeams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifySquareWebhookSignature, squareWebhookUrl } from '@/lib/square'

/**
 * Square webhook handler.
 *
 * Security: every request is verified against SQUARE_WEBHOOK_SIGNATURE_KEY
 * before any DB work. Unverified requests are rejected with 401.
 *
 * Handled events:
 *   payment.updated                  one-time / initial charge status
 *   subscription.created             recurring plan started
 *   subscription.updated             status change (active/canceled/paused)
 *   invoice.payment_made             a renewal succeeded → extend period
 *   invoice.scheduled_charge_failed  a renewal failed → dunning
 *   invoice.canceled                 invoice voided
 */
export async function POST(request: NextRequest) {
  // Read the RAW body first — signature is computed over the exact bytes.
  const rawBody = await request.text()
  const signature = request.headers.get('x-square-hmacsha256-signature')

  // In production the signature key MUST be set — hard-fail if missing.
  if (!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Square webhook] SQUARE_WEBHOOK_SIGNATURE_KEY is not set in production — rejecting all webhook calls')
      return NextResponse.json({ error: 'webhook verification misconfigured' }, { status: 500 })
    }
    console.warn('[Square webhook] SQUARE_WEBHOOK_SIGNATURE_KEY not set — skipping verification (non-production only)')
  } else {
    const valid = verifySquareWebhookSignature(rawBody, signature, squareWebhookUrl())
    if (!valid) {
      console.warn('[Square webhook] Signature verification FAILED — rejecting request')
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const eventType: string = body?.type ?? ''
  const data = body?.data?.object

  console.log(`[square] webhook verified: ${eventType}`)

  try {
    switch (eventType) {
      case 'payment.updated':
        return await handlePaymentUpdated(data)
      case 'subscription.created':
      case 'subscription.updated':
        return await handleSubscriptionEvent(data)
      case 'invoice.payment_made':
        return await handleInvoicePaymentMade(data)
      case 'invoice.scheduled_charge_failed':
        return await handleInvoiceFailed(data)
      case 'invoice.canceled':
        return await handleInvoiceCanceled(data)
      default:
        console.log(`[v0] Ignoring Square event: ${eventType}`)
        return NextResponse.json({ received: true, status: 'ignored' })
    }
  } catch (err) {
    console.error('[v0] Square webhook processing error:', err)
    // Return 200 so Square doesn't retry forever on our internal bug.
    return NextResponse.json({ received: true, error: 'processing_error' }, { status: 200 })
  }
}

/** Look up a team by subscription id first, then fall back to customer id. */
async function findTeam(opts: { subscriptionId?: string; customerId?: string }) {
  if (opts.subscriptionId) {
    const [t] = await db
      .select()
      .from(mdTeams)
      .where(eq(mdTeams.squareSubscriptionId, opts.subscriptionId))
      .limit(1)
    if (t) return t
  }
  if (opts.customerId) {
    const [t] = await db
      .select()
      .from(mdTeams)
      .where(eq(mdTeams.squareCustomerId, opts.customerId))
      .limit(1)
    if (t) return t
  }
  return null
}

async function handlePaymentUpdated(data: any) {
  const status = data?.status
  const customerId = data?.customer_id
  const team = await findTeam({ customerId })
  if (!team) {
    console.warn(`[v0] payment.updated: no team for customer ${customerId}`)
    return NextResponse.json({ received: true, status: 'no_team_found' })
  }

  if (status === 'COMPLETED') {
    await db
      .update(mdTeams)
      .set({ paymentStatus: 'active', paymentFailureCount: 0, lastPaymentAttempt: new Date() })
      .where(eq(mdTeams.id, team.id))
    return NextResponse.json({ received: true, status: 'payment_active', teamId: team.id })
  }
  if (status === 'FAILED') {
    await db
      .update(mdTeams)
      .set({
        paymentStatus: 'failed',
        paymentFailureCount: (team.paymentFailureCount ?? 0) + 1,
        lastPaymentAttempt: new Date(),
      })
      .where(eq(mdTeams.id, team.id))
    return NextResponse.json({ received: true, status: 'payment_failed', teamId: team.id })
  }
  return NextResponse.json({ received: true, status: 'payment_noop' })
}

async function handleSubscriptionEvent(data: any) {
  const subscriptionId = data?.id
  const customerId = data?.customer_id
  const sqStatus: string = data?.status ?? '' // ACTIVE | CANCELED | DEACTIVATED | PAUSED
  const canceledDate = data?.canceled_date

  const team = await findTeam({ subscriptionId, customerId })
  if (!team) {
    console.warn(`[v0] subscription event: no team for sub ${subscriptionId} / cust ${customerId}`)
    return NextResponse.json({ received: true, status: 'no_team_found' })
  }

  // Map Square subscription status to our internal status.
  const active = sqStatus === 'ACTIVE'
  const canceled = sqStatus === 'CANCELED' || sqStatus === 'DEACTIVATED'

  await db
    .update(mdTeams)
    .set({
      squareSubscriptionId: subscriptionId ?? team.squareSubscriptionId,
      subscriptionStatus: active ? 'active' : canceled ? 'canceled' : 'paused',
      paymentStatus: active ? 'active' : team.paymentStatus,
      cancelAtPeriodEnd: sqStatus === 'CANCELED' ? true : team.cancelAtPeriodEnd,
      subscriptionCanceledAt: canceledDate ? new Date(canceledDate) : team.subscriptionCanceledAt,
    })
    .where(eq(mdTeams.id, team.id))

  console.log(`[v0] Subscription ${subscriptionId} → ${sqStatus} for team ${team.id}`)
  return NextResponse.json({ received: true, status: 'subscription_synced', teamId: team.id })
}

async function handleInvoicePaymentMade(data: any) {
  const subscriptionId = data?.subscription_id
  const team = await findTeam({ subscriptionId })
  if (!team) {
    console.warn(`[v0] invoice.payment_made: no team for sub ${subscriptionId}`)
    return NextResponse.json({ received: true, status: 'no_team_found' })
  }

  // A renewal succeeded — clear dunning and extend the period one cycle.
  const cycleDays = (team.billingFrequency ?? 'annual') === 'monthly' ? 30 : 365
  const periodEnd = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000)

  await db
    .update(mdTeams)
    .set({
      paymentStatus: 'active',
      subscriptionStatus: 'active',
      paymentFailureCount: 0,
      lastPaymentAttempt: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    })
    .where(eq(mdTeams.id, team.id))

  console.log(`[v0] Renewal paid for team ${team.id}, period extended to ${periodEnd.toISOString()}`)
  return NextResponse.json({ received: true, status: 'renewal_paid', teamId: team.id })
}

async function handleInvoiceFailed(data: any) {
  const subscriptionId = data?.subscription_id
  const team = await findTeam({ subscriptionId })
  if (!team) {
    return NextResponse.json({ received: true, status: 'no_team_found' })
  }

  await db
    .update(mdTeams)
    .set({
      paymentStatus: 'failed',
      paymentFailureCount: (team.paymentFailureCount ?? 0) + 1,
      lastPaymentAttempt: new Date(),
    })
    .where(eq(mdTeams.id, team.id))

  console.log(`[v0] Renewal FAILED for team ${team.id} (attempt ${(team.paymentFailureCount ?? 0) + 1})`)
  return NextResponse.json({ received: true, status: 'renewal_failed', teamId: team.id })
}

async function handleInvoiceCanceled(data: any) {
  const subscriptionId = data?.subscription_id
  const team = await findTeam({ subscriptionId })
  if (!team) {
    return NextResponse.json({ received: true, status: 'no_team_found' })
  }
  await db
    .update(mdTeams)
    .set({ subscriptionStatus: 'canceled', subscriptionCanceledAt: new Date() })
    .where(eq(mdTeams.id, team.id))
  return NextResponse.json({ received: true, status: 'invoice_canceled', teamId: team.id })
}
