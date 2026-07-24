import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdCoachClients, mdTrainingPlans, mdCoachInvoices, mdCoachSessionAthletes, mdCoachSessions } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  const { id } = await params

  const [client] = await db.select().from(mdCoachClients)
    .where(and(eq(mdCoachClients.id, id), eq(mdCoachClients.coachTeamId, auth.teamId)))
    .limit(1)

  if (!client) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  const [plans, invoices, sessionRows] = await Promise.all([
    db.select().from(mdTrainingPlans)
      .where(and(eq(mdTrainingPlans.clientId, id), eq(mdTrainingPlans.coachTeamId, auth.teamId)))
      .orderBy(desc(mdTrainingPlans.weekStart)).limit(10),
    db.select().from(mdCoachInvoices)
      .where(and(eq(mdCoachInvoices.clientId, id), eq(mdCoachInvoices.coachTeamId, auth.teamId)))
      .orderBy(desc(mdCoachInvoices.createdAt)).limit(10),
    db.select({ session: mdCoachSessions })
      .from(mdCoachSessionAthletes)
      .innerJoin(mdCoachSessions, eq(mdCoachSessionAthletes.sessionId, mdCoachSessions.id))
      .where(eq(mdCoachSessionAthletes.clientId, id))
      .orderBy(desc(mdCoachSessions.scheduledAt)).limit(10),
  ])

  return NextResponse.json({ success: true, client, plans, invoices, sessions: sessionRows.map((r) => r.session) })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  const { id } = await params

  try {
    const body = await req.json()
    const [updated] = await db.update(mdCoachClients)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(mdCoachClients.id, id), eq(mdCoachClients.coachTeamId, auth.teamId)))
      .returning()
    return NextResponse.json({ success: true, client: updated })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
  const { id } = await params

  await db.update(mdCoachClients).set({ status: 'archived', updatedAt: new Date() })
    .where(and(eq(mdCoachClients.id, id), eq(mdCoachClients.coachTeamId, auth.teamId)))

  return NextResponse.json({ success: true })
}
