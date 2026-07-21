/**
 * POST /api/terra/webhook
 * Receives real-time events from Terra — user auth completions and live HR data.
 *
 * Terra sends two types of events we care about:
 *   1. auth — rider completed OAuth, sets terra_user_id + provider on our row
 *   2. realtime  — live heart rate data payload during an active session
 *
 * Webhook secret verification: Terra sends x-terra-signature header (HMAC-SHA256).
 * Set TERRA_WEBHOOK_SECRET in environment to enable. If unset, we skip verification
 * (dev-only — always set it in production).
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTerraConnections } from '@/lib/db/schema'
import { verifyTerraSignature } from '@/lib/terra/client'
import { eq } from 'drizzle-orm'

// Terra webhook event types we handle
type TerraAuthEvent = {
  type: 'auth'
  user: { user_id: string; provider: string; reference_id: string }
}

type TerraRealtimeEvent = {
  type: 'realtime'
  user: { user_id: string }
  data: Array<{
    heart_rate?: Array<{ bpm: number; timestamp: string }>
  }>
}

type TerraDeauthEvent = {
  type: 'user_reauth' | 'deauth'
  user: { user_id: string }
}

type TerraEvent = TerraAuthEvent | TerraRealtimeEvent | TerraDeauthEvent

const MAX_HISTORY = 60 // keep 60 data points (~60 seconds at 1Hz)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-terra-signature')

  // Verify signature when secret is configured
  if (process.env.TERRA_WEBHOOK_SECRET) {
    const valid = await verifyTerraSignature(rawBody, signature)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: TerraEvent
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    if (event.type === 'auth') {
      // Rider completed OAuth — link their Terra user_id to our row
      await handleAuth(event as TerraAuthEvent)
    } else if (event.type === 'realtime') {
      // Live HR data coming in during an active session
      await handleRealtime(event as TerraRealtimeEvent)
    } else if (event.type === 'deauth' || event.type === 'user_reauth') {
      // Rider disconnected — clear terra_user_id
      await handleDeauth(event as TerraDeauthEvent)
    }
  } catch (err) {
    console.error('[terra/webhook] processing error', err)
    // Still return 200 — Terra will retry on non-2xx
  }

  // Terra expects a 200 OK
  return NextResponse.json({ received: true })
}

async function handleAuth(event: TerraAuthEvent) {
  const { user_id, provider, reference_id } = event.user
  if (!reference_id) return

  // reference_id format: "{teamId}:{userId}"
  const rows = await db
    .select()
    .from(mdTerraConnections)
    .where(eq(mdTerraConnections.referenceId, reference_id))
    .limit(1)

  if (rows.length === 0) {
    console.warn('[terra/webhook] no connection row for reference_id', reference_id)
    return
  }

  await db
    .update(mdTerraConnections)
    .set({
      terraUserId: user_id,
      provider: provider.toUpperCase(),
      connectedAt: new Date(),
    })
    .where(eq(mdTerraConnections.id, rows[0].id))
}

async function handleRealtime(event: TerraRealtimeEvent) {
  const terraUserId = event.user.user_id
  if (!terraUserId) return

  // Extract latest HR reading from the payload
  let latestHr: number | null = null
  let latestTs: number = Date.now()

  for (const d of event.data ?? []) {
    if (d.heart_rate && d.heart_rate.length > 0) {
      const last = d.heart_rate[d.heart_rate.length - 1]
      latestHr = last.bpm
      latestTs = new Date(last.timestamp).getTime()
    }
  }

  if (latestHr === null) return

  // Fetch current connection row to update history
  const rows = await db
    .select()
    .from(mdTerraConnections)
    .where(eq(mdTerraConnections.terraUserId, terraUserId))
    .limit(1)

  if (rows.length === 0) return

  const current = rows[0]
  const history: { ts: number; hr: number }[] = Array.isArray(current.hrHistory)
    ? (current.hrHistory as { ts: number; hr: number }[])
    : []

  // Append new point, keep rolling window of MAX_HISTORY points
  const updated = [...history, { ts: latestTs, hr: latestHr }].slice(-MAX_HISTORY)

  await db
    .update(mdTerraConnections)
    .set({
      latestHr,
      latestHrAt: new Date(latestTs),
      hrHistory: updated,
    })
    .where(eq(mdTerraConnections.id, current.id))
}

async function handleDeauth(event: TerraDeauthEvent) {
  const terraUserId = event.user.user_id
  if (!terraUserId) return

  await db
    .update(mdTerraConnections)
    .set({
      terraUserId: null,
      provider: null,
      connectedAt: null,
      latestHr: null,
      latestHrAt: null,
      hrHistory: [],
    })
    .where(eq(mdTerraConnections.terraUserId, terraUserId))
}
