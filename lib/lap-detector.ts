/**
 * Lap Detection Service — GPS-based lap crossing detection
 * Determines when a rider crosses the start/finish line (lap boundary)
 */

interface GPSPoint {
  lat: number
  lng: number
  timestamp: number
  speed: number
}

interface TrackBoundary {
  type: string
  coordinates: Array<Array<[number, number]>>
}

/**
 * Point-in-polygon test using ray casting algorithm
 * Returns true if point [lat, lng] is inside the polygon boundary
 */
export function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: Array<[number, number]>
): boolean {
  let inside = false
  let p1lat = polygon[0][1]
  let p1lng = polygon[0][0]

  for (let i = 1; i <= polygon.length; i++) {
    const p2lat = polygon[i % polygon.length][1]
    const p2lng = polygon[i % polygon.length][0]

    if (lng > Math.min(p1lng, p2lng)) {
      if (lng <= Math.max(p1lng, p2lng)) {
        if (lat <= Math.max(p1lat, p2lat)) {
          if (p1lng !== p2lng) {
            const xinters = ((lng - p1lng) * (p2lat - p1lat)) / (p2lng - p1lng) + p1lat
            if (p1lat === p2lat || lat <= xinters) inside = !inside
          }
        }
      }
    }
    p1lat = p2lat
    p1lng = p2lng
  }

  return inside
}

/**
 * Line-line intersection test to detect if a GPS path crosses the start/finish line
 * Returns true if the line from prev to current crosses the line from p1 to p2
 */
export function lineIntersects(
  prevLat: number,
  prevLng: number,
  currLat: number,
  currLng: number,
  p1Lat: number,
  p1Lng: number,
  p2Lat: number,
  p2Lng: number
): boolean {
  const ccw = (Alat: number, Alng: number, Blat: number, Blng: number, Clat: number, Clng: number) => {
    return (Clng - Alng) * (Blat - Alat) > (Blng - Alat) * (Clat - Alat)
  }

  return (
    ccw(prevLat, prevLng, p1Lat, p1Lng, p2Lat, p2Lng) !==
      ccw(currLat, currLng, p1Lat, p1Lng, p2Lat, p2Lng) &&
    ccw(prevLat, prevLng, currLat, currLng, p1Lat, p1Lng) !==
      ccw(prevLat, prevLng, currLat, currLng, p2Lat, p2Lng)
  )
}

interface RiderLapState {
  isInside: boolean
  lapCount: number
  lastLapTimestamp: number
  lastLapSeconds: number
}

/**
 * Track rider lap state and detect crossings
 * Call this on each new GPS telemetry point
 */
export class LapDetector {
  private riderStates: Map<string, RiderLapState> = new Map()
  private boundary: Array<[number, number]> | null = null
  private startFinishLat: number
  private startFinishLng: number

  constructor(trackBoundary?: TrackBoundary, centerLat = 0, centerLng = 0) {
    if (trackBoundary && trackBoundary.coordinates[0]) {
      this.boundary = trackBoundary.coordinates[0] as Array<[number, number]>
    }
    // Start/finish line approximately at track center + offset
    this.startFinishLat = centerLat + 0.001
    this.startFinishLng = centerLng
  }

  /**
   * Process a new GPS telemetry point for a rider
   * Returns { lapCrossed: boolean, newLapCount: number, lapTimeSeconds: number }
   */
  processTelemetry(
    riderId: string,
    lat: number,
    lng: number,
    prevLat?: number,
    prevLng?: number
  ): { lapCrossed: boolean; lapCount: number; lapTimeSeconds: number } {
    if (!this.riderStates.has(riderId)) {
      this.riderStates.set(riderId, {
        isInside: this.boundary ? isPointInPolygon(lat, lng, this.boundary) : false,
        lapCount: 1,
        lastLapTimestamp: Date.now(),
        lastLapSeconds: 0,
      })
      return { lapCrossed: false, lapCount: 1, lapTimeSeconds: 0 }
    }

    const state = this.riderStates.get(riderId)!
    const wasInside = state.isInside
    const isNowInside = this.boundary ? isPointInPolygon(lat, lng, this.boundary) : false

    // Detect lap boundary crossing (entry into polygon)
    let lapCrossed = false
    let lapTimeSeconds = 0

    if (!wasInside && isNowInside) {
      // Rider just entered the polygon = lap boundary cross
      lapCrossed = true
      const now = Date.now()
      lapTimeSeconds = (now - state.lastLapTimestamp) / 1000
      state.lapCount++
      state.lastLapTimestamp = now
      state.lastLapSeconds = lapTimeSeconds
    }

    state.isInside = isNowInside

    return {
      lapCrossed,
      lapCount: state.lapCount,
      lapTimeSeconds: state.lastLapSeconds,
    }
  }

  /**
   * Get current lap count for a rider
   */
  getLapCount(riderId: string): number {
    return this.riderStates.get(riderId)?.lapCount ?? 0
  }

  /**
   * Reset lap tracking for all riders
   */
  reset() {
    this.riderStates.clear()
  }
}
