export type MdPlanId = 'rookie' | 'privateer' | 'wrench' | 'race_team' | 'factory_rig' | 'agent' | 'fan' | 'coach'

// ── SMX 2027 Elite Season Program IDs ──────────────────────────────────────
// These are season-length contracts, not recurring subscriptions.
// Pricing is the FULL SEASON TOTAL in cents (17 rounds, Jan–May 2027).
export type SmxElitePlanId = 'smx_team_partner' | 'smx_command_partner' | 'smx_factory_command'

export const SMX_ELITE_PLANS: Record<SmxElitePlanId, {
  label: string
  monthlyPrice: number        // displayed monthly rate (dollars)
  seasonTotal: number         // full season total (dollars) — what Square charges
  seasonTotalCents: number    // Square amount in cents
  tag: string
  who: string
  accent: string
  accentText: string
  accentBg: string
  topBar: string
  popular: boolean
}> = {
  smx_team_partner: {
    label: 'Team Partner',
    monthlyPrice: 2500,
    seasonTotal: 42500,
    seasonTotalCents: 4250000,   // $42,500.00
    tag: 'Entry Program',
    who: '1–3 rider team. Full telemetry, crew chief AI, Command Rig access.',
    accent: 'border-amber-400/40',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-400/5',
    topBar: 'bg-amber-400/60',
    popular: false,
  },
  smx_command_partner: {
    label: 'Command Partner',
    monthlyPrice: 7500,
    seasonTotal: 127500,
    seasonTotalCents: 12750000,  // $127,500.00
    tag: 'Recommended',
    who: '4–8 rider program. Dedicated analyst + rig desk at every venue.',
    accent: 'border-lime-400/60',
    accentText: 'text-lime-400',
    accentBg: 'bg-lime-400/5',
    topBar: 'bg-lime-400',
    popular: true,
  },
  smx_factory_command: {
    label: 'Factory Command',
    monthlyPrice: 18000,
    seasonTotal: 306000,
    seasonTotalCents: 30600000,  // $306,000.00
    tag: 'Factory Program',
    who: 'Manufacturer-backed program. Embedded analyst. Private data infrastructure.',
    accent: 'border-red-400/40',
    accentText: 'text-red-400',
    accentBg: 'bg-red-400/5',
    topBar: 'bg-red-500/60',
    popular: false,
  },
}

export const SMX_ELITE_PLAN_IDS: SmxElitePlanId[] = [
  'smx_team_partner',
  'smx_command_partner',
  'smx_factory_command',
]

// Annual pricing (stored in CENTS) — derived from target monthly pricing with 15% markup
// Target monthly prices: Rookie FREE | Privateer $79 | Wrench $149 | Race Team $399 | Factory Rig $3,999 | Agent $1,199 | Coach $299 | Fan FREE
// Annual = (monthly × 12) / 1.15
export const MD_PLAN_CENTS: Record<MdPlanId, number> = {
  rookie: 0,             // FREE — youth / entry
  privateer: 82300,      // $823/year ($79/mo × 12 ÷ 1.15) — solo riders
  wrench: 155300,        // $1,553/year ($149/mo × 12 ÷ 1.15) — professional mechanics (career portfolio)
  race_team: 415300,     // $4,153/year ($399/mo × 12 ÷ 1.15) — regional teams
  factory_rig: 4156500,  // $41,565/year ($3,999/mo × 12 ÷ 1.15) — professional factory operations
  agent: 1251300,        // $12,513/year ($1,199/mo × 12 ÷ 1.15) — agents & teams (contract negotiation + prospect scouting)
  fan: 0,                // FREE — community spectators
  coach: 311300,         // $3,113/year ($299/mo × 12 ÷ 1.15) — training coaches (cross-team coaching access)
}

// Billing frequency multiplier: paying monthly costs 15% more than the annual
// plan over a full year (i.e. annual buyers get ~13% off vs monthly).
export const BILLING_MULTIPLIER_MONTHLY = 1.15

// The PER-MONTH price charged on a monthly-cadence subscription, in cents.
// annual total (already discounted) × 1.15 gives the un-discounted yearly sum
// for monthly payers; divide by 12 to get the actual monthly charge.
// e.g. Privateer: 82300 × 1.15 / 12 ≈ 7887 → ~$78.87/mo (target ~$79/mo).
export const MD_PLAN_CENTS_MONTHLY: Record<MdPlanId, number> = Object.entries(MD_PLAN_CENTS).reduce(
  (acc, [tier, annualCents]) => {
    acc[tier as MdPlanId] =
      annualCents === 0 ? 0 : Math.round((annualCents * BILLING_MULTIPLIER_MONTHLY) / 12)
    return acc
  },
  {} as Record<MdPlanId, number>
)

// Get pricing for a specific tier and frequency
export function getPricingCents(tierId: MdPlanId, frequency: 'annual' | 'monthly'): number {
  return frequency === 'annual' ? MD_PLAN_CENTS[tierId] : MD_PLAN_CENTS_MONTHLY[tierId]
}

// Format pricing for display
export function formatPricingDisplay(tierId: MdPlanId): string {
  const annual = MD_PLAN_CENTS[tierId]
  if (annual === 0) return 'FREE'
  const monthly = MD_PLAN_CENTS_MONTHLY[tierId]
  const annualDollars = (annual / 100).toFixed(0)
  const monthlyDollars = (monthly / 100).toFixed(0)
  const monthlySavings = Math.round(((monthly * 12 - annual) / (monthly * 12)) * 100)
  return `$${annualDollars}/year (Save ${monthlySavings}%) or $${monthlyDollars}/month`
}

export const MD_PLAN_LABELS: Record<MdPlanId, string> = {
  rookie: 'Free Rider',
  privateer: 'The Privateer',
  wrench: 'The Wrench',
  race_team: 'The Race Team',
  factory_rig: 'The Factory Rig',
  agent: 'Agent',
  fan: 'The Fan',
  coach: 'Coach',
}

export const MD_PLAN_IDS: MdPlanId[] = ['rookie', 'privateer', 'wrench', 'race_team', 'factory_rig', 'agent', 'fan', 'coach']

// Tier categories for navigation organization
export const TIER_CATEGORIES = {
  riders: ['fan', 'rookie', 'privateer'] as const,
  teams: ['race_team', 'factory_rig'] as const,
  professional: ['wrench', 'agent', 'coach'] as const,
} as const

export function isMdPlanId(value: unknown): value is MdPlanId {
  return typeof value === 'string' && MD_PLAN_IDS.includes(value as MdPlanId)
}

/** The Wrench tier targets professional mechanics — not riders.
 *  Their account is their career portfolio: work orders, setup deltas, rider outcomes.
 *  They carry it from team to team. That's the lock-in.
 */
export const MECHANIC_PLAN_ID: MdPlanId = 'wrench'
