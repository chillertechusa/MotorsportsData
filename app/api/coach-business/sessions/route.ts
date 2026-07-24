import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdCoachSessions, mdCoachSessionAthletes } from '@/lib/db/schema'
import { and, count, desc, eq, sql } from 'drizzle-orm'

export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  const sessions = await db.select().from(mdCoachSessions)
    .where(eq(mdCoachSessions.coachTeamId, auth.teamId))
    .orderBy(desc(mdCoachSessions.scheduledAt))

  if (!sessions.length) return NextResponse.json({ success: true, sessions: [] })

  const counts = await db
    .select({ sessionId: mdCoachSessionAthletes.sessionId, n: count() })
    .from(mdCoachSessionAthletes)
    .where(sql`session_id = ANY(ARRAY[${sql.join(sessions.map((s) => sql`${s.id}::uuid`), sql`, `)}])`)
    .groupBy(mdCoachSessionAthletes.sessionId)

  const countMap = Object.fromEntries(counts.map((c) => [c.sessionId, c.n]))
  return NextResponse.json({ success: true, sessions: sessions.map((s) => ({ ...s, athleteCount: countMap[s.id] ?? 0 })) })
}

export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { title, sessionType, discipline, location, scheduledAt, durationMinutes, athleteIds, notes } = body

    if (!title || !scheduledAt) {
      return NextResponse.json({ success: false, error: 'title and scheduledAt required' }, { status: 400 })
    }

    const [session] = await db.insert(mdCoachSessions).values({
      coachTeamId: auth.teamId, title, sessionType: sessionType ?? 'track',
      discipline, location, scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes ?? 60, notes,
    }).returning()

    if (Array.isArray(athleteIds) && athleteIds.length) {
      await db.insert(mdCoachSessionAthletes).values(
        athleteIds.map((clientId: string) => ({ sessionId: session.id, clientId }))
      )
    }

    return NextResponse.json({ success: true, session }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 })
  }
}
