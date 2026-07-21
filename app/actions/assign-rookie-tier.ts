'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { trackSignup } from '@/lib/analytics'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers } from '@/lib/db/schema'
import { ROOKIE_TIER } from '@/lib/md-tiers'
import { eq } from 'drizzle-orm'

/**
 * Assigns a new user to the Rookie (free) tier.
 * Creates a default team if none exists, adds the user as owner.
 * Called after successful signup.
 */
export async function assignRookieTier() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      throw new Error('Unauthorized: no session')
    }

    // Check if user already has a team membership
    const existingMembership = await db
      .select({ teamId: mdTeamMembers.teamId })
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.userId, session.user.id))
      .limit(1)

    if (existingMembership.length > 0) {
      // User already has a team, nothing to do
      return { success: true, message: 'User already assigned to a team' }
    }

    // Create a default team with Rookie tier
    const teamName = `${session.user.name || 'My'} Team`
    const newTeam = await db
      .insert(mdTeams)
      .values({
        name: teamName,
        subscriptionTier: ROOKIE_TIER,
        subscriptionStatus: 'active',
      })
      .returning({ id: mdTeams.id })

    if (!newTeam || newTeam.length === 0) {
      throw new Error('Failed to create team')
    }

    const teamId = newTeam[0].id

    // Add user as owner of the team
    await db.insert(mdTeamMembers).values({
      userId: session.user.id,
      teamId,
      role: 'owner',
    })

    console.log(`[v0] Assigned user ${session.user.id} to Rookie tier in team ${teamId}`)

    // Track signup event for analytics
    void trackSignup(session.user.id, ROOKIE_TIER)

    return { success: true, teamId, tier: ROOKIE_TIER }
  } catch (error) {
    console.error('[v0] Error assigning rookie tier:', error)
    throw error
  }
}
