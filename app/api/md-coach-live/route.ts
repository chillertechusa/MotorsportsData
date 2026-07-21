import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdLiveSessions, mdLiveTelemetry } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { withErrorTrackedRoute } from '@/lib/sentry/api-route-wrapper'

/**
 * Coach AI Live Recommendations
 * Analyzes telemetry in real-time and streams recommendations to coach
 * POST /api/md-coach-live
 * Body: { liveSessionId, lastN: number (default 50) }
 */
async function handler(req: NextRequest) {
  try {
    const { liveSessionId, lastN = 50 } = await req.json()

    if (!liveSessionId) {
      return NextResponse.json({ error: 'Missing liveSessionId' }, { status: 400 })
    }

    // Get the live session
    const liveSession = await db
      .select()
      .from(mdLiveSessions)
      .where(eq(mdLiveSessions.id, liveSessionId))
      .limit(1)
      .then(rows => rows[0])

    if (!liveSession) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 })
    }

    // Get recent telemetry points
    const recentTelemetry = await db
      .select()
      .from(mdLiveTelemetry)
      .where(eq(mdLiveTelemetry.liveSessionId, liveSessionId))
      .orderBy(desc(mdLiveTelemetry.createdAt))
      .limit(lastN)

    if (recentTelemetry.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'Awaiting telemetry data...',
      })
    }

    // Analyze telemetry and generate recommendations
    const recommendations = analyzeForRecommendations(recentTelemetry, liveSession)

    return NextResponse.json({
      ok: true,
      sessionId: liveSessionId,
      riderEmail: liveSession.riderEmail,
      currentLap: liveSession.currentLap,
      bestLap: liveSession.bestLapSeconds,
      recommendations,
    })
  } catch (error) {
    console.error('[Coach AI Live] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withErrorTrackedRoute(handler, 'md-coach-live')

/**
 * Analyze telemetry and generate AI recommendations
 */
function analyzeForRecommendations(telemetry: any[], liveSession: any) {
  const recommendations: any[] = []

  if (telemetry.length === 0) return recommendations

  // Calculate averages
  const avgSpeed = telemetry.reduce((sum, t) => sum + (t.speed || 0), 0) / telemetry.length
  const avgThrottle = telemetry.reduce((sum, t) => sum + (t.throttle || 0), 0) / telemetry.length
  const avgBrake = telemetry.reduce((sum, t) => sum + (t.brakePressure || 0), 0) / telemetry.length
  const maxEngineTemp = Math.max(...telemetry.map(t => t.engineTempC || 0))
  const maxGLateral = Math.max(...telemetry.map(t => Math.abs(t.gLateral || 0)))

  // Recommendation 1: Throttle Control
  if (avgThrottle > 75) {
    recommendations.push({
      type: 'THROTTLE_MANAGEMENT',
      priority: 'MEDIUM',
      message: `High average throttle (${Math.round(avgThrottle)}%). Consider smoother transitions to preserve traction.`,
      actionable: true,
      estimate: 'Could gain 0.2s per lap with smoother inputs',
    })
  }

  // Recommendation 2: Engine Temperature
  if (maxEngineTemp > 105) {
    recommendations.push({
      type: 'ENGINE_MANAGEMENT',
      priority: 'HIGH',
      message: `Engine temp peaked at ${Math.round(maxEngineTemp)}°C. Monitor coolant and radiator.`,
      actionable: true,
      estimate: 'Risk of engine damage if >115°C',
    })
  }

  // Recommendation 3: Brake Modulation
  if (avgBrake > 0 && avgBrake < 30) {
    recommendations.push({
      type: 'BRAKE_OPTIMIZATION',
      priority: 'LOW',
      message: `Average brake pressure is low (${Math.round(avgBrake)}%). You may be able to brake harder into corners.`,
      actionable: true,
      estimate: 'Could gain 0.1-0.3s per lap',
    })
  }

  // Recommendation 4: Lean Angle / Cornering
  if (maxGLateral > 1.5) {
    recommendations.push({
      type: 'CORNERING',
      priority: 'MEDIUM',
      message: `Lateral G-forces reached ${maxGLateral.toFixed(1)}G. You're pushing grip to the limit - maintain consistency.`,
      actionable: false,
      estimate: 'Operating near maximum adhesion',
    })
  }

  // Recommendation 5: Pace Trend
  if (liveSession.currentLap > 3) {
    recommendations.push({
      type: 'PACE_TREND',
      priority: 'INFO',
      message: `Current lap: ${liveSession.currentLap} | Best lap: ${liveSession.bestLapSeconds?.toFixed(2)}s | Avg speed: ${Math.round(avgSpeed)} km/h`,
      actionable: false,
      estimate: 'Monitor for improvement',
    })
  }

  return recommendations
}
