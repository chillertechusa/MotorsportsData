'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertCircle, CheckCircle, TrendingUp, Heart, Zap } from 'lucide-react'

interface ContextData {
  readiness?: {
    score: number
    confidence: number
    status: 'peak' | 'optimal' | 'ready' | 'fatigued'
    peakProbability: number
    recommendation: string
  }
  compliance?: {
    rate: number
    acknowledged: number
    total: number
    status: 'excellent' | 'good' | 'needs-attention'
  }
  alerts?: Array<{
    type: string
    message: string
    severity: 'warning' | 'critical' | 'info'
    firedAt: string
  }>
  recentPerformance?: {
    lastSession?: {
      date: string
      bestLap: number
      avgPower: number
    }
    delta?: {
      lapTimeDelta: number
      hoursDelta: number
    }
  }
}

interface CoachAIContextBriefProps {
  riderId?: string
  onDataLoaded?: (data: ContextData) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'peak':
      return 'bg-emerald-500/10 border-emerald-500/30'
    case 'optimal':
      return 'bg-cyan-500/10 border-cyan-500/30'
    case 'ready':
      return 'bg-amber-500/10 border-amber-500/30'
    case 'fatigued':
      return 'bg-red-500/10 border-red-500/30'
    default:
      return 'bg-zinc-800/50 border-zinc-700'
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'peak':
      return 'bg-emerald-500 text-black'
    case 'optimal':
      return 'bg-cyan-500 text-black'
    case 'ready':
      return 'bg-amber-500 text-black'
    case 'fatigued':
      return 'bg-red-500 text-white'
    case 'excellent':
      return 'bg-emerald-500/20 text-emerald-300'
    case 'good':
      return 'bg-cyan-500/20 text-cyan-300'
    case 'needs-attention':
      return 'bg-orange-500/20 text-orange-300'
    default:
      return 'bg-zinc-700 text-zinc-300'
  }
}

export function CoachAIContextBrief({ riderId, onDataLoaded }: CoachAIContextBriefProps) {
  const [context, setContext] = useState<ContextData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch('/api/md-coach/context-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ riderId: riderId || 'current' }),
        })

        if (!res.ok) throw new Error('Failed to fetch context')

        const data = await res.json()
        if (data.context) {
          setContext(data.context)
          onDataLoaded?.(data.context)
        }
      } catch (err) {
        console.error('[context-brief] fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContext()
  }, [riderId, onDataLoaded])

  if (loading) {
    return (
      <div className="border border-zinc-800 bg-zinc-900/50 rounded-lg p-4 animate-pulse">
        <p className="text-xs text-zinc-500">Loading rider context...</p>
      </div>
    )
  }

  if (!context) return null

  return (
    <div className="space-y-3 mb-6 border border-zinc-800 bg-zinc-900/30 rounded-lg p-4">
      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Before I answer...</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Readiness */}
        {context.readiness && (
          <div className={`border rounded-lg p-3 ${getStatusColor(context.readiness.status)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">Readiness</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusBadgeColor(context.readiness.status)}`}>
                {context.readiness.status.toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-zinc-50">{context.readiness.score}</p>
              <p className="text-xs text-zinc-400">Peak probability: {context.readiness.peakProbability}%</p>
            </div>
          </div>
        )}

        {/* Compliance */}
        {context.compliance && (
          <div className={`border rounded-lg p-3 ${getStatusColor(context.compliance.status)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">Compliance</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusBadgeColor(context.compliance.status)}`}>
                {context.compliance.rate}%
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {context.compliance.acknowledged} of {context.compliance.total} assignments acknowledged
            </p>
          </div>
        )}

        {/* Recent Performance */}
        {context.recentPerformance?.delta && (
          <div className={`border rounded-lg p-3 ${context.recentPerformance.delta.lapTimeDelta > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300">Performance vs Last</span>
            </div>
            <div className="space-y-1">
              <p
                className={`text-sm font-bold ${
                  context.recentPerformance.delta.lapTimeDelta > 0 ? 'text-emerald-400' : 'text-orange-400'
                }`}
              >
                {context.recentPerformance.delta.lapTimeDelta > 0 ? '+' : ''}
                {Math.round(context.recentPerformance.delta.lapTimeDelta * 100)}% Faster Lap
              </p>
              <p className="text-xs text-zinc-400">
                {context.recentPerformance.delta.hoursDelta > 0 ? '+' : ''}
                {Math.round(context.recentPerformance.delta.hoursDelta * 100)}% More Time
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {context.alerts && context.alerts.length > 0 && (
        <div className="border border-orange-500/30 bg-orange-500/5 rounded p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-orange-300 mb-1">Active Alerts</p>
              <ul className="space-y-1">
                {context.alerts.slice(0, 2).map((alert, i) => (
                  <li key={i} className="text-xs text-orange-100">
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      {context.readiness?.recommendation && (
        <div className="border border-lime-500/30 bg-lime-500/5 rounded p-3">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-lime-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-lime-300 mb-1">Taper Protocol</p>
              <p className="text-xs text-lime-100">{context.readiness.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
