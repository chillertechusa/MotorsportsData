import * as Sentry from '@sentry/nextjs'

/**
 * Capture an API error with context about the request
 */
export function captureApiError(
  error: Error,
  context: {
    route: string
    method: string
    statusCode?: number
    userId?: string
    teamId?: string
    customData?: Record<string, unknown>
  }
) {
  Sentry.captureException(error, {
    tags: {
      type: 'api_error',
      route: context.route,
      method: context.method,
      statusCode: context.statusCode ? String(context.statusCode) : undefined,
    },
    contexts: {
      api: {
        route: context.route,
        method: context.method,
        statusCode: context.statusCode,
      },
      user: context.userId
        ? {
            user_id: context.userId,
            team_id: context.teamId,
          }
        : undefined,
    },
    extra: context.customData,
  })
}

/**
 * Capture a server action error
 */
export function captureServerActionError(
  error: Error,
  actionName: string,
  context?: Record<string, unknown>
) {
  Sentry.captureException(error, {
    tags: {
      type: 'server_action',
      action: actionName,
    },
    extra: context,
  })
}

/**
 * Capture a database error with query context
 */
export function captureDatabaseError(
  error: Error,
  context: {
    operation: string
    table?: string
    userId?: string
    customData?: Record<string, unknown>
  }
) {
  Sentry.captureException(error, {
    tags: {
      type: 'database_error',
      operation: context.operation,
      table: context.table,
    },
    contexts: {
      database: {
        operation: context.operation,
        table: context.table,
      },
    },
    extra: context.customData,
  })
}

/**
 * Capture a performance metric (e.g., API response time)
 */
export function capturePerformanceMetric(
  metricName: string,
  durationMs: number,
  context?: Record<string, unknown>
) {
  Sentry.captureMessage(
    `Performance: ${metricName} took ${durationMs}ms`,
    durationMs > 1000 ? 'warning' : 'info'
  )

  Sentry.addBreadcrumb({
    message: `${metricName}: ${durationMs}ms`,
    level: durationMs > 1000 ? 'warning' : 'info',
    category: 'performance',
    data: {
      durationMs,
      ...context,
    },
  })
}

/**
 * Wrap an async function with error tracking
 */
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context: {
    name: string
    route?: string
    userId?: string
    teamId?: string
  }
): Promise<T> {
  const startTime = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - startTime
    if (duration > 500) {
      capturePerformanceMetric(context.name, duration, {
        userId: context.userId,
        teamId: context.teamId,
      })
    }
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    if (error instanceof Error) {
      if (context.route) {
        captureApiError(error, {
          route: context.route,
          method: 'POST',
          userId: context.userId,
          teamId: context.teamId,
        })
      } else {
        captureServerActionError(error, context.name, { duration })
      }
    }
    throw error
  }
}

/**
 * Breadcrumb for tracking user actions (e.g., button clicks, navigation)
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.addBreadcrumb({
    message,
    level,
    data,
    category: 'user-action',
  })
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, teamId?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: teamId ? `team:${teamId}` : undefined,
  })
}

/**
 * Clear user context on logout
 */
export function clearUserContext() {
  Sentry.setUser(null)
}
