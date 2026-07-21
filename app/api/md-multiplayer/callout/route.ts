import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdLiveAlerts } from '@/lib/db/schema'

export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, broadcast } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Log strategy callout as an alert for the team
    if (broadcast) {
      // TODO: Broadcast to team via WebSocket or notify all active sessions
      console.log(`[v0] Coach callout: ${message}`)
    }

    return NextResponse.json({
      success: true,
      callout: {
        coach: 'Coach',
        message,
        timestamp: new Date(),
        broadcast,
      },
    })
  } catch (error) {
    console.error('[v0] Callout POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
