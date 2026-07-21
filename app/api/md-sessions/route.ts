import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdSessions } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { getSessionTeamId, assertVehicleOwnership } from '@/lib/md-auth'

// List sessions for a vehicle (ownership-checked), newest first.
export async function GET(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const vehicleId = new URL(req.url).searchParams.get('vehicleId')
  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId required' }, { status: 400 })
  }

  // Block cross-team access before returning any rows.
  const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ error: 'Vehicle does not belong to your team.' }, { status: 403 })
  }

  try {
    const sessions = await db
      .select({
        id: mdSessions.id,
        trackName: mdSessions.trackName,
        trackConditions: mdSessions.trackConditions,
        riderFeedback: mdSessions.riderFeedback,
        bestLapSeconds: mdSessions.bestLapSeconds,
        sessionHours: mdSessions.sessionHours,
        sessionDate: mdSessions.sessionDate,
        createdAt: mdSessions.createdAt,
      })
      .from(mdSessions)
      .where(eq(mdSessions.vehicleId, vehicleId))
      .orderBy(desc(mdSessions.createdAt))

    return NextResponse.json({ sessions })
  } catch (e) {
    console.error('[md-sessions] error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
