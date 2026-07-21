import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdSessions, mdVehicles, mdTeamMembers, mdSessionMetrics } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

/**
 * POST /api/sessions - Create a new session with lap data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      vehicleId,
      trackName,
      trackConditions,
      bestLapSeconds,
      sessionHours,
      riderFeedback,
      ambientTempF,
      humidityPct,
      windMph,
      trackSurface,
      tireFront,
      tireRear,
      tirePressureFront,
      tirePressureRear,
      fuelMix,
      jetNeedle,
      airFilterCondition,
      engineMap,
    } = body

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

    // Verify vehicle belongs to this team
    const vehicle = await db
      .select()
      .from(mdVehicles)
      .where(and(eq(mdVehicles.id, vehicleId), eq(mdVehicles.teamId, teamId)))
      .limit(1)

    if (!vehicle || vehicle.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Create session
    const result = await db
      .insert(mdSessions)
      .values({
        teamId,
        vehicleId,
        trackName,
        trackConditions,
        bestLapSeconds,
        sessionHours: sessionHours || 0,
        riderFeedback,
        ambientTempF,
        humidityPct,
        windMph,
        trackSurface,
        tireFront,
        tireRear,
        tirePressureFront,
        tirePressureRear,
        fuelMix,
        jetNeedle,
        airFilterCondition,
        engineMap,
      })
      .returning()

    const newSession = result[0]

    // Track event
    await db.insert(mdSessionMetrics).values({
      sessionId: newSession.id,
      teamId,
      bestLapSeconds: bestLapSeconds || 0,
      avgLapSeconds: bestLapSeconds || 0,
      improvementTrend: 0,
    }).catch(() => {})

    return NextResponse.json({ ok: true, session: newSession }, { status: 201 })
  } catch (error) {
    console.error('[v0] Session POST failed:', error)
    return NextResponse.json({ error: 'Failed to create session', details: String(error) }, { status: 500 })
  }
}

/**
 * GET /api/sessions - List sessions for user's team
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Build query
    const filters = [eq(mdSessions.teamId, teamId)]
    if (vehicleId) {
      filters.push(eq(mdSessions.vehicleId, vehicleId))
    }

    const rows = await db
      .select()
      .from(mdSessions)
      .where(and(...filters))
      .orderBy(desc(mdSessions.createdAt))
      .limit(limit)
      .offset(offset)

    // Map raw DB rows to the shape the RaceControl UI expects, with safe
    // defaults so no field is ever undefined/null at render time.
    const sessions = rows.map((s) => ({
      id: s.id,
      name: s.trackName ?? 'Untitled Session',
      discipline: s.trackSurface ?? 'motocross',
      location: s.trackConditions ?? undefined,
      // These are logged setup-sheet records (no live lifecycle), so they are
      // always treated as completed sessions.
      status: 'completed' as const,
      startTime: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
      endTime: undefined,
      riderCount: 1,
      totalTelemetryPoints: 0,
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : '',
      // Keep the raw setup-sheet fields available for detail views.
      trackName: s.trackName,
      bestLapSeconds: s.bestLapSeconds,
      trackConditions: s.trackConditions,
    }))

    return NextResponse.json({
      ok: true,
      sessions,
      count: sessions.length,
    })
  } catch (error) {
    console.error('[v0] Session GET failed:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions', details: String(error) }, { status: 500 })
  }
}
