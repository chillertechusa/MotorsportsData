// Motorsport Data Service Worker
// Enables offline access to setup sheets and vehicle data in the pits

// PWA cache strategy with version-based invalidation
// Version bumps on deploy trigger automatic cache refresh
const CACHE_VERSION = process.env.NEXT_PUBLIC_BUILD_ID || 'v1'
const CACHE_NAME = `motorsport-data-${CACHE_VERSION}`
const RUNTIME_CACHE = `motorsport-data-runtime-${CACHE_VERSION}`
const urlsToCache = [
  '/',
  '/data/fleet',
  '/data/fleet/session-compare',
  '/data/fleet/progression',
  '/data/fleet/setup-ai',
  '/data/fleet/coaching',
  '/data/fleet/analytics',
  '/data/owner',
  '/data/owner/analytics',
  '/data/owner/cohorts',
  '/data/owner/recovery',
  '/manifest.json',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell')
      return cache.addAll(urlsToCache)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Removing old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - network first, fall back to cache for offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests and API calls to other domains
  if (url.origin !== self.location.origin) {
    return
  }

  // Network first for API routes, but cache response for offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const cache = caches.open(RUNTIME_CACHE).then((c) => {
              c.put(request, response.clone())
              return response
            })
            return cache
          }
          return response
        })
        .catch(() => {
          // Fall back to cached API response if offline
          return caches.match(request).then((response) => {
            return (
              response ||
              new Response('Offline - API data not available', {
                status: 503,
                statusText: 'Service Unavailable',
              })
            )
          })
        })
    )
    return
  }

  // Stale-while-revalidate for pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
        }
        return response
      })

      // Return cached response immediately, update in background
      return cachedResponse || fetchPromise
    })
  )
})

// Message event - allow manual cache clear
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE).then(() => {
      console.log('[SW] Runtime cache cleared')
    })
  }
})
