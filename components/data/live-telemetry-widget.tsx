'use client'

import { useEffect, useState } from 'react'
import { Activity, Heart, Zap, Gauge } from 'lucide-react'
import { telemetryStreamManager } from '@/lib/websocket/telemetry-stream'

interface LiveMetrics {
  heartRate?: number
  power?: number
  speed?: number
  cadence?: number
  timestamp: number
}

interface LiveTelemetryWidgetProps {
  sessionId: string
  riderId: string
  riderName: string
}

export function LiveTelemetryWidget({ sessionId, riderId, riderName }: LiveTelemetryWidgetProps) {
  const [isLive, setIsLive] = useState(false)
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null)
  const [subscriberCount, setSubscriberCount] = useState(0)

  useEffect(() => {
    setIsLive(true)

    // Subscribe to telemetry stream
    const unsubscribe = telemetryStreamManager.subscribe(sessionId, riderId, (message) => {
      if (message.type === 'METRIC') {
        setMetrics({
          ...message.data,
          timestamp: message.timestamp,
        })
      }
    })

    // Update subscriber count
    const updateCount = () => {
      setSubscriberCount(telemetryStreamManager.getSubscriberCount(sessionId, riderId))
    }
    updateCount()

    return () => {
      unsubscribe()
      setIsLive(false)
    }
  }, [sessionId, riderId])

  return (
    <div className="border border-lime-500/40 bg-lime-500/5 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-lime-500 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-lime-400">LIVE: {riderName}</p>
            <p className="text-xs text-zinc-400">{subscriberCount} viewer(s)</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isLive ? 'bg-lime-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
          {isLive ? 'STREAMING' : 'OFFLINE'}
        </div>
      </div>

      {metrics ? (
        <div className="grid grid-cols-4 gap-3">
          {metrics.heartRate && (
            <div className="bg-zinc-900 p-3 rounded">
              <Heart className="h-4 w-4 text-red-500 mb-1" />
              <p className="text-2xl font-black text-red-500">{metrics.heartRate}</p>
              <p className="text-xs text-zinc-500">bpm</p>
            </div>
          )}
          {metrics.power && (
            <div className="bg-zinc-900 p-3 rounded">
              <Zap className="h-4 w-4 text-yellow-500 mb-1" />
              <p className="text-2xl font-black text-yellow-500">{metrics.power}</p>
              <p className="text-xs text-zinc-500">watts</p>
            </div>
          )}
          {metrics.speed && (
            <div className="bg-zinc-900 p-3 rounded">
              <Gauge className="h-4 w-4 text-blue-500 mb-1" />
              <p className="text-2xl font-black text-blue-500">{metrics.speed}</p>
              <p className="text-xs text-zinc-500">mph</p>
            </div>
          )}
          {metrics.cadence && (
            <div className="bg-zinc-900 p-3 rounded">
              <Activity className="h-4 w-4 text-amber-500 mb-1" />
              <p className="text-2xl font-black text-amber-500">{metrics.cadence}</p>
              <p className="text-xs text-zinc-500">rpm</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-zinc-900 p-6 rounded text-center">
          <p className="text-sm text-zinc-400">Waiting for live data...</p>
          <p className="text-xs text-zinc-500 mt-1">Start a training session to stream metrics</p>
        </div>
      )}

      <p className="text-xs text-zinc-500 mt-4">Updates in real-time as session data arrives</p>
    </div>
  )
}
