import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTeamMembers, mdTeams, user } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { ALL_TEAM_ROLES } from '@/lib/md-tiers'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('team_id')

    if (!teamId) {
      return NextResponse.json({ error: 'Missing team_id' }, { status: 400 })
    }

    // Verify team exists
    const teams = await db.select().from(mdTeams).where(eq(mdTeams.id, teamId)).limit(1)
    if (teams.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get team members
    const members = await db
      .select()
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.teamId, teamId))

    // Get user details for each member
    const userIds = members.map(m => m.userId)
    const users = userIds.length > 0
      ? await db.select().from(user).where(inArray(user.id, userIds))
      : []

    const membersWithDetails = members.map(member => {
      const u = users.find(u => u.id === member.userId)
      return {
        id: member.id,
        user_id: member.userId,
        email: u?.email,
        name: u?.name,
        role: member.role,
        created_at: member.createdAt,
      }
    })

    return NextResponse.json({ members: membersWithDetails })
  } catch (error) {
    console.error('[v0] Team members GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { team_id, email, role = 'mechanic' } = body

    if (!team_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role against the canonical team role list (single source of truth)
    if (!ALL_TEAM_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user exists
    const users = await db.select().from(user).where(eq(user.email, email)).limit(1)
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    const foundUser = users[0]

    // Check if already a member
    const existing = await db
      .select()
      .from(mdTeamMembers)
      .where(and(eq(mdTeamMembers.teamId, team_id), eq(mdTeamMembers.userId, foundUser.id)))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 409 }
      )
    }

    // Add team member
    const newMember = await db
      .insert(mdTeamMembers)
      .values({
        teamId: team_id,
        userId: foundUser.id,
        role,
      })
      .returning()

    return NextResponse.json(
      { member: newMember[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Team members POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
