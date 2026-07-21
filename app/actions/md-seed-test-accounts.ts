'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers, user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TEST_ACCOUNTS, type SeedResult } from '@/lib/md-test-accounts'

/**
 * Idempotent seed — creates each test user via Better Auth (so passwords are
 * correctly hashed), then sets the team tier + subscription_status directly
 * via SQL. Safe to run multiple times; existing users are left alone and their
 * tiers are always reset to the expected value.
 */
export async function seedTestAccounts(): Promise<SeedResult[]> {
  const results: SeedResult[] = []

  for (const account of TEST_ACCOUNTS) {
    try {
      // 1. Try to create the user via Better Auth.
      let userId: string | null = null
      let status: SeedResult['status'] = 'created'

      try {
        const ctx = await auth.api.signUpEmail({
          body: {
            email: account.email,
            password: account.password,
            name: account.name,
          },
        })
        userId = ctx?.user?.id ?? null
      } catch {
        // User likely already exists — look them up.
        const [existing] = await db
          .select({ id: userTable.id })
          .from(userTable)
          .where(eq(userTable.email, account.email))
          .limit(1)
        if (existing?.id) {
          userId = existing.id
          status = 'already_exists'
        }
      }

      if (!userId) {
        results.push({ account, status: 'error', detail: 'Could not create or find user' })
        continue
      }

      // 2. Ensure the user has a team.
      let teamId: string | null = null
      const [membership] = await db
        .select({ teamId: mdTeamMembers.teamId })
        .from(mdTeamMembers)
        .where(eq(mdTeamMembers.userId, userId))
        .limit(1)

      if (membership?.teamId) {
        teamId = membership.teamId
      } else {
        // Create a team for this user.
        const [team] = await db
          .insert(mdTeams)
          .values({ name: `${account.name}'s Team` })
          .returning({ id: mdTeams.id })
        teamId = team?.id ?? null
        if (teamId) {
          await db.insert(mdTeamMembers).values({
            teamId,
            userId,
            role: 'owner',
          })
        }
      }

      if (!teamId) {
        results.push({ account, status: 'error', detail: 'Could not create team' })
        continue
      }

      // 3. Set the tier + activate the subscription.
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setDate(periodEnd.getDate() + 30)

      await db
        .update(mdTeams)
        .set({
          subscriptionTier: account.tier,
          subscriptionStatus: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        })
        .where(eq(mdTeams.id, teamId))

      if (status === 'already_exists') {
        results.push({ account, status: 'tier_updated' })
      } else {
        results.push({ account, status: 'created' })
      }
    } catch (err) {
      results.push({
        account,
        status: 'error',
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return results
}
