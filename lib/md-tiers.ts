/** Canonical tier values — client-safe, no server imports. */
export const FAN_TIER = 'fan'
export const ROOKIE_TIER = 'rookie'
export const PRIVATEER_TIER = 'privateer'
export const WRENCH_TIER = 'wrench'
export const RACE_TEAM_TIER = 'race_team'
export const COACH_TIER = 'coach'
export const AGENT_TIER = 'agent'
export const FACTORY_TIER = 'factory_rig'

/** Legacy alias — early builds used 'mechanic_pro'; the DB now stores 'wrench'. */
export const MECHANIC_PRO_TIER = 'mechanic_pro'

export type MdTier =
  | typeof FAN_TIER
  | typeof ROOKIE_TIER
  | typeof PRIVATEER_TIER
  | typeof WRENCH_TIER
  | typeof RACE_TEAM_TIER
  | typeof COACH_TIER
  | typeof AGENT_TIER
  | typeof FACTORY_TIER
  | typeof MECHANIC_PRO_TIER

/** Vehicle limits per tier. */
export const TIER_VEHICLE_LIMIT: Record<MdTier, number> = {
  fan: 1,
  rookie: 1,
  privateer: 1,
  wrench: 3,
  race_team: 5,
  coach: 5,
  agent: Infinity,
  factory_rig: Infinity,
  mechanic_pro: 3,
}

/**
 * Numeric rank for tier comparisons — higher = more access.
 * Free tiers (fan/rookie) sit at the bottom. The professional tiers (wrench,
 * coach, agent) are ranked so the coarse rank-based gates unlock the right
 * tools: coach & agent must clear the Race Team gate so their coaching/scouting
 * features are visible, and wrench clears Privateer for mechanic features.
 */
const TIER_RANK: Record<MdTier, number> = {
  fan: 0,
  rookie: 0,
  privateer: 1,
  wrench: 1.5,
  mechanic_pro: 1.5,
  race_team: 2,
  coach: 2.5,
  agent: 2.8,
  factory_rig: 3,
}

/** Short display labels — used for nav lock hints ("Privateer+", etc.). */
export const TIER_LABELS: Record<MdTier, string> = {
  fan: 'Fan',
  rookie: 'Free Rider',
  privateer: 'Privateer',
  wrench: 'Wrench',
  race_team: 'Race Team',
  coach: 'Coach',
  agent: 'Agent',
  factory_rig: 'Factory Rig',
  mechanic_pro: 'Wrench',
}

export function tierRank(tier: string | null | undefined): number {
  return TIER_RANK[(tier ?? 'privateer') as MdTier] ?? 1
}

/** Label for a minimum-tier gate, e.g. "Privateer+" or "Race Team+". */
export function tierLabel(tier: string | null | undefined): string {
  return TIER_LABELS[(tier ?? 'privateer') as MdTier] ?? 'Privateer'
}

/** True when `tier` meets or exceeds `minTier` by rank. */
export function meetsMinTier(tier: string | null | undefined, minTier: string): boolean {
  return tierRank(tier) >= tierRank(minTier)
}

export function isRaceTeamOrAbove(tier: string | null | undefined): boolean {
  return tierRank(tier) >= TIER_RANK.race_team
}

export function isFactoryTier(tier: string | null | undefined): boolean {
  return tier === FACTORY_TIER
}

/** True when the team is on the professional mechanic tier (Wrench, or legacy mechanic_pro). */
export function isMechanicProTier(tier: string | null | undefined): boolean {
  return tier === WRENCH_TIER || tier === MECHANIC_PRO_TIER
}

/** True when the team is on the training-coach tier. */
export function isCoachTier(tier: string | null | undefined): boolean {
  return tier === COACH_TIER
}

/** True when the team is on the agent tier. */
export function isAgentTier(tier: string | null | undefined): boolean {
  return tier === AGENT_TIER
}

