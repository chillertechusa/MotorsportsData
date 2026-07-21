import { db } from '@/lib/db'
import { mdLiveSessions } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { redis } from '@/lib/cache'

export interface LeaderboardEntry {
  rank: number
  riderEmail: string
  bestLapSeconds: number
  currentLap: number
  totalLaps: number
  gapToLeader: number
}

export async function getTeamLeaderboard(teamId: string): Promise<LeaderboardEntry[]> {
  const cacheKey = `team:${teamId}:leaderboard`

  // Try cache first
  const cached = await redis.get<string>(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Active sessions ordered by best lap time (lower seconds = faster = leader)
  const sessions = await db
    .select()
    .from(mdLiveSessions)
    .where(and(eq(mdLiveSessions.teamId, teamId), eq(mdLiveSessions.isActive, true)))
    .orderBy(asc(mdLiveSessions.bestLapSeconds))

  const leaderBest = sessions[0]?.bestLapSeconds ?? 0

  const leaderboard: LeaderboardEntry[] = sessions.map((session, index) => {
    const best = session.bestLapSeconds ?? 0
    const gapToLeader = best && leaderBest ? best - leaderBest : 0

    return {
      rank: index + 1,
      riderEmail: session.riderEmail,
      bestLapSeconds: best,
      currentLap: session.currentLap ?? 0,
      totalLaps: session.totalLaps ?? 0,
      gapToLeader,
    }
  })

  // Cache for 3 seconds
  await redis.set(cacheKey, JSON.stringify(leaderboard), { ex: 3 })

  return leaderboard
}

export async function invalidateLeaderboard(teamId: string) {
  const cacheKey = `team:${teamId}:leaderboard`
  await redis.del(cacheKey)
}
