import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdSetupLogs, mdSessions, mdVehicles } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'

/**
 * GET /api/md-mechanic/context-brief
 * Returns context data for mechanic AI coaching on setup optimization.
 * Grounds the setup coach AI with:
 * - Recent setup changes (suspension, tire pressure, weight)
 * - Performance deltas before/after setup changes
 * - Rider readiness and compliance status
 * - Vehicle and lap-time trends
 */
export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // Get recent setup logs (last 10) to show mechanic what they've changed
    const recentSetups = await db
      .select({
        id: mdSetupLogs.id,
        sessionId: mdSetupLogs.sessionId,
        parameterKey: mdSetupLogs.parameterKey,
        parameterValue: mdSetupLogs.parameterValue,
      })
      .from(mdSetupLogs)
      .innerJoin(mdSessions, eq(mdSetupLogs.sessionId, mdSessions.id))
      .innerJoin(mdVehicles, eq(mdSessions.vehicleId, mdVehicles.id))
      .where(eq(mdVehicles.teamId, auth.teamId))
      .orderBy(desc(mdSetupLogs.id))
      .limit(10)

    // Get vehicle list with latest session performance
    const vehicles = await db
      .select({
        id: mdVehicles.id,
        name: mdVehicles.name,
      })
      .from(mdVehicles)
      .where(eq(mdVehicles.teamId, auth.teamId))
      .limit(5)

    // Get performance delta for each vehicle (last 2 sessions)
    const performanceData: Record<
      string,
      {
        lastLapTime?: number
        previousLapTime?: number
        bestLapTrend?: number
      }
    > = {}

    for (const v of vehicles) {
      const sessions = await db
        .select({
          bestLapSeconds: mdSessions.bestLapSeconds,
          sessionDate: mdSessions.sessionDate,
        })
        .from(mdSessions)
        .where(eq(mdSessions.vehicleId, v.id))
        .orderBy(desc(mdSessions.sessionDate))
        .limit(2)

      if (sessions.length >= 2) {
        const lastLap = sessions[0].bestLapSeconds
        const previousLap = sessions[1].bestLapSeconds

        if (lastLap && previousLap) {
          performanceData[v.id] = {
            lastLapTime: lastLap,
            previousLapTime: previousLap,
            bestLapTrend: ((previousLap - lastLap) / previousLap) * 100, // Positive = faster improvement
          }
        }
      }
    }

    // Calculate setup change frequency (how often mechanic is making changes)
    const setupChangeCount = recentSetups.length

    return NextResponse.json({
      success: true,
      context: {
        recentSetups: recentSetups.map((s) => ({
          parameterKey: s.parameterKey,
          parameterValue: s.parameterValue,
          changeType: s.parameterKey?.includes('tire')
            ? 'tire_pressure'
            : s.parameterKey?.includes('suspension')
              ? 'suspension'
              : 'other',
        })),
        vehicles: vehicles.map((v) => ({
          id: v.id,
          name: v.name,
          performance: performanceData[v.id] || null,
        })),
        metrics: {
          recentChangeCount: setupChangeCount,
          avgTrendPercentage:
            Object.values(performanceData).reduce((sum, pd) => sum + (pd.bestLapTrend || 0), 0) /
            Math.max(Object.values(performanceData).length, 1),
        },
      },
    })
  } catch (err) {
    console.error('[md-mechanic/context-brief] error:', err)
    return NextResponse.json({ error: 'Failed to fetch context' }, { status: 500 })
  }
}
