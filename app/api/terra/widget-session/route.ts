/**
 * POST /api/terra/widget-session
 * Generates a Terra widget URL for the current user to connect their wearable.
 * Returns { url } — the frontend opens this URL in a new tab / modal iframe.
 *
 * Also creates or updates the md_terra_connections row with a referenceId so
 * we can match the Terra webhook callback back to this team member.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTerraConnections } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'
import { generateWidgetSession, isTerraConfigured } from '@/lib/terra/client'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId, userId } = auth

    if (!isTerraConfigured()) {
      return NextResponse.json(
        { error: 'Terra API not configured — add TERRA_API_KEY and TERRA_DEV_ID to environment variables.' },
        { status: 503 },
      )
    }

    const body = await req.json().catch(() => ({}))
    const riderName: string = body.riderName || ''

    // Use a stable reference ID: teamId:userId
    const referenceId = `${teamId}:${userId}`

    // Generate the widget session URL from Terra
    const session = await generateWidgetSession(referenceId)
    if (!session) {
      return NextResponse.json({ error: 'Failed to generate Terra widget session' }, { status: 502 })
    }

    // Upsert the connection row so we have a record even before OAuth completes
    const existing = await db
      .select()
      .from(mdTerraConnections)
      .where(and(eq(mdTerraConnections.teamId, teamId), eq(mdTerraConnections.userId, userId)))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(mdTerraConnections)
        .set({ referenceId, riderName: riderName || existing[0].riderName })
        .where(eq(mdTerraConnections.id, existing[0].id))
    } else {
      await db.insert(mdTerraConnections).values({
        teamId,
        userId,
        referenceId,
        riderName: riderName || null,
      })
    }

    return NextResponse.json({ url: session.url, sessionId: session.session_id })
  } catch (err) {
    console.error('[terra/widget-session]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/** GET /api/terra/widget-session — fetch this user's current connection status */
export async function GET() {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId, userId } = auth

    const rows = await db
      .select()
      .from(mdTerraConnections)
      .where(and(eq(mdTerraConnections.teamId, teamId), eq(mdTerraConnections.userId, userId)))
      .limit(1)

    const conn = rows[0] ?? null
    return NextResponse.json({
      connected: Boolean(conn?.terraUserId),
      provider: conn?.provider ?? null,
      riderName: conn?.riderName ?? null,
      connectedAt: conn?.connectedAt ?? null,
    })
  } catch (err) {
    console.error('[terra/widget-session GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/** DELETE /api/terra/widget-session — disconnect the current user's wearable */
export async function DELETE() {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId, userId } = auth

    const rows = await db
      .select()
      .from(mdTerraConnections)
      .where(and(eq(mdTerraConnections.teamId, teamId), eq(mdTerraConnections.userId, userId)))
      .limit(1)

    if (rows[0]?.terraUserId) {
      const { deauthTerraUser } = await import('@/lib/terra/client')
      await deauthTerraUser(rows[0].terraUserId)
    }

    await db
      .delete(mdTerraConnections)
      .where(and(eq(mdTerraConnections.teamId, teamId), eq(mdTerraConnections.userId, userId)))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[terra/widget-session DELETE]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
