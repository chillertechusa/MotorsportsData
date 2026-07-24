/** Maximum number of founding-rig slots available for the Aug 31 2026 launch. */
export const FOUNDING_SLOT_CAP = 50

/** Only Race Team and Factory Rig plans consume a founding slot. Privateer does not. */
export const FOUNDING_ELIGIBLE_PLANS = ['race_team', 'factory_rig'] as const
export type FoundingEligiblePlan = typeof FOUNDING_ELIGIBLE_PLANS[number]

/** Founding coaches are tracked separately and never consume race-team rig slots. */
export const FOUNDING_COACH_CAP = 25
export const FOUNDING_COACH_ELIGIBLE_PLANS = ['coach_pro', 'academy'] as const
export type FoundingCoachEligiblePlan = typeof FOUNDING_COACH_ELIGIBLE_PLANS[number]

export type FoundingCohort = 'founding_rig' | 'founding_coach'
