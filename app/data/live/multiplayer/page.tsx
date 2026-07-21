import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionTeamId } from '@/lib/md-auth'
import { LiveLeaderboard } from '@/components/multiplayer/live-leaderboard'
import { DriverComparison } from '@/components/multiplayer/driver-comparison'
import { RacePaceChart } from '@/components/multiplayer/race-pace-chart'
import { TeamAlertPanel } from '@/components/multiplayer/team-alert-panel'

export const metadata: Metadata = {
  title: 'Multiplayer Racing | MD',
  description: 'Live head-to-head race comparison and team coordination',
}

export default async function MultiplayerRacingPage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    redirect('/login')
  }

  // Mock data for demo
  const mockDriver1 = {
    name: 'Driver 1',
    bestLapTime: 62.345,
    lastLapTime: 62.421,
    engineTemp: 102,
    speed: 142,
    setup: 'Balanced',
  }

  const mockDriver2 = {
    name: 'Driver 2',
    bestLapTime: 62.756,
    lastLapTime: 62.890,
    engineTemp: 105,
    speed: 139,
    setup: 'Aggressive',
  }

  const mockPaceData = [
    { lap: 1, driver1: 63.2, driver2: 63.5 },
    { lap: 2, driver1: 62.8, driver2: 63.1 },
    { lap: 3, driver1: 62.5, driver2: 62.9 },
    { lap: 4, driver1: 62.345, driver2: 62.756 },
    { lap: 5, driver1: 62.421, driver2: 62.890 },
  ]

  const mockAlerts = [
    {
      riderId: 'driver1',
      riderName: 'Driver 1',
      severity: 'warning' as const,
      message: 'Engine temperature rising - 102°C',
      timestamp: new Date(Date.now() - 30000),
    },
    {
      riderId: 'driver2',
      riderName: 'Driver 2',
      severity: 'info' as const,
      message: 'Tire pressure nominal',
      timestamp: new Date(Date.now() - 60000),
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Live Multiplayer Racing</h1>
        <p className="text-muted-foreground mt-1">
          Head-to-head race comparison and team coordination
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <LiveLeaderboard />
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Driver comparison */}
          <DriverComparison driver1={mockDriver1} driver2={mockDriver2} />

          {/* Pace chart */}
          <RacePaceChart
            data={mockPaceData}
            drivers={[
              { name: 'Driver 1', color: '#3b82f6' },
              { name: 'Driver 2', color: '#ef4444' },
            ]}
          />
        </div>
      </div>

      {/* Team alerts */}
      <TeamAlertPanel alerts={mockAlerts} />
    </div>
  )
}
