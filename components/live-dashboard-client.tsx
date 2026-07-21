'use client'

import { useLiveTelemetry } from '@/lib/hooks/use-live-telemetry'
import { useState } from 'react'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'

interface LiveSession {
  id: string
  riderEmail: string
  currentLap: number | null
  bestLapSeconds?: number | null
}

export function LiveDashboardClient({ session }: { session: LiveSession }) {
  const telemetry = useLiveTelemetry(session.id)
  const [showAlerts, setShowAlerts] = useState(true)

  const speedColor = telemetry.speed > 100 ? 'text-red-400' : telemetry.speed > 80 ? 'text-yellow-400' : 'text-green-400'
  const engineTempColor = telemetry.engineTemp > 100 ? 'text-red-400' : telemetry.engineTemp > 90 ? 'text-yellow-400' : 'text-green-400'
  const throttleColor = telemetry.throttle > 80 ? 'text-red-400' : 'text-blue-400'

  return (
    <div className="w-full h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900 p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Race Coaching</h1>
          <p className="text-sm text-muted-foreground">{session.riderEmail}</p>
        </div>
        <div className="flex items-center gap-4">
          {telemetry.isConnected ? (
            <div className="flex items-center gap-2 text-green-400">
              <Wifi className="w-5 h-5" />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400 animate-pulse">
              <WifiOff className="w-5 h-5" />
              <span>Connecting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="flex-1 overflow-auto p-6 flex gap-6">
        {/* Left: Live Metrics */}
        <div className="flex-1 space-y-4">
          {/* Speed Gauge */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">SPEED</div>
            <div className={`text-5xl font-bold ${speedColor} font-mono`}>
              {Math.round(telemetry.speed)} km/h
            </div>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Lap */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">LAP</div>
              <div className="text-3xl font-bold text-lime-400">{telemetry.currentLap}</div>
            </div>

            {/* Best Lap */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">BEST LAP</div>
              <div className="text-3xl font-bold text-blue-400">
                {telemetry.bestLap ? telemetry.bestLap.toFixed(2) : '--'}s
              </div>
            </div>

            {/* Throttle */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">THROTTLE</div>
              <div className={`text-3xl font-bold ${throttleColor} font-mono`}>
                {Math.round(telemetry.throttle)}%
              </div>
            </div>

            {/* Brake */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">BRAKE</div>
              <div className="text-3xl font-bold text-orange-400 font-mono">
                {Math.round(telemetry.brake)}%
              </div>
            </div>
          </div>

          {/* Engine Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">ENGINE TEMP</div>
              <div className={`text-3xl font-bold ${engineTempColor} font-mono`}>
                {Math.round(telemetry.engineTemp)}°C
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-2">RPM</div>
              <div className="text-3xl font-bold text-cyan-400 font-mono">
                {(telemetry.engineTemp || 0).toFixed(0)}k
              </div>
            </div>
          </div>
        </div>

        {/* Right: Alerts & Recommendations */}
        <div className="w-80 space-y-4">
          {/* Live Alerts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex-1 min-h-0 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground">Live Alerts</h2>
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="text-xs px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 transition"
              >
                {showAlerts ? 'Hide' : 'Show'}
              </button>
            </div>

            {showAlerts && telemetry.alerts.length > 0 ? (
              <div className="space-y-3">
                {telemetry.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border-l-4 ${
                      alert.severity === 'CRITICAL'
                        ? 'border-red-500 bg-red-950'
                        : 'border-yellow-500 bg-yellow-950'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold text-white">{alert.type}</div>
                        <div className="text-xs text-gray-300">{alert.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No active alerts
              </div>
            )}
          </div>

          {/* Coach AI Recommendations */}
          <div className="bg-zinc-900 border border-lime-500/30 rounded-lg p-6">
            <h2 className="text-lg font-bold text-lime-400 mb-4">Coach AI</h2>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>• Monitor engine temperature - approaching warning threshold</p>
              <p>• Brake pressure optimal</p>
              <p>• Throttle response consistent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
