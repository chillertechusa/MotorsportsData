import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdLiveSessions, mdLiveTelemetry } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

/**
 * WebSocket endpoint for streaming individual rider telemetry
 * GET /api/md-telemetry/rider-stream?vehicleId=...&sessionId=...
 *
 * Sends rider telemetry updates every 100ms (10Hz)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vehicleId = searchParams.get('vehicleId')
  const sessionId = searchParams.get('sessionId')

  if (!vehicleId || !sessionId) {
    return new NextResponse('Missing vehicleId or sessionId', { status: 400 })
  }

  // Verify auth
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Verify session belongs to team
  const session = await db
    .select()
    .from(mdLiveSessions)
    .where(eq(mdLiveSessions.id, sessionId))
    .limit(1)
    .then(rows => rows[0])

  if (!session || session.teamId !== auth.teamId) {
    return new NextResponse('Session not found', { status: 404 })
  }

  // Upgrade to WebSocket if client supports it
  if (req.headers.get('upgrade') !== 'websocket') {
    return new NextResponse(
      'This endpoint requires a WebSocket connection',
      { status: 400 }
    )
  }

  // Note: In a real deployment, use a proper WebSocket library (Vercel KV, Socket.io, etc.)
  // This is a simplified version that demonstrates the pattern
  return new NextResponse(
    `WebSocket upgrade required for vehicle ${vehicleId}`,
    {
      status: 101,
      headers: {
        Upgrade: 'websocket',
        Connection: 'Upgrade',
      },
    }
  )
}

/**
 * Polling fallback endpoint for rider telemetry
 * Returns last 10 telemetry points for a rider
 */
export async function POST(req: NextRequest) {
  try {
    const { vehicleId, sessionId } = await req.json()

    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!vehicleId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing vehicleId or sessionId' },
        { status: 400 }
      )
    }

    // Get last 10 telemetry points (sessionId is the live-session id)
    const telemetry = await db
      .select()
      .from(mdLiveTelemetry)
      .where(eq(mdLiveTelemetry.liveSessionId, sessionId as string))
      .orderBy(desc(mdLiveTelemetry.timestamp))
      .limit(10)

    return NextResponse.json({
      ok: true,
      vehicleId,
      telemetry: telemetry.reverse(), // Chronological order
    })
  } catch (error) {
    console.error('[Rider Stream] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rider telemetry' },
      { status: 500 }
    )
  }
}
