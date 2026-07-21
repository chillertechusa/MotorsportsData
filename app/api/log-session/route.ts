import { NextResponse } from 'next/server'
import { sql, eq, desc, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs, mdVehicles } from '@/lib/db/schema'
import { getSessionTeamId, assertVehicleOwnership } from '@/lib/md-auth'

type SetupEntry = { key: string; value: string }

// Read recent session history + saved setup values for a vehicle (ownership-checked).
export async function GET(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { searchParams } = new URL(req.url)
  const vehicleId = searchParams.get('vehicleId')
  if (!vehicleId) {
    return NextResponse.json({ success: false, error: 'vehicleId is required.' }, { status: 400 })
  }

  const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ success: false, error: 'Vehicle does not belong to your team.' }, { status: 403 })
  }

  try {
    const sessions = await db
      .select({
        id: mdSessions.id,
        trackName: mdSessions.trackName,
        trackConditions: mdSessions.trackConditions,
        riderFeedback: mdSessions.riderFeedback,
        sessionDate: mdSessions.sessionDate,
        createdAt: mdSessions.createdAt,
      })
      .from(mdSessions)
      .where(eq(mdSessions.vehicleId, vehicleId))
      .orderBy(desc(mdSessions.createdAt))
      .limit(25)

    // Pull all setup rows for these sessions in one query, then group in memory.
    const sessionIds = sessions.map((s) => s.id)
    const setupRows = sessionIds.length
      ? await db
          .select({
            sessionId: mdSetupLogs.sessionId,
            parameterKey: mdSetupLogs.parameterKey,
            parameterValue: mdSetupLogs.parameterValue,
          })
          .from(mdSetupLogs)
          .where(inArray(mdSetupLogs.sessionId, sessionIds))
      : []

    const grouped = sessions.map((s) => ({
      ...s,
      setup: setupRows
        .filter((r) => r.sessionId === s.id)
        .map((r) => ({ key: r.parameterKey, value: r.parameterValue })),
    }))

    return NextResponse.json({ success: true, sessions: grouped })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to load session history.' }, { status: 500 })
  }
}

type LogSessionBody = {
  vehicleId: string
  trackName: string
  trackConditions?: string
  riderFeedback?: string
  sessionDate?: string
  setup?: SetupEntry[]
  sessionHours?: number
  bestLapSeconds?: number
}

export async function POST(req: Request) {
  // Phase 1: authenticate + resolve team
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  let body: LogSessionBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { vehicleId, trackName, trackConditions, riderFeedback, sessionDate, setup = [], sessionHours = 0, bestLapSeconds } = body

  if (!vehicleId || !trackName?.trim()) {
    return NextResponse.json(
      { success: false, error: 'vehicleId and trackName are required.' },
      { status: 400 },
    )
  }

  // Phase 1: block cross-team vehicle injection
  const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ success: false, error: 'Vehicle does not belong to your team.' }, { status: 403 })
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Insert the session (the parent record)
      const [session] = await tx
        .insert(mdSessions)
        .values({
          teamId: authResult.teamId,
          vehicleId,
          trackName: trackName.trim(),
          trackConditions: trackConditions?.trim() || null,
          riderFeedback: riderFeedback?.trim() || null,
          sessionDate: sessionDate || undefined,
          sessionHours: sessionHours > 0 ? sessionHours : 0,
          bestLapSeconds: typeof bestLapSeconds === 'number' && bestLapSeconds > 0 ? bestLapSeconds : null,
        })
        .returning({ id: mdSessions.id })

      // 2. Bulk-insert the setup parameters tied to that session
      const rows = setup
        .filter((s) => s.key?.trim() && s.value?.toString().trim())
        .map((s) => ({
          teamId: authResult.teamId,
          sessionId: session.id,
          parameterKey: s.key.trim(),
          parameterValue: s.value.toString().trim(),
        }))
      if (rows.length) await tx.insert(mdSetupLogs).values(rows)

      // 3. Advance the vehicle's engine hours by this session's run time
      if (sessionHours > 0) {
        await tx
          .update(mdVehicles)
          .set({ engineHours: sql`${mdVehicles.engineHours} + ${sessionHours}` })
          .where(eq(mdVehicles.id, vehicleId))
      }

      return session.id
    })

    return NextResponse.json({ success: true, sessionId: result })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to save session.' }, { status: 500 })
  }
}
