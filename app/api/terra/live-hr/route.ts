/**
 * GET /api/terra/live-hr
 * Returns the latest HR readings for all connected riders on the team.
 * Polled every 3 seconds by the ViewLiveHR component.
 *
 * Response shape:
 * {
 *   riders: [{
 *     id, userId, riderName, provider, connected,
 *     latestHr, latestHrAt, hrHistory,
 *     secondsAgo (how stale the reading is)
 *   }],
 *   terraConfigured: boolean
 * }
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTerraConnections } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'
import { isTerraConfigured } from '@/lib/terra/client'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId } = auth

    const rows = await db
      .select()
      .from(mdTerraConnections)
      .where(eq(mdTerraConnections.teamId, teamId))

    const now = Date.now()

    const riders = rows.map((row) => {
      const lastAt = row.latestHrAt ? new Date(row.latestHrAt).getTime() : null
      const secondsAgo = lastAt ? Math.floor((now - lastAt) / 1000) : null

      return {
        id: row.id,
        userId: row.userId,
        riderName: row.riderName ?? 'Unnamed Rider',
        provider: row.provider ?? null,
        connected: Boolean(row.terraUserId),
        latestHr: row.latestHr ?? null,
        latestHrAt: row.latestHrAt ?? null,
        secondsAgo,
        // Only send last 30 history points for charting (keep payload small)
        hrHistory: Array.isArray(row.hrHistory)
          ? (row.hrHistory as { ts: number; hr: number }[]).slice(-30)
          : [],
      }
    })

    return NextResponse.json({ riders, terraConfigured: isTerraConfigured() })
  } catch (err) {
    console.error('[terra/live-hr]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
