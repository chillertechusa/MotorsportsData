import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { getSessionTeamId, assertVehicleOwnership } from '@/lib/md-auth'

export async function POST(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { session1Id, session2Id } = (await req.json()) as {
      session1Id?: string
      session2Id?: string
    }

    if (!session1Id || !session2Id) {
      return NextResponse.json({ error: 'session1Id and session2Id required' }, { status: 400 })
    }

    // Load both sessions, then verify each one's vehicle belongs to the caller's team.
    const sessions = await db
      .select({ id: mdSessions.id, vehicleId: mdSessions.vehicleId })
      .from(mdSessions)
      .where(inArray(mdSessions.id, [session1Id, session2Id]))

    if (sessions.length < 2) {
      return NextResponse.json({ error: 'One or both sessions not found.' }, { status: 404 })
    }

    for (const s of sessions) {
      const owned = s.vehicleId ? await assertVehicleOwnership(s.vehicleId, authResult.teamId) : false
      if (!owned) {
        return NextResponse.json({ error: 'Session does not belong to your team.' }, { status: 403 })
      }
    }

    // Pull setup rows for both sessions in one query.
    const rows = await db
      .select({
        sessionId: mdSetupLogs.sessionId,
        parameterKey: mdSetupLogs.parameterKey,
        parameterValue: mdSetupLogs.parameterValue,
      })
      .from(mdSetupLogs)
      .where(inArray(mdSetupLogs.sessionId, [session1Id, session2Id]))

    const setup1Map = new Map(rows.filter((r) => r.sessionId === session1Id).map((r) => [r.parameterKey, r.parameterValue]))
    const setup2Map = new Map(rows.filter((r) => r.sessionId === session2Id).map((r) => [r.parameterKey, r.parameterValue]))
    const allKeys = Array.from(new Set([...setup1Map.keys(), ...setup2Map.keys()]))

    const diffFor = (key: string) => {
      const v1 = setup1Map.get(key)
      const v2 = setup2Map.get(key)
      if (v1 === v2) return 'same'
      if (v1 === undefined) return 'added'
      if (v2 === undefined) return 'removed'
      return 'changed'
    }

    const comparison = {
      setup1: allKeys.map((key) => ({ key, value: setup1Map.get(key) ?? 'N/A', diff: diffFor(key) })),
      setup2: allKeys.map((key) => ({ key, value: setup2Map.get(key) ?? 'N/A', diff: diffFor(key) })),
    }

    return NextResponse.json(comparison)
  } catch (e) {
    console.error('[md-session-compare] error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
