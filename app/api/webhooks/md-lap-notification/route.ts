import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdSessions, mdVehicles } from '@/lib/db/schema'
import { and, eq, isNotNull, ne } from 'drizzle-orm'
import { sendTeamPush } from '@/lib/md-push'

type LapBody = {
  sessionId?: string
  vehicleId?: string
  lapTime?: number
  trackName?: string
  riderName?: string
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const secret = req.headers.get('x-webhook-secret')
    if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, vehicleId, lapTime, trackName, riderName } = (await req.json()) as LapBody

    if (!sessionId || !vehicleId || typeof lapTime !== 'number' || !trackName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Resolve the vehicle (and its owning team, needed to target the push).
    const [vehicle] = await db
      .select({ id: mdVehicles.id, name: mdVehicles.name, type: mdVehicles.type, teamId: mdVehicles.teamId })
      .from(mdVehicles)
      .where(eq(mdVehicles.id, vehicleId))
      .limit(1)

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Find the best previously-recorded lap on this track for this vehicle,
    // excluding the session that was just logged.
    const previous = await db
      .select({ best: mdSessions.bestLapSeconds })
      .from(mdSessions)
      .where(
        and(
          eq(mdSessions.vehicleId, vehicleId),
          eq(mdSessions.trackName, trackName),
          isNotNull(mdSessions.bestLapSeconds),
          ne(mdSessions.id, sessionId),
        ),
      )

    const previousBest = previous.reduce<number | null>((min, row) => {
      const v = row.best
      if (v == null) return min
      return min == null || v < min ? v : min
    }, null)

    const isPersonalBest = previousBest == null || lapTime < previousBest

    // Only fire a notification when they actually BEAT a prior time.
    if (isPersonalBest && previousBest != null && vehicle.teamId) {
      const improvement = previousBest - lapTime
      const label = [vehicle.name, vehicle.type].filter(Boolean).join(' ')
      const result = await sendTeamPush(vehicle.teamId, {
        title: 'New Personal Best!',
        body: `${riderName || 'A teammate'} ran ${lapTime.toFixed(2)}s at ${trackName}${label ? ` on the ${label}` : ''} — ${improvement.toFixed(2)}s faster than the previous best.`,
        data: { type: 'new_lap_record', vehicleId, trackName, lapTime, improvement },
      })

      return NextResponse.json({
        success: true,
        isPersonalBest: true,
        notificationsSent: result.sent,
        pushConfigured: result.configured,
      })
    }

    return NextResponse.json({
      success: true,
      isPersonalBest,
      notificationsSent: 0,
      message: isPersonalBest ? 'First recorded lap on this track.' : 'Not a personal best.',
    })
  } catch (e) {
    console.error('[md-lap-notification] error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
