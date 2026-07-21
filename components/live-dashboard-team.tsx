'use client'

import { useState } from 'react'
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTeamTelemetry } from '@/lib/hooks/use-team-telemetry'
import { TeamRiderComparison } from './team-rider-comparison'
import { RiderDetailPanel } from './rider-detail-panel'
import { TrackMapOverlay } from './track-map-overlay'
import { PitCrewPanel } from './pit-crew-panel'

interface LiveDashboardTeamProps {
  sessionId: string
  trackName?: string
}

export function LiveDashboardTeam({
  sessionId,
  trackName,
}: LiveDashboardTeamProps) {
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null)
  const { riders, sessionStatus, isLive, isLoading } = useTeamTelemetry(
    sessionId,
    true
  )

  const selectedRider = riders.find(r => r.vehicleId === selectedRiderId) || null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Team Telemetry</h1>
          <p className="text-muted-foreground">
            {trackName ? `${trackName} - ` : ''}
            {riders.length} riders
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 px-4 py-2 bg-lime-950 border border-lime-700 rounded-lg">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
            <span className="text-lime-300 font-semibold text-sm">LIVE</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="map">Track Map</TabsTrigger>
          <TabsTrigger value="pit-strategy">Pit Strategy</TabsTrigger>
          <TabsTrigger value="detail">
            Detail
            {selectedRider && ` - ${selectedRider.riderName}`}
          </TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <TeamRiderComparison
            riders={riders}
            isLive={isLive}
            onRiderClick={setSelectedRiderId}
          />
          <div className="text-xs text-muted-foreground text-center">
            Click on a rider to view details
          </div>
        </TabsContent>

        {/* Track Map Tab */}
        <TabsContent value="map">
          <TrackMapOverlay
            riders={riders}
            trackName={trackName}
            onRiderClick={setSelectedRiderId}
          />
        </TabsContent>

        {/* Pit Strategy Tab */}
        <TabsContent value="pit-strategy">
          <PitCrewPanel riders={riders} totalLaps={20} fuelConsumptionPerLap={0.5} />
        </TabsContent>

        {/* Detail Tab */}
        <TabsContent value="detail">
          {selectedRider ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <TeamRiderComparison
                  riders={[selectedRider]}
                  isLive={isLive}
                  onRiderClick={setSelectedRiderId}
                />
              </div>
              <div className="md:w-80">
                <RiderDetailPanel
                  rider={selectedRider}
                  sessionId={sessionId}
                  onClose={() => setSelectedRiderId(null)}
                />
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
              <p className="text-muted-foreground">
                Select a rider from the Comparison tab to view details
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Stats */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Session: {sessionStatus}</span>
        <span>Riders: {riders.length}</span>
        <span>Updates: 500ms</span>
      </div>
    </div>
  )
}
