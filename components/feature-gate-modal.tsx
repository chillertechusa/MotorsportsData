'use client'

import { useState } from 'react'
import { X, Lock, ArrowRight } from 'lucide-react'
import { useFeatureGate } from '@/lib/hooks/use-feature-gate'
import { TIER_LABELS } from '@/lib/md-tiers'

interface FeatureGateModalProps {
  featureKey: string
  featureName: string
  featureDescription?: string
  onClose: () => void
  onUpgradeClick?: () => void
}

export function FeatureGateModal({
  featureKey,
  featureName,
  featureDescription,
  onClose,
  onUpgradeClick,
}: FeatureGateModalProps) {
  const { status, hasAccess, isLoading } = useFeatureGate(featureKey)
  const [clicked, setClicked] = useState(false)

  if (hasAccess) return null

  const handleUpgrade = async () => {
    setClicked(true)
    onUpgradeClick?.()
    // Log modal click
    try {
      await fetch(`/api/md-features/log-upgrade-click?feature=${featureKey}`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('[FeatureGate] Error logging click:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-lime-400" />
            <h3 className="font-bold text-foreground">{featureName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground">
            {featureDescription ||
              `${featureName} is available on higher tiers.`}
          </p>

          {status?.upsellTier && (
            <div className="bg-lime-950 border border-lime-700 rounded p-4">
              <p className="text-sm text-lime-200">
                Unlock at{' '}
                <span className="font-bold">
                  {TIER_LABELS[status.upsellTier as keyof typeof TIER_LABELS] ||
                    status.upsellTier}
                </span>{' '}
                tier
              </p>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-zinc-800 rounded p-4">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">
              Includes:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Live telemetry streaming</li>
              <li>• Advanced analytics</li>
              <li>• Team management</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-800 text-foreground rounded font-semibold hover:bg-zinc-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={isLoading || clicked}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-lime-600 text-black rounded font-semibold hover:bg-lime-500 disabled:opacity-50 transition"
          >
            {clicked ? 'Processing...' : 'Upgrade Now'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Higher-order component wrapper for protecting components with feature gates
 */
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  featureKey: string,
  featureName: string,
  featureDescription?: string
) {
  return function ProtectedComponent(props: P) {
    const [showModal, setShowModal] = useState(false)
    const { hasAccess, isLoading } = useFeatureGate(featureKey)

    if (isLoading) {
      return <div className="text-muted-foreground">Loading...</div>
    }

    if (!hasAccess) {
      return (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">{featureName}</h3>
            <p className="text-muted-foreground mb-6">
              This feature is not available on your plan.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-lime-600 text-black rounded font-semibold hover:bg-lime-500 transition"
            >
              Upgrade Plan
            </button>
          </div>
          <FeatureGateModal
            featureKey={featureKey}
            featureName={featureName}
            featureDescription={featureDescription}
            onClose={() => setShowModal(false)}
          />
        </>
      )
    }

    return <Component {...props} />
  }
}
