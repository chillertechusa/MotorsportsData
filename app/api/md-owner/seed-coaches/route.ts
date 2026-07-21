import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers, user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/md-owner/seed-coaches?token=<MD_OWNER_SEED_PASSWORD>
 *
 * Cohort simulation — real-world signup lifecycle, coaching-staff stage.
 * Creates 3 coach accounts (one per future Factory Rig). Per the real-world
 * model, EVERYONE enters as a Free Rider (`rookie` tier) — these users carry
 * no rider/bike/setup data. They exist so a later stage can add them to
 * Factory Rig teams with role='coach' (one coach per rig).
 *
 * Fully idempotent — re-running finds existing users/teams and only refreshes
 * the rookie tier + coaching-specialty note.
 */

const SHARED_PASSWORD = 'PrivateerLife#1'

type CoachSeed = {
  email: string
  name: string
  teamName: string
  specialty: string
  yearsExperience: number
}

const COACHES: CoachSeed[] = [
  { email: 'coach1@motorsportsdata.io', name: 'Ricky Vance', teamName: 'Ricky Vance — Coach', specialty: 'Race craft & starts', yearsExperience: 19 },
  { email: 'coach2@motorsportsdata.io', name: 'Danielle Ford', teamName: 'Danielle Ford — Coach', specialty: 'Fitness & mental prep', yearsExperience: 12 },
  { email: 'coach3@motorsportsdata.io', name: 'Trevor Nash', teamName: 'Trevor Nash — Coach', specialty: 'Technique & lines', yearsExperience: 24 },
]

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  const expected = process.env.MD_OWNER_SEED_PASSWORD

  if (!expected) {
    return NextResponse.json({ error: 'MD_OWNER_SEED_PASSWORD is not set' }, { status: 500 })
  }
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const results: Array<Record<string, unknown>> = []

  for (const coach of COACHES) {
    try {
      // 1. Create (or find) the user via Better Auth so the password hashes.
      let userId: string | null = null
      let userStatus: 'created' | 'existing' = 'created'

      try {
        const ctx = await auth.api.signUpEmail({
          body: { email: coach.email, password: SHARED_PASSWORD, name: coach.name },
          asResponse: false,
        })
        userId = (ctx as { user?: { id?: string } })?.user?.id ?? null
      } catch {
        userStatus = 'existing'
      }

      if (!userId) {
        const [existing] = await db
          .select({ id: userTable.id })
          .from(userTable)
          .where(eq(userTable.email, coach.email))
          .limit(1)
        userId = existing?.id ?? null
        userStatus = 'existing'
      }

      if (!userId) {
        results.push({ email: coach.email, status: 'error', detail: 'Could not create or find user' })
        continue
      }

      // 2. Create or find the coach's own default team.
      let teamId: string | null = null
      const [membership] = await db
        .select({ teamId: mdTeamMembers.teamId })
        .from(mdTeamMembers)
        .where(eq(mdTeamMembers.userId, userId))
        .limit(1)

      if (membership?.teamId) {
        teamId = membership.teamId
      } else {
        const [team] = await db
          .insert(mdTeams)
          .values({ name: coach.teamName })
          .returning({ id: mdTeams.id })
        teamId = team?.id ?? null
        if (teamId) {
          await db.insert(mdTeamMembers).values({ teamId, userId, role: 'owner' })
        }
      }

      if (!teamId) {
        results.push({ email: coach.email, status: 'error', detail: 'Could not create team' })
        continue
      }

      // 3. Free Rider (rookie) entry state — everyone starts here. Store the
      //    coaching specialty in the rider_name field for later reference
      //    when staffing Factory Rig teams (no bike/setup data for coaches).
      await db
        .update(mdTeams)
        .set({
          subscriptionTier: 'rookie',
          subscriptionStatus: 'active',
          paymentStatus: 'active',
          riderName: `${coach.name} (${coach.specialty}, ${coach.yearsExperience}yr)`,
        })
        .where(eq(mdTeams.id, teamId))

      results.push({
        email: coach.email,
        name: coach.name,
        specialty: coach.specialty,
        user: userStatus,
        teamId,
        status: 'ok',
      })
    } catch (err) {
      results.push({
        email: coach.email,
        status: 'error',
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const okCount = results.filter((r) => r.status === 'ok').length
  return NextResponse.json({
    message: `Seeded ${okCount}/${COACHES.length} coach accounts as Free Riders (rookie tier)`,
    coaches: results,
  })
}
