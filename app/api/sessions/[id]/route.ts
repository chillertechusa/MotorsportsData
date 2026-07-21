import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs, mdTeamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user's team
    const member = await db
      .select({ teamId: mdTeamMembers.teamId })
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.userId, session.user.id))
      .limit(1)

    if (!member || member.length === 0) {
      return NextResponse.json({ error: 'User not in a team' }, { status: 400 })
    }

    const teamId = member[0].teamId

    // Fetch session with team isolation
    const sessionData = await db
      .select()
      .from(mdSessions)
      .where(and(eq(mdSessions.id, id), eq(mdSessions.teamId, teamId)))
      .limit(1)

    if (!sessionData || sessionData.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch setup logs for this session
    const setupLogs = await db
      .select()
      .from(mdSetupLogs)
      .where(eq(mdSetupLogs.sessionId, id))

    return NextResponse.json({
      ok: true,
      session: sessionData[0],
      setupLogs,
    })
  } catch (error) {
    console.error('[v0] Session detail failed:', error)
    return NextResponse.json({ error: 'Failed to fetch session', details: String(error) }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get user's team
    const member = await db
      .select({ teamId: mdTeamMembers.teamId })
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.userId, session.user.id))
      .limit(1)

    if (!member || member.length === 0) {
      return NextResponse.json({ error: 'User not in a team' }, { status: 400 })
    }

    const teamId = member[0].teamId

    // Verify session belongs to user's team
    const sessionExists = await db
      .select()
      .from(mdSessions)
      .where(and(eq(mdSessions.id, id), eq(mdSessions.teamId, teamId)))
      .limit(1)

    if (!sessionExists || sessionExists.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Update session
    const updated = await db
      .update(mdSessions)
      .set({
        trackConditions: body.trackConditions,
        riderFeedback: body.riderFeedback,
        bestLapSeconds: body.bestLapSeconds,
        sessionHours: body.sessionHours,
      })
      .where(eq(mdSessions.id, id))
      .returning()

    return NextResponse.json({ ok: true, session: updated[0] })
  } catch (error) {
    console.error('[v0] Session update failed:', error)
    return NextResponse.json({ error: 'Failed to update session', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user's team
    const member = await db
      .select({ teamId: mdTeamMembers.teamId })
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.userId, session.user.id))
      .limit(1)

    if (!member || member.length === 0) {
      return NextResponse.json({ error: 'User not in a team' }, { status: 400 })
    }

    const teamId = member[0].teamId

    // Verify session belongs to user's team
    const sessionExists = await db
      .select()
      .from(mdSessions)
      .where(and(eq(mdSessions.id, id), eq(mdSessions.teamId, teamId)))
      .limit(1)

    if (!sessionExists || sessionExists.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Delete session
    await db.delete(mdSessions).where(eq(mdSessions.id, id))

    return NextResponse.json({ ok: true, deleted: id })
  } catch (error) {
    console.error('[v0] Session delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete session', details: String(error) }, { status: 500 })
  }
}
