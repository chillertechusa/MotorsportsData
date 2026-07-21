import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers, user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/md-owner/seed-wrenches?token=<MD_OWNER_SEED_PASSWORD>
 *
 * Cohort simulation — real-world signup lifecycle, support-staff stage.
 * Creates 15 professional-mechanic ("wrench") accounts. Per the real-world
 * model, EVERYONE enters as a Free Rider (`rookie` tier) — these users do not
 * upgrade to the Wrench tier here, and they carry no rider/bike/setup data.
 * They exist so a later stage can add them to Factory Rig teams with
 * role='mechanic' (5 wrenches per rig).
 *
 * Fully idempotent — re-running finds existing users/teams and only refreshes
 * the rookie tier + specialty note.
 */

const SHARED_PASSWORD = 'PrivateerLife#1'

type WrenchSeed = {
  email: string
  name: string
  teamName: string
  specialty: string
  yearsExperience: number
}

const WRENCHES: WrenchSeed[] = [
  { email: 'wrench1@motorsportsdata.io', name: 'Marcus Bell', teamName: 'Marcus Bell — Wrench', specialty: 'Suspension tuning', yearsExperience: 14 },
  { email: 'wrench2@motorsportsdata.io', name: 'Diego Fuentes', teamName: 'Diego Fuentes — Wrench', specialty: 'Engine builder (4-stroke)', yearsExperience: 18 },
  { email: 'wrench3@motorsportsdata.io', name: 'Sam Okafor', teamName: 'Sam Okafor — Wrench', specialty: 'Chassis & geometry', yearsExperience: 9 },
  { email: 'wrench4@motorsportsdata.io', name: 'Kyle Novak', teamName: 'Kyle Novak — Wrench', specialty: 'EFI & mapping', yearsExperience: 11 },
  { email: 'wrench5@motorsportsdata.io', name: 'Tomas Herrera', teamName: 'Tomas Herrera — Wrench', specialty: 'Top-end / valve service', yearsExperience: 22 },
  { email: 'wrench6@motorsportsdata.io', name: 'Andre Willis', teamName: 'Andre Willis — Wrench', specialty: 'Suspension tuning', yearsExperience: 7 },
  { email: 'wrench7@motorsportsdata.io', name: 'Rhys Delgado', teamName: 'Rhys Delgado — Wrench', specialty: 'Wheels & drivetrain', yearsExperience: 13 },
  { email: 'wrench8@motorsportsdata.io', name: 'Curtis Yang', teamName: 'Curtis Yang — Wrench', specialty: 'Engine builder (2-stroke)', yearsExperience: 16 },
  { email: 'wrench9@motorsportsdata.io', name: 'Beau Franklin', teamName: 'Beau Franklin — Wrench', specialty: 'General race prep', yearsExperience: 5 },
  { email: 'wrench10@motorsportsdata.io', name: 'Ivan Petrov', teamName: 'Ivan Petrov — Wrench', specialty: 'Data & telemetry setup', yearsExperience: 10 },
  { email: 'wrench11@motorsportsdata.io', name: 'Leo Marchetti', teamName: 'Leo Marchetti — Wrench', specialty: 'Suspension tuning', yearsExperience: 20 },
  { email: 'wrench12@motorsportsdata.io', name: 'Dev Sharma', teamName: 'Dev Sharma — Wrench', specialty: 'EFI & mapping', yearsExperience: 8 },
  { email: 'wrench13@motorsportsdata.io', name: 'Colton Reeves', teamName: 'Colton Reeves — Wrench', specialty: 'Chassis & geometry', yearsExperience: 12 },
  { email: 'wrench14@motorsportsdata.io', name: 'Malik Johnson', teamName: 'Malik Johnson — Wrench', specialty: 'Top-end / valve service', yearsExperience: 15 },
  { email: 'wrench15@motorsportsdata.io', name: 'Enzo Ricci', teamName: 'Enzo Ricci — Wrench', specialty: 'General race prep', yearsExperience: 6 },
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

  for (const wrench of WRENCHES) {
    try {
      // 1. Create (or find) the user via Better Auth so the password hashes.
      let userId: string | null = null
      let userStatus: 'created' | 'existing' = 'created'

      try {
        const ctx = await auth.api.signUpEmail({
          body: { email: wrench.email, password: SHARED_PASSWORD, name: wrench.name },
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
          .where(eq(userTable.email, wrench.email))
          .limit(1)
        userId = existing?.id ?? null
        userStatus = 'existing'
      }

      if (!userId) {
        results.push({ email: wrench.email, status: 'error', detail: 'Could not create or find user' })
        continue
      }

      // 2. Create or find the wrench's own default team.
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
          .values({ name: wrench.teamName })
          .returning({ id: mdTeams.id })
        teamId = team?.id ?? null
        if (teamId) {
          await db.insert(mdTeamMembers).values({ teamId, userId, role: 'owner' })
        }
      }

      if (!teamId) {
        results.push({ email: wrench.email, status: 'error', detail: 'Could not create team' })
        continue
      }

      // 3. Free Rider (rookie) entry state — everyone starts here. Store the
      //    mechanic's specialty in the rider_name field for later reference
      //    when staffing Factory Rig teams (no bike/setup data for wrenches).
      await db
        .update(mdTeams)
        .set({
          subscriptionTier: 'rookie',
          subscriptionStatus: 'active',
          paymentStatus: 'active',
          riderName: `${wrench.name} (${wrench.specialty}, ${wrench.yearsExperience}yr)`,
        })
        .where(eq(mdTeams.id, teamId))

      results.push({
        email: wrench.email,
        name: wrench.name,
        specialty: wrench.specialty,
        user: userStatus,
        teamId,
        status: 'ok',
      })
    } catch (err) {
      results.push({
        email: wrench.email,
        status: 'error',
        detail: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const okCount = results.filter((r) => r.status === 'ok').length
  return NextResponse.json({
    message: `Seeded ${okCount}/${WRENCHES.length} wrench accounts as Free Riders (rookie tier)`,
    wrenches: results,
  })
}
