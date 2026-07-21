'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react'

interface Recommendation {
  type: string
  priority: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  actionable: boolean
  estimate: string
}

interface LiveCoachRecommendationsProps {
  liveSessionId: string
  refreshInterval?: number
}

export function LiveCoachRecommendations({ 
  liveSessionId, 
  refreshInterval = 5000 
}: LiveCoachRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/md-coach-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ liveSessionId, lastN: 50 }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setRecommendations(data.recommendations || [])
        setError(null)
      } catch (err) {
        console.error('[Live Coach] Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load recommendations')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
    const interval = setInterval(fetchRecommendations, refreshInterval)
    return () => clearInterval(interval)
  }, [liveSessionId, refreshInterval])

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-950'
      case 'HIGH':
        return 'border-orange-500 bg-orange-950'
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-950'
      case 'LOW':
        return 'border-blue-500 bg-blue-950'
      default:
        return 'border-green-500 bg-green-950'
    }
  }

  const priorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4" />
      case 'MEDIUM':
      case 'LOW':
        return <Lightbulb className="w-4 h-4" />
      default:
        return <TrendingUp className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-lime-400 mb-4">Coach AI Recommendations</h3>
        <div className="text-sm text-muted-foreground animate-pulse">Loading recommendations...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4">Coach AI</h3>
        <div className="text-sm text-red-300">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-lime-500/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-lime-400 mb-4">Coach AI Recommendations</h3>

      {recommendations.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          No recommendations yet. Keep riding!
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`p-4 rounded border-l-4 ${priorityColor(rec.priority)}`}>
              <div className="flex items-start gap-3">
                <div className="text-lg mt-0.5">{priorityIcon(rec.priority)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{rec.type}</span>
                    <span className="text-xs px-2 py-0.5 bg-black/30 rounded font-mono">
                      {rec.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-200 mb-2">{rec.message}</div>
                  <div className="text-xs text-gray-400">
                    {rec.actionable ? '✓ Actionable: ' : ''}{rec.estimate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-zinc-800">
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
