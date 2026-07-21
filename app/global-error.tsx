'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * Global error boundary — catches unhandled errors that escape the root layout.
 * Automatically reports them to Sentry.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#09090b', display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#a3e635', fontWeight: 700, marginBottom: '12px' }}>
            Motorsport Data
          </p>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fafafa', marginBottom: '12px' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '14px', color: '#71717a', lineHeight: 1.6, marginBottom: '24px' }}>
            An unexpected error occurred. The issue has been reported automatically.
          </p>
          <button
            onClick={reset}
            style={{ background: '#a3e635', color: '#09090b', fontWeight: 700, fontSize: '14px', padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
