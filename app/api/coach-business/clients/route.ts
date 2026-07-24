import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdCoachClients } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  const clients = await db.select().from(mdCoachClients)
    .where(eq(mdCoachClients.coachTeamId, auth.teamId))
    .orderBy(desc(mdCoachClients.createdAt))

  return NextResponse.json({ success: true, clients })
}

export async function POST(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, discipline, classCategory, homeTrack, dateOfBirth, notes } = body

    if (!firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'firstName and lastName are required' }, { status: 400 })
    }

    const [client] = await db.insert(mdCoachClients).values({
      coachTeamId: auth.teamId, firstName, lastName, email, phone,
      discipline, classCategory, homeTrack, dateOfBirth, notes,
    }).returning()

    return NextResponse.json({ success: true, client }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create client' }, { status: 500 })
  }
}
