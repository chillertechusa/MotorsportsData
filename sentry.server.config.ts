import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Lower sample rate on server to keep quota manageable
  tracesSampleRate: 0.1,

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Automatically capture database slow queries (>500ms)
  beforeSend(event) {
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.type === 'DatabaseError' || error?.type === 'QueryTimeoutError') {
        event.level = 'warning'
      }
    }
    return event
  },
})
