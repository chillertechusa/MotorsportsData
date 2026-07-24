import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdCoachPackages } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  const packages = await db.select().from(mdCoachPackages)
    .where(and(eq(mdCoachPackages.coachTeamId, auth.teamId), eq(mdCoachPackages.isActive, true)))
    .orderBy(mdCoachPackages.priceCents)

  return NextResponse.json({ success: true, packages })
}

export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { name, description, sessionCount, durationWeeks, priceCents, cadence } = body

    if (!name || !priceCents) {
      return NextResponse.json({ success: false, error: 'name and priceCents required' }, { status: 400 })
    }

    const [pkg] = await db.insert(mdCoachPackages).values({
      coachTeamId: auth.teamId, name, description, sessionCount,
      durationWeeks, priceCents, cadence: cadence ?? 'monthly',
    }).returning()

    return NextResponse.json({ success: true, package: pkg }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create package' }, { status: 500 })
  }
}
