import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdInjuries } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// GET — list all injuries for the team
export async function GET() {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { teamId } = authResult

  const rows = await db
    .select()
    .from(mdInjuries)
    .where(eq(mdInjuries.teamId, teamId))
    .orderBy(desc(mdInjuries.incidentDate))

  return NextResponse.json(rows)
}

// POST — log a new injury
export async function POST(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { teamId } = authResult

  const body = await req.json()
  const { bodyRegion, injuryType, severity, incidentDate, isConcussion, notes, linkedScheduleEventId } = body

  if (!bodyRegion || !injuryType || !incidentDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [row] = await db.insert(mdInjuries).values({
    teamId,
    bodyRegion,
    injuryType,
    severity: severity ?? 1,
    incidentDate,
    isConcussion: isConcussion ?? false,
    notes: notes ?? null,
    linkedScheduleEventId: linkedScheduleEventId ?? null,
    rtrStage: 0,
    status: 'active',
  }).returning()

  return NextResponse.json(row, { status: 201 })
}

// PATCH — update RTR stage, status, clearance, or notes
export async function PATCH(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { teamId } = authResult

  const body = await req.json()
  const { id, rtrStage, status, clearedBy, notes } = body

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  }
  if (rtrStage !== undefined) {
    updates.rtrStage = rtrStage
    updates.rtrStageStartedAt = new Date()
    // Stage 5 (non-concussion) or 6 (concussion) = cleared
    if (rtrStage >= 5) {
      updates.status = 'cleared'
      updates.rtrClearedAt = new Date()
    }
  }
  if (status !== undefined) updates.status = status
  if (clearedBy !== undefined) updates.clearedBy = clearedBy
  if (notes !== undefined) updates.notes = notes

  const [updated] = await db
    .update(mdInjuries)
    .set(updates)
    .where(and(eq(mdInjuries.id, id), eq(mdInjuries.teamId, teamId)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

// DELETE — remove an injury record
export async function DELETE(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { teamId } = authResult

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db
    .delete(mdInjuries)
    .where(and(eq(mdInjuries.id, id), eq(mdInjuries.teamId, teamId)))

  return NextResponse.json({ ok: true })
}
