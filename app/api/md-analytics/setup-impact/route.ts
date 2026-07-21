import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdSessionMetrics } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth || !('teamId' in auth && auth.teamId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sessions where setup changed
    const metricsWithSetupChanges = await db
      .select()
      .from(mdSessionMetrics)
      .where(
        eq(mdSessionMetrics.teamId, auth.teamId) &&
        eq(mdSessionMetrics.setupChanged, true)
      )
      .orderBy(desc(mdSessionMetrics.createdAt))

    const setupImpactData = metricsWithSetupChanges.map(session => ({
      sessionId: session.id,
      riderEmail: session.riderEmail,
      bestLapSeconds: session.bestLapSeconds,
      deltaVsPrevious: session.deltaVsPrevious,
      wasImprovement: (session.deltaVsPrevious ?? 0) < 0,
      improvementAmount: session.deltaVsPrevious ? Math.abs(session.deltaVsPrevious) : 0,
      readinessScore: session.readinessScore,
      createdAt: session.createdAt?.toISOString(),
    }))

    // Calculate ROI metrics
    const totalSetupChanges = setupImpactData.length
    const successfulChanges = setupImpactData.filter(s => s.wasImprovement).length
    const successRate = totalSetupChanges > 0 ? (successfulChanges / totalSetupChanges) * 100 : 0
    const avgImprovementWhenSuccessful =
      setupImpactData.filter(s => s.wasImprovement).length > 0
        ? setupImpactData
            .filter(s => s.wasImprovement)
            .reduce((sum, s) => sum + s.improvementAmount, 0) /
          setupImpactData.filter(s => s.wasImprovement).length
        : 0

    return NextResponse.json({
      teamId: auth.teamId,
      setupRoi: {
        totalSetupChanges,
        successfulChanges,
        successRate: Math.round(successRate * 100) / 100,
        avgImprovementSeconds: Math.round(avgImprovementWhenSuccessful * 1000) / 1000,
      },
      recentChanges: setupImpactData.slice(0, 20),
    })
  } catch (err) {
    console.error('[v0] Setup impact error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch setup impact data' },
      { status: 500 }
    )
  }
}
