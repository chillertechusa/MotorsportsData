import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdMechanicPortfolio, mdMechanicOptimizations } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * GET /api/md-mechanic/optimizations-context?mechanicUserId=...
 * Returns mechanic's portfolio context + recent optimizations for AI grounding
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mechanicUserId = searchParams.get('mechanicUserId')

    if (!mechanicUserId) {
      return NextResponse.json({ error: 'Missing mechanicUserId' }, { status: 400 })
    }

    // Get mechanic portfolio
    const portfolio = await db
      .select()
      .from(mdMechanicPortfolio)
      .where(eq(mdMechanicPortfolio.userId, mechanicUserId))
      .limit(1)
      .then(rows => rows[0])

    if (!portfolio) {
      return NextResponse.json({
        ok: false,
        message: 'Mechanic profile not found',
      })
    }

    // Get recent optimizations (last 20)
    const recentOptimizations = await db
      .select()
      .from(mdMechanicOptimizations)
      .where(eq(mdMechanicOptimizations.mechanicUserId, mechanicUserId))
      .orderBy(desc(mdMechanicOptimizations.createdAt))
      .limit(20)

    // Calculate metrics
    const evaluatedOptimizations = recentOptimizations.filter(o => o.actualLapTimeDelta !== null)
    const averageAccuracy = evaluatedOptimizations.length > 0
      ? evaluatedOptimizations.reduce((sum, o) => sum + (o.accuracy || 0), 0) / evaluatedOptimizations.length
      : 0

    // Calculate parameter expertise (which parameters mechanic specializes in)
    const parameterStats: Record<string, { count: number; avgDelta: number }> = {}
    recentOptimizations.forEach(o => {
      if (!parameterStats[o.parameter]) {
        parameterStats[o.parameter] = { count: 0, avgDelta: 0 }
      }
      parameterStats[o.parameter].count++
      if (o.estimatedLapTimeDelta) {
        parameterStats[o.parameter].avgDelta += o.estimatedLapTimeDelta
      }
    })

    // Calculate top performing areas
    const topAreas = Object.entries(parameterStats)
      .map(([param, stats]) => ({
        parameter: param,
        count: stats.count,
        avgDelta: stats.avgDelta / stats.count,
      }))
      .sort((a, b) => b.avgDelta - a.avgDelta)
      .slice(0, 5)

    return NextResponse.json({
      ok: true,
      mechanic: {
        id: portfolio.id,
        userId: portfolio.userId,
        displayName: portfolio.displayName,
        bio: portfolio.bio,
        totalRidersServed: portfolio.totalRidersServed,
        totalLapTimeSavings: portfolio.totalLapTimeSavings,
        averageEfficiencyScore: portfolio.averageEfficiencyScore,
        totalWorkOrders: portfolio.totalWorkOrders,
        verificationStatus: portfolio.verificationStatus,
      },
      stats: {
        totalOptimizations: recentOptimizations.length,
        evaluatedOptimizations: evaluatedOptimizations.length,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        successRate: evaluatedOptimizations.length > 0
          ? Math.round((evaluatedOptimizations.filter(o => (o.actualLapTimeDelta ?? 0) < 0).length / evaluatedOptimizations.length) * 100)
          : 0,
      },
      recentOptimizations: recentOptimizations.slice(0, 10),
      topPerformingAreas: topAreas,
    })
  } catch (error) {
    console.error('[Mechanic Context] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mechanic context' },
      { status: 500 }
    )
  }
}
