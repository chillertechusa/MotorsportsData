'use server'

import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import {
  mdCoachClients,
  mdCoachPackages,
  mdCoachSessions,
  mdCoachSessionAthletes,
  mdTrainingPlans,
  mdCoachInvoices,
} from '@/lib/db/schema'
import { and, desc, eq, count, sum, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ─── Auth guard ────────────────────────────────────────────────────────────────
async function requireCoachTeam() {
  const auth = await getSessionTeamId()
  if (!auth.ok) throw new Error(auth.error)
  return auth.teamId
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
export async function getCoachDashboardKpis() {
  const coachTeamId = await requireCoachTeam()

  const [clientCount, sessionCount, openInvoiceAmount, planCount] = await Promise.all([
    db.select({ n: count() }).from(mdCoachClients)
      .where(and(eq(mdCoachClients.coachTeamId, coachTeamId), eq(mdCoachClients.status, 'active'))),
    db.select({ n: count() }).from(mdCoachSessions)
      .where(and(eq(mdCoachSessions.coachTeamId, coachTeamId), eq(mdCoachSessions.status, 'scheduled'))),
    db.select({ total: sum(mdCoachInvoices.amountCents) }).from(mdCoachInvoices)
      .where(and(eq(mdCoachInvoices.coachTeamId, coachTeamId), eq(mdCoachInvoices.status, 'sent'))),
    db.select({ n: count() }).from(mdTrainingPlans)
      .where(and(eq(mdTrainingPlans.coachTeamId, coachTeamId), eq(mdTrainingPlans.status, 'active'))),
  ])

  return {
    activeAthletes: clientCount[0]?.n ?? 0,
    upcomingSessions: sessionCount[0]?.n ?? 0,
    outstandingCents: Number(openInvoiceAmount[0]?.total ?? 0),
    activePlans: planCount[0]?.n ?? 0,
  }
}

// ─── Clients ──────────────────────────────────────────────────────────────────
export async function getCoachClients() {
  const coachTeamId = await requireCoachTeam()
  return db.select().from(mdCoachClients)
    .where(eq(mdCoachClients.coachTeamId, coachTeamId))
    .orderBy(desc(mdCoachClients.createdAt))
}

export async function createCoachClient(data: {
  firstName: string; lastName: string; email?: string; phone?: string
  discipline?: string; classCategory?: string; homeTrack?: string
  dateOfBirth?: string; notes?: string
}) {
  const coachTeamId = await requireCoachTeam()
  const [client] = await db.insert(mdCoachClients).values({
    coachTeamId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    discipline: data.discipline,
    classCategory: data.classCategory,
    homeTrack: data.homeTrack,
    notes: data.notes,
  }).returning()
  revalidatePath('/data/coach')
  return client
}

export async function updateCoachClient(id: string, data: Partial<typeof mdCoachClients.$inferInsert>) {
  const coachTeamId = await requireCoachTeam()
  const [updated] = await db.update(mdCoachClients).set({ ...data, updatedAt: new Date() })
    .where(and(eq(mdCoachClients.id, id), eq(mdCoachClients.coachTeamId, coachTeamId)))
    .returning()
  revalidatePath('/data/coach/roster')
  return updated
}

export async function archiveCoachClient(id: string) {
  const coachTeamId = await requireCoachTeam()
  await db.update(mdCoachClients).set({ status: 'archived', updatedAt: new Date() })
    .where(and(eq(mdCoachClients.id, id), eq(mdCoachClients.coachTeamId, coachTeamId)))
  revalidatePath('/data/coach/roster')
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
export async function getCoachSessions() {
  const coachTeamId = await requireCoachTeam()
  const sessions = await db.select().from(mdCoachSessions)
    .where(eq(mdCoachSessions.coachTeamId, coachTeamId))
    .orderBy(desc(mdCoachSessions.scheduledAt))

  // Attach athlete counts
  const counts = await db
    .select({ sessionId: mdCoachSessionAthletes.sessionId, n: count() })
    .from(mdCoachSessionAthletes)
    .where(sql`session_id = ANY(${sessions.map((s) => s.id)})`)
    .groupBy(mdCoachSessionAthletes.sessionId)

  const countMap = Object.fromEntries(counts.map((c) => [c.sessionId, c.n]))
  return sessions.map((s) => ({ ...s, athleteCount: countMap[s.id] ?? 0 }))
}

export async function createCoachSession(data: {
  title: string; sessionType: string; discipline?: string
  location?: string; scheduledAt: string; durationMinutes: number
  athleteIds?: string[]; notes?: string
}) {
  const coachTeamId = await requireCoachTeam()
  const [session] = await db.insert(mdCoachSessions).values({
    coachTeamId,
    title: data.title,
    sessionType: data.sessionType,
    discipline: data.discipline,
    location: data.location,
    scheduledAt: new Date(data.scheduledAt),
    durationMinutes: data.durationMinutes,
    notes: data.notes,
  }).returning()

  if (data.athleteIds?.length) {
    await db.insert(mdCoachSessionAthletes).values(
      data.athleteIds.map((clientId) => ({ sessionId: session.id, clientId }))
    )
  }

  revalidatePath('/data/coach/sessions')
  return session
}

export async function completeCoachSession(id: string, aiDebrief?: string) {
  const coachTeamId = await requireCoachTeam()
  const [updated] = await db.update(mdCoachSessions)
    .set({ status: 'completed', aiDebrief, updatedAt: new Date() })
    .where(and(eq(mdCoachSessions.id, id), eq(mdCoachSessions.coachTeamId, coachTeamId)))
    .returning()
  revalidatePath('/data/coach/sessions')
  return updated
}

// ─── Training Plans ───────────────────────────────────────────────────────────
export async function getTrainingPlans(clientId?: string) {
  const coachTeamId = await requireCoachTeam()
  const conditions = clientId
    ? and(eq(mdTrainingPlans.coachTeamId, coachTeamId), eq(mdTrainingPlans.clientId, clientId))
    : eq(mdTrainingPlans.coachTeamId, coachTeamId)
  return db.select({
    plan: mdTrainingPlans,
    clientFirstName: mdCoachClients.firstName,
    clientLastName: mdCoachClients.lastName,
  })
    .from(mdTrainingPlans)
    .innerJoin(mdCoachClients, eq(mdTrainingPlans.clientId, mdCoachClients.id))
    .where(conditions)
    .orderBy(desc(mdTrainingPlans.weekStart))
}

export async function createTrainingPlan(data: {
  clientId: string; title: string; weekStart: string; weekEnd: string
  goals?: string; physicalBlocks?: object[]; technicalBlocks?: object[]
  mentalBlocks?: object[]; nutritionNotes?: string; aiGenerated?: boolean
}) {
  const coachTeamId = await requireCoachTeam()
  const [plan] = await db.insert(mdTrainingPlans).values({
    coachTeamId,
    clientId: data.clientId,
    title: data.title,
    weekStart: data.weekStart,
    weekEnd: data.weekEnd,
    goals: data.goals,
    physicalBlocks: data.physicalBlocks ?? [],
    technicalBlocks: data.technicalBlocks ?? [],
    mentalBlocks: data.mentalBlocks ?? [],
    nutritionNotes: data.nutritionNotes,
    aiGenerated: data.aiGenerated ?? false,
  }).returning()
  revalidatePath('/data/coach/plans')
  return plan
}

export async function updateTrainingPlan(id: string, data: Partial<typeof mdTrainingPlans.$inferInsert>) {
  const coachTeamId = await requireCoachTeam()
  const [updated] = await db.update(mdTrainingPlans).set({ ...data, updatedAt: new Date() })
    .where(and(eq(mdTrainingPlans.id, id), eq(mdTrainingPlans.coachTeamId, coachTeamId)))
    .returning()
  revalidatePath('/data/coach/plans')
  return updated
}

// ─── Packages ─────────────────────────────────────────────────────────────────
export async function getCoachPackages() {
  const coachTeamId = await requireCoachTeam()
  return db.select().from(mdCoachPackages)
    .where(and(eq(mdCoachPackages.coachTeamId, coachTeamId), eq(mdCoachPackages.isActive, true)))
    .orderBy(mdCoachPackages.priceCents)
}

export async function createCoachPackage(data: {
  name: string; description?: string; sessionCount?: number
  durationWeeks?: number; priceCents: number; cadence: string
}) {
  const coachTeamId = await requireCoachTeam()
  const [pkg] = await db.insert(mdCoachPackages).values({ coachTeamId, ...data }).returning()
  revalidatePath('/data/coach/billing')
  return pkg
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export async function getCoachInvoices() {
  const coachTeamId = await requireCoachTeam()
  return db.select({
    invoice: mdCoachInvoices,
    clientFirstName: mdCoachClients.firstName,
    clientLastName: mdCoachClients.lastName,
  })
    .from(mdCoachInvoices)
    .innerJoin(mdCoachClients, eq(mdCoachInvoices.clientId, mdCoachClients.id))
    .where(eq(mdCoachInvoices.coachTeamId, coachTeamId))
    .orderBy(desc(mdCoachInvoices.createdAt))
}

export async function createCoachInvoice(data: {
  clientId: string; packageId?: string; amountCents: number
  dueDate: string; lineItems?: object[]; notes?: string
}) {
  const coachTeamId = await requireCoachTeam()
  // Auto-generate invoice number: INV-YYYY-NNNN
  const [{ n }] = await db.select({ n: count() }).from(mdCoachInvoices).where(eq(mdCoachInvoices.coachTeamId, coachTeamId))
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Number(n) + 1).padStart(4, '0')}`

  const [invoice] = await db.insert(mdCoachInvoices).values({
    coachTeamId,
    clientId: data.clientId,
    packageId: data.packageId,
    invoiceNumber,
    amountCents: data.amountCents,
    dueDate: data.dueDate,
    lineItems: data.lineItems ?? [],
    notes: data.notes,
    status: 'draft',
  }).returning()
  revalidatePath('/data/coach/billing')
  return invoice
}

export async function markInvoiceSent(id: string) {
  const coachTeamId = await requireCoachTeam()
  const [updated] = await db.update(mdCoachInvoices)
    .set({ status: 'sent', updatedAt: new Date() })
    .where(and(eq(mdCoachInvoices.id, id), eq(mdCoachInvoices.coachTeamId, coachTeamId)))
    .returning()
  revalidatePath('/data/coach/billing')
  return updated
}

export async function markInvoicePaid(id: string) {
  const coachTeamId = await requireCoachTeam()
  const [updated] = await db.update(mdCoachInvoices)
    .set({ status: 'paid', paidAt: new Date(), updatedAt: new Date() })
    .where(and(eq(mdCoachInvoices.id, id), eq(mdCoachInvoices.coachTeamId, coachTeamId)))
    .returning()
  revalidatePath('/data/coach/billing')
  return updated
}
