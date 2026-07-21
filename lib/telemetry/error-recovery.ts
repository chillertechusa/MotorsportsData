/**
 * Error recovery and resilience for live telemetry
 */

export type ErrorSeverity = 'critical' | 'warning' | 'info'

export interface TelemetryError {
  code: string
  message: string
  severity: ErrorSeverity
  timestamp: number
  recoverable: boolean
}

export class TelemetryErrorHandler {
  private errors: TelemetryError[] = []
  private listeners: Set<(error: TelemetryError) => void> = new Set()

  report(
    code: string,
    message: string,
    severity: ErrorSeverity = 'warning',
    recoverable = true
  ) {
    const error: TelemetryError = {
      code,
      message,
      severity,
      recoverable,
      timestamp: Date.now(),
    }

    this.errors.push(error)
    this.listeners.forEach(listener => listener(error))

    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors.shift()
    }

    console.error(`[Telemetry ${severity.toUpperCase()}] ${code}: ${message}`)
  }

  onError(callback: (error: TelemetryError) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  getRecentErrors(limit: number = 10): TelemetryError[] {
    return this.errors.slice(-limit)
  }

  getCriticalErrors(): TelemetryError[] {
    return this.errors.filter(e => e.severity === 'critical')
  }

  clear() {
    this.errors = []
  }
}

export const telemetryErrorHandler = new TelemetryErrorHandler()

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      const delayMs = initialDelayMs * Math.pow(2, attempt)
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  throw lastError!
}

/**
 * Circuit breaker for API calls
 */
export class CircuitBreaker {
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  private readonly threshold = 5 // failures before opening
  private readonly timeout = 30000 // ms to wait before trying again

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failureCount = 0
    this.successCount++
    if (this.state === 'half-open') {
      this.state = 'closed'
      this.successCount = 0
    }
  }

  private onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    if (this.failureCount >= this.threshold) {
      this.state = 'open'
    }
  }

  getState() {
    return this.state
  }
}
