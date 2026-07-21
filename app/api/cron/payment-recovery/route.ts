import { db } from '@/lib/db'
import { mdTeams } from '@/lib/db/schema'
import { ROOKIE_TIER } from '@/lib/md-tiers'
import { and, eq, lt, gte } from 'drizzle-orm'

/**
 * Payment Recovery Cron Job
 * Runs daily to downgrade teams with failed payments after 7 days
 * Keeps data intact so users can re-upgrade when payment recovers
 */
export async function GET(request: Request) {
  // Verify this is a valid cron request (from Vercel)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Find teams with failed payment status created > 7 days ago
    const failedTeams = await db
      .select()
      .from(mdTeams)
      .where(
        and(
          eq(mdTeams.paymentStatus, 'failed'),
          gte(mdTeams.paymentFailureCount, 1),
          lt(mdTeams.lastPaymentAttempt, sevenDaysAgo)
        )
      )

    if (failedTeams.length === 0) {
      return Response.json({
        success: true,
        downgradedCount: 0,
        message: 'No teams to downgrade',
      })
    }

    // Downgrade all failed teams to Rookie tier
    const downgradedTeams = await Promise.all(
      failedTeams.map(team =>
        db
          .update(mdTeams)
          .set({
            subscriptionTier: ROOKIE_TIER,
            subscriptionStatus: 'active',
            paymentStatus: 'downgraded',
            downgradedAt: new Date(),
          })
          .where(eq(mdTeams.id, team.id))
      )
    )

    console.log(`[Cron] Payment recovery: downgraded ${downgradedTeams.length} teams to Rookie tier`)

    return Response.json({
      success: true,
      downgradedCount: downgradedTeams.length,
      message: `Downgraded ${downgradedTeams.length} teams due to failed payments`,
    })
  } catch (error) {
    console.error('[Cron] Payment recovery error:', error)
    return Response.json(
      { success: false, error: 'Payment recovery failed' },
      { status: 500 }
    )
  }
}
