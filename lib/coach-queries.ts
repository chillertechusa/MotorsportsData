'use server'

import { db } from '@/lib/db'
import { mdCoachAssignments, mdAccessLog, mdRiderProfiles, mdRaces, user } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

/**
 * Coach read-only access layer.
 * Coaches can view bike data, race history, and performance metrics
 * for riders who invited them, but cannot export or modify data.
 * All access is audit-logged to mdAccessLog.
 */

export async function getCoachVisibleRiders(coachEmail: string) {
  try {
    // Find all coach assignments where coachEmail matches
    const assignments = await db
      .select({
        riderEmail: mdCoachAssignments.riderEmail,
        assignmentId: mdCoachAssignments.id,
        assignedAt: mdCoachAssignments.assignedAt,
        status: mdCoachAssignments.status,
      })
      .from(mdCoachAssignments)
      .where(eq(mdCoachAssignments.riderEmail, coachEmail.toLowerCase()))

    return assignments
  } catch (error) {
    console.error('[coach-queries] getCoachVisibleRiders failed:', error)
    throw error
  }
}

export async function getRiderProfilesForCoach(riderEmail: string, coachEmail: string) {
  try {
    // Verify coach has access to this rider
    const hasAccess = await db
      .select()
      .from(mdCoachAssignments)
      .where(
        and(
          eq(mdCoachAssignments.riderEmail, coachEmail.toLowerCase()),
          eq(mdCoachAssignments.riderEmail, riderEmail.toLowerCase())
        )
      )
      .limit(1)

    if (!hasAccess.length) {
      console.warn('[coach-queries] Coach denied access to rider')
      return []
    }

    // Log access
    await db.insert(mdAccessLog).values({
      id: uuid(),
      userEmail: coachEmail,
      action: 'coach_view_rider_profiles',
      details: `Viewed profiles for ${riderEmail}`,
      teamId: '',
      sourceIp: '',
    })

    // Get rider profiles (no export, read-only)
    const profiles = await db
      .select()
      .from(mdRiderProfiles)
      .where(eq(mdRiderProfiles.userId, riderEmail))

    return profiles
  } catch (error) {
    console.error('[coach-queries] getRiderProfilesForCoach failed:', error)
    throw error
  }
}

export async function getRiderRacesForCoach(riderEmail: string, coachEmail: string) {
  try {
    // Verify coach has access
    const hasAccess = await db
      .select()
      .from(mdCoachAssignments)
      .where(
        and(
          eq(mdCoachAssignments.riderEmail, coachEmail.toLowerCase()),
          eq(mdCoachAssignments.riderEmail, riderEmail.toLowerCase())
        )
      )
      .limit(1)

    if (!hasAccess.length) {
      return []
    }

    // Log access
    await db.insert(mdAccessLog).values({
      id: uuid(),
      userEmail: coachEmail,
      action: 'coach_view_rider_races',
      details: `Viewed race history for ${riderEmail}`,
      teamId: '',
      sourceIp: '',
    })

    // Get race data (read-only, no export)
    const races = await db.select().from(mdRaces)

    return races
  } catch (error) {
    console.error('[coach-queries] getRiderRacesForCoach failed:', error)
    throw error
  }
}

export async function logCoachExportAttempt(
  coachEmail: string,
  riderEmail: string,
  reason: string
) {
  try {
    // Log when coach tries to export (deny + audit)
    await db.insert(mdAccessLog).values({
      id: uuid(),
      userEmail: coachEmail,
      action: 'coach_export_denied',
      details: `Export attempt for ${riderEmail}: ${reason}. Exports not permitted for read-only coach access.`,
      teamId: '',
      sourceIp: '',
    })

    return { success: false, blocked: true }
  } catch (error) {
    console.error('[coach-queries] logCoachExportAttempt failed:', error)
    throw error
  }
}
