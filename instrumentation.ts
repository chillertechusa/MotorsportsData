export async function register() {
  // Only load Sentry when a DSN is configured, and never let its init block or
  // crash a serverless cold start. register() is awaited by Next.js before ANY
  // request is served, so a hang here hangs every route (even static JSON ones).
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config')
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config')
    }
  } catch (err) {
    console.log('[v0] Sentry instrumentation skipped:', (err as Error)?.message)
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs'
