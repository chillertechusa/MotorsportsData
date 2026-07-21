import { db } from '@/lib/db'
import { mdSetupLogs, mdSessions, mdVehicles } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export interface MechanicContextBrief {
  recentSetups: Array<{
    parameterKey: string
    parameterValue: string
    changeType: 'suspension' | 'tire_pressure' | 'other'
  }>
  vehicles: Array<{
    id: string
    name: string
    performance: {
      lastLapTime?: number
      previousLapTime?: number
      bestLapTrend?: number
    } | null
  }>
  metrics: {
    recentChangeCount: number
    avgTrendPercentage: number
  }
}

/**
 * Fetch context brief for mechanic setup coaching.
 * Queries recent setup changes, vehicle performance, and trends.
 */
export async function fetchContextBrief(teamId: string): Promise<MechanicContextBrief> {
  // Get recent setup logs
  const recentSetups = await db
    .select({
      parameterKey: mdSetupLogs.parameterKey,
      parameterValue: mdSetupLogs.parameterValue,
    })
    .from(mdSetupLogs)
    .innerJoin(mdSessions, eq(mdSetupLogs.sessionId, mdSessions.id))
    .innerJoin(mdVehicles, eq(mdSessions.vehicleId, mdVehicles.id))
    .where(eq(mdVehicles.teamId, teamId))
    .orderBy(desc(mdSetupLogs.id))
    .limit(10)

  // Get vehicles
  const vehicles = await db
    .select({
      id: mdVehicles.id,
      name: mdVehicles.name,
    })
    .from(mdVehicles)
    .where(eq(mdVehicles.teamId, teamId))
    .limit(5)

  // Get performance data
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
      })
      .from(mdSessions)
      .where(eq(mdSessions.vehicleId, v.id))
      .orderBy(desc(mdSessions.sessionDate))
      .limit(2)

    if (sessions.length >= 2 && sessions[0].bestLapSeconds && sessions[1].bestLapSeconds) {
      performanceData[v.id] = {
        lastLapTime: sessions[0].bestLapSeconds,
        previousLapTime: sessions[1].bestLapSeconds,
        bestLapTrend: ((sessions[1].bestLapSeconds - sessions[0].bestLapSeconds) / sessions[1].bestLapSeconds) * 100,
      }
    }
  }

  return {
    recentSetups: recentSetups.map((s) => ({
      parameterKey: s.parameterKey,
      parameterValue: s.parameterValue,
      changeType: s.parameterKey.includes('tire')
        ? 'tire_pressure'
        : s.parameterKey.includes('suspension')
          ? 'suspension'
          : 'other',
    })),
    vehicles: vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      performance: performanceData[v.id] || null,
    })),
    metrics: {
      recentChangeCount: recentSetups.length,
      avgTrendPercentage:
        Object.values(performanceData).reduce((sum, pd) => sum + (pd.bestLapTrend || 0), 0) /
        Math.max(Object.values(performanceData).length, 1),
    },
  }
}
