import { getSessionTeamId } from './md-auth'
import { db } from './db'
import { mdTeams } from './db/schema'
import { eq } from 'drizzle-orm'

const LIVE_COACHING_TIERS = ['factory_rig']

/**
 * Check if team has Live Coaching tier access
 */
export async function hasLiveCoachingAccess(): Promise<boolean> {
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

    return LIVE_COACHING_TIERS.includes(team.subscriptionTier || '')
  } catch {
    return false
  }
}

/**
 * Require Live Coaching tier or throw error
 */
export async function requireLiveCoachingAccess() {
  const hasAccess = await hasLiveCoachingAccess()
  if (!hasAccess) {
    throw new Error('Live Coaching requires Factory Rig subscription')
  }
}
