import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdConversionEvents, mdSubscriptionEvents, mdTeams, mdTeamMembers, mdSessions } from '@/lib/db/schema'
import { eq, inArray, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { withCache, cacheKey, TTL } from '@/lib/cache'
import { withErrorTrackedRoute } from '@/lib/sentry/api-route-wrapper'

export const dynamic = 'force-dynamic'

interface CohortMetric {
  daysSinceSignup: number
  retentionPercent: number
  activeTeams: number
  totalTeams: number
}

interface CohortData {
  source: string
  cohortSize: number
  d7: CohortMetric
  d30: CohortMetric
  d90: CohortMetric
  d365: CohortMetric
  expansionRevenue: number
}

/**
 * GET /api/md-analytics/cohorts?metric=retention&source=organic
 * Returns retention curves by signup source
 * - D7, D30, D90, D365 retention %
 * - Expansion revenue by cohort
 * Cached: 24h
 */
async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const metric = searchParams.get('metric') || 'retention'
    const source = searchParams.get('source') || 'all'

    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKeyStr = cacheKey(
      'analytics',
      'cohorts',
      auth.teamId as string,
      metric,
      source
    )

    const { data, cached } = await withCache(cacheKeyStr, TTL.ANALYTICS_LONG, async () => {
      // Teams this user belongs to (membership, not a team-owner column)
      const memberships = await db
        .select({ teamId: mdTeamMembers.teamId })
        .from(mdTeamMembers)
        .where(eq(mdTeamMembers.userId, auth.userId as string))
      const teamIds = memberships.map((m) => m.teamId)

      const allTeams = teamIds.length
        ? await db.select().from(mdTeams).where(inArray(mdTeams.id, teamIds))
        : []

      // Subscription events for this user (holds upgrade amounts / tier history)
      const subEvents = await db
        .select()
        .from(mdSubscriptionEvents)
        .where(eq(mdSubscriptionEvents.userId, auth.userId as string))

      // Conversion events scoped to this user's teams — carry the UTM source
      const conversionEvents = teamIds.length
        ? await db.select().from(mdConversionEvents).where(inArray(mdConversionEvents.teamId, teamIds))
        : []

      // First-touch UTM source per team → cohort key
      const sourceByTeam = new Map<string, string>()
      for (const evt of conversionEvents) {
        if (!sourceByTeam.has(evt.teamId)) {
          sourceByTeam.set(evt.teamId, evt.utmSource || 'organic')
        }
      }

      // Most recent session per team → "last active" signal
      const lastSessions = teamIds.length
        ? await db
            .select({ teamId: mdSessions.teamId, createdAt: mdSessions.createdAt })
            .from(mdSessions)
            .where(inArray(mdSessions.teamId, teamIds))
            .orderBy(desc(mdSessions.createdAt))
        : []
      const lastActiveByTeam = new Map<string, Date>()
      for (const s of lastSessions) {
        if (s.createdAt && !lastActiveByTeam.has(s.teamId)) {
          lastActiveByTeam.set(s.teamId, s.createdAt)
        }
      }

      // Build cohort map: source -> [teams]
      const cohortMap: Record<string, typeof allTeams> = {}
      allTeams.forEach(team => {
        const src = sourceByTeam.get(team.id) || 'organic'
        if (!cohortMap[src]) cohortMap[src] = []
        cohortMap[src].push(team)
      })

      // Calculate retention metrics for each cohort
      const cohorts: CohortData[] = Object.entries(cohortMap)
        .filter(([key]) => source === 'all' || key === source)
        .map(([src, teams]) => {
          const cohortSize = teams.length

          // Get signup date for this cohort (earliest team creation)
          const signupDate = teams.reduce((earliest, team) => {
            const teamDate = new Date(team.createdAt ?? Date.now())
            return teamDate < earliest ? teamDate : earliest
          }, new Date())

          // Calculate retention at D7, D30, D90, D365
          const retentionAtDay = (daysAgo: number): CohortMetric => {
            const targetDate = new Date(signupDate.getTime() + daysAgo * 24 * 60 * 60 * 1000)
            const activeAtDay = teams.filter(team => {
              const lastActive = lastActiveByTeam.get(team.id) ?? null
              return lastActive && new Date(lastActive) >= targetDate
            }).length

            return {
              daysSinceSignup: daysAgo,
              activeTeams: activeAtDay,
              totalTeams: cohortSize,
              retentionPercent: cohortSize > 0 ? Math.round((activeAtDay / cohortSize) * 1000) / 10 : 0,
            }
          }

          // Expansion revenue: upgrade subscription events within 30 days of signup
          const cohortTeamIds = new Set(teams.map((t) => t.id))
          const evt30 = new Date(signupDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          const expansionRevenue = subEvents
            .filter(evt =>
              cohortTeamIds.has(evt.teamId) &&
              evt.eventType === 'upgrade' &&
              evt.createdAt !== null &&
              new Date(evt.createdAt) <= evt30
            )
            .reduce((sum, evt) => sum + (evt.amountCents || 0), 0)

          return {
            source: src,
            cohortSize,
            d7: retentionAtDay(7),
            d30: retentionAtDay(30),
            d90: retentionAtDay(90),
            d365: retentionAtDay(365),
            expansionRevenue,
          }
        })

      return { cohorts, metric, source, generatedAt: new Date().toISOString() }
    })

    return NextResponse.json({
      ok: true,
      cached,
      ...data,
    })
  } catch (error) {
    console.error('[Cohort Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cohort analytics' },
      { status: 500 }
    )
  }
}

export const GET = withErrorTrackedRoute(handler, 'md-analytics/cohorts')
