'use server'

import { db } from '@/lib/db'
import { mdFoundingRigs } from '@/lib/db/schema'
import { count, eq } from 'drizzle-orm'
import {
  FOUNDING_SLOT_CAP,
  FOUNDING_ELIGIBLE_PLANS,
  FOUNDING_COACH_CAP,
  FOUNDING_COACH_ELIGIBLE_PLANS,
  type FoundingCohort,
} from '@/lib/founding-rigs-config'

/** Returns status for both independent founding cohorts. */
export async function getFoundingSlotStatus() {
  try {
    const [rigRow, coachRow] = await Promise.all([
      db.select({ total: count() }).from(mdFoundingRigs).where(eq(mdFoundingRigs.cohort, 'founding_rig')),
      db.select({ total: count() }).from(mdFoundingRigs).where(eq(mdFoundingRigs.cohort, 'founding_coach')),
    ])
    const used = rigRow[0]?.total ?? 0
    const coachUsed = coachRow[0]?.total ?? 0
    return {
      ok: true as const,
      used,
      remaining: Math.max(0, FOUNDING_SLOT_CAP - used),
      pct: Math.round((used / FOUNDING_SLOT_CAP) * 100),
      coachUsed,
      coachRemaining: Math.max(0, FOUNDING_COACH_CAP - coachUsed),
      coachPct: Math.round((coachUsed / FOUNDING_COACH_CAP) * 100),
    }
  } catch {
    return {
      ok: true as const,
      used: 0,
      remaining: FOUNDING_SLOT_CAP,
      pct: 0,
      coachUsed: 0,
      coachRemaining: FOUNDING_COACH_CAP,
      coachPct: 0,
    }
  }
}

/** Allocates a founding slot immediately after a successful subscription.
 *  Called from md-billing.ts after subscribeMdPlan succeeds. */
export async function allocateFoundingSlot(
  teamId: string,
  planId: string,
  lockedCents: number,
  frequency: 'annual' | 'monthly',
): Promise<{ ok: boolean; slotNumber?: number; error?: string }> {
  const cohort: FoundingCohort | null = FOUNDING_ELIGIBLE_PLANS.includes(
    planId as typeof FOUNDING_ELIGIBLE_PLANS[number],
  )
    ? 'founding_rig'
    : FOUNDING_COACH_ELIGIBLE_PLANS.includes(
          planId as typeof FOUNDING_COACH_ELIGIBLE_PLANS[number],
        )
      ? 'founding_coach'
      : null

  if (!cohort) return { ok: true }

  const cap = cohort === 'founding_coach' ? FOUNDING_COACH_CAP : FOUNDING_SLOT_CAP
  const cohortLabel = cohort === 'founding_coach' ? 'founding coach' : 'founding rig'

  try {
    const result = await db.transaction(async (tx) => {
      const [{ total }] = await tx
        .select({ total: count() })
        .from(mdFoundingRigs)
        .where(eq(mdFoundingRigs.cohort, cohort))
      const used = total ?? 0
      if (used >= cap) {
        return { ok: false as const, error: `All ${cap} ${cohortLabel} spots are now taken. Please contact us.` }
      }
      const slotNumber = used + 1
      await tx.insert(mdFoundingRigs).values({
        teamId,
        planId,
        cohort,
        lockedCents,
        frequency,
        slotNumber,
      }).onConflictDoNothing()
      return { ok: true as const, slotNumber }
    })
    return result
  } catch (err) {
    console.error('[founding-rigs] allocateFoundingSlot error:', err)
    return { ok: false, error: 'Could not allocate founding slot.' }
  }
}

/** Returns all enrolled founding rigs for the owner console. */
export async function getFoundingRigs() {
  try {
    const rigs = await db
      .select()
      .from(mdFoundingRigs)
      .orderBy(mdFoundingRigs.slotNumber)
    return { ok: true as const, rigs }
  } catch (err) {
    console.error('[founding-rigs] getFoundingRigs error:', err)
    return { ok: false as const, rigs: [] }
  }
}
