'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Scoped error boundary for /data routes.
 * Renders inline (within the existing layout shell) rather than resetting
 * the full page like global-error.tsx does.
 *
 * IMPORTANT: Next.js redirect() throws a special error with digest "NEXT_REDIRECT".
 * We must re-throw it so the router can handle the redirect instead of swallowing it
 * into this error UI.
 */
export default function DataError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Re-throw Next.js redirect and not-found errors — they must propagate to the router.
  if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.digest?.startsWith('NEXT_NOT_FOUND')) {
    throw error
  }

  useEffect(() => {
    // Log error for observability (Sentry or console)
    console.error('[v0] DataError boundary caught:', error.message, error.digest)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-red-950 border border-red-800 rounded-full p-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <p className="text-xs font-bold tracking-widest uppercase text-lime-400 mb-3">
          Motorsports Data
        </p>

        <h2 className="text-xl font-bold text-foreground mb-2">
          Something went wrong
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          An unexpected error occurred in this section. The issue has been
          reported automatically.
          {error.digest && (
            <span className="block mt-1 font-mono text-xs text-zinc-500">
              Ref: {error.digest}
            </span>
          )}
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-lime-600 hover:bg-lime-500 text-black font-semibold text-sm rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  )
}
