/**
 * API Feature Gate Component
 * 
 * Renders children only if API is available.
 * For test-bench features, renders a "Coming Soon" state instead.
 * For unavailable features, renders nothing.
 */

'use client'

import { ReactNode } from 'react'
import { isApiAvailable, getFeatureStatus } from '@/lib/api-availability'

interface ApiFeatureGateProps {
  apiKey: string
  children: ReactNode
  testBenchFallback?: ReactNode
  unavailableFallback?: ReactNode
  hideIfUnavailable?: boolean
}

export function ApiFeatureGate({
  apiKey,
  children,
  testBenchFallback = null,
  unavailableFallback = null,
  hideIfUnavailable = true,
}: ApiFeatureGateProps) {
  const status = getFeatureStatus(apiKey as any)

  if (status === 'available') {
    return children
  }

  if (status === 'test-bench') {
    return testBenchFallback
  }

  if (status === 'unavailable') {
    return unavailableFallback || (hideIfUnavailable ? null : children)
  }

  return null
}

/**
 * Hook to check API availability in components
 */
export function useApiAvailable(apiKey: string): boolean {
  return isApiAvailable(apiKey as any)
}
