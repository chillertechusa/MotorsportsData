import { Metric } from 'web-vitals'

/**
 * Performance alert thresholds (in milliseconds or absolute values)
 */
export const ALERT_THRESHOLDS = {
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  TTFB: {
    good: 600,
    needsImprovement: 1200,
  },
}

export type AlertSeverity = 'good' | 'needs-improvement' | 'poor'

export interface PerformanceAlert {
  metric: string
  value: number
  severity: AlertSeverity
  threshold: number
  message: string
  timestamp: Date
}

/**
 * Evaluates a Web Vital metric against thresholds and returns alert.
 */
export function evaluateMetric(metric: Metric): PerformanceAlert {
  const thresholds = ALERT_THRESHOLDS[metric.name as keyof typeof ALERT_THRESHOLDS]

  if (!thresholds) {
    return {
      metric: metric.name,
      value: metric.value,
      severity: 'good',
      threshold: 0,
      message: `Unknown metric: ${metric.name}`,
      timestamp: new Date(),
    }
  }

  let severity: AlertSeverity = 'good'
  let threshold = thresholds.good

  if (metric.value > thresholds.needsImprovement) {
    severity = 'poor'
    threshold = thresholds.needsImprovement
  } else if (metric.value > thresholds.good) {
    severity = 'needs-improvement'
    threshold = thresholds.good
  }

  const message =
    severity === 'good'
      ? `${metric.name} is within acceptable range (${metric.value.toFixed(1)})`
      : `${metric.name} exceeds threshold: ${metric.value.toFixed(1)} > ${threshold}`

  return {
    metric: metric.name,
    value: metric.value,
    severity,
    threshold,
    message,
    timestamp: new Date(),
  }
}

/**
 * Sends alert to monitoring service (Slack, email, webhook, etc.)
 */
export async function sendAlert(alert: PerformanceAlert) {
  if (alert.severity === 'good') return // Don't alert on good metrics

  // Log to console for development
  console.warn(`[Performance Alert] ${alert.message}`)

  // TODO: Integrate with alerting service
  // Examples:
  // - POST to Slack webhook
  // - POST to email service (Resend, SendGrid)
  // - POST to monitoring service (DataDog, New Relic)
  // - POST to PagerDuty for critical issues

  const alertPayload = {
    severity: alert.severity,
    metric: alert.metric,
    value: alert.value,
    threshold: alert.threshold,
    message: alert.message,
    timestamp: alert.timestamp.toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server-side',
  }

  // Stub for future integration
  console.log('[Alert Payload]', alertPayload)
}
