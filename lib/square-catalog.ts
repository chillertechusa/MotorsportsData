import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { mdSquarePlanCatalog } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { getSquareClient } from '@/lib/square'
import {
  MD_PLAN_IDS,
  MD_PLAN_LABELS,
  getPricingCents,
  type MdPlanId,
} from '@/lib/md-plans'

export type BillingFrequency = 'annual' | 'monthly'

/** Paid tiers only — FREE tiers (rookie, fan) never get a Square plan. */
export function paidTiers(): MdPlanId[] {
  return MD_PLAN_IDS.filter((t) => getPricingCents(t, 'annual') > 0)
}

/** Sandbox app ids start with "sandbox-"; everything else is production. */
function envTag(): string {
  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? ''
  return appId.startsWith('sandbox-') ? 'sandbox' : 'production'
}

const CADENCE: Record<BillingFrequency, string> = {
  annual: 'ANNUAL',
  monthly: 'MONTHLY',
}

/**
 * Look up a cached Square plan-variation id for a tier + frequency. If it is
 * not cached yet, bootstrap the whole catalog once, then return it.
 */
export async function getPlanVariationId(
  tier: MdPlanId,
  frequency: BillingFrequency,
): Promise<{ variationId: string; planId: string; amountCents: number } | null> {
  const environment = envTag()

  const cached = await db
    .select()
    .from(mdSquarePlanCatalog)
    .where(
      and(
        eq(mdSquarePlanCatalog.tier, tier),
        eq(mdSquarePlanCatalog.frequency, frequency),
        eq(mdSquarePlanCatalog.environment, environment),
      ),
    )
    .limit(1)

  if (cached[0]) {
    return {
      variationId: cached[0].squareVariationId,
      planId: cached[0].squarePlanId,
      amountCents: cached[0].amountCents,
    }
  }

  // Not cached — bootstrap everything, then re-read.
  await bootstrapSquareCatalog()

  const after = await db
    .select()
    .from(mdSquarePlanCatalog)
    .where(
      and(
        eq(mdSquarePlanCatalog.tier, tier),
        eq(mdSquarePlanCatalog.frequency, frequency),
        eq(mdSquarePlanCatalog.environment, environment),
      ),
    )
    .limit(1)

  if (!after[0]) return null
  return {
    variationId: after[0].squareVariationId,
    planId: after[0].squarePlanId,
    amountCents: after[0].amountCents,
  }
}

/**
 * Creates a Square SUBSCRIPTION_PLAN (with ANNUAL + MONTHLY variations) for
 * every paid tier that is not already cached, and stores the resulting
 * plan/variation ids in md_square_plan_catalog. Idempotent: tiers already in
 * the cache are skipped.
 */
export async function bootstrapSquareCatalog(): Promise<{
  created: string[]
  skipped: string[]
}> {
  const client = getSquareClient()
  const environment = envTag()
  const created: string[] = []
  const skipped: string[] = []

  for (const tier of paidTiers()) {
    // Skip if both frequencies are already cached for this tier.
    const existing = await db
      .select()
      .from(mdSquarePlanCatalog)
      .where(
        and(eq(mdSquarePlanCatalog.tier, tier), eq(mdSquarePlanCatalog.environment, environment)),
      )
    if (existing.length >= 2) {
      skipped.push(tier)
      continue
    }

    const planTempId = `#plan_${tier}`
    const annualTempId = `#var_${tier}_annual`
    const monthlyTempId = `#var_${tier}_monthly`
    const annualCents = getPricingCents(tier, 'annual')
    const monthlyCents = getPricingCents(tier, 'monthly')

    const buildVariation = (tempId: string, frequency: BillingFrequency, cents: number) => ({
      type: 'SUBSCRIPTION_PLAN_VARIATION' as const,
      id: tempId,
      subscriptionPlanVariationData: {
        name: `${MD_PLAN_LABELS[tier]} — ${frequency === 'annual' ? 'Annual' : 'Monthly'}`,
        phases: [
          {
            cadence: CADENCE[frequency] as any,
            pricing: {
              type: 'STATIC' as any,
              priceMoney: { amount: BigInt(cents), currency: 'USD' as any },
            },
          },
        ],
      },
    })

    const res: any = await client.catalog.object.upsert({
      idempotencyKey: randomUUID(),
      object: {
        type: 'SUBSCRIPTION_PLAN',
        id: planTempId,
        subscriptionPlanData: {
          name: `Motorsports Data — ${MD_PLAN_LABELS[tier]}`,
          subscriptionPlanVariations: [
            buildVariation(annualTempId, 'annual', annualCents),
            buildVariation(monthlyTempId, 'monthly', monthlyCents),
          ],
        },
      } as any,
    })

    // Response may be direct or wrapped in `.result` depending on SDK internals.
    const idMappings: Array<{ clientObjectId: string; objectId: string }> =
      res.idMappings ?? res.result?.idMappings ?? []
    const catalogObject = res.catalogObject ?? res.result?.catalogObject

    const realPlanId =
      idMappings.find((m) => m.clientObjectId === planTempId)?.objectId ??
      catalogObject?.id
    const realAnnualId = idMappings.find((m) => m.clientObjectId === annualTempId)?.objectId
    const realMonthlyId = idMappings.find((m) => m.clientObjectId === monthlyTempId)?.objectId

    if (!realPlanId || !realAnnualId || !realMonthlyId) {
      throw new Error(
        `Square catalog bootstrap for ${tier} returned incomplete id mappings: ${JSON.stringify(idMappings)}`,
      )
    }

    // Cache both variations.
    await db
      .insert(mdSquarePlanCatalog)
      .values([
        {
          tier,
          frequency: 'annual',
          squarePlanId: realPlanId,
          squareVariationId: realAnnualId,
          amountCents: annualCents,
          environment,
        },
        {
          tier,
          frequency: 'monthly',
          squarePlanId: realPlanId,
          squareVariationId: realMonthlyId,
          amountCents: monthlyCents,
          environment,
        },
      ])
      .onConflictDoNothing()

    created.push(tier)
  }

  return { created, skipped }
}
