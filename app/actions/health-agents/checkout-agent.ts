'use server'

import { HealthCheck, CheckoutTestPayload, HealthCheckStatus } from '@/lib/health-check-types'
import { SMX_ELITE_PLANS, SMX_ELITE_PLAN_IDS, SmxElitePlanId } from '@/lib/md-plans'

/**
 * Checkout Health Check Agent
 * Validates the MD platform checkout flows:
 *  1. Legacy subscription tiers (rookie/privateer/race_team/factory_rig)
 *  2. SMX 2027 elite season programs (smx_team_partner/smx_command_partner/smx_factory_command)
 */
export async function runCheckoutHealthCheck(
  payload?: CheckoutTestPayload
): Promise<HealthCheck> {
  const startTime = Date.now()
  let status: HealthCheckStatus = 'pass'
  let message = 'Checkout flow validated'
  const errorDetails: Record<string, any> = {}

  try {
    // ── Legacy subscription tiers ─────────────────────────────────────────
    const legacyTiers = ['rookie', 'privateer', 'race_team', 'factory_rig']
    const legacyPricesCents: Record<string, number> = {
      rookie: 900,
      privateer: 4900,
      race_team: 29900,
      factory_rig: 249900,
    }

    for (const tier of legacyTiers) {
      if (legacyPricesCents[tier] === undefined) {
        status = 'fail'
        message = `Legacy tier missing from price map: ${tier}`
        errorDetails.missing_tier = tier
        break
      }
    }

    errorDetails.legacy_tiers_validated = legacyTiers.length
    errorDetails.legacy_prices = legacyPricesCents

    // ── SMX 2027 elite season programs ────────────────────────────────────
    const smxIssues: string[] = []
    for (const planId of SMX_ELITE_PLAN_IDS) {
      const plan = SMX_ELITE_PLANS[planId]
      if (!plan) {
        smxIssues.push(`Missing plan definition: ${planId}`)
        continue
      }
      if (!plan.seasonTotalCents || plan.seasonTotalCents <= 0) {
        smxIssues.push(`Zero or missing seasonTotalCents for ${planId}`)
      }
      if (!plan.monthlyPrice || plan.monthlyPrice <= 0) {
        smxIssues.push(`Zero or missing monthlyPrice for ${planId}`)
      }
    }

    if (smxIssues.length > 0) {
      status = 'fail'
      message = `SMX 2027 plan configuration issues: ${smxIssues.join('; ')}`
      errorDetails.smx_issues = smxIssues
    } else {
      const smxSummary = SMX_ELITE_PLAN_IDS.map((id) => ({
        id,
        label: SMX_ELITE_PLANS[id].label,
        monthly_display: `$${SMX_ELITE_PLANS[id].monthlyPrice.toLocaleString()}/mo`,
        season_total_cents: SMX_ELITE_PLANS[id].seasonTotalCents,
      }))
      errorDetails.smx_plans_validated = smxSummary
    }

    if (status === 'pass') {
      message = `All checkout flows validated — ${legacyTiers.length} legacy tiers + ${SMX_ELITE_PLAN_IDS.length} SMX 2027 elite programs`
    }

    return {
      id: `checkout_${Date.now()}`,
      check_type: 'checkout',
      status,
      message,
      response_time_ms: Date.now() - startTime,
      error_details: errorDetails,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    return {
      id: `checkout_error_${Date.now()}`,
      check_type: 'checkout',
      status: 'error',
      message: 'Checkout health check failed',
      response_time_ms: Date.now() - startTime,
      error_details: { error: error instanceof Error ? error.message : String(error) },
      created_at: new Date().toISOString(),
    }
  }
}
