import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSessionTeamId } from '@/lib/md-auth'
import { hasLiveCoachingAccess } from '@/lib/md-live-auth'
import { db } from '@/lib/db'
import { mdLiveSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PitCrewDashboardClient } from '@/components/pit-crew-dashboard-client'

export const metadata = {
  title: 'Pit Crew Coordinator | Motorsports Data',
  description: 'Live pit strategy and team coordination',
}

export default async function PitCrewPage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) redirect('/data/sign-in')

  const hasAccess = await hasLiveCoachingAccess()
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Pit Crew Access Required</h1>
          <p className="text-muted-foreground mb-8">
            Pit crew coordination is a Factory Rig feature.
          </p>
          <a
            href="/data/live"
            className="inline-block px-6 py-2 bg-lime-500 text-black rounded-lg font-semibold hover:bg-lime-400 transition"
          >
            Back to Live Dashboard
          </a>
        </div>
      </div>
    )
  }

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
            Start a live race session to begin pit crew coordination.
          </p>
          <a
            href="/data/live"
            className="inline-block px-6 py-2 bg-lime-500 text-black rounded-lg font-semibold hover:bg-lime-400 transition"
          >
            Back to Live Dashboard
          </a>
        </div>
      </div>
    )
  }

  const primarySession = activeSessions[0]

  return (
    <div className="min-h-screen bg-background p-8">
      <Suspense fallback={<div>Loading pit crew dashboard...</div>}>
        <PitCrewDashboardClient session={primarySession} />
      </Suspense>
    </div>
  )
}
