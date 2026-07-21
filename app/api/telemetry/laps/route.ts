import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/telemetry/laps
 * Query lap data for a session
 * Query params: sessionId, riderId
 */
export async function GET(request: NextRequest) {
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

    // TODO: Query from lap_data table
    return NextResponse.json({
      success: true,
      laps: [],
    })
  } catch (err) {
    console.error('[v0] Laps error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
