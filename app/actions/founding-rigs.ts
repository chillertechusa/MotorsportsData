'use server'

import { db } from '@/lib/db'
import { mdFoundingRigs } from '@/lib/db/schema'
import { count, sql } from 'drizzle-orm'

export const FOUNDING_SLOT_CAP = 50
export const FOUNDING_ELIGIBLE_PLANS = ['race_team', 'factory_rig'] as const

/** Returns { used, remaining, pct } for the slot counter UI. */
export async function getFoundingSlotStatus() {
  try {
    const [row] = await db.select({ total: count() }).from(mdFoundingRigs)
    const used = row?.total ?? 0
    const remaining = Math.max(0, FOUNDING_SLOT_CAP - used)
    const pct = Math.round((used / FOUNDING_SLOT_CAP) * 100)
    return { ok: true as const, used, remaining, pct }
  } catch {
    return { ok: true as const, used: 0, remaining: FOUNDING_SLOT_CAP, pct: 0 }
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
  if (!FOUNDING_ELIGIBLE_PLANS.includes(planId as typeof FOUNDING_ELIGIBLE_PLANS[number])) {
    return { ok: true } // Privateer — no slot needed, silent success
  }

  try {
    // Atomic: count existing + insert in a transaction so slots never exceed 50
    const result = await db.transaction(async (tx) => {
      const [{ total }] = await tx.select({ total: count() }).from(mdFoundingRigs)
      const used = total ?? 0
      if (used >= FOUNDING_SLOT_CAP) {
        return { ok: false as const, error: 'All 50 founding slots are now taken. Please contact us.' }
      }
      const slotNumber = used + 1
      await tx.insert(mdFoundingRigs).values({
        teamId,
        planId,
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
