import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getSquareClient, squareLocationId, isSquareConfigured } from '@/lib/square'
import { SMX_ELITE_PLANS, type SmxElitePlanId, SMX_ELITE_PLAN_IDS } from '@/lib/md-plans'

/**
 * POST /api/smx/checkout
 * Body: { planId: SmxElitePlanId }
 *
 * Creates a Square payment link for the full SMX 2027 season total and returns
 * { url } — the client redirects to Square-hosted checkout immediately.
 * Square handles PCI, card capture, receipt, and webhook back to us.
 */
export async function POST(req: NextRequest) {
  if (!isSquareConfigured()) {
    return NextResponse.json(
      { error: 'Payments not configured.' },
      { status: 503 },
    )
  }

  let planId: SmxElitePlanId
  try {
    const body = await req.json()
    planId = body.planId
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!SMX_ELITE_PLAN_IDS.includes(planId)) {
    return NextResponse.json({ error: 'Unknown plan.' }, { status: 400 })
  }

  const plan = SMX_ELITE_PLANS[planId]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://motorsportsdata.io'

  try {
    const client = getSquareClient()

    const res: any = await client.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      order: {
        locationId: squareLocationId(),
        lineItems: [
          {
            name: `Motorsports Data — ${plan.label} SMX 2027 Season`,
            note: `Full season program Jan–May 2027. 17 rounds. ${plan.who}`,
            quantity: '1',
            basePriceMoney: {
              amount: BigInt(plan.seasonTotalCents),
              currency: 'USD',
            },
          },
        ],
      },
      checkoutOptions: {
        redirectUrl: `${siteUrl}/smx2027/thank-you?plan=${planId}`,
        askForShippingAddress: false,
        merchantSupportEmail: 'motorsportsdata@gmail.com',
      },

    })

    // Square SDK may wrap in .result depending on version
    const url: string | undefined =
      res?.paymentLink?.url ??
      res?.result?.paymentLink?.url

    if (!url) {
      console.error('[smx/checkout] Square returned no payment link URL', JSON.stringify(res))
      return NextResponse.json({ error: 'Failed to create checkout link.' }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[smx/checkout] Square error:', msg)
    return NextResponse.json({ error: 'Checkout creation failed.', detail: msg }, { status: 500 })
  }
}
