import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdConversionEvents } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { withCache, cacheKey, TTL } from '@/lib/cache'
import { withErrorTrackedRoute } from '@/lib/sentry/api-route-wrapper'

export const dynamic = 'force-dynamic'

interface FunnelStep {
  step: string
  count: number
  percentage: number
  dropoff?: number
}

/**
 * GET /api/md-analytics/funnel?days=30
 * Returns conversion funnel: visitor → signup → checkout → paid.
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
    const key = cacheKey('analytics', 'funnel', auth.teamId as string, String(days))

    const { data, cached } = await withCache(key, ttl, async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const events = await db
        .select()
        .from(mdConversionEvents)
        .where(
          and(
            eq(mdConversionEvents.teamId, auth.teamId),
            gte(mdConversionEvents.createdAt, since)
          )
        )

      // Build per-step unique-user sets
      const stepCounts = {
        visitor:           new Set<string>(),
        signup:            new Set<string>(),
        checkout_started:  new Set<string>(),
        checkout_abandoned: new Set<string>(),
        paid:              new Set<string>(),
      }

      events.forEach(event => {
        const step = event.step as keyof typeof stepCounts
        if (stepCounts[step]) stepCounts[step].add(event.userId)
      })

      const steps: FunnelStep[] = [
        {
          step: 'Visitor',
          count: stepCounts.visitor.size,
          percentage: 100,
        },
        {
          step: 'Signup',
          count: stepCounts.signup.size,
          percentage: stepCounts.visitor.size > 0
            ? (stepCounts.signup.size / stepCounts.visitor.size) * 100
            : 0,
        },
        {
          step: 'Checkout Started',
          count: stepCounts.checkout_started.size,
          percentage: stepCounts.signup.size > 0
            ? (stepCounts.checkout_started.size / stepCounts.signup.size) * 100
            : 0,
        },
        {
          step: 'Payment Complete',
          count: stepCounts.paid.size,
          percentage: stepCounts.checkout_started.size > 0
            ? (stepCounts.paid.size / stepCounts.checkout_started.size) * 100
            : 0,
        },
      ]

      // Dropoff rates
      for (let i = 0; i < steps.length - 1; i++) {
        const cur  = steps[i].count
        const next = steps[i + 1].count
        steps[i].dropoff = cur > 0 ? ((cur - next) / cur) * 100 : 0
      }

      return {
        ok: true,
        period: `Last ${days} days`,
        funnel: steps,
        conversionRate: steps[steps.length - 1].percentage,
        totalEvents: events.length,
      }
    })

    return NextResponse.json({ ...data, cached })
  } catch (error) {
    console.error('[Funnel Analytics] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 })
  }
}

export const GET = withErrorTrackedRoute(handler, 'md-analytics/funnel')
