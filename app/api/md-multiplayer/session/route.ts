import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { getTeamActiveSessions, updateSessionMetrics } from '@/lib/multiplayer-session-manager'
import { getTeamLeaderboard } from '@/lib/team-leaderboard'

export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const view = searchParams.get('view') || 'sessions'

    if (view === 'leaderboard') {
      const leaderboard = await getTeamLeaderboard(auth.teamId)
      return NextResponse.json({ leaderboard })
    }

    // Default: return all active sessions
    const sessions = await getTeamActiveSessions(auth.teamId)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('[v0] Multiplayer session GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, metrics } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    await updateSessionMetrics(sessionId, metrics)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Multiplayer session PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
