import { NextRequest, NextResponse } from 'next/server'
import { captureApiError } from './error-tracking'

export type ApiHandler = (req: NextRequest) => Promise<NextResponse | Response>

/**
 * Wraps an API route handler with automatic error tracking and logging
 */
export function withErrorTrackedRoute(handler: ApiHandler, routeName: string): ApiHandler {
  return async (req: NextRequest) => {
    const startTime = Date.now()
    const method = req.method
    const pathname = new URL(req.url).pathname

    try {
      const response = await handler(req)
      const duration = Date.now() - startTime

      // Log slow API calls
      if (duration > 500) {
        console.warn(
          `[Sentry] Slow API: ${method} ${pathname} took ${duration}ms`
        )
      }

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      if (error instanceof Error) {
        captureApiError(error, {
          route: pathname,
          method,
          statusCode: 500,
          customData: {
            duration,
            routeName,
          },
        })
      }

      // Return 500 error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          requestId: req.headers.get('x-request-id'),
        },
        { status: 500 }
      )
    }
  }
}
