'use client'

import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric } from 'web-vitals'

const VITALS_ENDPOINT = '/api/vitals/report'

/**
 * Sends Web Vitals metrics to the analytics backend.
 * Called automatically when vitals are available.
 */
function sendVitals(metric: Metric) {
  const body = {
    ...metric,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  }

  // Use `navigator.sendBeacon()` if available, otherwise fall back to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon(VITALS_ENDPOINT, JSON.stringify(body))
  } else {
    fetch(VITALS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(body),
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((err) => console.error('[v0] Failed to send vitals:', err))
  }
}

/**
 * Initialize Web Vitals tracking.
 * Call this in the root layout to start tracking.
 */
export function initVitalsTracking() {
  // Track all Web Vitals metrics
  getCLS(sendVitals)
  getFCP(sendVitals)
  getFID(sendVitals)
  getLCP(sendVitals)
  getTTFB(sendVitals)
}
