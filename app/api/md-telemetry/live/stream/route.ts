import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdLiveSessions, mdLiveAlerts, mdLiveTelemetry } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

interface StreamMessage {
  type: 'telemetry' | 'alert' | 'session-update' | 'keepalive'
  data: Record<string, unknown>
  timestamp: number
}

/** SSE endpoint for real-time live telemetry + alerts */
export async function GET(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const liveSessionId = searchParams.get('liveSessionId')

  if (!liveSessionId) {
    return NextResponse.json({ error: 'Missing liveSessionId' }, { status: 400 })
  }

  // Verify session belongs to user's team
  const session = await db
    .select()
    .from(mdLiveSessions)
    .where(
      and(
        eq(mdLiveSessions.id, liveSessionId),
        eq(mdLiveSessions.teamId, auth.teamId)
      )
    )
    .then((r) => r[0])

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Set up SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  }

  const encoder = new TextEncoder()

  // Create readable stream for SSE
  const readable = new ReadableStream({
    async start(controller) {
      let lastTelemetryId = 0
      let lastAlertId = 0
      const pollIntervalMs = 1000 // Poll every 1 second

      const poll = async () => {
        try {
          // Fetch new telemetry since last poll
          const newTelemetry = await db
            .select()
            .from(mdLiveTelemetry)
            .where(eq(mdLiveTelemetry.liveSessionId, liveSessionId))
            .orderBy(desc(mdLiveTelemetry.createdAt))
            .limit(10)

          for (const point of newTelemetry) {
            if (Number(point.id) > lastTelemetryId) {
              lastTelemetryId = Number(point.id) || lastTelemetryId
              const message: StreamMessage = {
                type: 'telemetry',
                data: point,
                timestamp: Date.now(),
              }
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify(message)}\n\n`
                )
              )
            }
          }

          // Fetch new alerts since last poll
          const newAlerts = await db
            .select()
            .from(mdLiveAlerts)
            .where(eq(mdLiveAlerts.liveSessionId, liveSessionId))
            .orderBy(desc(mdLiveAlerts.createdAt))
            .limit(10)

          for (const alert of newAlerts) {
            if (Number(alert.id) > lastAlertId) {
              lastAlertId = Number(alert.id) || lastAlertId
              const message: StreamMessage = {
                type: 'alert',
                data: alert,
                timestamp: Date.now(),
              }
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify(message)}\n\n`
                )
              )
            }
          }

          // Send keepalive every 10 polls
          if (Math.random() < 0.1) {
            const keepalive: StreamMessage = {
              type: 'keepalive',
              data: { status: 'connected' },
              timestamp: Date.now(),
            }
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify(keepalive)}\n\n`
              )
            )
          }
        } catch (error) {
          console.error('[Live Stream] Poll error:', error)
          controller.error(error)
        }
      }

      // Start polling
      const pollInterval = setInterval(poll, pollIntervalMs)

      // Clean up on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(pollInterval)
        controller.close()
      })
    },
  })

  return new NextResponse(readable, { headers })
}
