'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdRiderProfiles, mdTeams } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { computeAge, ageBracket } from '@/lib/legal'

/**
 * Rider Profile Server Actions
 *
 * All actions enforce: parent_user_id = session.user.id
 * No rider data is ever accessible across parent accounts.
 */

export interface CreateRiderProfileInput {
  teamId: string
  name: string
  dateOfBirth: string // YYYY-MM-DD
  riderEmail?: string
  guardianRelationship?: string
}

/** Create a new sub-rider profile under the signed-in parent account. */
export async function createRiderProfile(input: CreateRiderProfileInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { ok: false as const, reason: 'unauthorized' }
  const parentUserId = session.user.id

  // Verify the team belongs to this parent
  const [team] = await db
    .select({ id: mdTeams.id })
    .from(mdTeams)
    .where(and(eq(mdTeams.id, input.teamId), eq(mdTeams.userId, parentUserId)))
    .limit(1)

  if (!team) return { ok: false as const, reason: 'team_not_found' }

  const age = computeAge(input.dateOfBirth)
  if (age === null || age < 0 || age > 120) {
    return { ok: false as const, reason: 'invalid_dob' }
  }

  // This table is ONLY for minors. If the rider is already 18+ they get their own account.
  if (age >= 18) {
    return { ok: false as const, reason: 'rider_is_adult' }
  }

  const bracket = ageBracket(age)

  const [profile] = await db
    .insert(mdRiderProfiles)
    .values({
      parentUserId,
      teamId: input.teamId,
      name: input.name.trim(),
      dateOfBirth: input.dateOfBirth,
      ageBracket: bracket,
      isMinor: true,
      guardianRelationship: input.guardianRelationship?.trim() ?? 'parent',
      riderEmail: input.riderEmail?.trim() || null,
      promotionStatus: 'active',
    })
    .returning()

  return { ok: true as const, profile }
}

/** List all rider profiles belonging to the signed-in parent. */
export async function listRiderProfiles() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { ok: false as const, reason: 'unauthorized' }
  const parentUserId = session.user.id

  const profiles = await db
    .select()
    .from(mdRiderProfiles)
    .where(eq(mdRiderProfiles.parentUserId, parentUserId))

  // Recompute live age and check if any are now eligible for promotion
  const now = new Date()
  const enriched = profiles.map((p) => {
    const age = computeAge(p.dateOfBirth)
    const isNowAdult = age !== null && age >= 18
    const eligibleForPromotion = isNowAdult && p.promotionStatus === 'active'
    return { ...p, currentAge: age, eligibleForPromotion }
  })

  return { ok: true as const, profiles: enriched }
}

/** Update promotion status to 'eligible' for riders who have turned 18. */
export async function checkPromotionEligibility() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { ok: false as const, reason: 'unauthorized' }
  const parentUserId = session.user.id

  const profiles = await db
    .select()
    .from(mdRiderProfiles)
    .where(
      and(
        eq(mdRiderProfiles.parentUserId, parentUserId),
        eq(mdRiderProfiles.promotionStatus, 'active'),
      ),
    )

  const eligible: string[] = []
  for (const p of profiles) {
    const age = computeAge(p.dateOfBirth)
    if (age !== null && age >= 18) {
      await db
        .update(mdRiderProfiles)
        .set({ promotionStatus: 'eligible', isMinor: false, updatedAt: new Date() })
        .where(eq(mdRiderProfiles.id, p.id))
      eligible.push(p.id)
    }
  }

  return { ok: true as const, eligibleCount: eligible.length, eligibleIds: eligible }
}

/**
 * Promote a rider to their own standalone account.
 * - Parent must be signed in and own the profile.
 * - Rider must be 18+ (promotionStatus = 'eligible').
 * - Marks the profile promoted — the rider must create their own account separately.
 *   Their team data stays intact; parent loses management access after promotion.
 */
export async function initiateRiderPromotion(profileId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { ok: false as const, reason: 'unauthorized' }
  const parentUserId = session.user.id

  const [profile] = await db
    .select()
    .from(mdRiderProfiles)
    .where(
      and(
        eq(mdRiderProfiles.id, profileId),
        eq(mdRiderProfiles.parentUserId, parentUserId),
      ),
    )
    .limit(1)

  if (!profile) return { ok: false as const, reason: 'not_found' }

  const age = computeAge(profile.dateOfBirth)
  if (age === null || age < 18) {
    return { ok: false as const, reason: 'rider_still_minor' }
  }

  await db
    .update(mdRiderProfiles)
    .set({
      promotionStatus: 'promoted',
      isMinor: false,
      promotedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(mdRiderProfiles.id, profileId))

  return { ok: true as const, riderName: profile.name, riderEmail: profile.riderEmail }
}

/** Delete a rider profile (parent only, cannot delete promoted profiles). */
export async function deleteRiderProfile(profileId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { ok: false as const, reason: 'unauthorized' }
  const parentUserId = session.user.id

  const [profile] = await db
    .select({ id: mdRiderProfiles.id, promotionStatus: mdRiderProfiles.promotionStatus })
    .from(mdRiderProfiles)
    .where(
      and(
        eq(mdRiderProfiles.id, profileId),
        eq(mdRiderProfiles.parentUserId, parentUserId),
      ),
    )
    .limit(1)

  if (!profile) return { ok: false as const, reason: 'not_found' }
  if (profile.promotionStatus === 'promoted') {
    return { ok: false as const, reason: 'cannot_delete_promoted' }
  }

  await db.delete(mdRiderProfiles).where(eq(mdRiderProfiles.id, profileId))

  return { ok: true as const }
}
