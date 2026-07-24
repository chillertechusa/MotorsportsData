/**
 * GET /api/cron/demo-cleanup
 *
 * Deletes ephemeral demo coaching accounts older than 2 hours.
 * Called nightly by Vercel Cron (see vercel.json crons config).
 *
 * Cascades via FK:
 *   mdCoachInvoices → clientId → mdCoachClients
 *   mdCoachSessionAthletes → sessionId/clientId
 *   mdTrainingPlans → clientId
 *   mdCoachPackages (by coachTeamId)
 *   mdTeamMembers → teamId
 *   mdTeams → id
 *   auth user → userId (Better Auth signOut / deleteUser)
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers, mdCoachClients, mdCoachSessions, mdCoachPackages, mdTrainingPlans, mdCoachInvoices, mdCoachSessionAthletes } from '@/lib/db/schema'
import { like, lt, eq, inArray } from 'drizzle-orm'
import { user as authUser } from '@/lib/db/schema'

const TWO_HOURS = 2 * 60 * 60 * 1000

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - TWO_HOURS)

  try {
    // Find all expired demo teams
    const expiredTeams = await db
      .select({ id: mdTeams.id })
      .from(mdTeams)
      .where(lt(mdTeams.createdAt!, cutoff))
      .then(rows => rows.filter(r => r.id.startsWith('demo-coach-')))

    if (expiredTeams.length === 0) {
      return NextResponse.json({ deleted: 0, message: 'No expired demo teams found' })
    }

    const teamIds = expiredTeams.map(t => t.id)

    // Find user IDs linked to these demo teams
    const memberships = await db
      .select({ userId: mdTeamMembers.userId })
      .from(mdTeamMembers)
      .where(inArray(mdTeamMembers.teamId, teamIds))

    const userIds = memberships.map(m => m.userId).filter(Boolean) as string[]

    // Delete coach data in FK-safe order
    // Get client IDs first for cascading
    const clients = await db
      .select({ id: mdCoachClients.id })
      .from(mdCoachClients)
      .where(inArray(mdCoachClients.coachTeamId, teamIds))
    const clientIds = clients.map(c => c.id)

    const sessions = await db
      .select({ id: mdCoachSessions.id })
      .from(mdCoachSessions)
      .where(inArray(mdCoachSessions.coachTeamId, teamIds))
    const sessionIds = sessions.map(s => s.id)

    if (sessionIds.length > 0) {
      await db.delete(mdCoachSessionAthletes).where(inArray(mdCoachSessionAthletes.sessionId, sessionIds))
    }
    if (clientIds.length > 0) {
      await db.delete(mdTrainingPlans).where(inArray(mdTrainingPlans.clientId, clientIds))
      await db.delete(mdCoachInvoices).where(inArray(mdCoachInvoices.clientId, clientIds))
      await db.delete(mdCoachClients).where(inArray(mdCoachClients.id, clientIds))
    }
    await db.delete(mdCoachSessions).where(inArray(mdCoachSessions.coachTeamId, teamIds))
    await db.delete(mdCoachPackages).where(inArray(mdCoachPackages.coachTeamId, teamIds))
    await db.delete(mdTeamMembers).where(inArray(mdTeamMembers.teamId, teamIds))
    await db.delete(mdTeams).where(inArray(mdTeams.id, teamIds))

    // Delete auth users directly (Better Auth user table)
    let deletedUsers = 0
    if (userIds.length > 0) {
      await db.delete(authUser).where(inArray(authUser.id, userIds))
      deletedUsers = userIds.length
    }

    console.log(`[demo-cleanup] Deleted ${teamIds.length} teams, ${deletedUsers}/${userIds.length} auth users`)

    return NextResponse.json({
      deleted: teamIds.length,
      teams: teamIds,
      authUsersDeleted: deletedUsers,
    })
  } catch (error) {
    console.error('[demo-cleanup]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cleanup failed' },
      { status: 500 }
    )
  }
}
