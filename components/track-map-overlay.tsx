'use client'

import { Map } from 'lucide-react'
import { RiderSnapshot } from '@/lib/hooks/use-team-telemetry'

interface TrackMapOverlayProps {
  riders: RiderSnapshot[]
  trackName?: string
  onRiderClick?: (vehicleId: string) => void
}

// Color mapping by position
const getPositionColor = (position: number) => {
  const colors = [
    '#fbbf24', // 1st - amber
    '#60a5fa', // 2nd - blue
    '#f87171', // 3rd - red
    '#34d399', // 4th - emerald
    '#a78bfa', // 5th - purple
    '#fb923c', // 6th - orange
  ]
  return colors[position - 1] || '#9ca3af'
}

export function TrackMapOverlay({
  riders,
  trackName = 'Track',
  onRiderClick,
}: TrackMapOverlayProps) {
  // Generate random positions on map for demo
  // In production, this would use actual GPS coordinates
  const riderPositions = riders.map((rider, idx) => ({
    ...rider,
    x: 20 + (idx % 3) * 25 + Math.random() * 10,
    y: 30 + Math.floor(idx / 3) * 25 + Math.random() * 10,
  }))

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 px-6 py-4 flex items-center gap-2">
        <Map className="w-5 h-5 text-lime-400" />
        <h3 className="font-bold text-foreground">{trackName}</h3>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 bg-zinc-800">
        {/* SVG Background */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {/* Simple track layout */}
          <path
            d="M 50,30 Q 80,20 95,50 Q 100,80 80,95 Q 50,100 20,90 Q 10,60 50,30"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-lime-500"
          />
        </svg>

        {/* Rider Markers */}
        {riderPositions.map((rider) => (
          <div
            key={rider.vehicleId}
            onClick={() => onRiderClick?.(rider.vehicleId)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${rider.x}%`,
              top: `${rider.y}%`,
            }}
          >
            {/* Position Indicator */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg border-2 border-white transition hover:scale-125"
              style={{
                backgroundColor: getPositionColor(rider.position),
              }}
            >
              {rider.position}
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              <div className="bg-zinc-800 text-foreground text-xs px-2 py-1 rounded border border-zinc-700">
                {rider.riderName}
              </div>
            </div>

            {/* Speed/Direction Vector */}
            {rider.speed && rider.speed > 0 && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  transform: `rotate(${(rider.speed / 150) * 360}deg)`,
                }}
              >
                <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-lime-400 transform -translate-x-1/2" />
              </div>
            )}
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground space-y-1">
          <p>Positions by number</p>
          <p>Size = Speed</p>
        </div>

        {/* No Riders Message */}
        {riders.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No riders on track</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-zinc-800/50 px-6 py-3 border-t border-zinc-700 text-xs text-muted-foreground flex items-center justify-between">
        <span>{riders.length} riders live</span>
        <span>GPS updates every 500ms</span>
      </div>
    </div>
  )
}
