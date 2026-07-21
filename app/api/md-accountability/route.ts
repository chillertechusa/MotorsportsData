import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdCoachAssignments, mdAssignmentAuditLog } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { headers } from 'next/headers'

async function getIp() {
  const hdrs = await headers()
  return hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? 'unknown'
}
async function getUa() {
  const hdrs = await headers()
  return hdrs.get('user-agent') ?? ''
}

// GET /api/md-accountability — list all assignments for the team
export async function GET(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    // Single assignment with audit trail
    const [assignment] = await db
      .select()
      .from(mdCoachAssignments)
      .where(and(eq(mdCoachAssignments.id, id), eq(mdCoachAssignments.teamId, auth.teamId)))
      .limit(1)
    if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const auditLog = await db
      .select()
      .from(mdAssignmentAuditLog)
      .where(eq(mdAssignmentAuditLog.assignmentId, id))
      .orderBy(desc(mdAssignmentAuditLog.actionAt))

    return NextResponse.json({ success: true, assignment, auditLog })
  }

  const assignments = await db
    .select()
    .from(mdCoachAssignments)
    .where(eq(mdCoachAssignments.teamId, auth.teamId))
    .orderBy(desc(mdCoachAssignments.assignedAt))
    .limit(100)

  return NextResponse.json({ success: true, assignments })
}

// POST /api/md-accountability — create assignment, acknowledge, or assess compliance
export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json()
  const { action } = body
  const ip = await getIp()
  const ua = await getUa()

  // ── Create new assignment ───────────────────────────────────────────────────
  if (action === 'create') {
    const { riderEmail, assignmentSpec, dueAt } = body
    if (!riderEmail || !assignmentSpec) {
      return NextResponse.json({ error: 'riderEmail and assignmentSpec required' }, { status: 400 })
    }

    const [assignment] = await db
      .insert(mdCoachAssignments)
      .values({
        teamId: auth.teamId,
        riderEmail,
        assignmentSpec,
        status: 'pending',
        dueAt: dueAt ? new Date(dueAt) : undefined,
      })
      .returning()

    await db.insert(mdAssignmentAuditLog).values({
      assignmentId: assignment.id,
      action: 'assigned',
      ipAddress: ip,
      userAgent: ua,
      eventData: { assignedBy: auth.userId, riderEmail, spec: assignmentSpec },
    })

    return NextResponse.json({ success: true, assignment })
  }

  // ── Rider acknowledges assignment ──────────────────────────────────────────
  if (action === 'acknowledge') {
    const { assignmentId } = body
    if (!assignmentId) return NextResponse.json({ error: 'assignmentId required' }, { status: 400 })

    const [existing] = await db
      .select()
      .from(mdCoachAssignments)
      .where(and(eq(mdCoachAssignments.id, assignmentId), eq(mdCoachAssignments.teamId, auth.teamId)))
      .limit(1)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.acknowledgedAt) {
      return NextResponse.json({ success: true, assignment: existing, alreadyAcknowledged: true })
    }

    const now = new Date()
    const [updated] = await db
      .update(mdCoachAssignments)
      .set({ acknowledgedAt: now, acknowledgedIp: ip, status: 'acknowledged' })
      .where(eq(mdCoachAssignments.id, assignmentId))
      .returning()

    await db.insert(mdAssignmentAuditLog).values({
      assignmentId,
      action: 'acknowledged',
      ipAddress: ip,
      userAgent: ua,
      eventData: { acknowledgedAt: now.toISOString(), riderEmail: existing.riderEmail },
    })

    return NextResponse.json({ success: true, assignment: updated })
  }

  // ── Coach assesses compliance ──────────────────────────────────────────────
  if (action === 'assess') {
    const { assignmentId, complianceResult, complianceNotes } = body
    if (!assignmentId || !complianceResult) {
      return NextResponse.json({ error: 'assignmentId and complianceResult required' }, { status: 400 })
    }

    const [existing] = await db
      .select()
      .from(mdCoachAssignments)
      .where(and(eq(mdCoachAssignments.id, assignmentId), eq(mdCoachAssignments.teamId, auth.teamId)))
      .limit(1)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [updated] = await db
      .update(mdCoachAssignments)
      .set({
        complianceResult,
        complianceNotes: complianceNotes ?? null,
        status: complianceResult === 'COMPLIANT' ? 'completed' : 'failed',
      })
      .where(eq(mdCoachAssignments.id, assignmentId))
      .returning()

    await db.insert(mdAssignmentAuditLog).values({
      assignmentId,
      action: 'compliance_assessed',
      ipAddress: ip,
      userAgent: ua,
      eventData: { result: complianceResult, notes: complianceNotes },
    })

    return NextResponse.json({ success: true, assignment: updated })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}

// DELETE /api/md-accountability — remove an assignment
export async function DELETE(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db
    .delete(mdCoachAssignments)
    .where(and(eq(mdCoachAssignments.id, id), eq(mdCoachAssignments.teamId, auth.teamId)))

  return NextResponse.json({ success: true })
}
