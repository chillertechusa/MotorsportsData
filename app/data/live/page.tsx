import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { LiveDashboardClient } from '@/components/live-dashboard-client'
import { getSessionTeamId } from '@/lib/md-auth'
import { hasLiveCoachingAccess } from '@/lib/md-live-auth'
import { db } from '@/lib/db'
import { mdLiveSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const metadata = {
  title: 'Live Race Dashboard | Motorsports Data',
  description: 'Real-time coaching during races',
}

export default async function LivePage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) redirect('/data/sign-in')

  // Check tier access
  const hasAccess = await hasLiveCoachingAccess()
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Live Coaching Locked</h1>
          <p className="text-muted-foreground mb-8">
            Live race-day coaching is a Factory Rig feature. Upgrade your team to access real-time AI coaching during races.
          </p>
          <a
            href="/data/dashboard"
            className="inline-block px-6 py-2 bg-lime-500 text-black rounded-lg font-semibold hover:bg-lime-400 transition"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  // Get active live sessions for this team
  const activeSessions = await db
    .select()
    .from(mdLiveSessions)
    .where(eq(mdLiveSessions.teamId, auth.teamId))
    .limit(10)

  if (activeSessions.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">No Active Live Sessions</h1>
          <p className="text-muted-foreground mb-8">
            Start a live race session to begin real-time coaching.
          </p>
          <a
            href="/data/dashboard"
            className="inline-block px-6 py-2 bg-lime-500 text-black rounded-lg font-semibold hover:bg-lime-400 transition"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const primarySession = activeSessions[0]

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-8">Loading live session...</div>}>
        <LiveDashboardClient session={primarySession} />
      </Suspense>
    </div>
  )
}
