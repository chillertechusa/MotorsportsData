import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdAbandonedCheckouts } from '@/lib/db/schema'
import { gte } from 'drizzle-orm'
import { withCache, cacheKey, TTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/md-analytics/recovery?days=30
 * Returns abandoned checkout recovery metrics.
 * Cached in Redis: 1h TTL (recovery stats change hourly with the cron).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    const key = cacheKey('analytics', 'recovery', String(days))

    const { data, cached } = await withCache(key, TTL.RECOVERY_STATS, async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const abandoned = await db
        .select()
        .from(mdAbandonedCheckouts)
        .where(gte(mdAbandonedCheckouts.createdAt, since))

      const totalAbandoned = abandoned.length
      const emailsSent     = abandoned.filter(a => a.emailSent).length
      const converted      = abandoned.filter(a => a.converted).length
      const pending        = totalAbandoned - converted
      const recoveryRate   = emailsSent > 0 ? (converted / emailsSent) * 100 : 0
      const estimatedRecoveredValue = converted * 4900 // cents (~$49 avg plan)

      const byPlan: Record<string, { abandoned: number; converted: number }> = {}
      abandoned.forEach(record => {
        if (!byPlan[record.plan]) byPlan[record.plan] = { abandoned: 0, converted: 0 }
        byPlan[record.plan].abandoned++
        if (record.converted) byPlan[record.plan].converted++
      })

      return {
        ok: true,
        period: `Last ${days} days`,
        metrics: {
          totalAbandoned,
          emailsSent,
          recovered: converted,
          pending,
          recoveryRate:             Math.round(recoveryRate * 10) / 10,
          estimatedRecoveredValue,
          avgTimeToConversion: 0, // requires timestamp diff; future work
        },
        byPlan: Object.entries(byPlan).map(([plan, d]) => ({
          plan,
          abandoned:    d.abandoned,
          converted:    d.converted,
          recoveryRate: d.abandoned > 0
            ? Math.round((d.converted / d.abandoned) * 100 * 10) / 10
            : 0,
        })),
        emailOpen:  0, // requires pixel tracking
        emailClick: 0, // requires link tracking
      }
    })

    return NextResponse.json({ ...data, cached })
  } catch (error) {
    console.error('[Recovery Analytics] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch recovery analytics' }, { status: 500 })
  }
}
