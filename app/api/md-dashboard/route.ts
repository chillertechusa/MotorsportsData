import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdVehicles, mdPartVault, mdRiderReadiness, mdScheduleEvents, mdSessions } from '@/lib/db/schema'
import { eq, asc, desc, gte, and, inArray } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

export async function GET() {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { teamId } = authResult

  try {
    // ── 1. Fleet ──────────────────────────────────────────────────────────────
    const vehicles = await db
      .select({ id: mdVehicles.id, name: mdVehicles.name, type: mdVehicles.type, engineHours: mdVehicles.engineHours })
      .from(mdVehicles)
      .where(eq(mdVehicles.teamId, teamId))
      .orderBy(asc(mdVehicles.createdAt))

    const vehicleIds = vehicles.map((v) => v.id)

    // ── 2. Part health alerts (≥75% life used) ────────────────────────────────
    let alerts: { vehicleName: string; partName: string; currentHours: number; maxHours: number; pct: number }[] = []

    if (vehicleIds.length > 0) {
      const allPartsMulti = await Promise.all(
        vehicleIds.map((vid) =>
          db
            .select({ vehicleId: mdPartVault.vehicleId, partName: mdPartVault.partName, currentHours: mdPartVault.currentHours, maxHours: mdPartVault.maxHours })
            .from(mdPartVault)
            .where(eq(mdPartVault.vehicleId, vid)),
        ),
      )
      const flat = allPartsMulti.flat()
      alerts = flat
        .map((p) => {
          const pct = p.maxHours > 0 ? Math.round(((p.currentHours ?? 0) / p.maxHours) * 100) : 0
          const vehicle = vehicles.find((v) => v.id === p.vehicleId)
          return { vehicleName: vehicle?.name ?? 'Unknown', partName: p.partName, currentHours: p.currentHours ?? 0, maxHours: p.maxHours, pct }
        })
        .filter((p) => p.pct >= 75)
        .sort((a, b) => b.pct - a.pct)
    }

    // ── 3. Latest readiness entry ─────────────────────────────────────────────
    const [latestReadiness] = await db
      .select({ entryDate: mdRiderReadiness.entryDate, sleepHours: mdRiderReadiness.sleepHours, hrv: mdRiderReadiness.hrv, energy: mdRiderReadiness.energy, fatigue: mdRiderReadiness.fatigue, sleepScore: mdRiderReadiness.sleepScore })
      .from(mdRiderReadiness)
      .where(eq(mdRiderReadiness.teamId, teamId))
      .orderBy(desc(mdRiderReadiness.entryDate))
      .limit(1)

    // 7-day HRV trend
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentReadiness = await db
      .select({ entryDate: mdRiderReadiness.entryDate, hrv: mdRiderReadiness.hrv, energy: mdRiderReadiness.energy, fatigue: mdRiderReadiness.fatigue, sleepHours: mdRiderReadiness.sleepHours })
      .from(mdRiderReadiness)
      .where(and(eq(mdRiderReadiness.teamId, teamId), gte(mdRiderReadiness.entryDate, sevenDaysAgo.toISOString().slice(0, 10))))
      .orderBy(asc(mdRiderReadiness.entryDate))

    // ── 4. Next upcoming event ────────────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10)
    const [nextEvent] = await db
      .select({ id: mdScheduleEvents.id, title: mdScheduleEvents.title, eventType: mdScheduleEvents.eventType, eventDate: mdScheduleEvents.eventDate, series: mdScheduleEvents.series })
      .from(mdScheduleEvents)
      .where(and(eq(mdScheduleEvents.teamId, teamId), gte(mdScheduleEvents.eventDate, today)))
      .orderBy(asc(mdScheduleEvents.eventDate))
      .limit(1)

    // ── 5. Recent sessions (last 3) ───────────────────────────────────────────
    let recentSessions: { trackName: string; sessionDate: string | null; bestLapSeconds: number | null; riderFeedback: string | null }[] = []
    if (vehicleIds.length > 0) {
      const sessionRows = await db
        .select({ trackName: mdSessions.trackName, sessionDate: mdSessions.sessionDate, bestLapSeconds: mdSessions.bestLapSeconds, riderFeedback: mdSessions.riderFeedback })
        .from(mdSessions)
        .where(inArray(mdSessions.vehicleId, vehicleIds))
        .orderBy(desc(mdSessions.sessionDate))
        .limit(3)
      recentSessions = sessionRows
    }

    // ── 6. Days until next event ──────────────────────────────────────────────
    let daysUntilEvent: number | null = null
    if (nextEvent) {
      const eventMs = new Date(nextEvent.eventDate + 'T12:00:00').getTime()
      const nowMs = new Date().setHours(0, 0, 0, 0)
      daysUntilEvent = Math.max(0, Math.ceil((eventMs - nowMs) / 86400000))
    }

    return NextResponse.json({
      success: true,
      vehicles,
      alerts,
      latestReadiness: latestReadiness ?? null,
      recentReadiness,
      nextEvent: nextEvent ?? null,
      daysUntilEvent,
      recentSessions,
    })
  } catch (err) {
    console.error('[md-dashboard]', err)
    return NextResponse.json({ success: false, error: 'Failed to load dashboard data.' }, { status: 500 })
  }
}
