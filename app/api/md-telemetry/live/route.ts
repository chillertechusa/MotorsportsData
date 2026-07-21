import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory WebSocket manager
// In production, use Socket.IO or dedicated WebSocket service
const connections = new Map<string, Set<any>>()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  // This endpoint is for WebSocket upgrades
  // The actual WebSocket connection is handled by Next.js middleware
  // For now, return a placeholder that indicates the WebSocket should be established

  return NextResponse.json({
    ok: true,
    message: 'WebSocket connection ready',
    sessionId,
  })
}

/**
 * Broadcast telemetry to all connected coaches watching this session
 */
export function broadcastTelemetry(sessionId: string, data: any) {
  const coaches = connections.get(sessionId)
  if (!coaches) return

  coaches.forEach(coach => {
    try {
      coach.send(JSON.stringify(data))
    } catch (err) {
      console.error('[Broadcast] Send error:', err)
      coaches.delete(coach)
    }
  })
}
