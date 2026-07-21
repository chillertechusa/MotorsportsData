'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

export interface RiderSnapshot {
  vehicleId: string
  riderName: string
  position: number
  lapNumber: number
  currentLapTime?: number
  bestLapTime?: number
  gapToLeader?: number
  speed?: number
  throttle?: number
  brake?: number
  engineTemp?: number
  lastUpdate: number
}

interface TeamTelemetryData {
  ok: boolean
  sessionId: string
  sessionStatus: string
  trackName?: string
  riders: RiderSnapshot[]
  timestamp: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

/**
 * Hook for real-time team telemetry comparison
 * Polls the team comparison endpoint every 500ms
 */
export function useTeamTelemetry(sessionId: string | null, enabled = true) {
  const { data, error, isLoading } = useSWR<TeamTelemetryData>(
    enabled && sessionId ? `/api/md-telemetry/team-comparison?sessionId=${sessionId}` : null,
    fetcher,
    {
      refreshInterval: 500, // Poll every 500ms for live updates
      revalidateOnFocus: false,
      dedupingInterval: 200,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  const riders = data?.riders || []
  const sessionStatus = data?.sessionStatus || 'idle'
  const isLive = enabled && sessionStatus === 'active'

  return {
    riders,
    sessionStatus,
    isLive,
    isLoading,
    error,
    timestamp: data?.timestamp || Date.now(),
  }
}

/**
 * Hook for per-rider detailed telemetry streaming
 */
export function useRiderDetails(vehicleId: string | null, sessionId: string | null) {
  const [details, setDetails] = useState<RiderSnapshot | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!vehicleId || !sessionId) return

    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        ws = new WebSocket(
          `${protocol}//${window.location.host}/api/md-telemetry/rider-stream?vehicleId=${vehicleId}&sessionId=${sessionId}`
        )

        ws.onopen = () => {
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setDetails(data)
          } catch (e) {
            console.error('[RiderDetails] Parse error:', e)
          }
        }

        ws.onerror = (error) => {
          console.error('[RiderDetails] WebSocket error:', error)
          setIsConnected(false)
        }

        ws.onclose = () => {
          setIsConnected(false)
          // Attempt reconnect after 2s
          reconnectTimeout = setTimeout(connect, 2000)
        }
      } catch (e) {
        console.error('[RiderDetails] Connection error:', e)
        setIsConnected(false)
        reconnectTimeout = setTimeout(connect, 2000)
      }
    }

    connect()

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (ws) ws.close()
    }
  }, [vehicleId, sessionId])

  return { details, isConnected }
}
