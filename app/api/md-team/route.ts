import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdTeams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DISCIPLINES } from '@/lib/md-discipline'

const VALID_DISCIPLINE_IDS = new Set(DISCIPLINES.map((d) => d.id))

// GET /api/md-team — returns the current session's team tier + discipline.
export async function GET() {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  try {
    const [team] = await db
      .select({ tier: mdTeams.subscriptionTier, discipline: mdTeams.discipline, name: mdTeams.name })
      .from(mdTeams)
      .where(eq(mdTeams.id, authResult.teamId))
      .limit(1)

    return NextResponse.json({
      success: true,
      tier: team?.tier ?? 'privateer',
      discipline: team?.discipline ?? null,
      name: team?.name ?? '',
      role: authResult.role,
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load team.' }, { status: 500 })
  }
}

// PATCH /api/md-team — update team discipline (and optionally rider details).
export async function PATCH(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json()
    const { discipline, riderName, riderClass, riderBirthYear } = body

    if (discipline !== undefined && !VALID_DISCIPLINE_IDS.has(discipline)) {
      return NextResponse.json({ success: false, error: 'Invalid discipline' }, { status: 400 })
    }

    const updates: Partial<typeof mdTeams.$inferInsert> = {}
    if (discipline !== undefined) updates.discipline = discipline
    if (riderName !== undefined) updates.riderName = riderName
    if (riderClass !== undefined) updates.riderClass = riderClass
    if (riderBirthYear !== undefined) updates.riderBirthYear = riderBirthYear

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })
    }

    const [updated] = await db
      .update(mdTeams)
      .set(updates)
      .where(eq(mdTeams.id, authResult.teamId))
      .returning({ discipline: mdTeams.discipline, riderName: mdTeams.riderName, riderClass: mdTeams.riderClass })

    return NextResponse.json({ success: true, team: updated })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update team.' }, { status: 500 })
  }
}
