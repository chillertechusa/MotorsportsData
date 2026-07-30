import { db } from '@/lib/db'
import { mdInvoices, mdSponsors } from '@/lib/db/schema'
import { getSquareClientForToken } from '@/lib/square'
import { getSquareCredentialsForTeam } from '@/lib/md-square-connect'
import { eq, and, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

/**
 * Rail 2 of the money model: the family sends a REAL invoice from inside MD.
 * Square hosts the payment page, the sponsor pays by card/ACH, our webhook
 * marks it paid. The rider sees the full number — MD never taxes this rail.
 *
 * Flow (Square Invoices API):
 *   1. Ensure the sponsor has a Square Customer (created once, reused).
 *   2. Create an Order with one line item for the invoice amount.
 *   3. Create the Invoice against that order (EMAIL delivery, card+ACH on).
 *   4. Publish it — Square emails the sponsor a hosted payment link.
 */

export interface CreateInvoiceInput {
  teamId: string
  sponsorId: string
  title: string
  description?: string
  amountCents: number
  dueDate?: string // YYYY-MM-DD
}

export type CreateInvoiceResult =
  | { ok: true; invoiceId: string; invoiceNumber: string; publicUrl: string | null; status: string }
  | { ok: false; error: string }

/** Generates the next human-readable invoice number, e.g. MD-2026-0007. */
async function nextInvoiceNumber(teamId: string): Promise<string> {
  const year = new Date().getFullYear()
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mdInvoices)
    .where(eq(mdInvoices.teamId, teamId))
  const seq = String((row?.count ?? 0) + 1).padStart(4, '0')
  return `MD-${year}-${seq}`
}

/** Reads a value defensively from the SDK response (body or .result wrapper). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(res: any, key: string): T | undefined {
  return res?.[key] ?? res?.result?.[key]
}

export async function createAndSendSponsorInvoice(
  input: CreateInvoiceInput,
): Promise<CreateInvoiceResult> {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 100) {
    return { ok: false, error: 'invalid_amount' }
  }
  if (input.amountCents > 5_000_000) {
    // $50k cap — nobody fat-fingers a sponsor invoice into six figures.
    return { ok: false, error: 'amount_too_large' }
  }

  // Load the sponsor and verify it belongs to this team (per-team scoping).
  const [sponsor] = await db
    .select()
    .from(mdSponsors)
    .where(and(eq(mdSponsors.id, input.sponsorId), eq(mdSponsors.teamId, input.teamId)))
    .limit(1)
  if (!sponsor) return { ok: false, error: 'sponsor_not_found' }
  if (!sponsor.contactEmail) return { ok: false, error: 'sponsor_missing_email' }

  let seller: Awaited<ReturnType<typeof getSquareCredentialsForTeam>>
  try {
    seller = await getSquareCredentialsForTeam(input.teamId)
  } catch {
    return { ok: false, error: 'square_account_not_connected' }
  }
  const client = getSquareClientForToken(seller.accessToken)

  try {
    // 1. Ensure Square customer exists for this sponsor.
    let customerId = sponsor.squareCustomerId
    if (!customerId) {
      const custRes = await client.customers.create({
        idempotencyKey: randomUUID(),
        companyName: sponsor.sponsorName,
        givenName: sponsor.contactName ?? sponsor.sponsorName,
        emailAddress: sponsor.contactEmail,
        note: 'MD sponsor — created by motorsportsdata.io invoicing',
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customerId = (unwrap<any>(custRes, 'customer'))?.id ?? null
      if (!customerId) return { ok: false, error: 'square_customer_failed' }
      await db
        .update(mdSponsors)
        .set({ squareCustomerId: customerId })
        .where(eq(mdSponsors.id, sponsor.id))
    }

    // 2. Create the order (one line item).
    const orderRes = await client.orders.create({
      idempotencyKey: randomUUID(),
      order: {
        locationId: seller.locationId,
        customerId,
        lineItems: [
          {
            name: input.title.slice(0, 255),
            quantity: '1',
            basePriceMoney: { amount: BigInt(input.amountCents), currency: 'USD' },
            note: input.description?.slice(0, 500),
          },
        ],
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderId = (unwrap<any>(orderRes, 'order'))?.id
    if (!orderId) return { ok: false, error: 'square_order_failed' }

    // 3. Create the invoice.
    const invoiceNumber = await nextInvoiceNumber(input.teamId)
    const dueDate =
      input.dueDate ??
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const invRes = await client.invoices.create({
      idempotencyKey: randomUUID(),
      invoice: {
        orderId,
        locationId: seller.locationId,
        primaryRecipient: { customerId },
        invoiceNumber,
        title: input.title.slice(0, 255),
        description: input.description?.slice(0, 65536),
        deliveryMethod: 'EMAIL',
        acceptedPaymentMethods: {
          card: true,
          bankAccount: true,
          squareGiftCard: false,
          buyNowPayLater: false,
        },
        paymentRequests: [
          { requestType: 'BALANCE', dueDate, automaticPaymentSource: 'NONE' },
        ],
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = unwrap<any>(invRes, 'invoice')
    if (!created?.id) return { ok: false, error: 'square_invoice_failed' }

    // 4. Publish — Square emails the sponsor the hosted payment link.
    const pubRes = await client.invoices.publish({
      invoiceId: created.id,
      idempotencyKey: randomUUID(),
      version: created.version ?? 0,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const published = unwrap<any>(pubRes, 'invoice')

    // 5. Persist our record.
    const [saved] = await db
      .insert(mdInvoices)
      .values({
        teamId: input.teamId,
        sponsorId: sponsor.id,
        invoiceNumber,
        title: input.title,
        description: input.description,
        amountCents: input.amountCents,
        status: 'sent',
        squareInvoiceId: created.id,
        squareOrderId: orderId,
        publicUrl: published?.publicUrl ?? null,
        dueDate,
        sentAt: new Date(),
      })
      .returning({ id: mdInvoices.id })

    return {
      ok: true,
      invoiceId: saved.id,
      invoiceNumber,
      publicUrl: published?.publicUrl ?? null,
      status: 'sent',
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[md-invoicing] create/send failed:', msg)
    return { ok: false, error: 'square_error' }
  }
}

/** Marks an invoice paid from the Square webhook (invoice.payment_made). */
export async function markInvoicePaidBySquareId(squareInvoiceId: string): Promise<boolean> {
  const [row] = await db
    .update(mdInvoices)
    .set({ status: 'paid', paidAt: new Date() })
    .where(eq(mdInvoices.squareInvoiceId, squareInvoiceId))
    .returning({ id: mdInvoices.id })
  return Boolean(row)
}

/** Marks an invoice canceled from the Square webhook (invoice.canceled). */
export async function markInvoiceCanceledBySquareId(squareInvoiceId: string): Promise<boolean> {
  const [row] = await db
    .update(mdInvoices)
    .set({ status: 'canceled' })
    .where(eq(mdInvoices.squareInvoiceId, squareInvoiceId))
    .returning({ id: mdInvoices.id })
  return Boolean(row)
}
