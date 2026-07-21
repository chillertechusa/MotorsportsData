import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdSessionMetrics } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth || !('teamId' in auth && auth.teamId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all session metrics for this team
    const metrics = await db
      .select()
      .from(mdSessionMetrics)
      .where(eq(mdSessionMetrics.teamId, auth.teamId))
      .orderBy(desc(mdSessionMetrics.createdAt))

    // Aggregate by rider
    interface RiderStats {
      [email: string]: {
        email: string
        sessionCount: number
        bestLapOverall: number
        avgLap: number
        improvement: number
        readinessAccuracy: number
        lastSessionDate: Date | null
      }
    }

    const riderStats: RiderStats = {}

    metrics.forEach(session => {
      if (!session.riderEmail) return

      if (!riderStats[session.riderEmail]) {
        riderStats[session.riderEmail] = {
          email: session.riderEmail,
          sessionCount: 0,
          bestLapOverall: Infinity,
          avgLap: 0,
          improvement: 0,
          readinessAccuracy: 0,
          lastSessionDate: null,
        }
      }

      const stats = riderStats[session.riderEmail]
      stats.sessionCount += 1
      if (session.bestLapSeconds && session.bestLapSeconds < stats.bestLapOverall) {
        stats.bestLapOverall = session.bestLapSeconds
      }
      if (session.avgLapSeconds) {
        stats.avgLap = (stats.avgLap * (stats.sessionCount - 1) + session.avgLapSeconds) / stats.sessionCount
      }
      if (session.deltaVsPrevious && session.deltaVsPrevious < 0) {
        stats.improvement += Math.abs(session.deltaVsPrevious)
      }
      if (session.readinessScore) {
        stats.readinessAccuracy = (stats.readinessAccuracy * (stats.sessionCount - 1) + session.readinessScore) / stats.sessionCount
      }
      if (session.createdAt && (!stats.lastSessionDate || session.createdAt > stats.lastSessionDate)) {
        stats.lastSessionDate = session.createdAt
      }
    })

    // Convert to sorted array
    const riders = Object.values(riderStats)
      .sort((a, b) => a.bestLapOverall - b.bestLapOverall)
      .map(r => ({
        email: r.email,
        sessionCount: r.sessionCount,
        bestLapSeconds: r.bestLapOverall === Infinity ? null : r.bestLapOverall,
        avgLapSeconds: r.avgLap,
        totalImprovementSeconds: r.improvement,
        avgReadinessScore: Math.round(r.readinessAccuracy),
        lastSessionDate: r.lastSessionDate?.toISOString(),
      }))

    return NextResponse.json({
      teamId: auth.teamId,
      riders,
      summary: {
        totalRiders: riders.length,
        teamAvgBestLap: riders.length > 0
          ? riders.reduce((sum, r) => sum + (r.bestLapSeconds || 0), 0) / riders.length
          : 0,
      },
    })
  } catch (err) {
    console.error('[v0] Rider comparisons error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch rider comparisons' },
      { status: 500 }
    )
  }
}
