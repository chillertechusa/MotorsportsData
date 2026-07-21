'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DriverComparisonProps {
  driver1: {
    name: string
    bestLapTime: number
    lastLapTime: number
    engineTemp: number
    speed: number
    setup?: string
  }
  driver2: {
    name: string
    bestLapTime: number
    lastLapTime: number
    engineTemp: number
    speed: number
    setup?: string
  }
}

export function DriverComparison({ driver1, driver2 }: DriverComparisonProps) {
  const lapDelta = Math.abs(driver1.bestLapTime - driver2.bestLapTime)
  const leader = driver1.bestLapTime < driver2.bestLapTime ? driver1.name : driver2.name
  const speedDelta = Math.abs(driver1.speed - driver2.speed)
  const tempDelta = Math.abs(driver1.engineTemp - driver2.engineTemp)

  return (
    <Card className="p-6 bg-slate-950 border-slate-800">
      <h3 className="text-lg font-bold mb-4 text-foreground">Head-to-Head Comparison</h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Driver 1 */}
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="font-semibold text-foreground">{driver1.name}</h4>
            {driver1.bestLapTime < driver2.bestLapTime && (
              <Badge className="mt-1 bg-green-900 text-green-200">Leader</Badge>
            )}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Lap:</span>
              <span className="font-mono text-foreground">{driver1.bestLapTime.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed:</span>
              <span className="font-mono text-foreground">{driver1.speed.toFixed(0)} mph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Eng Temp:</span>
              <span className="font-mono text-foreground">{driver1.engineTemp.toFixed(0)}°C</span>
            </div>
          </div>
        </div>

        {/* Delta */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-center text-xs text-muted-foreground">Gap</div>
          <div className="text-lg font-bold text-amber-400">{lapDelta.toFixed(2)}s</div>
          <div className="text-xs space-y-1 text-center">
            <div>Spd: {speedDelta.toFixed(0)} mph</div>
            <div>Tmp: {tempDelta.toFixed(0)}°C</div>
          </div>
        </div>

        {/* Driver 2 */}
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="font-semibold text-foreground">{driver2.name}</h4>
            {driver2.bestLapTime < driver1.bestLapTime && (
              <Badge className="mt-1 bg-green-900 text-green-200">Leader</Badge>
            )}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Lap:</span>
              <span className="font-mono text-foreground">{driver2.bestLapTime.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed:</span>
              <span className="font-mono text-foreground">{driver2.speed.toFixed(0)} mph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Eng Temp:</span>
              <span className="font-mono text-foreground">{driver2.engineTemp.toFixed(0)}°C</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
