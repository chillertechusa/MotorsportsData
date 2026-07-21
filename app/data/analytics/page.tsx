import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { mdTeamMembers, mdTeams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AnalyticsDashboard } from '@/components/data/analytics-dashboard'

export const metadata = {
  title: 'Team Analytics | Motorsport Data',
  description: 'Season performance trends, rider stats, and compliance reports',
}

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect('/data/sign-in?redirect=/data/analytics')
  }

  // Check team membership
  const [membership] = await db
    .select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers)
    .where(eq(mdTeamMembers.userId, session.user.id))
    .limit(1)

  if (!membership) {
    redirect('/data/pricing?reason=no-team')
  }

  // Check subscription tier for analytics access (Race Team + only)
  const [team] = await db
    .select({ subscriptionTier: mdTeams.subscriptionTier })
    .from(mdTeams)
    .where(eq(mdTeams.id, membership.teamId))
    .limit(1)

  if (!team || (team.subscriptionTier !== 'race_team' && team.subscriptionTier !== 'factory_rig')) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center border border-zinc-800 bg-zinc-900 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-4">Analytics Locked</h1>
          <p className="text-zinc-400 mb-2">
            Advanced analytics are available on <span className="font-bold">Race Team</span> and <span className="font-bold">Factory Rig</span> tiers.
          </p>
          <p className="text-sm text-zinc-500 mb-6">
            Unlock real-time performance trends, rider comparisons, and coaching ROI tracking.
          </p>
          <a
            href="/data/pricing"
            className="inline-block px-6 py-2 bg-lime-500 text-zinc-950 font-bold rounded-lg hover:bg-lime-400 transition"
          >
            View Pricing
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AnalyticsDashboard teamId={membership.teamId} />
      </div>
    </div>
  )
}
