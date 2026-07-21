'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, TrendingUp, Gauge, Thermometer, Wind } from 'lucide-react'

interface TelemetryData {
  timestamp: string
  lapNumber: number
  speed: number
  throttle: number
  brakePressure: number
  tirePressFront: number
  tirePressRear: number
  engineTempC: number
  engineRpmK: number
  gLateral: number
  gLongitudinal: number
}

interface LiveAlert {
  id: string
  type: string
  severity: string
  message: string
  timestamp: string
}

interface LiveDashboardProps {
  liveSessionId: string
  riderName: string
  vehicleName: string
}

export function LiveCoachDashboard({ liveSessionId, riderName, vehicleName }: LiveDashboardProps) {
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([])
  const [alerts, setAlerts] = useState<LiveAlert[]>([])
  const [currentLap, setCurrentLap] = useState(1)
  const [isLive, setIsLive] = useState(true)
  const [bestLapTime, setBestLapTime] = useState(115.2) // Demo best lap

  // Poll for live telemetry every 250ms
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/md-telemetry/live?sessionId=${liveSessionId}`)
        if (!response.ok) return

        const data = await response.json()
        setTelemetry(data.telemetry || [])
        setAlerts(data.alerts || [])
        setCurrentLap(data.currentLap)
      } catch (err) {
        console.error('[v0] Live telemetry poll error:', err)
      }
    }, 250)

    return () => clearInterval(interval)
  }, [liveSessionId, isLive])

  const currentData = telemetry[0]

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`h-5 w-5 ${isLive ? 'animate-pulse text-lime-400' : 'text-zinc-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {isLive ? 'LIVE SESSION' : 'SESSION PAUSED'}
              </span>
            </div>
            <p className="text-2xl font-black text-zinc-50">{riderName}</p>
            <p className="text-sm text-zinc-400">{vehicleName} • Lap {currentLap}</p>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className="px-4 py-2 rounded-lg bg-lime-500/10 border border-lime-500/30 text-lime-400 text-sm font-bold hover:border-lime-500/50 transition"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-orange-500/10 border-orange-500/30'
                }`}
              >
                <AlertTriangle
                  className={`h-4 w-4 shrink-0 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-400' : 'text-orange-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-50">{alert.message}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Telemetry Grid */}
      {currentData && (
        <>
          {/* Speed & Power */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Speed</p>
              <p className="text-4xl font-black text-lime-400">{currentData.speed.toFixed(1)}</p>
              <p className="text-xs text-zinc-400 mt-2">mph</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Throttle</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-blue-400">{currentData.throttle}</p>
                <p className="text-xs text-zinc-400">%</p>
              </div>
              <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 transition-all"
                  style={{ width: `${currentData.throttle}%` }}
                />
              </div>
            </div>
          </div>

          {/* Braking & G-Forces */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Brake Pressure</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-red-400">{currentData.brakePressure}</p>
                <p className="text-xs text-zinc-400">%</p>
              </div>
              <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 transition-all"
                  style={{ width: `${currentData.brakePressure}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Lateral G</p>
              <p className="text-4xl font-black text-purple-400">{currentData.gLateral.toFixed(2)}</p>
              <p className="text-xs text-zinc-400 mt-2">Gs</p>
            </div>
          </div>

          {/* Tires & Engine */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <Wind className="h-4 w-4" />
                Tire Pressure
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Front</span>
                  <span className="font-bold text-zinc-50">{currentData.tirePressFront.toFixed(1)} PSI</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Rear</span>
                  <span className="font-bold text-zinc-50">{currentData.tirePressRear.toFixed(1)} PSI</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Engine
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Temp</span>
                  <span className="font-bold text-zinc-50">{currentData.engineTempC}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">RPM</span>
                  <span className="font-bold text-zinc-50">{(currentData.engineRpmK * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lap Time Comparison */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Best Lap This Session</span>
                <span className="font-bold text-lime-400">{bestLapTime.toFixed(2)}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Current Lap Time</span>
                <span className="font-bold text-zinc-50">Lap in progress...</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI Chat Section */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">AI Coaching Chat</p>
        <div className="rounded-lg bg-zinc-800/50 p-4 mb-4 min-h-[120px] border border-zinc-700">
          <p className="text-sm text-zinc-400 italic">
            Chat grounded in live telemetry will appear here. Ask about braking points, throttle smoothness, setup
            changes, or anything visible in the live data.
          </p>
        </div>
        <input
          type="text"
          placeholder="Ask about this lap's performance..."
          className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-50 placeholder-zinc-500 text-sm focus:outline-none focus:border-lime-500"
        />
      </div>
    </div>
  )
}
