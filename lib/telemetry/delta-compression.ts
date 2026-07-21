/**
 * Delta compression for telemetry data
 * Sends only changes in values to reduce bandwidth
 */

export interface TelemetryDelta {
  speed?: number
  throttle?: number
  brake?: number
  engineTemp?: number
  lapNumber?: number
  currentLapTime?: number
}

export interface CompressedSnapshot {
  t: number // timestamp
  d: TelemetryDelta // delta changes
}

class DeltaCompressor {
  private lastValue: Record<string, any> = {}

  /**
   * Compress a full telemetry snapshot to only changed values
   */
  compress(current: Record<string, any>): TelemetryDelta {
    const delta: TelemetryDelta = {}

    const keys: (keyof typeof current)[] = [
      'speed',
      'throttle',
      'brake',
      'engineTemp',
      'lapNumber',
      'currentLapTime',
    ]

    for (const key of keys) {
      const currentVal = current[key]
      const lastVal = this.lastValue[key]

      // Send if changed or first time
      if (currentVal !== lastVal) {
        delta[key as keyof TelemetryDelta] = currentVal
        this.lastValue[key] = currentVal
      }
    }

    return delta
  }

  /**
   * Decompress a delta back to full values
   */
  decompress(delta: TelemetryDelta): Record<string, any> {
    const result = { ...this.lastValue }

    Object.assign(result, delta)
    Object.assign(this.lastValue, delta)

    return result
  }

  /**
   * Reset compressor state
   */
  reset() {
    this.lastValue = {}
  }
}

export const deltaCompressor = new DeltaCompressor()

/**
 * Calculate bandwidth savings
 */
export function estimateBandwidthSavings(
  fullSize: number,
  compressedSize: number
): number {
  return ((fullSize - compressedSize) / fullSize) * 100
}

/**
 * Batch telemetry updates for efficient transmission
 */
export class TelemetryBatcher {
  private batch: CompressedSnapshot[] = []
  private batchSize: number
  private flushCallback: (batch: CompressedSnapshot[]) => void

  constructor(
    batchSize: number = 50,
    flushCallback: (batch: CompressedSnapshot[]) => void = () => {}
  ) {
    this.batchSize = batchSize
    this.flushCallback = flushCallback
  }

  add(snapshot: CompressedSnapshot) {
    this.batch.push(snapshot)
    if (this.batch.length >= this.batchSize) {
      this.flush()
    }
  }

  flush() {
    if (this.batch.length > 0) {
      this.flushCallback(this.batch)
      this.batch = []
    }
  }

  getSize() {
    return this.batch.length
  }
}
