'use client'

import { useEffect, useState } from 'react'
import { Activity, Heart, Zap, Gauge, Flag, TrendingUp } from 'lucide-react'
import { telemetryBroadcaster } from '@/lib/websocket/telemetry-broadcast'
import { TelemetryWaveform } from './charting/telemetry-waveform'

interface LiveMetrics {
  heartRate: number
  power: number
  speed: number
  cadence: number
  lapNumber: number
  lastLapTime?: string
  bestLapTime?: string
  readinessScore: number
}

interface RaceSessionProps {
  sessionId: string
  riderId: string
  riderName: string
  riderNumber: number
}

export function LiveRaceDashboard({ sessionId, riderId, riderName, riderNumber }: RaceSessionProps) {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([])

  useEffect(() => {
    setIsLive(true)

    // Subscribe to live telemetry
    telemetryBroadcaster.subscribe('coach-01', sessionId, [riderId])

    // Simulate live data updates
    const interval = setInterval(() => {
      const newMetrics: LiveMetrics = {
        heartRate: 160 + Math.random() * 20,
        power: 250 + Math.random() * 100,
        speed: 60 + Math.random() * 15,
        cadence: 85 + Math.random() * 20,
        lapNumber: Math.floor(Math.random() * 20) + 1,
        lastLapTime: '1:45.3',
        bestLapTime: '1:43.8',
        readinessScore: 85,
      }
      setMetrics(newMetrics)
      setSubscriberCount(telemetryBroadcaster.getSubscriberCount(sessionId))

      // Add to history for charting
      setTelemetryHistory((prev) => [...prev.slice(-999), newMetrics])
    }, 1000)

    return () => {
      clearInterval(interval)
      setIsLive(false)
    }
  }, [sessionId, riderId])

  if (!metrics) {
    return (
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-8 text-center">
        <Activity className="h-8 w-8 text-zinc-500 mx-auto mb-3 animate-pulse" />
        <p className="text-zinc-400">Connecting to live session...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase text-zinc-50">
            #{riderNumber} {riderName}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Live Race Telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full animate-pulse ${isLive ? 'bg-lime-500' : 'bg-zinc-700'}`} />
          <span className="text-sm font-bold text-zinc-300">
            {subscriberCount} coach{subscriberCount !== 1 ? 'es' : ''} watching
          </span>
        </div>
      </div>

      {/* Current Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Heart, label: 'HR', value: Math.round(metrics.heartRate), unit: 'bpm', color: 'text-red-500' },
          { icon: Zap, label: 'Power', value: Math.round(metrics.power), unit: 'W', color: 'text-yellow-500' },
          { icon: Gauge, label: 'Speed', value: metrics.speed.toFixed(1), unit: 'mph', color: 'text-blue-500' },
          { icon: Activity, label: 'Cadence', value: Math.round(metrics.cadence), unit: 'rpm', color: 'text-purple-500' },
          { icon: TrendingUp, label: 'Readiness', value: metrics.readinessScore, unit: '%', color: 'text-lime-500' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <Icon className={`h-5 w-5 ${item.color} mb-2`} />
              <p className="text-xs text-zinc-400 mb-1">{item.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-zinc-50">{item.value}</p>
                <p className="text-xs text-zinc-500">{item.unit}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lap Timing */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-4">
          <Flag className="h-5 w-5 text-amber-500 mb-2" />
          <p className="text-xs text-zinc-400 mb-1">Current Lap</p>
          <p className="text-3xl font-black text-zinc-50">{metrics.lapNumber}</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-4">
          <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-xs text-zinc-400 mb-1">Last Lap</p>
          <p className="text-2xl font-black text-blue-400">{metrics.lastLapTime}</p>
        </div>

        <div className="border border-lime-500/30 bg-lime-500/5 rounded-lg p-4">
          <Trophy className="h-5 w-5 text-lime-500 mb-2" />
          <p className="text-xs text-lime-400 mb-1">Best Lap</p>
          <p className="text-2xl font-black text-lime-400">{metrics.bestLapTime}</p>
        </div>
      </div>

      {/* Waveform Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <TelemetryWaveform
          data={telemetryHistory.map((m, idx) => ({
            timestamp: idx,
            heartRate: m.heartRate,
            power: m.power,
            speed: m.speed,
            cadence: m.cadence,
          }))}
          activeMetric="heartRate"
          height={200}
        />
        <TelemetryWaveform
          data={telemetryHistory.map((m, idx) => ({
            timestamp: idx,
            heartRate: m.heartRate,
            power: m.power,
            speed: m.speed,
            cadence: m.cadence,
          }))}
          activeMetric="power"
          height={200}
        />
      </div>

      {/* Status Footer */}
      <div className="border-t border-zinc-800 pt-4 text-xs text-zinc-500">
        <p>Real-time telemetry streaming from {riderName}&apos;s devices</p>
        <p>Data updates every 1 second • Compression enabled for stability</p>
      </div>
    </div>
  )
}

interface Trophy {
  h?: number
  w?: number
  className?: string
}

function Trophy({ className = 'h-5 w-5' }: Trophy) {
  return <TrendingUp className={className} />
}
