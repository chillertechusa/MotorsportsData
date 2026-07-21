import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdSubscriptionEvents, mdTeams } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { withCache, cacheKey, TTL } from '@/lib/cache'
import { withErrorTrackedRoute } from '@/lib/sentry/api-route-wrapper'

export const dynamic = 'force-dynamic'

/**
 * GET /api/md-analytics/revenue?days=30
 * Returns MRR, ARR, LTV, churn rate, revenue by tier.
 * Cached in Redis: 24h for 30-day window, 5 min for 7-day window.
 */
async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ttl = days >= 30 ? TTL.ANALYTICS_LONG : TTL.ANALYTICS_SHORT
    const key = cacheKey('analytics', 'revenue', auth.teamId as string, String(days))

    const { data, cached } = await withCache(key, ttl, async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      // Run both DB queries in parallel
      const [events, teamRows] = await Promise.all([
        db
          .select()
          .from(mdSubscriptionEvents)
          .where(
            and(
              eq(mdSubscriptionEvents.teamId, auth.teamId),
              gte(mdSubscriptionEvents.createdAt, since)
            )
          ),
        db
          .select()
          .from(mdTeams)
          .where(eq(mdTeams.id, auth.teamId))
          .limit(1),
      ])

      const team = teamRows[0]

      // Calculate metrics
      const upgrades      = events.filter(e => e.eventType === 'upgrade').length
      const downgrades    = events.filter(e => e.eventType === 'downgrade').length
      const cancellations = events.filter(e => e.eventType === 'cancellation').length
      const newSignups    = events.filter(e => e.eventType === 'signup').length

      const totalRevenue   = events.reduce((sum, e) => sum + (e.amountCents || 0), 0)
      const monthlyRevenue = totalRevenue / (days / 30)
      const churnRate      = newSignups > 0 ? (cancellations / newSignups) * 100 : 0

      const avgRevPerCustomer = newSignups > 0 ? (totalRevenue / newSignups) / 100 : 0
      const ltv = avgRevPerCustomer * (1 / Math.max(0.01, churnRate / 100 / 12))

      const revenueByTier: Record<string, number> = {}
      events.forEach(e => {
        if (e.toTier) {
          revenueByTier[e.toTier] = (revenueByTier[e.toTier] || 0) + (e.amountCents || 0)
        }
      })

      return {
        ok: true,
        period: `Last ${days} days`,
        metrics: {
          mrr: Math.round(monthlyRevenue),
          arr: Math.round(monthlyRevenue * 12),
          totalRevenue,
          ltv: Math.round(ltv * 100) / 100,
          churnRate: Math.round(churnRate * 100) / 100,
        },
        events: {
          newSignups,
          upgrades,
          downgrades,
          cancellations,
          netGrowth: newSignups - cancellations,
        },
        revenueByTier: Object.entries(revenueByTier).map(([tier, revenue]) => ({
          tier,
          revenue,
        })),
      }
    })

    return NextResponse.json({ ...data, cached })
  } catch (error) {
    console.error('[Revenue Analytics] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
  }
}

export const GET = withErrorTrackedRoute(handler, 'md-analytics/revenue')
