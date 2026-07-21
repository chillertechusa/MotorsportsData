/**
 * MD platform auth helpers.
 * Every API route that touches md_ tables calls getSessionTeamId() first.
 * It resolves the Better Auth session, then looks up the team the user belongs
 * to. If there is no session or no team membership the route should 401/403.
 */
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdTeams } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// Imported from md-tiers (no server-only deps) so client components can also
// import it directly from there without pulling in next/headers etc.
import { FACTORY_TIER, RACE_TEAM_TIER, isRaceTeamOrAbove } from '@/lib/md-tiers'
export { FACTORY_TIER, RACE_TEAM_TIER }

export type TeamAuthResult =
  | { ok: true; userId: string; teamId: string; role: string }
  | { ok: false; status: 401 | 403; error: string }

export async function getSessionTeamId(): Promise<TeamAuthResult> {
  // Resolve the Better Auth session from the incoming request headers.
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { ok: false, status: 401, error: 'Not authenticated' }
  }
  const userId = session.user.id

  // Find the first team this user belongs to.
  const [membership] = await db
    .select({ teamId: mdTeamMembers.teamId, role: mdTeamMembers.role })
    .from(mdTeamMembers)
    .where(eq(mdTeamMembers.userId, userId))
    .limit(1)

  if (!membership) {
    return { ok: false, status: 403, error: 'No team membership found for this user' }
  }

  return { ok: true, userId, teamId: membership.teamId!, role: membership.role ?? 'mechanic' }
}

/**
 * Verify that a given vehicleId actually belongs to the caller's team.
 * Prevents cross-team data injection via a crafted POST body.
 */
import { mdVehicles, mdPartVault } from '@/lib/db/schema'

export async function assertVehicleOwnership(
  vehicleId: string,
  teamId: string,
): Promise<boolean> {
  // Single scoped query: the row only comes back if BOTH the id AND the team match.
  const [vehicle] = await db
    .select({ id: mdVehicles.id })
    .from(mdVehicles)
    .where(and(eq(mdVehicles.id, vehicleId), eq(mdVehicles.teamId, teamId)))
    .limit(1)

  return vehicle?.id !== undefined
}

/**
 * Confirm a part belongs to a vehicle owned by the caller's team.
 * Used by all /api/md-parts/[partId] mutations so a crafted partId can't
 * touch another team's data.
 */
export async function assertPartOwnership(
  partId: string,
  teamId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: mdPartVault.id })
    .from(mdPartVault)
    .innerJoin(mdVehicles, eq(mdPartVault.vehicleId, mdVehicles.id))
    .where(and(eq(mdPartVault.id, partId), eq(mdVehicles.teamId, teamId)))
    .limit(1)

  return row?.id !== undefined
}

/**
 * Returns the subscription tier for a team, or 'privateer' as fallback.
 */
export async function getTeamTier(teamId: string): Promise<string> {
  const [team] = await db
    .select({ tier: mdTeams.subscriptionTier })
    .from(mdTeams)
    .where(eq(mdTeams.id, teamId))
    .limit(1)

  return team?.tier ?? 'privateer'
}

/**
 * Hard paywall check — Race Team or above.
 */
export async function assertRaceTeamOrAbove(teamId: string): Promise<boolean> {
  const tier = await getTeamTier(teamId)
  return isRaceTeamOrAbove(tier)
}

/**
 * Hard paywall check. Returns true ONLY when the team is on the premium
 * (factory_rig) tier. Premium API routes call this and 403 before any work.
 */
export async function assertFactoryTier(teamId: string): Promise<boolean> {
  const tier = await getTeamTier(teamId)
  return tier === FACTORY_TIER
}
