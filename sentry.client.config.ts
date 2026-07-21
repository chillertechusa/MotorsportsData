import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of sessions as replays in production; 100% on errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Only initialize when DSN is set — safe no-op in local dev without it
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media to protect rider PII
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
