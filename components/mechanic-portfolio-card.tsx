'use client'

import { Award, Zap, Target, Users } from 'lucide-react'

interface MechanicPortfolioCardProps {
  displayName: string
  bio?: string
  totalRidersServed: number
  totalLapTimeSavings: number
  averageEfficiencyScore: number
  totalWorkOrders: number
  verificationStatus: 'unverified' | 'verified' | 'elite'
}

export function MechanicPortfolioCard({
  displayName,
  bio,
  totalRidersServed,
  totalLapTimeSavings,
  averageEfficiencyScore,
  totalWorkOrders,
  verificationStatus,
}: MechanicPortfolioCardProps) {
  const verificationBadgeColor = {
    unverified: 'bg-zinc-700 text-zinc-200',
    verified: 'bg-blue-700 text-blue-100',
    elite: 'bg-lime-700 text-lime-100',
  }

  const verificationBadgeText = {
    unverified: 'Unverified',
    verified: 'Verified',
    elite: 'Elite',
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{displayName}</h2>
          {bio && <p className="text-sm text-muted-foreground">{bio}</p>}
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${verificationBadgeColor[verificationStatus]}`}
        >
          {verificationBadgeText[verificationStatus]}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-lime-400" />
            <span className="text-xs text-muted-foreground">Riders Served</span>
          </div>
          <div className="text-2xl font-bold text-lime-400">{totalRidersServed}</div>
        </div>

        <div className="bg-zinc-800 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-muted-foreground">Lap Savings</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {Math.abs(totalLapTimeSavings).toFixed(2)}s
          </div>
        </div>

        <div className="bg-zinc-800 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Accuracy</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {Math.round(averageEfficiencyScore)}%
          </div>
        </div>

        <div className="bg-zinc-800 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-muted-foreground">Work Orders</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">{totalWorkOrders}</div>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-sm text-muted-foreground">
          {totalRidersServed > 0
            ? `Trusted by ${totalRidersServed} rider${totalRidersServed !== 1 ? 's' : ''} with a combined ${Math.abs(totalLapTimeSavings).toFixed(2)}s of improvement.`
            : 'Starting your optimization journey. Create your first work order to begin tracking improvements.'}
        </p>
      </div>
    </div>
  )
}