// Role constants — user-level roles within a team
export const ROLE_OWNER = 'owner'
export const ROLE_COACH = 'coach'
export const ROLE_MECHANIC = 'mechanic'
export const ROLE_MECHANIC_COACH = 'mechanic_coach'
// Factory Rig expansion roles (validated against real SMX/MXGP team structures)
export const ROLE_TEAM_MANAGER = 'team_manager'
export const ROLE_CREW_CHIEF = 'crew_chief'
export const ROLE_TRAINER = 'trainer'
export const ROLE_PHYSIO = 'physio'
export const ROLE_DATA_ANALYST = 'data_analyst'
export const ROLE_TRUCK_DRIVER = 'truck_driver'
export const ROLE_MEDIA_MANAGER = 'media_manager'

export type MdRole =
  | typeof ROLE_OWNER
  | typeof ROLE_COACH
  | typeof ROLE_MECHANIC
  | typeof ROLE_MECHANIC_COACH
  | typeof ROLE_TEAM_MANAGER
  | typeof ROLE_CREW_CHIEF
  | typeof ROLE_TRAINER
  | typeof ROLE_PHYSIO
  | typeof ROLE_DATA_ANALYST
  | typeof ROLE_TRUCK_DRIVER
  | typeof ROLE_MEDIA_MANAGER

/** Canonical list of every assignable team role. */
export const ALL_TEAM_ROLES: MdRole[] = [
  ROLE_OWNER,
  ROLE_TEAM_MANAGER,
  ROLE_CREW_CHIEF,
  ROLE_MECHANIC,
  ROLE_MECHANIC_COACH,
  ROLE_DATA_ANALYST,
  ROLE_COACH,
  ROLE_TRAINER,
  ROLE_PHYSIO,
  ROLE_TRUCK_DRIVER,
  ROLE_MEDIA_MANAGER,
]

/** Human-readable labels for each role. */
export const ROLE_LABELS: Record<MdRole, string> = {
  owner: 'Owner',
  team_manager: 'Team Manager',
  crew_chief: 'Crew Chief',
  mechanic: 'Mechanic',
  mechanic_coach: 'Mechanic Coach',
  data_analyst: 'Data Analyst',
  coach: 'Coach',
  trainer: 'Trainer',
  physio: 'Physio',
  truck_driver: 'Truck Driver',
  media_manager: 'Media Manager',
}

/** True when role has access to mechanic setup AI features. */
export function isMechanicRole(role: string | null | undefined): boolean {
  return role === ROLE_MECHANIC || role === ROLE_MECHANIC_COACH || role === ROLE_CREW_CHIEF
}

/** True when role has access to coach IP Vault / accountability features. */
export function isCoachRole(role: string | null | undefined): boolean {
  return role === ROLE_COACH || role === ROLE_MECHANIC_COACH || role === ROLE_OWNER
}

/** True when role is management-level (team-wide admin authority). */
export function isManagementRole(role: string | null | undefined): boolean {
  return role === ROLE_OWNER || role === ROLE_TEAM_MANAGER
}

/** True when role is a technical/data role that works with bikes and telemetry. */
export function isTechnicalRole(role: string | null | undefined): boolean {
  return (
    role === ROLE_MECHANIC ||
    role === ROLE_MECHANIC_COACH ||
    role === ROLE_CREW_CHIEF ||
    role === ROLE_DATA_ANALYST
  )
}

/** True when role handles rider health/conditioning (consent-gated data). */
export function isHealthRole(role: string | null | undefined): boolean {
  return role === ROLE_TRAINER || role === ROLE_PHYSIO
}

/** True when role is a logistics/operations support role (narrow access). */
export function isOperationsRole(role: string | null | undefined): boolean {
  return role === ROLE_TRUCK_DRIVER || role === ROLE_MEDIA_MANAGER
}

/** True when role may read telemetry data (owner, crew chief, coach, analyst). */
export function canViewTelemetry(role: string | null | undefined): boolean {
  return (
    role === ROLE_OWNER ||
    role === ROLE_CREW_CHIEF ||
    role === ROLE_COACH ||
    role === ROLE_MECHANIC_COACH ||
    role === ROLE_DATA_ANALYST
  )
}

/** True when the team is on the entry-level youth (Rookie) plan. */
export function isRookieTier(tier: string | null | undefined): boolean {
  return tier === ROOKIE_TIER
}
