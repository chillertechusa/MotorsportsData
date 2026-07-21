import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdScheduleEvents, mdTracks } from '@/lib/db/schema'
import { eq, asc, and } from 'drizzle-orm'
import { getSessionTeamId, assertRaceTeamOrAbove } from '@/lib/md-auth'

// GET /api/md-schedule — list all events for the team
export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const events = await db
    .select({
      id: mdScheduleEvents.id,
      title: mdScheduleEvents.title,
      eventType: mdScheduleEvents.eventType,
      eventDate: mdScheduleEvents.eventDate,
      vehicleId: mdScheduleEvents.vehicleId,
      trackId: mdScheduleEvents.trackId,
      lat: mdScheduleEvents.lat,
      lng: mdScheduleEvents.lng,
      series: mdScheduleEvents.series,
      finishPosition: mdScheduleEvents.finishPosition,
      seriesResultUrl: mdScheduleEvents.seriesResultUrl,
      entryFeeCents: mdScheduleEvents.entryFeeCents,
      notes: mdScheduleEvents.notes,
      trackName: mdTracks.name,
      trackCity: mdTracks.city,
      trackState: mdTracks.state,
      trackLat: mdTracks.centerLat,
      trackLng: mdTracks.centerLng,
    })
    .from(mdScheduleEvents)
    .leftJoin(mdTracks, eq(mdScheduleEvents.trackId, mdTracks.id))
    .where(eq(mdScheduleEvents.teamId, auth.teamId))
    .orderBy(asc(mdScheduleEvents.eventDate))

  return NextResponse.json({ events })
}

// POST /api/md-schedule — create a new event
export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const isRaceTeam = await assertRaceTeamOrAbove(auth.teamId)
  if (!isRaceTeam) {
    return NextResponse.json({ error: 'Schedule requires Race Team or above.' }, { status: 403 })
  }

  let body: {
    title?: string
    eventType?: string
    eventDate?: string
    vehicleId?: string | null
    trackId?: string | null
    lat?: number | null
    lng?: number | null
    series?: string | null
    finishPosition?: number | null
    seriesResultUrl?: string | null
    entryFeeCents?: number | null
    notes?: string | null
  }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const title = body.title?.trim()
  const eventDate = body.eventDate
  if (!title || !eventDate) {
    return NextResponse.json({ error: 'title and eventDate are required' }, { status: 400 })
  }

  const [event] = await db
    .insert(mdScheduleEvents)
    .values({
      teamId: auth.teamId,
      title,
      eventType: body.eventType ?? 'practice',
      eventDate,
      vehicleId: body.vehicleId ?? null,
      trackId: body.trackId ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      series: body.series ?? null,
      finishPosition: body.finishPosition ?? null,
      seriesResultUrl: body.seriesResultUrl ?? null,
      entryFeeCents: body.entryFeeCents ?? 0,
      notes: body.notes ?? null,
    })
    .returning()

  return NextResponse.json({ event }, { status: 201 })
}

// PATCH /api/md-schedule?id=... — update finish position, notes, result URL
export async function PATCH(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowed: (keyof typeof mdScheduleEvents.$inferInsert)[] = [
    'title', 'eventType', 'eventDate', 'vehicleId', 'trackId', 'lat', 'lng',
    'series', 'finishPosition', 'seriesResultUrl', 'entryFeeCents', 'notes',
  ]
  const patch: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in body) patch[k] = body[k]
  }

  await db
    .update(mdScheduleEvents)
    .set(patch)
    .where(and(eq(mdScheduleEvents.id, id), eq(mdScheduleEvents.teamId, auth.teamId)))

  return NextResponse.json({ ok: true })
}

// DELETE /api/md-schedule?id=...
export async function DELETE(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db
    .delete(mdScheduleEvents)
    .where(and(eq(mdScheduleEvents.id, id), eq(mdScheduleEvents.teamId, auth.teamId)))

  return NextResponse.json({ ok: true })
}
