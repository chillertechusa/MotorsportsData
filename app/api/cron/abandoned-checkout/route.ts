import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdAbandonedCheckouts } from '@/lib/db/schema'
import { eq, and, lt } from 'drizzle-orm'
import { sendMdAbandonedCheckoutEmail } from '@/lib/md-email'
import { MD_PLAN_LABELS, type MdPlanId } from '@/lib/md-plans'
import { invalidateCache, cacheKey } from '@/lib/cache'
import { withErrorTrackedRoute } from '@/lib/sentry/api-route-wrapper'

// Max concurrent email sends per cron invocation
const BATCH_SIZE      = 500  // total per run (up from 100)
const CONCURRENCY     = 10   // parallel sends at once

/**
 * Cron: Send recovery emails for abandoned checkouts
 * Runs hourly (0 * * * * in vercel.json).
 * Parallelized: 10 concurrent sends → 500 emails/hour throughput.
 */
async function handler(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[abandoned-checkout-cron] Starting recovery email batch')

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const abandoned = await db
      .select()
      .from(mdAbandonedCheckouts)
      .where(
        and(
          lt(mdAbandonedCheckouts.createdAt, oneHourAgo),
          eq(mdAbandonedCheckouts.emailSent, false),
          eq(mdAbandonedCheckouts.converted, false)
        )
      )
      .limit(BATCH_SIZE)

    console.log(`[abandoned-checkout-cron] Found ${abandoned.length} eligible checkouts`)

    let sentCount  = 0
    let errorCount = 0

    // Chunked parallel execution: process CONCURRENCY sends at a time
    for (let i = 0; i < abandoned.length; i += CONCURRENCY) {
      const chunk = abandoned.slice(i, i + CONCURRENCY)

      const results = await Promise.allSettled(
        chunk.map(async record => {
          const planLabel =
            MD_PLAN_LABELS[record.plan as keyof typeof MD_PLAN_LABELS] || record.plan

          const ok = await sendMdAbandonedCheckoutEmail({
            to:        record.email,
            name:      record.name || 'User',
            plan:      record.plan as MdPlanId,
            planLabel,
          })

          if (ok) {
            await db
              .update(mdAbandonedCheckouts)
              .set({ emailSent: true })
              .where(eq(mdAbandonedCheckouts.id, record.id))
            return 'sent'
          }
          return 'failed'
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value === 'sent') {
          sentCount++
        } else {
          errorCount++
        }
      }
    }

    // Invalidate recovery analytics cache so dashboard refreshes immediately
    await invalidateCache(
      cacheKey('analytics', 'recovery', '7'),
      cacheKey('analytics', 'recovery', '30'),
      cacheKey('analytics', 'recovery', '90')
    )

    console.log(`[abandoned-checkout-cron] Done: ${sentCount} sent, ${errorCount} errors`)

    return NextResponse.json({
      ok:         true,
      batchSize:  abandoned.length,
      sent:       sentCount,
      errors:     errorCount,
      concurrency: CONCURRENCY,
      timestamp:  new Date().toISOString(),
    })
  } catch (error) {
    console.error('[abandoned-checkout-cron] Fatal error:', error)
    return NextResponse.json(
      { error: 'Failed to process abandoned checkout emails' },
      { status: 500 }
    )
  }
}

export const GET = withErrorTrackedRoute(handler, 'cron/abandoned-checkout')
