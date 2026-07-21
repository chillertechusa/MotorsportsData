'use server'

import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers } from '@/lib/db/schema'
import { getSessionUserId } from '@/app/actions/md-subscription'
import { getSquareClient } from '@/lib/square'

export type BillingActionResult = { ok: true; message: string } | { ok: false; error: string }

/** Find the caller's owned team row (or null if not an owner). */
async function getOwnedTeam(userId: string) {
  const [membership] = await db
    .select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers)
    .where(and(eq(mdTeamMembers.userId, userId), eq(mdTeamMembers.role, 'owner')))
    .limit(1)
  if (!membership) return null
  const [team] = await db.select().from(mdTeams).where(eq(mdTeams.id, membership.teamId)).limit(1)
  return team ?? null
}

/**
 * Cancels the active Square subscription. Square schedules the cancellation for
 * the end of the current billing period, so the member keeps access until
 * periodEnd. We reflect that immediately with cancelAtPeriodEnd = true; the
 * subscription webhook confirms the final state.
 */
export async function cancelMySubscription(): Promise<BillingActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, error: 'You must be signed in.' }

  const team = await getOwnedTeam(userId)
  if (!team) return { ok: false, error: 'No team found for your account.' }
  if (!team.squareSubscriptionId) {
    return { ok: false, error: 'You do not have an active recurring subscription to cancel.' }
  }

  try {
    const client = getSquareClient()
    await client.subscriptions.cancel({ subscriptionId: team.squareSubscriptionId })

    await db.update(mdTeams).set({ cancelAtPeriodEnd: true }).where(eq(mdTeams.id, team.id))

    return {
      ok: true,
      message:
        'Your subscription will not renew. You keep full access until the end of your current billing period.',
    }
  } catch (err) {
    console.error('[md-billing-actions] cancel error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'Could not cancel your subscription. Please try again or contact support.' }
  }
}

/** Resumes a subscription that was scheduled to cancel, before the period ends. */
export async function resumeMySubscription(): Promise<BillingActionResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, error: 'You must be signed in.' }

  const team = await getOwnedTeam(userId)
  if (!team) return { ok: false, error: 'No team found for your account.' }
  if (!team.squareSubscriptionId) {
    return { ok: false, error: 'You do not have a subscription to resume.' }
  }

  try {
    const client = getSquareClient()
    await client.subscriptions.resume({ subscriptionId: team.squareSubscriptionId })

    await db
      .update(mdTeams)
      .set({ cancelAtPeriodEnd: false, subscriptionCanceledAt: null })
      .where(eq(mdTeams.id, team.id))

    return { ok: true, message: 'Your subscription has been resumed and will renew normally.' }
  } catch (err) {
    console.error('[md-billing-actions] resume error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'Could not resume your subscription. Please try again or contact support.' }
  }
}
