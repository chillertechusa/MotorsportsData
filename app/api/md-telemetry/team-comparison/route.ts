import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdLiveSessions, mdLiveTelemetry } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

export const dynamic = 'force-dynamic'

interface RiderSnapshot {
  liveSessionId: string
  riderEmail: string
  position: number
  lapNumber: number
  bestLapSeconds?: number
  currentLapTime?: number
  gapToLeader?: number
  speed?: number
  throttle?: number
  engineTemp?: number
  lastUpdate: number
}

/**
 * GET /api/md-telemetry/team-comparison?sessionId=...
 * Returns live comparison data for all team riders streaming the same session.
 * `sessionId` is the underlying mdSessions id shared by the live-session rows.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // All live-session rows for this team streaming the given session
    const liveSessions = await db
      .select()
      .from(mdLiveSessions)
      .where(
        and(
          eq(mdLiveSessions.sessionId, sessionId),
          eq(mdLiveSessions.teamId, auth.teamId as string)
        )
      )

    if (liveSessions.length === 0) {
      return NextResponse.json({
        ok: true,
        sessionId,
        riders: [],
        timestamp: Date.now(),
      })
    }

    // Latest telemetry point per rider's live session
    const riders: RiderSnapshot[] = await Promise.all(
      liveSessions.map(async (ls, idx) => {
        const [latest] = await db
          .select()
          .from(mdLiveTelemetry)
          .where(eq(mdLiveTelemetry.liveSessionId, ls.id))
          .orderBy(desc(mdLiveTelemetry.timestamp))
          .limit(1)

        return {
          liveSessionId: ls.id,
          riderEmail: ls.riderEmail,
          position: idx + 1,
          lapNumber: latest?.lapNumber ?? ls.currentLap ?? 0,
          bestLapSeconds: ls.bestLapSeconds ?? undefined,
          currentLapTime: latest?.lapTimeSeconds ?? undefined,
          speed: latest?.speed ?? undefined,
          throttle: latest?.throttle ?? undefined,
          engineTemp: latest?.engineTempC ?? undefined,
          lastUpdate: latest?.timestamp?.getTime() ?? Date.now(),
        } satisfies RiderSnapshot
      })
    )

    // Gap to leader based on best lap (lower is faster)
    const leaderBest = Math.min(
      ...riders.map((r) => r.bestLapSeconds ?? Infinity)
    )
    riders.forEach((r) => {
      r.gapToLeader =
        r.bestLapSeconds != null && leaderBest !== Infinity
          ? r.bestLapSeconds - leaderBest
          : undefined
    })

    // Sort by gap to leader and recompute positions
    riders.sort((a, b) => (a.gapToLeader ?? Infinity) - (b.gapToLeader ?? Infinity))
    riders.forEach((rider, idx) => {
      rider.position = idx + 1
    })

    return NextResponse.json({
      ok: true,
      sessionId,
      riders,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('[Team Comparison] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team comparison' },
      { status: 500 }
    )
  }
}
