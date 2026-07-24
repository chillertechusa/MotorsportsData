import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdCoachInvoices, mdCoachClients } from '@/lib/db/schema'
import { and, count, desc, eq } from 'drizzle-orm'

export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  const invoices = await db.select({
    invoice: mdCoachInvoices,
    clientFirstName: mdCoachClients.firstName,
    clientLastName: mdCoachClients.lastName,
  })
    .from(mdCoachInvoices)
    .innerJoin(mdCoachClients, eq(mdCoachInvoices.clientId, mdCoachClients.id))
    .where(eq(mdCoachInvoices.coachTeamId, auth.teamId))
    .orderBy(desc(mdCoachInvoices.createdAt))

  return NextResponse.json({ success: true, invoices })
}

export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { clientId, packageId, amountCents, dueDate, lineItems, notes } = body

    if (!clientId || !amountCents || !dueDate) {
      return NextResponse.json({ success: false, error: 'clientId, amountCents, dueDate required' }, { status: 400 })
    }

    const [{ n }] = await db.select({ n: count() }).from(mdCoachInvoices)
      .where(eq(mdCoachInvoices.coachTeamId, auth.teamId))
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Number(n) + 1).padStart(4, '0')}`

    const [invoice] = await db.insert(mdCoachInvoices).values({
      coachTeamId: auth.teamId, clientId, packageId, invoiceNumber,
      amountCents, dueDate, lineItems: lineItems ?? [], notes, status: 'draft',
    }).returning()

    return NextResponse.json({ success: true, invoice }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create invoice' }, { status: 500 })
  }
}
