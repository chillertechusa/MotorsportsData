import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdLiveSessions, mdLiveTelemetry, mdLiveAlerts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { checkRateLimit } from '@/lib/cache'
import { withErrorTrackedRoute } from '@/lib/sentry/api-route-wrapper'

interface TelemetryPoint {
  timestamp: number
  lapNumber: number
  lapTimeSeconds?: number
  speed: number
  throttle: number
  brakePressure?: number
  tirePressFront?: number
  tirePressRear?: number
  engineTempC?: number
  engineRpmK?: number
  gLateral?: number
  gLongitudinal?: number
  suspensionTravelFront?: number
  suspensionTravelRear?: number
  gpsLat?: number
  gpsLon?: number
  deviceTimestamp: number
}

interface IngestPayload {
  sessionToken: string
  deviceId: string
  telemetry: TelemetryPoint[]
}

async function handler(req: NextRequest) {
  try {
    const deviceId = req.headers.get('x-device-id') || 'unknown'

    // Redis sliding-window rate limit: 10 req/sec per device (multi-instance safe)
    const { allowed, remaining, resetInSeconds } = await checkRateLimit(
      `telemetry:${deviceId}`,
      10,   // limit
      1     // window (seconds)
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limited: max 10 requests/sec per device' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit':     '10',
            'X-RateLimit-Remaining': String(remaining),
            'Retry-After':           String(resetInSeconds),
          },
        }
      )
    }

    const payload: IngestPayload = await req.json()

    if (!payload.sessionToken || !payload.deviceId || !Array.isArray(payload.telemetry)) {
      return NextResponse.json(
        { error: 'Invalid payload: missing sessionToken, deviceId, or telemetry array' },
        { status: 400 }
      )
    }

    if (payload.telemetry.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0 })
    }

    // Find active live session
    const liveSession = await db
      .select()
      .from(mdLiveSessions)
      .where(
        and(
          eq(mdLiveSessions.sessionToken, payload.sessionToken),
          eq(mdLiveSessions.deviceId, payload.deviceId),
          eq(mdLiveSessions.isActive, true)
        )
      )
      .limit(1)
      .then(rows => rows[0])

    if (!liveSession) {
      return NextResponse.json(
        { error: 'No active live session found for this token/device' },
        { status: 403 }
      )
    }

    const telemetryInserts = payload.telemetry.map(point => ({
      liveSessionId:          liveSession.id,
      timestamp:              new Date(point.timestamp),
      lapNumber:              point.lapNumber,
      lapTimeSeconds:         point.lapTimeSeconds     ?? null,
      speed:                  point.speed,
      throttle:               point.throttle,
      brakePressure:          point.brakePressure      ?? null,
      tirePressFront:         point.tirePressFront     ?? null,
      tirePressRear:          point.tirePressRear      ?? null,
      engineTempC:            point.engineTempC        ?? null,
      engineRpmK:             point.engineRpmK         ?? null,
      gLateral:               point.gLateral           ?? null,
      gLongitudinal:          point.gLongitudinal      ?? null,
      suspensionTravelFront:  point.suspensionTravelFront ?? null,
      suspensionTravelRear:   point.suspensionTravelRear  ?? null,
      gpsLat:                 point.gpsLat             ?? null,
      gpsLon:                 point.gpsLon             ?? null,
      deviceTimestamp:        point.deviceTimestamp,
    }))

    // Detect anomalies then flush inserts in parallel
    const alerts = detectAnomalies(payload.telemetry, liveSession.id)

    const lastPoint = payload.telemetry[payload.telemetry.length - 1]
    const currentBestLap = liveSession.bestLapSeconds
    const isNewBest =
      lastPoint.lapTimeSeconds !== undefined &&
      (!currentBestLap || lastPoint.lapTimeSeconds < currentBestLap)

    // Run all three DB operations in parallel
    await Promise.all([
      db.insert(mdLiveTelemetry).values(telemetryInserts).then(() => void 0),
      (alerts.length > 0 ? db.insert(mdLiveAlerts).values(alerts) : Promise.resolve()).then(() => void 0),
      lastPoint.lapTimeSeconds
        ? db
            .update(mdLiveSessions)
            .set({
              currentLap:            lastPoint.lapNumber,
              bestLapSeconds:        isNewBest ? lastPoint.lapTimeSeconds : currentBestLap,
              sessionDurationSeconds: Math.round(
                (Date.now() - (liveSession.streamStartedAt?.getTime() || 0)) / 1000
              ),
              updatedAt: new Date(),
            })
            .where(eq(mdLiveSessions.id, liveSession.id))
        : Promise.resolve(),
    ])

    return NextResponse.json({
      ok:             true,
      inserted:       telemetryInserts.length,
      alertsGenerated: alerts.length,
      bestLap:        isNewBest ? lastPoint.lapTimeSeconds : currentBestLap,
      currentLap:     lastPoint.lapNumber,
      rateLimitRemaining: remaining,
    })
  } catch (error) {
    console.error('[Telemetry Ingest] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error processing telemetry' },
      { status: 500 }
    )
  }
}

export const POST = withErrorTrackedRoute(handler, 'md-telemetry/ingest')

function detectAnomalies(telemetry: TelemetryPoint[], liveSessionId: string) {
  const alerts: {
    liveSessionId: string
    alertType: string
    severity: string
    message: string
    triggerData: Record<string, number>
    recommendation: string
  }[] = []

  for (const point of telemetry) {
    if (point.engineTempC && point.engineTempC > 100) {
      alerts.push({
        liveSessionId,
        alertType: 'ENGINE_OVERHEAT',
        severity: point.engineTempC > 110 ? 'CRITICAL' : 'WARNING',
        message: `Engine temp: ${point.engineTempC.toFixed(1)}\u00b0C`,
        triggerData: { engineTempC: point.engineTempC },
        recommendation: 'Monitor radiator; consider pit stop if temp >110\u00b0C',
      })
    }

    if (point.tirePressFront && (point.tirePressFront < 25 || point.tirePressFront > 35)) {
      alerts.push({
        liveSessionId,
        alertType: 'TIRE_PRESSURE',
        severity: point.tirePressFront < 20 ? 'CRITICAL' : 'WARNING',
        message: `Front tire pressure: ${point.tirePressFront.toFixed(1)} PSI`,
        triggerData: { tirePressFront: point.tirePressFront },
        recommendation: 'Check for punctures or valve leaks; pit stop recommended',
      })
    }

    if (point.gLateral && Math.abs(point.gLateral) > 1.8) {
      alerts.push({
        liveSessionId,
        alertType: 'EXTREME_LATERAL_G',
        severity: 'WARNING',
        message: `Extreme lateral G: ${Math.abs(point.gLateral).toFixed(2)}G`,
        triggerData: { gLateral: point.gLateral },
        recommendation: 'Reduce entry speed or increase tire grip',
      })
    }
  }

  return alerts
}
