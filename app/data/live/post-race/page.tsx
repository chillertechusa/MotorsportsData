import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionTeamId } from '@/lib/md-auth'
import { PostRaceReplay } from '@/components/multiplayer/post-race-replay'
import { TeamPerformance } from '@/components/multiplayer/team-performance'

export const metadata: Metadata = {
  title: 'Post-Race Analysis | MD',
  description: 'Race results, replay, and team performance analytics',
}

export default async function PostRacePage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Post-Race Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Review race results, replay key moments, and analyze team performance
        </p>
      </div>

      {/* Race replay */}
      <PostRaceReplay />

      {/* Team performance metrics */}
      <TeamPerformance />

      {/* Competitive insights */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground">Competitive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Pace Leader</div>
            <div className="text-xl font-bold text-foreground mt-1">Driver 1</div>
            <div className="text-xs text-muted-foreground mt-2">62.345s avg lap time</div>
          </div>
          <div className="bg-slate-950 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Most Improved</div>
            <div className="text-xl font-bold text-green-400 mt-1">Driver 3</div>
            <div className="text-xs text-muted-foreground mt-2">+12% improvement</div>
          </div>
          <div className="bg-slate-950 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Consistency Champion</div>
            <div className="text-xl font-bold text-foreground mt-1">Driver 1</div>
            <div className="text-xs text-muted-foreground mt-2">92% lap variance</div>
          </div>
        </div>
      </div>
    </div>
  )
}
