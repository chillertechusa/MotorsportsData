import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers } from '@/lib/db/schema'
import { RaceControl } from '@/components/data/race-control'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Session Management | Motorsport Data',
  description: 'Start/stop race sessions, track real-time telemetry, manage team racing',
}

export default async function SessionsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect('/data/sign-in?redirect=/data/sessions')
  }

  const [membership] = await db
    .select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers)
    .where(eq(mdTeamMembers.userId, session.user.id))
    .limit(1)

  if (!membership) {
    redirect('/data/pricing?reason=no-team')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="max-w-5xl mx-auto">
        <RaceControl teamId={membership.teamId} />
      </div>
    </div>
  )
}
