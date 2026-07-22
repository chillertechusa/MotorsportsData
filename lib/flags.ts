import { flag } from 'flags/next'

/**
 * Feature flags for A/B testing pricing and product features
 * Controlled via Vercel Flags UI — no code redeploy needed
 * All flags are cached on first request, refresh every 5 minutes
 */

/**
 * Aggressive Discount Test: Show 30% off for annual plans (vs. standard 20%)
 * Measures: conversion lift, LTV impact, cannibalization
 */
export const aggressiveDiscountFlag = flag<boolean>({
  key: 'aggressive-discount-test',
  description: 'Show 30% off annual plans instead of 20%',
  defaultValue: false,
  decide: () => false,
})

/**
 * Bundle Upsell Test: Show "Team Bundle" tier ($99/mo for 3 teams vs. $49/mo each)
 * Measures: ARPU, team expansion, attach rate
 */
export const bundleUpsellFlag = flag<boolean>({
  key: 'bundle-upsell-test',
  description: 'Show Team Bundle tier as primary upsell',
  defaultValue: false,
  decide: () => false,
})

/**
 * Elite Tier Cap Test: Limit Elite tier to 10 team slots (vs. unlimited)
 * Measures: willingness to upgrade further (if higher tier exists), LTV per tier
 */
export const eliteTierCapFlag = flag<boolean>({
  key: 'elite-tier-cap-test',
  description: 'Cap Elite tier at 10 vehicle slots',
  defaultValue: false,
  decide: () => false,
})

/**
 * Helper: Get discount percentage based on flag
 */
export function getAnnualDiscount(aggressiveEnabled: boolean): number {
  return aggressiveEnabled ? 30 : 20
}

/**
 * Helper: Get tier pricing based on bundle flag
 */
export function getTierPricing(bundleEnabled: boolean): Record<string, number> {
  if (bundleEnabled) {
    return {
      rookie: 49,
      privateer: 99, // Bundle: 3 teams
      pro: 199,
      elite: 499,
    }
  }
  return {
    rookie: 49,
    privateer: 79,
    pro: 199,
    elite: 499,
  }
}

/**
 * Helper: Get elite tier vehicle limit based on flag
 */
export function getEliteVehicleLimit(capEnabled: boolean): number {
  return capEnabled ? 10 : Infinity
}
