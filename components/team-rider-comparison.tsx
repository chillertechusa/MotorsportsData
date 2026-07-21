'use client'

import { TrendingDown, AlertCircle, Zap, Thermometer } from 'lucide-react'
import { RiderSnapshot } from '@/lib/hooks/use-team-telemetry'

interface TeamRiderComparisonProps {
  riders: RiderSnapshot[]
  isLive: boolean
  onRiderClick?: (vehicleId: string) => void
}

export function TeamRiderComparison({
  riders,
  isLive,
  onRiderClick,
}: TeamRiderComparisonProps) {
  if (riders.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Waiting for team riders to go live...</p>
      </div>
    )
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs}`
  }

  const formatGap = (gap?: number) => {
    if (gap === undefined || gap === 0) return 'Leader'
    return gap > 0 ? `+${gap.toFixed(2)}s` : gap.toFixed(2)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Team Riders</h3>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-lime-400 font-semibold">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left px-6 py-3 font-semibold text-sm text-muted-foreground">
                Pos
              </th>
              <th className="text-left px-6 py-3 font-semibold text-sm text-muted-foreground">
                Rider
              </th>
              <th className="text-center px-6 py-3 font-semibold text-sm text-muted-foreground">
                Lap
              </th>
              <th className="text-right px-6 py-3 font-semibold text-sm text-muted-foreground">
                Current Lap
              </th>
              <th className="text-right px-6 py-3 font-semibold text-sm text-muted-foreground">
                Best Lap
              </th>
              <th className="text-right px-6 py-3 font-semibold text-sm text-muted-foreground">
                Gap
              </th>
              <th className="text-center px-6 py-3 font-semibold text-sm text-muted-foreground">
                Speed
              </th>
              <th className="text-center px-6 py-3 font-semibold text-sm text-muted-foreground">
                Throttle
              </th>
              <th className="text-center px-6 py-3 font-semibold text-sm text-muted-foreground">
                Engine
              </th>
            </tr>
          </thead>
          <tbody>
            {riders.map((rider) => (
              <tr
                key={rider.vehicleId}
                onClick={() => onRiderClick?.(rider.vehicleId)}
                className="border-b border-zinc-800 hover:bg-zinc-800/50 transition cursor-pointer"
              >
                {/* Position */}
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-bold text-lime-400">
                    {rider.position}
                  </span>
                </td>

                {/* Rider Name */}
                <td className="px-6 py-4">
                  <p className="font-semibold text-foreground">{rider.riderName}</p>
                </td>

                {/* Lap */}
                <td className="px-6 py-4 text-center font-mono text-yellow-400">
                  {rider.lapNumber}
                </td>

                {/* Current Lap */}
                <td className="px-6 py-4 text-right font-mono text-blue-400">
                  {formatTime(rider.currentLapTime)}
                </td>

                {/* Best Lap */}
                <td className="px-6 py-4 text-right font-mono font-semibold text-lime-400">
                  {formatTime(rider.bestLapTime)}
                </td>

                {/* Gap to Leader */}
                <td className="px-6 py-4 text-right font-mono text-orange-400">
                  <span
                    className={
                      (rider.gapToLeader ?? 0) <= 0
                        ? 'text-lime-400 font-bold'
                        : ''
                    }
                  >
                    {formatGap(rider.gapToLeader)}
                  </span>
                </td>

                {/* Speed */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingDown className="w-4 h-4 text-blue-300" />
                    <span className="font-mono text-sm text-blue-300">
                      {rider.speed ? `${Math.round(rider.speed)}` : '—'}
                    </span>
                  </div>
                </td>

                {/* Throttle */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="font-mono text-sm text-yellow-300">
                      {rider.throttle ? `${Math.round(rider.throttle)}%` : '—'}
                    </span>
                  </div>
                </td>

                {/* Engine Temp */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Thermometer
                      className={`w-4 h-4 ${
                        (rider.engineTemp || 0) > 95
                          ? 'text-red-400'
                          : 'text-orange-300'
                      }`}
                    />
                    <span
                      className={`font-mono text-sm ${
                        (rider.engineTemp || 0) > 95
                          ? 'text-red-400 font-bold'
                          : 'text-orange-300'
                      }`}
                    >
                      {rider.engineTemp ? `${Math.round(rider.engineTemp)}°` : '—'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-zinc-800/50 px-6 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{riders.length} riders live</span>
        <span>Updates every 500ms</span>
      </div>
    </div>
  )
}
