import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdRiderReadiness, mdSessions } from '@/lib/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { calculateReadinessScore } from '@/lib/md-readiness'

export async function GET(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const calculateScore = searchParams.get('calculate') === 'true'
  const daysUntilRace = parseInt(searchParams.get('daysUntilRace') ?? '3', 10)

  const conditions = [eq(mdRiderReadiness.teamId, auth.teamId)]
  if (from) conditions.push(gte(mdRiderReadiness.entryDate, from))
  if (to) conditions.push(lte(mdRiderReadiness.entryDate, to))

  const rows = await db
    .select()
    .from(mdRiderReadiness)
    .where(and(...conditions))
    .orderBy(desc(mdRiderReadiness.entryDate))
    .limit(90)

  // If calculate=true, compute readiness scores and taper protocols
  if (calculateScore && rows.length > 0) {
    // Get latest entry (most recent)
    const latest = rows[0]

    // Calculate cumulative session volume for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Sessions are joined through vehicles; we need to query by vehicle ownership
    // For now, get all sessions and filter by team (this is a simplification)
    // In production, would pre-compute or cache team sessions
    const sessions = await db
      .select()
      .from(mdSessions)
      .where(gte(mdSessions.sessionDate, sevenDaysAgo.toISOString().slice(0, 10)))
      .orderBy(desc(mdSessions.sessionDate))
      .limit(50)

    const trackVolumeMinutes = sessions.reduce((sum, s) => {
      const hours = s.sessionHours ? parseFloat(s.sessionHours.toString()) : 0
      return sum + (hours * 60)
    }, 0)

    const lastSessionMinutes = sessions[0]?.sessionHours ? parseFloat(sessions[0].sessionHours.toString()) * 60 : 0

    // Calculate readiness using the algorithm
    const readiness = calculateReadinessScore({
      sleepHours: latest.sleepHours ? parseFloat(latest.sleepHours.toString()) : 7,
      sleepQuality: latest.sleepScore ?? 75,
      hrv: latest.hrv ?? 50,
      trackVolumeMinutes,
      lastHardSessionMinutes: lastSessionMinutes,
      temperature: 37.0,
      daysUntilRace,
    })

    return NextResponse.json({
      success: true,
      entries: rows,
      latest: {
        ...latest,
        sleepHours: latest.sleepHours ? parseFloat(latest.sleepHours.toString()) : null,
      },
      calculated: {
        trackVolumeMinutes,
        lastSessionMinutes,
        readiness: {
          overall: readiness.overall,
          sleepComponent: readiness.sleepComponent,
          hrvComponent: readiness.hrvComponent,
          volumeComponent: readiness.volumeComponent,
          peakProbability: readiness.peakProbability,
          confidence: readiness.confidence,
          tapperRecommendation: readiness.tapperRecommendation,
          warnings: readiness.warnings,
        },
      },
    })
  }

  return NextResponse.json({ success: true, entries: rows })
}

export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { entryDate, sleepHours, sleepScore, hrv, restingHr, energy, fatigue, notes, source } = body as Record<string, unknown>
  if (!entryDate) return NextResponse.json({ error: 'entryDate required' }, { status: 400 })

  const [row] = await db
    .insert(mdRiderReadiness)
    .values({
      teamId: auth.teamId,
      entryDate: entryDate as string,
      sleepHours: sleepHours != null ? String(sleepHours) : null,
      sleepScore: sleepScore != null ? Number(sleepScore) : null,
      hrv: hrv != null ? Number(hrv) : null,
      restingHr: restingHr != null ? Number(restingHr) : null,
      energy: energy != null ? Number(energy) : null,
      fatigue: fatigue != null ? Number(fatigue) : null,
      notes: notes ? String(notes) : null,
      source: source ? String(source) : 'manual',
    })
    .onConflictDoUpdate({
      target: [mdRiderReadiness.teamId, mdRiderReadiness.entryDate],
      set: {
        sleepHours: sleepHours != null ? String(sleepHours) : null,
        sleepScore: sleepScore != null ? Number(sleepScore) : null,
        hrv: hrv != null ? Number(hrv) : null,
        restingHr: restingHr != null ? Number(restingHr) : null,
        energy: energy != null ? Number(energy) : null,
        fatigue: fatigue != null ? Number(fatigue) : null,
        notes: notes ? String(notes) : null,
      },
    })
    .returning()

  return NextResponse.json({ success: true, entry: row })
}

export async function DELETE(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db
    .delete(mdRiderReadiness)
    .where(and(eq(mdRiderReadiness.id, id), eq(mdRiderReadiness.teamId, auth.teamId)))

  return NextResponse.json({ success: true })
}
