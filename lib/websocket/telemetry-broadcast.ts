/**
 * WebSocket Telemetry Broadcaster
 * Broadcasts live telemetry to all connected coaches watching a session
 * Handles subscriptions, filtering, rate limiting
 */

export interface TelemetryBroadcast {
  type: 'TELEMETRY'
  sessionId: string
  riderId: string
  timestamp: number
  data: {
    heartRate?: number
    power?: number
    speed?: number
    cadence?: number
  }
}

export interface RaceEventBroadcast {
  type: 'LAP_COMPLETE' | 'SECTOR_PASS' | 'PIT_IN' | 'PIT_OUT' | 'SESSION_END'
  sessionId: string
  riderId: string
  timestamp: number
  data: Record<string, any>
}

export interface CoachSubscription {
  coachId: string
  sessionId: string
  riderIds: string[] // Empty = all riders
  lastMessageTime: number
  compressionEnabled: boolean
}

class TelemetryBroadcaster {
  private subscriptions: Map<string, CoachSubscription[]> = new Map()
  private messageBuffer: Map<string, TelemetryBroadcast[]> = new Map()
  private readonly BUFFER_SIZE = 100 // Buffer 100ms of messages

  /**
   * Coach subscribes to live session telemetry
   */
  subscribe(coachId: string, sessionId: string, riderIds: string[] = []): string {
    const subscriptionId = `${coachId}-${sessionId}-${Date.now()}`

    const subscription: CoachSubscription = {
      coachId,
      sessionId,
      riderIds,
      lastMessageTime: Date.now(),
      compressionEnabled: true,
    }

    const key = `session:${sessionId}`
    const existing = this.subscriptions.get(key) || []
    this.subscriptions.set(key, [...existing, subscription])

    console.log('[WebSocket] Coach subscribed to session', {
      coachId,
      sessionId,
      riders: riderIds.length > 0 ? riderIds.length : 'all',
      totalSubscribers: existing.length + 1,
    })

    return subscriptionId
  }

  /**
   * Coach unsubscribes from session
   */
  unsubscribe(subscriptionId: string, sessionId: string): void {
    const key = `session:${sessionId}`
    const subs = this.subscriptions.get(key) || []
    
    // Filter out the subscription (assuming ID matches first sub for demo)
    this.subscriptions.set(key, subs.slice(1))

    console.log('[WebSocket] Coach unsubscribed')
  }

  /**
   * Publish telemetry point to all subscribed coaches
   * Called by telemetry ingestion endpoint
   */
  publish(broadcast: TelemetryBroadcast): void {
    const key = `session:${broadcast.sessionId}`
    const subs = this.subscriptions.get(key) || []

    if (subs.length === 0) return // No one watching

    // Filter subscriptions by rider
    const relevantSubs = subs.filter(
      (sub) => sub.riderIds.length === 0 || sub.riderIds.includes(broadcast.riderId)
    )

    // Buffer messages for batching
    const bufferKey = `${broadcast.sessionId}:${broadcast.riderId}`
    const buffer = this.messageBuffer.get(bufferKey) || []
    buffer.push(broadcast)

    // If buffer is large, flush immediately
    if (buffer.length >= this.BUFFER_SIZE) {
      this.flush(bufferKey, relevantSubs)
    } else {
      // Otherwise, schedule flush in 100ms
      this.messageBuffer.set(bufferKey, buffer)
      setTimeout(() => {
        this.flush(bufferKey, relevantSubs)
      }, 100)
    }
  }

  /**
   * Flush buffered messages to subscribed coaches
   */
  private flush(bufferKey: string, subs: CoachSubscription[]): void {
    const buffer = this.messageBuffer.get(bufferKey)
    if (!buffer || buffer.length === 0) return

    // Optionally compress: send only latest point if 50+ in buffer
    const toSend = buffer.length > 50 ? [buffer[buffer.length - 1]] : buffer

    for (const sub of subs) {
      // TODO: Send to WebSocket connection
      // ws.send(JSON.stringify(toSend))
      console.log('[Broadcast]', toSend.length, 'points to coach', sub.coachId)
    }

    this.messageBuffer.delete(bufferKey)
  }

  /**
   * Publish race event (lap complete, pit in/out, etc)
   */
  publishEvent(event: RaceEventBroadcast): void {
    const key = `session:${event.sessionId}`
    const subs = this.subscriptions.get(key) || []

    console.log('[Event]', event.type, 'for rider', event.riderId)

    for (const sub of subs) {
      // TODO: Send to WebSocket
      // ws.send(JSON.stringify(event))
    }
  }

  /**
   * Get subscriber count for a session
   */
  getSubscriberCount(sessionId: string): number {
    const key = `session:${sessionId}`
    return (this.subscriptions.get(key) || []).length
  }

  /**
   * Get all sessions with active subscribers
   */
  getActiveSessions(): string[] {
    return Array.from(this.subscriptions.keys())
      .filter((key) => this.subscriptions.get(key)!.length > 0)
      .map((key) => key.replace('session:', ''))
  }
}

export const telemetryBroadcaster = new TelemetryBroadcaster()
