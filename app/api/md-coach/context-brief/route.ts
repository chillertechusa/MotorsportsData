import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdRiderReadiness, mdCoachAssignments, mdAssignmentAuditLog, mdAlertEvents, mdSessions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { calculateReadinessScore } from '@/lib/md-readiness'

/**
 * Gather AI context brief for a rider before the AI responds
 * Returns: readiness, compliance, alerts, recent performance deltas
 */
export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { riderId } = await req.json()
    if (!riderId) {
      return NextResponse.json({ error: 'riderId required' }, { status: 400 })
    }

    // Get latest readiness entry
    const readinessEntries = await db
      .select()
      .from(mdRiderReadiness)
      .where(eq(mdRiderReadiness.teamId, auth.teamId))
      .orderBy(desc(mdRiderReadiness.entryDate))
      .limit(1)

    const latestReadiness = readinessEntries[0]

    // Calculate readiness score if we have the data
    let readinessScore = null
    if (latestReadiness) {
      const sessions = await db
        .select()
        .from(mdSessions)
        .orderBy(desc(mdSessions.sessionDate))
        .limit(7)

      const trackVolumeMinutes = sessions.reduce((sum, s) => {
        const hours = s.sessionHours ? parseFloat(s.sessionHours.toString()) : 0
        return sum + hours * 60
      }, 0)

      readinessScore = calculateReadinessScore({
        sleepHours: latestReadiness.sleepHours ? parseFloat(latestReadiness.sleepHours.toString()) : 7,
        sleepQuality: latestReadiness.sleepScore ?? 75,
        hrv: latestReadiness.hrv ?? 50,
        trackVolumeMinutes,
        lastHardSessionMinutes: sessions[0]?.sessionHours ? parseFloat(sessions[0].sessionHours.toString()) * 60 : 0,
        temperature: 37.0,
        daysUntilRace: 3,
      })
    }

    // Get open assignments and compliance status
    const assignments = await db
      .select()
      .from(mdCoachAssignments)
      .where(eq(mdCoachAssignments.teamId, auth.teamId))
      .orderBy(desc(mdCoachAssignments.assignedAt))
      .limit(5)

    const acknowledgedCount = assignments.filter((a) => a.acknowledgedAt).length
    const complianceRate = assignments.length > 0 ? Math.round((acknowledgedCount / assignments.length) * 100) : 0

    // Get recent alerts
    const alerts = await db
      .select()
      .from(mdAlertEvents)
      .where(eq(mdAlertEvents.teamId, auth.teamId))
      .orderBy(desc(mdAlertEvents.firedAt))
      .limit(5)

    const activeAlerts = alerts.filter((a) => {
      const firedTime = new Date(a.firedAt).getTime()
      const now = new Date().getTime()
      return now - firedTime < 24 * 60 * 60 * 1000 // Last 24 hours
    })

    // Get recent performance (last 2 sessions for comparison)
    const recentSessions = await db
      .select()
      .from(mdSessions)
      .orderBy(desc(mdSessions.sessionDate))
      .limit(2)

    const lastSession = recentSessions[0]
    const previousSession = recentSessions[1]

    let performanceDelta = null
    if (lastSession?.bestLapSeconds && previousSession?.bestLapSeconds) {
      // Positive = faster (improvement)
      const lapTimeDiff = previousSession.bestLapSeconds - lastSession.bestLapSeconds
      performanceDelta = {
        lapTimeDelta: (lapTimeDiff / previousSession.bestLapSeconds) * 100,
        hoursDelta:
          ((parseFloat(lastSession.sessionHours?.toString() ?? '0') - parseFloat(previousSession.sessionHours?.toString() ?? '0')) /
            parseFloat(previousSession.sessionHours?.toString() ?? '1')) *
          100,
      }
    }

    return NextResponse.json({
      success: true,
      context: {
        readiness: readinessScore
          ? {
              score: readinessScore.overall,
              confidence: readinessScore.confidence,
              status:
                readinessScore.overall >= 90
                  ? 'peak'
                  : readinessScore.overall >= 75
                    ? 'optimal'
                    : readinessScore.overall >= 60
                      ? 'ready'
                      : 'fatigued',
              peakProbability: readinessScore.peakProbability,
              recommendation: readinessScore.tapperRecommendation,
            }
          : null,
        compliance: {
          rate: complianceRate,
          acknowledged: acknowledgedCount,
          total: assignments.length,
          status: complianceRate >= 80 ? 'excellent' : complianceRate >= 60 ? 'good' : 'needs-attention',
        },
        alerts: activeAlerts.map((a) => ({
          type: a.alertType,
          message: a.alertType,
          severity: 'info',
          firedAt: a.firedAt,
        })),
        recentPerformance: {
          lastSession: lastSession
            ? {
                date: lastSession.sessionDate,
                bestLap: lastSession.bestLapSeconds,
              }
            : null,
          delta: performanceDelta,
        },
      },
    })
  } catch (err) {
    console.error('[context-brief] error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
