'use client'

import { X, TrendingDown, Zap, Thermometer, Activity } from 'lucide-react'
import { RiderSnapshot } from '@/lib/hooks/use-team-telemetry'
import { useRiderDetails } from '@/lib/hooks/use-team-telemetry'

interface RiderDetailPanelProps {
  rider: RiderSnapshot | null
  sessionId: string | null
  onClose: () => void
}

export function RiderDetailPanel({
  rider,
  sessionId,
  onClose,
}: RiderDetailPanelProps) {
  const { details, isConnected } = useRiderDetails(
    rider?.vehicleId || null,
    sessionId
  )

  if (!rider) return null

  const data = details || rider

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 md:relative md:bg-transparent md:items-stretch md:block md:w-80">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-lg md:rounded-lg w-full md:w-80 h-[70vh] md:h-auto flex flex-col md:max-h-[600px]">
        {/* Header */}
        <div className="bg-zinc-800 px-6 py-4 flex items-center justify-between border-b border-zinc-700">
          <div>
            <h3 className="font-bold text-lg text-foreground">{rider.riderName}</h3>
            <p className="text-xs text-muted-foreground">Position #{rider.position}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-700 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status */}
        {isConnected && (
          <div className="px-6 py-2 bg-lime-950 border-b border-lime-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-lime-300">Live streaming</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800 rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Lap</p>
              <p className="text-2xl font-bold text-yellow-400">
                {data.lapNumber}
              </p>
            </div>

            <div className="bg-zinc-800 rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Gap</p>
              <p className="text-2xl font-bold text-orange-400">
                {data.gapToLeader === undefined
                  ? '—'
                  : data.gapToLeader <= 0
                  ? 'Lead'
                  : `+${data.gapToLeader.toFixed(2)}s`}
              </p>
            </div>

            <div className="bg-zinc-800 rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Best Lap</p>
              <p className="font-mono text-lg text-lime-400">
                {data.bestLapTime
                  ? `${Math.floor(data.bestLapTime / 60)}:${(data.bestLapTime % 60).toFixed(2)}`
                  : '—'}
              </p>
            </div>

            <div className="bg-zinc-800 rounded p-4">
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <p className="font-mono text-lg text-blue-400">
                {data.currentLapTime
                  ? `${Math.floor(data.currentLapTime / 60)}:${(data.currentLapTime % 60).toFixed(2)}`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-muted-foreground">Speed</span>
              </div>
              <span className="font-mono text-lg text-blue-400">
                {data.speed ? `${Math.round(data.speed)} km/h` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Throttle</span>
              </div>
              <span className="font-mono text-lg text-yellow-400">
                {data.throttle ? `${Math.round(data.throttle)}%` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" />
                <span className="text-sm text-muted-foreground">Brake</span>
              </div>
              <span className="font-mono text-lg text-red-400">
                {data.brake ? `${Math.round(data.brake)}%` : '—'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer
                  className={`w-4 h-4 ${
                    (data.engineTemp || 0) > 95 ? 'text-red-400' : 'text-orange-400'
                  }`}
                />
                <span className="text-sm text-muted-foreground">Engine</span>
              </div>
              <span
                className={`font-mono text-lg ${
                  (data.engineTemp || 0) > 95
                    ? 'text-red-400 font-bold'
                    : 'text-orange-400'
                }`}
              >
                {data.engineTemp ? `${Math.round(data.engineTemp)}°C` : '—'}
              </span>
            </div>
          </div>

          {/* Throttle/Brake Indicator */}
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs text-muted-foreground mb-2">Throttle/Brake</p>
            <div className="h-8 bg-zinc-800 rounded flex overflow-hidden">
              {data.throttle ? (
                <div
                  className="bg-yellow-500 h-full transition-all"
                  style={{ width: `${data.throttle}%` }}
                />
              ) : null}
              {data.brake ? (
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${data.brake}%` }}
                />
              ) : null}
              <div className="flex-1 bg-zinc-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
