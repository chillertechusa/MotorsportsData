'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export type SubscriptionTier = 'grassroots' | 'privateer' | 'race_team' | 'factory_command'

interface TierGateProps {
  userTier: SubscriptionTier
  requiredTier: SubscriptionTier
  moduleName: string
  children: React.ReactNode
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  grassroots: 1,
  privateer: 2,
  race_team: 3,
  factory_command: 4,
}

const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  grassroots: 'Grassroots',
  privateer: 'Privateer',
  race_team: 'Race Team',
  factory_command: 'Factory Command',
}

/**
 * Tier gate wrapper — shows upgrade prompt if user lacks access.
 * Use this around console modules that require higher tier access.
 */
export default function TierGate({
  userTier,
  requiredTier,
  moduleName,
  children,
}: TierGateProps) {
  const hasAccess = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier]

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-500/20 p-4">
              <AlertCircle className="w-8 h-8 text-amber-400" aria-hidden="true" />
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-50 mb-2">
              {moduleName} Module
            </h1>
            <p className="text-sm text-zinc-400">
              Unlocked at <span className="text-amber-400 font-semibold">{TIER_DISPLAY_NAMES[requiredTier]}</span> tier
            </p>
          </div>

          {/* Body */}
          <p className="text-sm text-zinc-400 leading-relaxed">
            You&apos;re currently on the <span className="text-zinc-300 font-medium">{TIER_DISPLAY_NAMES[userTier]}</span> plan.
            Upgrade to {TIER_DISPLAY_NAMES[requiredTier]} to access this module.
          </p>

          {/* CTA */}
          <div className="space-y-3 pt-4">
            <Link
              href="/data/pricing"
              className="block w-full bg-amber-400 text-zinc-950 font-bold py-3 rounded-lg hover:bg-amber-300 transition-colors text-center"
            >
              View Pricing Plans
            </Link>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-zinc-800 text-zinc-100 font-medium py-3 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
