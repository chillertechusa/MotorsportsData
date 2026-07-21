'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdAbandonedCheckouts, mdTeams, mdTeamMembers } from '@/lib/db/schema'
import { eq, and, lt, isNull, or } from 'drizzle-orm'
import { isMdPlanId, MD_PLAN_LABELS, type MdPlanId } from '@/lib/md-plans'
import { sendMdAbandonedCheckoutEmail } from '@/lib/md-email'

/**
 * Called server-side when a signed-in user loads the checkout page.
 * Upserts a row so we know they showed intent. Safe no-op if already subscribed.
 */
export async function recordCheckoutIntent(plan: string): Promise<void> {
  if (!isMdPlanId(plan)) return

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return

  const userId = session.user.id
  const email  = session.user.email ?? ''
  const name   = session.user.name ?? ''

  // Don't record if they already have an active subscription on any team
  const [activeMembership] = await db
    .select({ id: mdTeamMembers.id })
    .from(mdTeamMembers)
    .innerJoin(mdTeams, eq(mdTeams.id, mdTeamMembers.teamId))
    .where(and(
      eq(mdTeamMembers.userId, userId),
      eq(mdTeams.subscriptionStatus, 'active'),
    ))
    .limit(1)
  if (activeMembership) return

  // Upsert: one row per user+plan combo, reset timestamps if they bounce & return
  const existing = await db
    .select({ id: mdAbandonedCheckouts.id })
    .from(mdAbandonedCheckouts)
    .where(and(
      eq(mdAbandonedCheckouts.userId, userId),
      eq(mdAbandonedCheckouts.plan, plan),
      eq(mdAbandonedCheckouts.converted, false),
    ))
    .limit(1)

  if (existing.length === 0) {
    await db.insert(mdAbandonedCheckouts).values({
      userId,
      email,
      name: name || null,
      plan,
      emailSent: false,
      converted: false,
    })
  }
}

/**
 * Called after a successful subscription to mark all pending abandoned-checkout
 * rows for that user as converted (prevents recovery email from firing).
 */
export async function markCheckoutConverted(userId: string): Promise<void> {
  await db
    .update(mdAbandonedCheckouts)
    .set({ converted: true })
    .where(and(
      eq(mdAbandonedCheckouts.userId, userId),
      eq(mdAbandonedCheckouts.converted, false),
    ))
}

/**
 * Cron handler — send recovery emails to users who abandoned checkout
 * more than 1 hour ago and haven't converted or already been emailed.
 */
export async function sendAbandonedCheckoutEmails(): Promise<{ sent: number; errors: string[] }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const rows = await db
    .select()
    .from(mdAbandonedCheckouts)
    .where(and(
      eq(mdAbandonedCheckouts.emailSent, false),
      eq(mdAbandonedCheckouts.converted, false),
      lt(mdAbandonedCheckouts.createdAt, oneHourAgo),
    ))

  let sent = 0
  const errors: string[] = []

  for (const row of rows) {
    try {
      const planLabel = MD_PLAN_LABELS[row.plan as MdPlanId] ?? row.plan
      const ok = await sendMdAbandonedCheckoutEmail({
        to:        row.email,
        name:      row.name ?? 'Racer',
        plan:      row.plan as MdPlanId,
        planLabel,
      })

      // Mark sent regardless of delivery (prevents retry spam)
      await db
        .update(mdAbandonedCheckouts)
        .set({ emailSent: true })
        .where(eq(mdAbandonedCheckouts.id, row.id))

      if (ok) sent++
    } catch (err) {
      errors.push(`${row.email}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  return { sent, errors }
}
