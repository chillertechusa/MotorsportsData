'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[App] Service Worker registered:', reg)
          setSwRegistration(reg)

          // Check for updates periodically
          setInterval(() => {
            reg.update()
          }, 60000) // Check every minute
        })
        .catch((error) => {
          console.error('[App] Service Worker registration failed:', error)
        })
    }

    // Track online/offline status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const clearCache = async () => {
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage({ type: 'CLEAR_CACHE' })
    }
  }

  return {
    isOnline,
    swRegistration,
    clearCache,
  }
}
