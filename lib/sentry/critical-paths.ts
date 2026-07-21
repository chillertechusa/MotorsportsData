import * as Sentry from '@sentry/nextjs'
import { capturePerformanceMetric, addBreadcrumb } from './error-tracking'

/**
 * Critical user flows that need monitoring
 */
export const CRITICAL_PATHS = {
  // Auth flows
  SIGNUP: 'auth:signup',
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  MFA_VERIFY: 'auth:mfa_verify',

  // Coach features
  SESSION_UPLOAD: 'coach:session_upload',
  SESSION_ANALYSIS: 'coach:session_analysis',
  SESSION_EXPORT: 'coach:session_export',
  READINESS_CALC: 'coach:readiness_calc',
  COMPLIANCE_CHECK: 'coach:compliance_check',

  // Live coaching
  LIVE_SESSION_START: 'live:session_start',
  LIVE_TELEMETRY_INGEST: 'live:telemetry_ingest',
  LIVE_AI_QUERY: 'live:ai_query',

  // Mechanic flows
  SETUP_LOG_CREATE: 'mechanic:setup_log_create',
  MECHANIC_AI_QUERY: 'mechanic:ai_query',

  // Device integration
  DEVICE_PAIR: 'device:pair',
  TELEMETRY_PARSE: 'telemetry:parse',
  IMPORT_SESSION: 'telemetry:import_session',

  // Payments
  CHECKOUT_INITIATE: 'payments:checkout_initiate',
  CHECKOUT_COMPLETE: 'payments:checkout_complete',
  SUBSCRIPTION_RENEW: 'payments:subscription_renew',
} as const

export type CriticalPath = typeof CRITICAL_PATHS[keyof typeof CRITICAL_PATHS]

/**
 * Start monitoring a critical user flow
 */
export function startCriticalPath(path: CriticalPath, metadata?: Record<string, unknown>) {
  addBreadcrumb(`Started flow: ${path}`, metadata, 'info')
  Sentry.setTag('critical_flow', path)
  return path
}

/**
 * Track completion of a critical path
 */
export function completeCriticalPath(
  path: CriticalPath,
  status: 'success' | 'error',
  metadata?: Record<string, unknown>
) {
  addBreadcrumb(`Completed flow: ${path} (${status})`, metadata, status === 'error' ? 'error' : 'info')
  capturePerformanceMetric(path, 0, { status, ...metadata })
}

/**
 * Track a specific operation within a critical path
 */
export function trackOperation(
  operationName: string,
  durationMs: number,
  success: boolean,
  metadata?: Record<string, unknown>
) {
  const level = durationMs > 1000 ? 'warning' : 'info'
  addBreadcrumb(
    `Operation: ${operationName} (${durationMs}ms)`,
    { success, ...metadata },
    success ? level : 'error'
  )

  if (durationMs > 1000) {
    capturePerformanceMetric(operationName, durationMs, { success, ...metadata })
  }
}

/**
 * Measure a function and track its performance
 */
export async function measureCriticalOperation<T>(
  operationName: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - startTime
    trackOperation(operationName, duration, true, metadata)
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    trackOperation(operationName, duration, false, metadata)
    throw error
  }
}
