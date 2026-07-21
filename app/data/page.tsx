import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ROOKIE_TIER } from '@/lib/md-tiers'
import RigShell from '@/components/data/rig-shell'

// Force dynamic rendering — this page reads request cookies/headers for auth.
export const dynamic = 'force-dynamic'

// Platform console — must be authenticated AND have team membership.
export default async function DataPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect('/data/sign-in?redirect=/data')
  }

  const [membership] = await db
    .select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers)
    .where(eq(mdTeamMembers.userId, session.user.id))
    .limit(1)

  // Safety net: if user has no membership, create a Rookie team
  if (!membership) {
    const teamName = `${session.user.name || 'My'} Team`
    const newTeam = await db
      .insert(mdTeams)
      .values({
        name: teamName,
        subscriptionTier: ROOKIE_TIER,
        subscriptionStatus: 'active',
      })
      .returning({ id: mdTeams.id })

    if (newTeam && newTeam.length > 0) {
      const teamId = newTeam[0].id
      await db.insert(mdTeamMembers).values({
        userId: session.user.id,
        teamId,
        role: 'owner',
      })
      console.log(`[v0] Safety net: created Rookie team ${teamId} for user ${session.user.id}`)
    }
  }

  return <RigShell />
}
