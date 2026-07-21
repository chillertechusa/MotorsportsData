import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTeams, mdSubscriptionEvents, mdTeamMembers, mdSessions } from '@/lib/db/schema'
import { eq, inArray, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { withCache, cacheKey, TTL } from '@/lib/cache'
import { withErrorTrackedRoute } from '@/lib/sentry/api-route-wrapper'

export const dynamic = 'force-dynamic'

interface AtRiskTeam {
  teamId: string
  teamName: string
  currentPlan: string
  expiryDate: string | null
  daysToExpiry: number | null
  riskLevel: 'red' | 'yellow' | 'green'
  lastSessionAt: string | null
  daysSinceLastSession: number | null
  signupDate: string
  ltv: number
  notes: string[]
}

/**
 * GET /api/md-analytics/at-risk
 * Returns teams at risk of churn based on:
 * - Expiry < 7 days: RED
 * - Expiry < 30 days + no session in 7 days: YELLOW
 * - Expiry < 30 days + no session in 14 days: YELLOW
 * Cached: 6h (fresher than retention cohorts)
 */
async function handler(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKeyStr = cacheKey('analytics', 'at-risk', auth.teamId as string)

    const { data, cached } = await withCache(cacheKeyStr, 6 * 60 * 60, async () => {
      // Teams this user belongs to (membership, not a team-owner column)
      const memberships = await db
        .select({ teamId: mdTeamMembers.teamId })
        .from(mdTeamMembers)
        .where(eq(mdTeamMembers.userId, auth.userId as string))
      const teamIds = memberships.map((m) => m.teamId)

      const allTeams = teamIds.length
        ? await db.select().from(mdTeams).where(inArray(mdTeams.id, teamIds))
        : []

      // Get subscription events for LTV calculation (scoped by userId)
      const subEvents = await db
        .select()
        .from(mdSubscriptionEvents)
        .where(eq(mdSubscriptionEvents.userId, auth.userId as string))

      // Most recent session date per team → "last active" signal
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

      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

      const atRiskTeams: AtRiskTeam[] = allTeams
        .map(team => {
          // Get LTV from subscription events
          const teamLTV = subEvents
            .filter(evt => evt.teamId === team.id)
            .reduce((sum, evt) => sum + (evt.amountCents || 0), 0)

          // Calculate days to expiry
          let daysToExpiry: number | null = null
          let riskLevel: 'red' | 'yellow' | 'green' = 'green'
          const notes: string[] = []

          if (team.currentPeriodEnd) {
            const expiryDate = new Date(team.currentPeriodEnd)
            daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

            if (daysToExpiry <= 7 && daysToExpiry > 0) {
              riskLevel = 'red'
              notes.push(`Expires in ${daysToExpiry} days`)
            } else if (daysToExpiry <= 0) {
              riskLevel = 'red'
              notes.push('EXPIRED')
            }
          }

          // Days since last session
          const lastActiveAt = lastActiveByTeam.get(team.id) ?? null
          let daysSinceLastSession: number | null = null
          if (lastActiveAt) {
            const lastSessionDate = new Date(lastActiveAt)
            daysSinceLastSession = Math.ceil((now.getTime() - lastSessionDate.getTime()) / (24 * 60 * 60 * 1000))

            if (daysSinceLastSession > 14) {
              riskLevel = 'red'
              notes.push(`No activity for ${daysSinceLastSession} days`)
            } else if (daysSinceLastSession > 7) {
              if (riskLevel !== 'red') riskLevel = 'yellow'
              notes.push(`No activity for ${daysSinceLastSession} days`)
            }
          }

          // Additional at-risk signals
          if (daysToExpiry && daysToExpiry <= 30) {
            if (daysSinceLastSession === null || daysSinceLastSession > 7) {
              if (riskLevel !== 'red') riskLevel = 'yellow'
              notes.push('Approaching expiry with low activity')
            }
          }

          return {
            teamId: team.id,
            teamName: team.name || 'Unnamed Team',
            currentPlan: team.subscriptionTier || 'free',
            expiryDate: team.currentPeriodEnd ? new Date(team.currentPeriodEnd).toISOString().split('T')[0] : null,
            daysToExpiry,
            riskLevel,
            lastSessionAt: lastActiveAt ? new Date(lastActiveAt).toISOString().split('T')[0] : null,
            daysSinceLastSession,
            signupDate: team.createdAt ? new Date(team.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            ltv: teamLTV / 100, // Convert cents to dollars
            notes,
          }
        })
        .filter(team => team.riskLevel !== 'green') // Only return at-risk teams
        .sort((a, b) => {
          // Sort by risk level (red first) then days to expiry
          if (a.riskLevel !== b.riskLevel) {
            return a.riskLevel === 'red' ? -1 : 1
          }
          if (a.daysToExpiry && b.daysToExpiry) {
            return a.daysToExpiry - b.daysToExpiry
          }
          return 0
        })

      const redCount = atRiskTeams.filter(t => t.riskLevel === 'red').length
      const yellowCount = atRiskTeams.filter(t => t.riskLevel === 'yellow').length
      const estimatedChurnValue = atRiskTeams
        .filter(t => t.riskLevel === 'red')
        .reduce((sum, t) => sum + (t.ltv / 12), 0) // Rough MRR estimate

      return {
        atRiskTeams,
        summary: {
          totalAtRisk: atRiskTeams.length,
          red: redCount,
          yellow: yellowCount,
          estimatedChurnValuePerMonth: Math.round(estimatedChurnValue * 100) / 100,
        },
        generatedAt: new Date().toISOString(),
      }
    })

    return NextResponse.json({
      ok: true,
      cached,
      ...data,
    })
  } catch (error) {
    console.error('[At-Risk Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch at-risk analytics' },
      { status: 500 }
    )
  }
}

export const GET = withErrorTrackedRoute(handler, 'md-analytics/at-risk')
