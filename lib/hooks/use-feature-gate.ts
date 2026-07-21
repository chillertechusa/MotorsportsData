'use client'

import { useEffect, useState } from 'react'

export interface FeatureGateStatus {
  granted: boolean
  upsellTier?: string
}

/**
 * Client hook to check feature gate status
 * Logs access attempts for analytics
 */
export function useFeatureGate(featureKey: string) {
  const [status, setStatus] = useState<FeatureGateStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch(`/api/md-features/check?feature=${featureKey}`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
        }
      } catch (error) {
        console.error('[FeatureGate] Error checking access:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [featureKey])

  return { status, isLoading, hasAccess: status?.granted || false }
}
