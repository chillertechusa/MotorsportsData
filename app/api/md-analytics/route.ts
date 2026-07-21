import { NextResponse } from 'next/server'
import { eq, inArray, and, gte, lte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mdVehicles, mdSessions } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'

export async function GET(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  const { teamId } = authResult

  const url = new URL(req.url)
  const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()), 10)
  const compareYear = parseInt(url.searchParams.get('compareYear') ?? String(year - 1), 10)

  try {
    // Load vehicles scoped to team
    const vehicles = await db
      .select({ id: mdVehicles.id, name: mdVehicles.name, discipline: mdVehicles.discipline })
      .from(mdVehicles)
      .where(eq(mdVehicles.teamId, teamId))

    if (vehicles.length === 0) {
      return NextResponse.json({ vehicles: [], yearStats: null, compareStats: null, monthlyBreakdown: [], bestLapTrend: [] })
    }

    const vehicleIds = vehicles.map((v) => v.id)

    // Sessions for the selected year and compare year
    const [yearSessions, compareSessions] = await Promise.all([
      db
        .select()
        .from(mdSessions)
        .where(
          and(
            inArray(mdSessions.vehicleId, vehicleIds),
            gte(mdSessions.sessionDate, `${year}-01-01`),
            lte(mdSessions.sessionDate, `${year}-12-31`)
          )
        ),
      db
        .select()
        .from(mdSessions)
        .where(
          and(
            inArray(mdSessions.vehicleId, vehicleIds),
            gte(mdSessions.sessionDate, `${compareYear}-01-01`),
            lte(mdSessions.sessionDate, `${compareYear}-12-31`)
          )
        ),
    ])

    function buildYearStats(sessions: typeof yearSessions) {
      const timed = sessions.filter((s) => s.bestLapSeconds != null && s.bestLapSeconds > 0)
      const bestLap = timed.length > 0 ? Math.min(...timed.map((s) => s.bestLapSeconds!)) : null
      const totalHours = sessions.reduce((sum, s) => sum + (s.sessionHours ?? 0), 0)
      const tracks = [...new Set(sessions.map((s) => s.trackName).filter(Boolean))]
      return {
        totalSessions: sessions.length,
        totalHours: Math.round(totalHours * 10) / 10,
        timedSessions: timed.length,
        bestLapSeconds: bestLap,
        uniqueTracks: tracks.length,
        trackList: tracks.slice(0, 8),
      }
    }

    // Monthly breakdown for selected year (sessions + best lap per month)
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyBreakdown = MONTHS.map((label, idx) => {
      const month = idx + 1
      const monthSessions = yearSessions.filter((s) => {
        if (!s.sessionDate) return false
        const d = new Date(s.sessionDate)
        return d.getMonth() + 1 === month
      })
      const timed = monthSessions.filter((s) => s.bestLapSeconds != null && s.bestLapSeconds > 0)
      const best = timed.length > 0 ? Math.min(...timed.map((s) => s.bestLapSeconds!)) : null
      return {
        month: label,
        sessions: monthSessions.length,
        hours: Math.round(monthSessions.reduce((sum, s) => sum + (s.sessionHours ?? 0), 0) * 10) / 10,
        bestLap: best,
      }
    })

    // Best lap trend across all sessions this year (chronological, timed only)
    const bestLapTrend = yearSessions
      .filter((s) => s.bestLapSeconds != null && s.bestLapSeconds > 0 && s.sessionDate)
      .sort((a, b) => new Date(a.sessionDate!).getTime() - new Date(b.sessionDate!).getTime())
      .map((s) => ({
        date: s.sessionDate,
        lapSeconds: s.bestLapSeconds,
        track: s.trackName,
      }))

    // Per-vehicle breakdown
    const perVehicle = vehicles.map((v) => {
      const vSessions = yearSessions.filter((s) => s.vehicleId === v.id)
      const timed = vSessions.filter((s) => s.bestLapSeconds != null && s.bestLapSeconds > 0)
      return {
        id: v.id,
        name: v.name,
        discipline: v.discipline,
        sessions: vSessions.length,
        hours: Math.round(vSessions.reduce((sum, s) => sum + (s.sessionHours ?? 0), 0) * 10) / 10,
        bestLap: timed.length > 0 ? Math.min(...timed.map((s) => s.bestLapSeconds!)) : null,
        tracks: [...new Set(vSessions.map((s) => s.trackName).filter(Boolean))].length,
      }
    })

    return NextResponse.json({
      year,
      compareYear,
      vehicles: perVehicle,
      yearStats: buildYearStats(yearSessions),
      compareStats: buildYearStats(compareSessions),
      monthlyBreakdown,
      bestLapTrend,
    })
  } catch (err) {
    console.error('[md-analytics]', err)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
