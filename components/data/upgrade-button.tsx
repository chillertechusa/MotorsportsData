'use client'

import { Lock, Zap } from 'lucide-react'

interface UpgradeButtonProps {
  featureName: string
  currentTier: string
  requiredTier: string
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function UpgradeButton({
  featureName,
  currentTier,
  requiredTier,
  onClick,
  disabled = false,
  size = 'md',
}: UpgradeButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-lg font-semibold transition-all
        ${disabled ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed' : 'bg-lime-400/20 text-lime-400 hover:bg-lime-400/30 active:scale-95'}
        border border-lime-400/30
        ${sizeClasses[size]}
      `}
      title={`Upgrade to ${requiredTier} to access ${featureName}`}
    >
      <Lock className="h-4 w-4" />
      <span>Upgrade to {requiredTier}</span>
    </button>
  )
}

/**
 * Locked feature placeholder card
 * Shows when a user doesn't have access to a feature
 */
export function LockedFeatureCard({
  featureName,
  description,
  requiredTier,
  onUpgradeClick,
}: {
  featureName: string
  description?: string
  requiredTier: string
  onUpgradeClick?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-zinc-300/20 bg-zinc-50/50 p-12 dark:bg-zinc-900/20">
      <Lock className="h-12 w-12 text-zinc-400" />
      <div className="text-center">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{featureName}</h3>
        {description && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          Available on {requiredTier} tier and above
        </p>
      </div>
      <UpgradeButton
        featureName={featureName}
        currentTier="rookie"
        requiredTier={requiredTier}
        onClick={onUpgradeClick}
      />
    </div>
  )
}
