'use client'

import { useEffect } from 'react'
import { initVitalsTracking } from '@/lib/vitals-tracker'

/**
 * Initializes Web Vitals tracking on client.
 * This component must be rendered in the root layout body.
 */
export function VitalsInit() {
  useEffect(() => {
    initVitalsTracking()
  }, [])

  return null
}
