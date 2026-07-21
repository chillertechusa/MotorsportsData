import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdExpenses, mdScheduleEvents } from '@/lib/db/schema'
import { eq, and, desc, gte, lte } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

export async function GET(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const vehicleId = searchParams.get('vehicleId')

  const conditions = [eq(mdExpenses.teamId, auth.teamId)]
  if (from) conditions.push(gte(mdExpenses.expenseDate, from))
  if (to) conditions.push(lte(mdExpenses.expenseDate, to))
  if (vehicleId) conditions.push(eq(mdExpenses.vehicleId, vehicleId))

  const expenses = await db
    .select()
    .from(mdExpenses)
    .where(and(...conditions))
    .orderBy(desc(mdExpenses.expenseDate))

  return NextResponse.json({ success: true, expenses })
}

export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: {
    category?: string
    amountCents?: number
    expenseDate?: string
    description?: string
    vehicleId?: string | null
    linkedScheduleEventId?: string | null
    receiptUrl?: string | null
  }
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { category, amountCents, expenseDate, description, vehicleId, linkedScheduleEventId, receiptUrl } = body

  if (!category || !expenseDate || amountCents === undefined) {
    return NextResponse.json({ success: false, error: 'category, amountCents, and expenseDate are required' }, { status: 400 })
  }

  // Validate linked schedule event belongs to this team
  if (linkedScheduleEventId) {
    const [evt] = await db
      .select({ id: mdScheduleEvents.id })
      .from(mdScheduleEvents)
      .where(and(eq(mdScheduleEvents.id, linkedScheduleEventId), eq(mdScheduleEvents.teamId, auth.teamId)))
      .limit(1)
    if (!evt) return NextResponse.json({ success: false, error: 'Schedule event not found' }, { status: 404 })
  }

  const [expense] = await db.insert(mdExpenses).values({
    teamId: auth.teamId,
    category,
    amountCents: Math.round(amountCents),
    expenseDate,
    description: description ?? null,
    vehicleId: vehicleId ?? null,
    linkedScheduleEventId: linkedScheduleEventId ?? null,
    receiptUrl: receiptUrl ?? null,
  }).returning()

  return NextResponse.json({ success: true, expense })
}

export async function DELETE(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

  await db.delete(mdExpenses).where(and(eq(mdExpenses.id, id), eq(mdExpenses.teamId, auth.teamId)))
  return NextResponse.json({ success: true })
}
