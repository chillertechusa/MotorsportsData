import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTeamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { ALL_TEAM_ROLES } from '@/lib/md-tiers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body
    const { id: memberId } = await params

    if (!role) {
      return NextResponse.json(
        { error: 'Missing role' },
        { status: 400 }
      )
    }

    // Validate role against the canonical team role list (single source of truth)
    if (!ALL_TEAM_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update member role
    const updated = await db
      .update(mdTeamMembers)
      .set({ role })
      .where(eq(mdTeamMembers.id, memberId))
      .returning()

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json({ member: updated[0] })
  } catch (error) {
    console.error('[v0] Member PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: memberId } = await params

    // Delete team member
    await db.delete(mdTeamMembers).where(eq(mdTeamMembers.id, memberId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Member DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
