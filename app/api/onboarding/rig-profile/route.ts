import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdFoundingRigs, mdTeamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Find the team for this user
    const [membership] = await db
      .select({ teamId: mdTeamMembers.teamId })
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.userId, session.user.id))
      .limit(1)

    if (!membership?.teamId) {
      return NextResponse.json({ error: 'No team found for this user.' }, { status: 404 })
    }

    // Update the founding rig record with onboarding data
    // If no founding rig row yet (e.g. privateer), still return 200 silently
    await db
      .update(mdFoundingRigs)
      .set({
        onboardingData: body,
        onboardingComplete: false, // team marks true after actual onboarding call
      })
      .where(eq(mdFoundingRigs.teamId, membership.teamId))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[onboarding/rig-profile] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
