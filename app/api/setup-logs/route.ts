import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdSetupLogs, mdSessions, mdTeamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * POST /api/setup-logs - Add setup parameters to a session
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, parameters } = body // parameters: { [key]: value }

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

    // Verify session belongs to this team
    const sessionRecord = await db
      .select()
      .from(mdSessions)
      .where(and(eq(mdSessions.id, sessionId), eq(mdSessions.teamId, teamId)))
      .limit(1)

    if (!sessionRecord || sessionRecord.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Create setup logs
    const logs: typeof mdSetupLogs.$inferInsert[] = Object.entries(parameters).map(([key, value]) => ({
      teamId,
      sessionId,
      parameterKey: key,
      parameterValue: String(value),
    }))

    const created = await db.insert(mdSetupLogs).values(logs).returning()

    return NextResponse.json({ ok: true, logs: created }, { status: 201 })
  } catch (error) {
    console.error('[v0] Setup logs creation failed:', error)
    return NextResponse.json({ error: 'Failed to create setup logs', details: String(error) }, { status: 500 })
  }
}

/**
 * GET /api/setup-logs?sessionId=... - Get setup logs for a session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

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

    // Verify session belongs to this team
    const sessionRecord = await db
      .select()
      .from(mdSessions)
      .where(and(eq(mdSessions.id, sessionId), eq(mdSessions.teamId, teamId)))
      .limit(1)

    if (!sessionRecord || sessionRecord.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get setup logs
    const logs = await db
      .select()
      .from(mdSetupLogs)
      .where(and(eq(mdSetupLogs.sessionId, sessionId), eq(mdSetupLogs.teamId, teamId)))

    // Convert to object
    const setupObj = logs.reduce((acc, log) => {
      acc[log.parameterKey] = log.parameterValue
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({ ok: true, setup: setupObj, logs })
  } catch (error) {
    console.error('[v0] Setup logs fetch failed:', error)
    return NextResponse.json({ error: 'Failed to fetch setup logs', details: String(error) }, { status: 500 })
  }
}
