/**
 * POST /api/sessions/[id]/control - Start or stop a session
 */

import { NextRequest, NextResponse } from 'next/server'

interface ControlRequest {
  action: 'start' | 'stop' | 'complete'
  notes?: string
}

interface Params {
  id: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: sessionId } = await params
    const body: ControlRequest = await request.json()

    const { action, notes } = body

    if (!['start', 'stop', 'complete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: start, stop, or complete' },
        { status: 400 }
      )
    }

    console.log(`[Sessions] ${action.toUpperCase()} session ${sessionId}`)

    // TODO: In production, update database
    // UPDATE md_sessions SET status = ?, end_time = NOW() WHERE id = ?
    // INSERT INTO md_session_uploads (...)

    const now = new Date().toISOString()

    const response = {
      sessionId,
      action,
      timestamp: now,
      status:
        action === 'start'
          ? 'active'
          : action === 'complete'
            ? 'completed'
            : 'paused',
      message: `Session ${action}ed successfully`,
      notes,
    }

    // When session stops, trigger auto-upload of telemetry
    if (action === 'stop' || action === 'complete') {
      console.log(`[Sessions] Triggering telemetry upload for ${sessionId}`)
      // TODO: Call /api/sessions/[id]/upload-telemetry
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    console.error('[Sessions] Error controlling session:', error)
    return NextResponse.json(
      { error: 'Failed to control session' },
      { status: 500 }
    )
  }
}
