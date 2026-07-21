import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdCoachEffectiveness } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth || !('teamId' in auth && auth.teamId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get coach effectiveness metrics for this team
    const coachMetrics = await db
      .select()
      .from(mdCoachEffectiveness)
      .where(eq(mdCoachEffectiveness.teamId, auth.teamId))

    // Calculate aggregate metrics
    const totalCoaches = coachMetrics.length
    const avgReadinessAccuracy =
      totalCoaches > 0
        ? coachMetrics.reduce((sum, c) => sum + (c.readinessAccuracy || 0), 0) / totalCoaches
        : 0
    const totalRidersImproved = coachMetrics.reduce((sum, c) => sum + (c.ridersImproved || 0), 0)
    const avgLapImprovement =
      totalCoaches > 0
        ? coachMetrics.reduce((sum, c) => sum + (c.avgLapImprovement || 0), 0) / totalCoaches
        : 0
    const totalSetupRecommendations = coachMetrics.reduce(
      (sum, c) => sum + (c.setupRecommendations || 0),
      0
    )
    const totalSuccessfulSetupChanges = coachMetrics.reduce(
      (sum, c) => sum + (c.successfulSetupChanges || 0),
      0
    )
    const setupSuccessRate =
      totalSetupRecommendations > 0
        ? (totalSuccessfulSetupChanges / totalSetupRecommendations) * 100
        : 0

    return NextResponse.json({
      teamId: auth.teamId,
      coaches: coachMetrics.map(c => ({
        email: c.coachEmail,
        sessionsCoached: c.sessionsCoached,
        readinessAccuracy: Math.round((c.readinessAccuracy || 0) * 100) / 100,
        ridersImproved: c.ridersImproved,
        avgLapImprovement: Math.round((c.avgLapImprovement || 0) * 1000) / 1000,
        setupRecommendations: c.setupRecommendations,
        successfulSetupChanges: c.successfulSetupChanges,
      })),
      summary: {
        totalCoaches,
        avgReadinessAccuracy: Math.round(avgReadinessAccuracy * 100) / 100,
        totalRidersImproved,
        avgLapImprovementPerCoach: Math.round(avgLapImprovement * 1000) / 1000,
        setupSuccessRate: Math.round(setupSuccessRate * 100) / 100,
      },
    })
  } catch (err) {
    console.error('[v0] Coach effectiveness error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch coach effectiveness data' },
      { status: 500 }
    )
  }
}
