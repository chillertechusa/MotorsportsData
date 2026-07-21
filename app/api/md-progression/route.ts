import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdSessions } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'
import { getSessionTeamId, assertVehicleOwnership } from '@/lib/md-auth'

export async function GET(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const url = new URL(req.url)
  const vehicleId = url.searchParams.get('vehicleId')
  const track = url.searchParams.get('track') || ''

  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId required' }, { status: 400 })
  }

  // Block cross-team access.
  const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ error: 'Vehicle does not belong to your team.' }, { status: 403 })
  }

  try {
    const allSessions = await db
      .select({
        sessionDate: mdSessions.sessionDate,
        trackName: mdSessions.trackName,
        bestLapSeconds: mdSessions.bestLapSeconds,
        riderFeedback: mdSessions.riderFeedback,
      })
      .from(mdSessions)
      .where(eq(mdSessions.vehicleId, vehicleId))
      .orderBy(asc(mdSessions.sessionDate))

    // Optional track filter (case-insensitive contains).
    const sessions = track
      ? allSessions.filter((s) => s.trackName.toLowerCase().includes(track.toLowerCase()))
      : allSessions

    if (sessions.length === 0) {
      return NextResponse.json({
        vehicleId,
        sessions: [],
        bestLapTime: null,
        averageLapTime: null,
        totalSessions: 0,
        improvement: null,
      })
    }

    // Compute per-session improvement vs the previous timed session.
    let prevLap: number | null = null
    const sessionsWithImprovement = sessions.map((s) => {
      const lapTime = typeof s.bestLapSeconds === 'number' ? s.bestLapSeconds : null
      let improvement: number | null = null
      if (lapTime !== null && prevLap !== null) improvement = prevLap - lapTime // positive = faster
      if (lapTime !== null) prevLap = lapTime
      return {
        date: s.sessionDate || '',
        trackName: s.trackName,
        lapTime,
        feedback: s.riderFeedback || '',
        improvement,
      }
    })

    const lapTimes = sessionsWithImprovement.filter((s) => s.lapTime !== null).map((s) => s.lapTime as number)
    const bestLapTime = lapTimes.length > 0 ? Math.min(...lapTimes) : null
    const averageLapTime = lapTimes.length > 0 ? lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length : null

    let improvement: number | null = null
    if (lapTimes.length > 1) {
      const first = lapTimes[0]
      const last = lapTimes[lapTimes.length - 1]
      if (first > 0) improvement = ((first - last) / first) * 100
    }

    return NextResponse.json({
      vehicleId,
      sessions: sessionsWithImprovement,
      bestLapTime,
      averageLapTime,
      totalSessions: sessions.length,
      improvement,
    })
  } catch (e) {
    console.error('[md-progression] error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
