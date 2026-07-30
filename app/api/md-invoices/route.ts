import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdInvoices, mdSponsors } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'
import { createAndSendSponsorInvoice } from '@/lib/md-invoicing'
import { eq, desc } from 'drizzle-orm'

/**
 * Sponsor invoicing — Rail 2.
 *   GET  → list this team's invoices (newest first) + sponsors for the form
 *   POST → create + send a Square invoice to a sponsor
 * Every query is scoped to the session team. No cross-team access, ever.
 */

export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [invoices, sponsors] = await Promise.all([
    db
      .select()
      .from(mdInvoices)
      .where(eq(mdInvoices.teamId, auth.teamId))
      .orderBy(desc(mdInvoices.createdAt))
      .limit(100),
    db
      .select({
        id: mdSponsors.id,
        sponsorName: mdSponsors.sponsorName,
        contactEmail: mdSponsors.contactEmail,
        valueCents: mdSponsors.valueCents,
        status: mdSponsors.status,
      })
      .from(mdSponsors)
      .where(eq(mdSponsors.teamId, auth.teamId)),
  ])

  return NextResponse.json({ invoices, sponsors })
}

export async function POST(request: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { sponsorId, title, description, amountCents, dueDate } = (body ?? {}) as {
    sponsorId?: string
    title?: string
    description?: string
    amountCents?: number
    dueDate?: string
  }

  if (!sponsorId || typeof sponsorId !== 'string') {
    return NextResponse.json({ error: 'sponsor_required' }, { status: 400 })
  }
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return NextResponse.json({ error: 'title_required' }, { status: 400 })
  }
  if (typeof amountCents !== 'number' || !Number.isInteger(amountCents) || amountCents < 100) {
    return NextResponse.json({ error: 'invalid_amount' }, { status: 400 })
  }
  if (dueDate !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return NextResponse.json({ error: 'invalid_due_date' }, { status: 400 })
  }

  const result = await createAndSendSponsorInvoice({
    teamId: auth.teamId,
    sponsorId,
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : undefined,
    amountCents,
    dueDate,
  })

  if (!result.ok) {
    const status = result.error === 'sponsor_not_found' ? 404 : 400
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result, { status: 201 })
}
