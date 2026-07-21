/**
 * /api/md-alerts
 *
 * GET  — fetch all rules + recent events for the team
 * POST — upsert a rule (enable/disable, change threshold)
 * All routes are team-scoped via getSessionTeamId().
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdAlertRules, mdAlertEvents } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { seedDefaultRules } from '@/lib/notifications/alert-engine'

export async function GET() {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId } = auth

    // Seed defaults if this team has no rules yet
    await seedDefaultRules(teamId)

    const [rules, events] = await Promise.all([
      db.select().from(mdAlertRules).where(eq(mdAlertRules.teamId, teamId)),
      db
        .select()
        .from(mdAlertEvents)
        .where(eq(mdAlertEvents.teamId, teamId))
        .orderBy(desc(mdAlertEvents.firedAt))
        .limit(50),
    ])

    return NextResponse.json({ rules, events })
  } catch (err) {
    console.error('[md-alerts GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { teamId } = auth

    const body = await req.json()
    const { alertType, enabled, thresholdValue, cooldownSeconds } = body

    if (!alertType) {
      return NextResponse.json({ error: 'alertType required' }, { status: 400 })
    }

    // Upsert — update existing rule or create it
    const existing = await db
      .select()
      .from(mdAlertRules)
      .where(and(eq(mdAlertRules.teamId, teamId), eq(mdAlertRules.alertType, alertType)))
      .limit(1)

    if (existing.length > 0) {
      const updates: Partial<typeof mdAlertRules.$inferInsert> = { updatedAt: new Date() }
      if (enabled !== undefined) updates.enabled = enabled
      if (thresholdValue !== undefined) updates.thresholdValue = thresholdValue
      if (cooldownSeconds !== undefined) updates.cooldownSeconds = cooldownSeconds

      const [updated] = await db
        .update(mdAlertRules)
        .set(updates)
        .where(and(eq(mdAlertRules.teamId, teamId), eq(mdAlertRules.alertType, alertType)))
        .returning()
      return NextResponse.json({ rule: updated })
    } else {
      const [created] = await db
        .insert(mdAlertRules)
        .values({ teamId, alertType, enabled: enabled ?? true, thresholdValue, cooldownSeconds: cooldownSeconds ?? 300 })
        .returning()
      return NextResponse.json({ rule: created })
    }
  } catch (err) {
    console.error('[md-alerts POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
