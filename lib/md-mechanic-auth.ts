import { getSessionTeamId } from './md-auth'
import { db } from './db'
import { mdTeams } from './db/schema'
import { eq } from 'drizzle-orm'
import { isMechanicProTier } from './md-tiers'

/**
 * Check if team has Mechanic Pro tier access
 */
export async function hasMechanicProAccess(): Promise<boolean> {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return false

    const team = await db
      .select()
      .from(mdTeams)
      .where(eq(mdTeams.id, auth.teamId))
      .limit(1)
      .then(rows => rows[0])

    if (!team) return false

    return isMechanicProTier(team.subscriptionTier)
  } catch {
    return false
  }
}

/**
 * Require Mechanic Pro tier or throw error
 */
export async function requireMechanicProTier() {
  const hasAccess = await hasMechanicProAccess()
  if (!hasAccess) {
    throw new Error('Mechanic Pro requires Mechanic Pro subscription')
  }
}

/**
 * Get team subscription tier
 */
export async function getTeamSubscriptionTier(): Promise<string | null> {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return null

    const team = await db
      .select()
      .from(mdTeams)
      .where(eq(mdTeams.id, auth.teamId))
      .limit(1)
      .then(rows => rows[0])

    return team?.subscriptionTier ?? null
  } catch {
    return null
  }
}
