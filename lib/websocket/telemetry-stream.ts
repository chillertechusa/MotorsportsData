/**
 * WebSocket integration for live telemetry streaming.
 * Real-time HR, power, speed data to dashboard during sessions.
 */

interface TelemetryStreamMessage {
  type: 'METRIC' | 'LAP' | 'READINESS' | 'ERROR'
  sessionId: string
  riderId: string
  timestamp: number
  data: Record<string, any>
}

interface TelemetrySubscriber {
  sessionId: string
  riderId: string
  callback: (message: TelemetryStreamMessage) => void
}

class TelemetryStreamManager {
  private subscribers: Map<string, TelemetrySubscriber[]> = new Map()
  private connections: Map<string, WebSocket> = new Map()

  subscribe(
    sessionId: string,
    riderId: string,
    callback: (message: TelemetryStreamMessage) => void
  ): () => void {
    const key = `${sessionId}:${riderId}`

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
    }

    const sub: TelemetrySubscriber = { sessionId, riderId, callback }
    this.subscribers.get(key)!.push(sub)

    // Unsubscribe function
    return () => {
      const subs = this.subscribers.get(key)
      if (subs) {
        const idx = subs.indexOf(sub)
        if (idx >= 0) subs.splice(idx, 1)
      }
    }
  }

  broadcast(message: TelemetryStreamMessage) {
    const key = `${message.sessionId}:${message.riderId}`
    const subs = this.subscribers.get(key)

    if (subs) {
      subs.forEach((sub) => {
        try {
          sub.callback(message)
        } catch (err) {
          console.error('[WebSocket] Callback error:', err)
        }
      })
    }
  }

  emitMetric(
    sessionId: string,
    riderId: string,
    metric: {
      heartRate?: number
      power?: number
      speed?: number
      cadence?: number
    }
  ) {
    this.broadcast({
      type: 'METRIC',
      sessionId,
      riderId,
      timestamp: Date.now(),
      data: metric,
    })
  }

  emitLap(
    sessionId: string,
    riderId: string,
    lapData: {
      lapNumber: number
      lapTimeMs: number
      heartRateAvg: number
      powerAvg: number
    }
  ) {
    this.broadcast({
      type: 'LAP',
      sessionId,
      riderId,
      timestamp: Date.now(),
      data: lapData,
    })
  }

  emitReadiness(
    riderId: string,
    readiness: {
      score: number
      peakProbability: number
    }
  ) {
    this.broadcast({
      type: 'READINESS',
      sessionId: '',
      riderId,
      timestamp: Date.now(),
      data: readiness,
    })
  }

  getSubscriberCount(sessionId: string, riderId: string): number {
    const key = `${sessionId}:${riderId}`
    return this.subscribers.get(key)?.length || 0
  }
}

export const telemetryStreamManager = new TelemetryStreamManager()
