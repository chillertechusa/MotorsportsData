import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-rate-limit'
import { getSessionTeamId } from '@/lib/md-auth'

/**
 * GET /api/telemetry/metrics
 * Query telemetry data for a session — requires API key or valid session.
 * Query params: sessionId, riderId, startTime, endTime
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const apiKeyRow = authHeader ? await validateApiKey(authHeader) : null
  const sessionTeamId = apiKeyRow ? null : await getSessionTeamId(request)
  if (!apiKeyRow && !sessionTeamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const riderId = searchParams.get('riderId')

    if (!sessionId || !riderId) {
      return NextResponse.json(
        { error: 'Missing sessionId or riderId' },
        { status: 400 }
      )
    }

    // TODO: Query from TimescaleDB telemetry_metrics hypertable
    // For now, return mock data
    return NextResponse.json({
      success: true,
      metrics: [],
    })
  } catch (err) {
    console.error('[v0] Telemetry error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
