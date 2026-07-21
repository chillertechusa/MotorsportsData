import { db } from '@/lib/db'
import { mdLiveSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { redis } from '@/lib/cache'

export interface TeamLiveSession {
  sessionId: string
  riderEmail: string
  deviceId: string
  isActive: boolean
  currentLap: number
  totalLaps: number
  bestLapSeconds: number | null
  sessionDurationSeconds: number
  updatedAt: string
}

export async function getTeamActiveSessions(teamId: string): Promise<TeamLiveSession[]> {
  const cacheKey = `team:${teamId}:active-sessions`

  // Try Redis cache first
  const cached = await redis.get<string>(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Query database for active sessions
  const sessions = await db
    .select()
    .from(mdLiveSessions)
    .where(and(eq(mdLiveSessions.teamId, teamId), eq(mdLiveSessions.isActive, true)))

  const result: TeamLiveSession[] = sessions.map((session) => ({
    sessionId: session.id,
    riderEmail: session.riderEmail,
    deviceId: session.deviceId,
    isActive: session.isActive ?? false,
    currentLap: session.currentLap ?? 0,
    totalLaps: session.totalLaps ?? 0,
    bestLapSeconds: session.bestLapSeconds,
    sessionDurationSeconds: session.sessionDurationSeconds ?? 0,
    updatedAt: session.updatedAt?.toISOString() || new Date().toISOString(),
  }))

  // Cache for 5 seconds (500ms + buffer for consistency)
  await redis.set(cacheKey, JSON.stringify(result), { ex: 5 })

  return result
}

export async function updateSessionMetrics(
  sessionId: string,
  metrics: {
    currentLap?: number
    totalLaps?: number
    bestLapSeconds?: number
    sessionDurationSeconds?: number
  }
) {
  // Update database
  await db
    .update(mdLiveSessions)
    .set({
      ...metrics,
      updatedAt: new Date(),
    })
    .where(eq(mdLiveSessions.id, sessionId))

  // Invalidate cache for this team
  const [session] = await db
    .select({ teamId: mdLiveSessions.teamId })
    .from(mdLiveSessions)
    .where(eq(mdLiveSessions.id, sessionId))
    .limit(1)

  if (session) {
    const cacheKey = `team:${session.teamId}:active-sessions`
    await redis.del(cacheKey)
  }
}

export async function invalidateTeamSessionCache(teamId: string) {
  const cacheKey = `team:${teamId}:active-sessions`
  await redis.del(cacheKey)
}
