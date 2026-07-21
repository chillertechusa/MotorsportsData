'use client'

import { useMemo } from 'react'
import { useTeamTelemetry } from '@/lib/hooks/use-team-telemetry'
import { PitCrewPanel } from './pit-crew-panel'
import { TrackMapOverlay } from './track-map-overlay'
import { TeamRiderComparison } from './team-rider-comparison'
import { AlertCircle, Clock, Gauge, Wrench } from 'lucide-react'

interface MdLiveSession {
  id: string
  trackName?: string
  lapCount?: number
  status?: string
}

interface PitCrewDashboardClientProps {
  session: MdLiveSession
}

export function PitCrewDashboardClient({
  session,
}: PitCrewDashboardClientProps) {
  const { riders, sessionStatus, isLive } = useTeamTelemetry(session.id, true)

  // Calculate pit crew alerts
  const alerts = useMemo(() => {
    const allAlerts: Array<{
      riderName: string
      message: string
      priority: 'high' | 'medium' | 'low'
      type: 'temperature' | 'gap' | 'fuel' | 'pace'
    }> = []

    riders.forEach(rider => {
      if ((rider.engineTemp || 0) > 95) {
        allAlerts.push({
          riderName: rider.riderName,
          message: `Engine critical: ${Math.round(rider.engineTemp || 0)}°C`,
          priority: 'high',
          type: 'temperature',
        })
      }

      if ((rider.gapToLeader || 0) > 10) {
        allAlerts.push({
          riderName: rider.riderName,
          message: `Large gap: +${(rider.gapToLeader || 0).toFixed(1)}s`,
          priority: 'medium',
          type: 'gap',
        })
      }
    })

    return allAlerts.sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 }
      return priorityMap[a.priority] - priorityMap[b.priority]
    })
  }, [riders])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Pit Crew Coordinator</h1>
          <p className="text-muted-foreground">
            {session.trackName || 'Track'} - Real-time pit strategy
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 px-4 py-2 bg-lime-950 border border-lime-700 rounded-lg">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
            <span className="text-lime-300 font-semibold">LIVE</span>
          </div>
        )}
      </div>

      {/* Alerts & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Riders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-lime-400" />
            <span className="text-sm text-muted-foreground">Active Riders</span>
          </div>
          <div className="text-3xl font-bold text-lime-400">{riders.length}</div>
        </div>

        {/* Session Time */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-muted-foreground">Status</span>
          </div>
          <div className="text-lg font-semibold text-blue-400 capitalize">
            {sessionStatus}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-muted-foreground">Critical</span>
          </div>
          <div className="text-3xl font-bold text-red-400">
            {alerts.filter(a => a.priority === 'high').length}
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Warnings</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {alerts.filter(a => a.priority === 'medium').length}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pit Strategy */}
        <div className="lg:col-span-2">
          <PitCrewPanel riders={riders} totalLaps={20} fuelConsumptionPerLap={0.5} />
        </div>

        {/* Right: Alerts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
            <h3 className="font-bold text-foreground">Pit Alerts</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">All systems nominal</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded text-sm border ${
                    alert.priority === 'high'
                      ? 'bg-red-950 border-red-700 text-red-200'
                      : alert.priority === 'medium'
                      ? 'bg-yellow-950 border-yellow-700 text-yellow-200'
                      : 'bg-blue-950 border-blue-700 text-blue-200'
                  }`}
                >
                  <p className="font-semibold">{alert.riderName}</p>
                  <p className="text-xs mt-1">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Track Map & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrackMapOverlay riders={riders} trackName={session.trackName} />
        <TeamRiderComparison riders={riders} isLive={isLive} />
      </div>
    </div>
  )
}
