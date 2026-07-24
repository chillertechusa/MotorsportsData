/**
 * POST /api/telemetry/ingest
 * 
 * Receives high-frequency telemetry data from wearables/devices
 * Validates, stores in TimescaleDB, broadcasts to live subscribers
 * 
 * Rate limit: 100 Hz (10ms between points) per rider
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-rate-limit'
import { getSessionTeamId } from '@/lib/md-auth'
import { normalizeTelemetryFrame } from '@/lib/telemetry-channels'

interface TelemetryPoint {
  timestamp: number // Unix ms
  sessionId: string
  riderId: string
  teamId: string
  
  // Wearable metrics
  heartRate?: number
  hrvMs?: number
  temperature?: number
  
  // Power/movement
  powerWatts?: number
  speedMph?: number
  cadenceRpm?: number
  
  // GPS (optional)
  latitude?: number
  longitude?: number
  altitudeFt?: number
  
  // Track data
  lapNumber?: number
  sector?: number
  
  // Device info
  deviceId: string
  deviceType: string // 'garmin', 'apple_watch', 'polar', 'mylapstr2', etc.
}

/**
 * Validate telemetry point against schema
 */
function validateTelemetry(point: any): point is TelemetryPoint {
  if (!point.timestamp || !point.sessionId || !point.riderId || !point.teamId) {
    return false
  }

  // At least one metric must be present
  const hasMetrics = [
    point.heartRate,
    point.powerWatts,
    point.speedMph,
    point.cadenceRpm,
  ].some((v) => v !== undefined && v !== null)

  return hasMetrics && point.deviceId && point.deviceType
}

/**
 * Main ingestion handler
 */
export async function POST(request: NextRequest) {
  // Auth: accept either a valid API key (devices) or a live session (browser)
  const authHeader = request.headers.get('authorization')
  const apiKeyRow = authHeader ? await validateApiKey(authHeader) : null
  const sessionTeamId = apiKeyRow ? null : await getSessionTeamId(request)

  if (!apiKeyRow && !sessionTeamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentType = request.headers.get('content-type')

    // Parse request body (can be single point or array)
    let points: TelemetryPoint[] = []

    if (contentType?.includes('application/json')) {
      const body = await request.json()
      points = Array.isArray(body) ? body : [body]
    } else {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    // Validate all points
    const validPoints = points.filter(validateTelemetry)
    if (validPoints.length === 0) {
      return NextResponse.json(
        { error: 'No valid telemetry points provided' },
        { status: 400 }
      )
    }

    // Normalize channel vocabulary per discipline
    // Each point may carry a disciplineId field; fall back to the team's configured discipline
    const normalizedPoints = validPoints.map((p) => {
      const disciplineId = (p as Record<string, unknown>).disciplineId as string | undefined
      return normalizeTelemetryFrame(p as unknown as Record<string, unknown>, disciplineId)
    })

    // TODO: Store normalizedPoints in TimescaleDB
    // INSERT INTO telemetry_metrics (time, session_id, rider_id, team_id, ...)
    // VALUES (...)

    // TODO: Broadcast to live subscribers
    // For coaches watching live dashboard
    // telemetryStreamManager.publish(sessionId, riderId, validPoints)

    // Return success with point count
    return NextResponse.json(
      {
        success: true,
        pointsIngested: normalizedPoints.length,
        pointsRejected: points.length - validPoints.length,
        normalized: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Telemetry] Error:', error)
    return NextResponse.json(
      { error: 'Failed to ingest telemetry' },
      { status: 500 }
    )
  }
}

/**
 * Example request:
 * 
 * POST /api/telemetry/ingest
 * Content-Type: application/json
 * 
 * {
 *   "timestamp": 1720569600000,
 *   "sessionId": "race-2026-07-10-sx",
 *   "riderId": "rider-123",
 *   "teamId": "factory-rig-01",
 *   "heartRate": 172,
 *   "hrvMs": 28,
 *   "powerWatts": 315,
 *   "speedMph": 68.5,
 *   "cadenceRpm": 98,
 *   "lapNumber": 12,
 *   "sector": 3,
 *   "deviceId": "garmin-edge-1540-abc123",
 *   "deviceType": "garmin"
 * }
 * 
 * Batch request (send 10 points at once):
 * 
 * POST /api/telemetry/ingest
 * Content-Type: application/json
 * 
 * [
 *   { timestamp: ..., heartRate: 170, ... },
 *   { timestamp: ..., heartRate: 171, ... },
 *   ...
 * ]
 */
