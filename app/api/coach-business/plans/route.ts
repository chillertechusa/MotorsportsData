import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdTrainingPlans, mdCoachClients } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  const clientId = req.nextUrl.searchParams.get('clientId')
  const condition = clientId
    ? and(eq(mdTrainingPlans.coachTeamId, auth.teamId), eq(mdTrainingPlans.clientId, clientId))
    : eq(mdTrainingPlans.coachTeamId, auth.teamId)

  const plans = await db.select({
    plan: mdTrainingPlans,
    clientFirstName: mdCoachClients.firstName,
    clientLastName: mdCoachClients.lastName,
  })
    .from(mdTrainingPlans)
    .innerJoin(mdCoachClients, eq(mdTrainingPlans.clientId, mdCoachClients.id))
    .where(condition)
    .orderBy(desc(mdTrainingPlans.weekStart))

  return NextResponse.json({ success: true, plans })
}

export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { clientId, title, weekStart, weekEnd, goals, physicalBlocks, technicalBlocks, mentalBlocks, nutritionNotes, aiGenerated } = body

    if (!clientId || !title || !weekStart || !weekEnd) {
      return NextResponse.json({ success: false, error: 'clientId, title, weekStart, weekEnd required' }, { status: 400 })
    }

    const [plan] = await db.insert(mdTrainingPlans).values({
      coachTeamId: auth.teamId, clientId, title, weekStart, weekEnd,
      goals, physicalBlocks: physicalBlocks ?? [], technicalBlocks: technicalBlocks ?? [],
      mentalBlocks: mentalBlocks ?? [], nutritionNotes, aiGenerated: aiGenerated ?? false,
    }).returning()

    return NextResponse.json({ success: true, plan }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create plan' }, { status: 500 })
  }
}
