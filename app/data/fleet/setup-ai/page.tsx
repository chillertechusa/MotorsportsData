import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdVehicles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SetupAIRecommender } from '@/components/data/setup-ai-recommender'

export const metadata: Metadata = {
  title: 'Setup AI Advisor — Motorsport Data',
  description: 'Get AI-powered suspension setup recommendations based on your historical data and conditions.',
}

export default async function SetupAIPage() {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) redirect('/data/rookie')
  const teamId = authResult.teamId

  const vehicles = await db
    .select()
    .from(mdVehicles)
    .where(eq(mdVehicles.teamId, teamId))

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-black text-zinc-100 mb-4">No Vehicles Yet</h1>
          <p className="text-zinc-400 mb-6">Add a vehicle to your fleet to get setup recommendations.</p>
          <a href="/data/fleet" className="inline-block bg-lime-400 text-zinc-950 px-6 py-3 font-black uppercase tracking-widest hover:bg-lime-300 transition-colors">
            Back to Fleet
          </a>
        </div>
      </div>
    )
  }

  return <SetupAIRecommender vehicles={vehicles} />
}
