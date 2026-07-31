import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdCoachAssignments } from '@/lib/db/schema'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { teamId, coachEmail, riderEmail } = await req.json()

    if (!teamId || !coachEmail || !riderEmail) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Create coach invite record
    await db.insert(mdCoachAssignments).values({
      id: uuid(),
      teamId,
      riderEmail: riderEmail.toLowerCase(),
      assignmentSpec: `Coach invite from ${coachEmail}`,
      status: 'pending',
    })

    // TODO: Send email to coach with accept link
    // Email template: "You've been invited to coach [rider]. Accept: https://motorsportsdata.io/coach/invite/[token]"

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${coachEmail}`,
    })
  } catch (error) {
    console.error('[v0] Coach invite failed:', error)
    return NextResponse.json({ success: false, error: 'Could not send invite' }, { status: 500 })
  }
}
