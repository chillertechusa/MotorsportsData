/** Maximum number of founding-rig slots available for the Aug 31 2026 launch. */
export const FOUNDING_SLOT_CAP = 50

/** Only Race Team and Factory Rig plans consume a founding slot. Privateer does not. */
export const FOUNDING_ELIGIBLE_PLANS = ['race_team', 'factory_rig'] as const
export type FoundingEligiblePlan = typeof FOUNDING_ELIGIBLE_PLANS[number]
