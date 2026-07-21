import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTerraConnections } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

/**
 * Terra widget callback — user authenticated with their device provider
 * Terra sends a POST with reference_id (we generated), terra_user_id, and provider
 */
export async function POST(req: Request) {
  try {
    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get('x-terra-signature')
    const webhookSecret = process.env.TERRA_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      const body = await req.text()
      const hash = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (hash !== signature) {
        return NextResponse.json({ error: 'Signature mismatch' }, { status: 401 })
      }

      // Re-parse body after using it for signature
      const data = JSON.parse(body)
      await handleConnection(data)
    } else {
      const data = await req.json()
      await handleConnection(data)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[terra-callback] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleConnection(data: any) {
  const { reference_id, terra_user_id, provider } = data

  if (!reference_id || !terra_user_id) {
    console.warn('[terra-callback] missing required fields:', data)
    return
  }

  // Parse reference_id: "teamId-userId-timestamp"
  const [teamId, userId] = reference_id.split('-').slice(0, 2)

  if (!teamId || !userId) {
    console.warn('[terra-callback] invalid reference_id format:', reference_id)
    return
  }

  try {
    // Check if connection already exists (user reconnecting)
    const existing = await db
      .select()
      .from(mdTerraConnections)
      .where(eq(mdTerraConnections.terraUserId, terra_user_id))
      .limit(1)

    if (existing.length > 0) {
      // Update existing connection
      await db
        .update(mdTerraConnections)
        .set({
          connectedAt: new Date(),
          provider: provider || existing[0].provider,
        })
        .where(eq(mdTerraConnections.terraUserId, terra_user_id))
    } else {
      // Create new connection
      await db.insert(mdTerraConnections).values({
        teamId: teamId as string,
        userId: userId as string,
        terraUserId: terra_user_id,
        referenceId: reference_id,
        provider: provider || 'UNKNOWN',
        connectedAt: new Date(),
      })
    }

    console.log(`[terra-callback] connection saved: ${terra_user_id} (${provider})`)
  } catch (err) {
    console.error('[terra-callback] db error:', err)
    throw err
  }
}
