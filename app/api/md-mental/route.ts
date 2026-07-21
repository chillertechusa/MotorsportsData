import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdMentalLog } from '@/lib/db/schema'
import { eq, and, desc, gte } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

export async function GET(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const days = Math.min(Number(searchParams.get('days') ?? '30'), 90)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const rows = await db
    .select()
    .from(mdMentalLog)
    .where(and(eq(mdMentalLog.teamId, auth.teamId), gte(mdMentalLog.entryDate, cutoffStr)))
    .orderBy(desc(mdMentalLog.entryDate))

  return NextResponse.json({ entries: rows })
}

export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: {
    entryDate?: string
    entryType?: string
    mood?: number
    focus?: number
    anxiety?: number
    confidence?: number
    motivation?: number
    notes?: string
    linkedScheduleEventId?: string | null
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }

  if (!body.entryDate) return NextResponse.json({ error: 'entryDate required.' }, { status: 400 })

  const clamp = (v: number | undefined) => v !== undefined ? Math.min(10, Math.max(1, Math.round(v))) : null

  const [row] = await db
    .insert(mdMentalLog)
    .values({
      teamId: auth.teamId,
      entryDate: body.entryDate,
      entryType: body.entryType ?? 'daily',
      mood: clamp(body.mood),
      focus: clamp(body.focus),
      anxiety: clamp(body.anxiety),
      confidence: clamp(body.confidence),
      motivation: clamp(body.motivation),
      notes: body.notes ?? null,
      linkedScheduleEventId: body.linkedScheduleEventId ?? null,
    })
    .returning()

  return NextResponse.json({ entry: row }, { status: 201 })
}

export async function DELETE(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })

  await db.delete(mdMentalLog).where(and(eq(mdMentalLog.id, id), eq(mdMentalLog.teamId, auth.teamId)))
  return NextResponse.json({ success: true })
}
