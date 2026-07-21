import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { getTeamLeaderboard, invalidateLeaderboard } from '@/lib/team-leaderboard'

export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const sendUpdate = async () => {
          try {
            const leaderboard = await getTeamLeaderboard(auth.teamId)
            controller.enqueue(
              `data: ${JSON.stringify({ leaderboard, timestamp: Date.now() })}\n\n`
            )
          } catch (error) {
            console.error('[v0] Leaderboard stream error:', error)
            controller.close()
          }
        }

        // Send initial state
        await sendUpdate()

        // Send updates every 1 second
        const interval = setInterval(sendUpdate, 1000)

        // Cleanup on connection close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[v0] Leaderboard stream GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
