/**
 * MD Alert Engine
 *
 * Evaluates configured alert rules against incoming data (HR readings,
 * readiness scores, assignment events) and fires real web push notifications
 * via sendTeamPush when thresholds are breached.
 *
 * Designed to be called from:
 *   - /api/terra/webhook  (HR spike / drop / sustained alerts)
 *   - /api/md-readiness   (readiness_peaked / readiness_drop)
 *   - /api/md-assignments (assignment_missed)
 *   - /api/md-sessions    (lap_record)
 */

import { db } from '@/lib/db'
import { mdAlertRules, mdAlertEvents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { sendTeamPush } from '@/lib/md-push'

export type AlertType =
  | 'hr_spike'
  | 'hr_drop'
  | 'hr_sustained_high'
  | 'readiness_drop'
  | 'readiness_peaked'
  | 'assignment_missed'
  | 'lap_record'

export interface AlertContext {
  riderName?: string
  bpm?: number
  readinessScore?: number
  previousScore?: number
  assignmentType?: string
  lapTime?: number
  previousBest?: number
}

// ── Default thresholds (seeded when a team's rules are blank) ─────────────────

export const DEFAULT_RULES: Array<{
  alertType: AlertType
  enabled: boolean
  thresholdValue: number
  thresholdDirection: 'above' | 'below'
  cooldownSeconds: number
}> = [
  { alertType: 'hr_spike',          enabled: true,  thresholdValue: 185, thresholdDirection: 'above', cooldownSeconds: 120 },
  { alertType: 'hr_drop',           enabled: true,  thresholdValue: 50,  thresholdDirection: 'below', cooldownSeconds: 120 },
  { alertType: 'hr_sustained_high', enabled: true,  thresholdValue: 175, thresholdDirection: 'above', cooldownSeconds: 600 },
  { alertType: 'readiness_peaked',  enabled: true,  thresholdValue: 88,  thresholdDirection: 'above', cooldownSeconds: 3600 },
  { alertType: 'readiness_drop',    enabled: true,  thresholdValue: 65,  thresholdDirection: 'below', cooldownSeconds: 3600 },
  { alertType: 'assignment_missed', enabled: true,  thresholdValue: 0,   thresholdDirection: 'above', cooldownSeconds: 86400 },
  { alertType: 'lap_record',        enabled: true,  thresholdValue: 0,   thresholdDirection: 'above', cooldownSeconds: 300 },
]

// ── Notification copy per alert type ──────────────────────────────────────────

function buildNotification(alertType: AlertType, ctx: AlertContext): { title: string; body: string } {
  const r = ctx.riderName ?? 'Rider'
  switch (alertType) {
    case 'hr_spike':
      return { title: `HR Spike — ${r}`, body: `${r} hit ${ctx.bpm} BPM. Monitor for overexertion.` }
    case 'hr_drop':
      return { title: `HR Drop — ${r}`, body: `${r} HR dropped to ${ctx.bpm} BPM. Check in now.` }
    case 'hr_sustained_high':
      return { title: `Sustained High HR — ${r}`, body: `${r} has been above ${ctx.bpm} BPM for an extended period.` }
    case 'readiness_peaked':
      return { title: `${r} is Peaked`, body: `Readiness hit ${ctx.readinessScore}. Race-day ready — don't over-train.` }
    case 'readiness_drop':
      return { title: `Readiness Drop — ${r}`, body: `${r} dropped to ${ctx.readinessScore} (was ${ctx.previousScore ?? '?'}). Check sleep & HRV.` }
    case 'assignment_missed':
      return { title: `Missed Assignment — ${r}`, body: `${r} did not complete: ${ctx.assignmentType ?? 'scheduled assignment'}.` }
    case 'lap_record':
      return { title: `New Lap Record — ${r}`, body: `${r} set a new personal best: ${ctx.lapTime}s.` }
  }
}

// ── Core evaluation function ───────────────────────────────────────────────────

/**
 * Evaluate a single alert type for a team. Handles cooldown enforcement,
 * fires push notification, and logs the event.
 */
export async function evaluateAlert(
  teamId: string,
  alertType: AlertType,
  context: AlertContext,
): Promise<{ fired: boolean; reason?: string }> {
  // 1. Load the rule (create default if missing)
  let [rule] = await db
    .select()
    .from(mdAlertRules)
    .where(and(eq(mdAlertRules.teamId, teamId), eq(mdAlertRules.alertType, alertType)))
    .limit(1)

  if (!rule) {
    const defaults = DEFAULT_RULES.find((r) => r.alertType === alertType)
    if (!defaults) return { fired: false, reason: 'no_rule' }
    const [inserted] = await db
      .insert(mdAlertRules)
      .values({ teamId, ...defaults })
      .onConflictDoNothing()
      .returning()
    if (!inserted) return { fired: false, reason: 'no_rule' }
    rule = inserted
  }

  if (!rule.enabled) return { fired: false, reason: 'disabled' }

  // 2. Check cooldown
  if (rule.lastFiredAt) {
    const cooldownMs = (rule.cooldownSeconds ?? 300) * 1000
    const elapsed = Date.now() - new Date(rule.lastFiredAt).getTime()
    if (elapsed < cooldownMs) return { fired: false, reason: 'cooldown' }
  }

  // 3. Evaluate threshold condition
  const threshold = rule.thresholdValue ?? 0
  const direction = rule.thresholdDirection ?? 'above'
  let conditionMet = false

  switch (alertType) {
    case 'hr_spike':
    case 'hr_sustained_high':
      conditionMet = direction === 'above' ? (context.bpm ?? 0) >= threshold : (context.bpm ?? 0) <= threshold
      break
    case 'hr_drop':
      conditionMet = (context.bpm ?? 999) <= threshold
      break
    case 'readiness_peaked':
      conditionMet = (context.readinessScore ?? 0) >= threshold
      break
    case 'readiness_drop':
      conditionMet = (context.readinessScore ?? 100) <= threshold
      break
    case 'assignment_missed':
    case 'lap_record':
      conditionMet = true // caller decides when to fire these
      break
  }

  if (!conditionMet) return { fired: false, reason: 'threshold_not_met' }

  // 4. Fire push notification
  const { title, body } = buildNotification(alertType, context)
  const pushResult = await sendTeamPush(teamId, {
    title,
    body,
    data: { alertType, ...context },
  })

  // 5. Update last_fired_at on the rule
  await db
    .update(mdAlertRules)
    .set({ lastFiredAt: new Date(), updatedAt: new Date() })
    .where(eq(mdAlertRules.id, rule.id))

  // 6. Log the event
  await db.insert(mdAlertEvents).values({
    teamId,
    ruleId: rule.id,
    alertType,
    context: context as Record<string, unknown>,
    pushSent: pushResult.sent,
  })

  return { fired: true }
}

/**
 * Seed default alert rules for a team that has none yet.
 * Safe to call multiple times — uses ON CONFLICT DO NOTHING.
 */
export async function seedDefaultRules(teamId: string): Promise<void> {
  for (const rule of DEFAULT_RULES) {
    await db
      .insert(mdAlertRules)
      .values({ teamId, ...rule })
      .onConflictDoNothing()
  }
}
