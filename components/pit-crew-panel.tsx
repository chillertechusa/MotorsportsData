'use client'

import { AlertCircle, TrendingUp, Gauge, Clock } from 'lucide-react'
import { RiderSnapshot } from '@/lib/hooks/use-team-telemetry'

interface PitCrewPanelProps {
  riders: RiderSnapshot[]
  fuelConsumptionPerLap?: number
  totalLaps?: number
}

export function PitCrewPanel({
  riders,
  fuelConsumptionPerLap = 0.5,
  totalLaps = 20,
}: PitCrewPanelProps) {
  // Calculate pit recommendations
  const getPitRecommendations = (rider: RiderSnapshot) => {
    const recommendations = []

    // Engine temperature alert
    if ((rider.engineTemp || 0) > 95) {
      recommendations.push({
        type: 'warning' as const,
        message: 'Engine temp critical',
        icon: 'thermometer',
        priority: 'high' as const,
      })
    } else if ((rider.engineTemp || 0) > 85) {
      recommendations.push({
        type: 'info' as const,
        message: 'Monitor engine temp',
        icon: 'thermometer',
        priority: 'medium' as const,
      })
    }

    // Fuel estimate
    if (fuelConsumptionPerLap > 0 && totalLaps > 0) {
      const lapsRemaining = totalLaps - (rider.lapNumber || 0)
      const estimatedFuelNeeded = lapsRemaining * fuelConsumptionPerLap
      if (estimatedFuelNeeded > 8) {
        recommendations.push({
          type: 'info' as const,
          message: `Fuel: ~${estimatedFuelNeeded.toFixed(1)}L remaining`,
          icon: 'fuel',
          priority: 'low' as const,
        })
      }
    }

    // Gap trend
    if ((rider.gapToLeader || 0) < -2) {
      recommendations.push({
        type: 'success' as const,
        message: 'Leading, maintain pace',
        icon: 'trend',
        priority: 'low' as const,
      })
    } else if ((rider.gapToLeader || 0) > 5) {
      recommendations.push({
        type: 'warning' as const,
        message: 'Gap increasing, adjust setup',
        icon: 'trend',
        priority: 'medium' as const,
      })
    }

    return recommendations
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-800 px-6 py-4">
        <h3 className="text-lg font-bold text-foreground">Pit Strategy</h3>
      </div>

      {/* Recommendations Grid */}
      <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {riders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No riders active</p>
          </div>
        ) : (
          riders.map((rider) => {
            const recommendations = getPitRecommendations(rider)
            return (
              <div
                key={rider.vehicleId}
                className="bg-zinc-800 border border-zinc-700 rounded p-4"
              >
                {/* Rider Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-700">
                  <div>
                    <p className="font-bold text-foreground">{rider.riderName}</p>
                    <p className="text-xs text-muted-foreground">Lap {rider.lapNumber}</p>
                  </div>
                  <span className="text-sm font-semibold px-2 py-1 bg-lime-950 text-lime-300 rounded">
                    P{rider.position}
                  </span>
                </div>

                {/* Recommendations */}
                {recommendations.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    All systems nominal
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded text-sm ${
                          rec.priority === 'high'
                            ? 'bg-red-950 text-red-200'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-950 text-yellow-200'
                            : 'bg-blue-950 text-blue-200'
                        }`}
                      >
                        <div className="mt-0.5">
                          {rec.icon === 'thermometer' && (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          {rec.icon === 'trend' && (
                            <TrendingUp className="w-4 h-4" />
                          )}
                          {rec.icon === 'fuel' && <Gauge className="w-4 h-4" />}
                        </div>
                        <span>{rec.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer Tips */}
      <div className="bg-zinc-800/50 px-6 py-3 border-t border-zinc-700 text-xs text-muted-foreground">
        <p>Updates every 500ms • Red = urgent • Yellow = monitor • Blue = info</p>
      </div>
    </div>
  )
}
