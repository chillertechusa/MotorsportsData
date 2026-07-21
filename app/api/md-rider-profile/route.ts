import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdTeams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET — rider profile + tier for the team
export async function GET() {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { teamId } = authResult

  const [team] = await db
    .select({
      riderName: mdTeams.riderName,
      riderBirthYear: mdTeams.riderBirthYear,
      riderClass: mdTeams.riderClass,
      subscriptionTier: mdTeams.subscriptionTier,
    })
    .from(mdTeams)
    .where(eq(mdTeams.id, teamId))

  if (!team) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(team)
}

// PATCH — update rider profile fields
export async function PATCH(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { teamId } = authResult

  const body = await req.json()
  const { riderName, riderBirthYear, riderClass } = body

  const updates: Record<string, unknown> = {}
  if (riderName !== undefined) updates.riderName = riderName || null
  if (riderBirthYear !== undefined) {
    const yr = riderBirthYear === null || riderBirthYear === '' ? null : Number(riderBirthYear)
    updates.riderBirthYear = Number.isFinite(yr as number) ? yr : null
  }
  if (riderClass !== undefined) updates.riderClass = riderClass || null

  const [updated] = await db
    .update(mdTeams)
    .set(updates)
    .where(eq(mdTeams.id, teamId))
    .returning({
      riderName: mdTeams.riderName,
      riderBirthYear: mdTeams.riderBirthYear,
      riderClass: mdTeams.riderClass,
      subscriptionTier: mdTeams.subscriptionTier,
    })

  return NextResponse.json(updated)
}
