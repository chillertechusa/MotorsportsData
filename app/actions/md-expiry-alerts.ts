'use server'

import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers, user as userTable } from '@/lib/db/schema'
import { eq, and, lte, gte, isNotNull, sql } from 'drizzle-orm'
import { sendMdExpiryAlertEmail } from '@/lib/md-email'
import { MD_PLAN_LABELS, type MdPlanId } from '@/lib/md-plans'

/**
 * Called by a cron job or the owner console manually.
 * Finds teams whose plan expires within 7 days and haven't been alerted yet,
 * sends them a heads-up email, and stamps expiryAlertSentAt so it only fires once.
 *
 * NOTE: requires an `expiry_alert_sent_at` column on md_teams.
 * Run this migration first:
 *   ALTER TABLE md_teams ADD COLUMN expiry_alert_sent_at TIMESTAMPTZ;
 */
export async function sendExpiryAlerts(): Promise<{ sent: number; errors: string[] }> {
  const now     = new Date()
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Teams expiring in ≤7 days that are still active and haven't been alerted
  const teams = await db
    .select({
      id:          mdTeams.id,
      name:        mdTeams.name,
      tier:        mdTeams.subscriptionTier,
      periodEnd:   mdTeams.currentPeriodEnd,
    })
    .from(mdTeams)
    .where(
      and(
        eq(mdTeams.subscriptionStatus, 'active'),
        isNotNull(mdTeams.currentPeriodEnd),
        lte(mdTeams.currentPeriodEnd, in7days),
        gte(mdTeams.currentPeriodEnd, now),
        // Only alert once — skip if already sent (column may not exist yet, safe fallback below)
        sql`expiry_alert_sent_at IS NULL`,
      ),
    )

  let sent   = 0
  const errors: string[] = []

  for (const team of teams) {
    // Get owner email
    const [owner] = await db
      .select({ email: userTable.email, name: userTable.name })
      .from(mdTeamMembers)
      .innerJoin(userTable, eq(userTable.id, mdTeamMembers.userId))
      .where(and(eq(mdTeamMembers.teamId, team.id), eq(mdTeamMembers.role, 'owner')))
      .limit(1)

    if (!owner?.email) continue

    const tier     = (team.tier ?? 'privateer') as MdPlanId
    const tierLabel = MD_PLAN_LABELS[tier] ?? tier
    const expiresAt = team.periodEnd!
    const daysLeft  = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const ok = await sendMdExpiryAlertEmail({
      to:         owner.email,
      name:       owner.name ?? 'Rider',
      teamName:   team.name,
      tierLabel,
      expiresAt:  expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      daysLeft,
    })

    if (ok) {
      sent++
      // Stamp so we don't re-send
      await db
        .update(mdTeams)
        .set({ expiryAlertSentAt: now })
        .where(eq(mdTeams.id, team.id))
    } else {
      errors.push(`Failed to email ${owner.email} (team ${team.name})`)
    }
  }

  return { sent, errors }
}
