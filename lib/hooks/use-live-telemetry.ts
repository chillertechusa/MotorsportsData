'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export interface TelemetryPoint {
  timestamp: number
  lapNumber: number
  speed: number
  throttle: number
  brakePressure?: number
  engineTempC?: number
  engineRpmK?: number
  gLateral?: number
  gLongitudinal?: number
}

interface LiveTelemetryState {
  isConnected: boolean
  currentLap: number
  speed: number
  throttle: number
  brake: number
  engineTemp: number
  bestLap?: number
  recentPoints: TelemetryPoint[]
  alerts: Array<{ type: string; message: string; severity: string }>
}

export function useLiveTelemetry(liveSessionId: string) {
  const [state, setState] = useState<LiveTelemetryState>({
    isConnected: false,
    currentLap: 0,
    speed: 0,
    throttle: 0,
    brake: 0,
    engineTemp: 0,
    recentPoints: [],
    alerts: [],
  })

  const wsRef = useRef<WebSocket | null>(null)
  const pointBufferRef = useRef<TelemetryPoint[]>([])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/md-telemetry/live?sessionId=${liveSessionId}`
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('[LiveTelemetry] Connected')
        setState(prev => ({ ...prev, isConnected: true }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'telemetry') {
            const point: TelemetryPoint = data.point
            pointBufferRef.current.push(point)

            // Keep last 1000 points for waveform rendering
            if (pointBufferRef.current.length > 1000) {
              pointBufferRef.current.shift()
            }

            setState(prev => ({
              ...prev,
              currentLap: point.lapNumber,
              speed: point.speed,
              throttle: point.throttle,
              brake: point.brakePressure || 0,
              engineTemp: point.engineTempC || 0,
              recentPoints: pointBufferRef.current.slice(-100),
            }))
          }

          if (data.type === 'alert') {
            setState(prev => ({
              ...prev,
              alerts: [...prev.alerts, data.alert].slice(-10), // Keep last 10 alerts
            }))
          }

          if (data.type === 'lap_complete') {
            setState(prev => ({
              ...prev,
              bestLap: Math.min(prev.bestLap || Infinity, data.lapTime),
            }))
          }
        } catch (err) {
          console.error('[LiveTelemetry] Parse error:', err)
        }
      }

      ws.onerror = (err) => {
        console.error('[LiveTelemetry] Error:', err)
        setState(prev => ({ ...prev, isConnected: false }))
      }

      ws.onclose = () => {
        console.log('[LiveTelemetry] Disconnected')
        setState(prev => ({ ...prev, isConnected: false }))
        // Reconnect after 3 seconds
        setTimeout(connect, 3000)
      }

      wsRef.current = ws
    } catch (err) {
      console.error('[LiveTelemetry] Connection error:', err)
    }
  }, [liveSessionId])

  useEffect(() => {
    connect()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return state
}
