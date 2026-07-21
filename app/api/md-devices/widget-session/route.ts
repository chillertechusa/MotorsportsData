import { NextResponse } from 'next/server'
import { generateWidgetSession } from '@/lib/terra/client'
import { getSessionTeamId } from '@/lib/md-auth'

export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    // Generate Terra widget session for this team member
    const referenceId = `${auth.teamId}-${auth.userId}-${Date.now()}`
    const session = await generateWidgetSession(referenceId)

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to generate widget session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.session_id,
    })
  } catch (err) {
    console.error('[device-widget] error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
