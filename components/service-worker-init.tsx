'use client'

import { useEffect } from 'react'

export function ServiceWorkerInit() {
  useEffect(() => {
    // ServiceWorkers cannot be registered inside iframes (e.g. v0 preview).
    // Skip registration when the page is embedded or on a non-production origin
    // to avoid InvalidStateError spam.
    if (!('serviceWorker' in navigator)) return
    if (window.self !== window.top) return // running inside an iframe — bail out

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Check for updates every 5 minutes
        setInterval(() => reg.update(), 5 * 60 * 1000)
      })
      .catch(() => {
        // Silently ignore — SW is a progressive enhancement, not required
      })
  }, [])

  return null
}
