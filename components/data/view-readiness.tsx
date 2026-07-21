'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, Zap, Battery, Moon, AlertTriangle } from 'lucide-react'

interface ReadinessData {
  score: number
  sleep: number
  hrv: number
  volume: number
  peakProbability: number
  confidence: number
  tapperRecommendation: string
  warnings: string[]
}

const mockReadiness: ReadinessData = {
  score: 87,
  sleep: 7.5,
  hrv: 52,
  volume: 240,
  peakProbability: 94,
  confidence: 85,
  tapperRecommendation: 'MAINTENANCE taper. 1 short session midweek (15 min easy). Rest remainder of week.',
  warnings: [],
}

export function ViewReadiness() {
  const [readiness, setReadiness] = useState<ReadinessData>(mockReadiness)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReadiness() {
      try {
        const res = await fetch('/api/md-readiness?calculate=true&daysUntilRace=3')
        if (!res.ok) throw new Error('Failed to fetch readiness')

        const data = await res.json()
        if (data.calculated?.readiness) {
          const r = data.calculated.readiness
          setReadiness({
            score: r.overall,
            sleep: data.latest?.sleepHours ?? 7.5,
            hrv: data.latest?.hrv ?? 52,
            volume: data.calculated.trackVolumeMinutes,
            peakProbability: r.peakProbability,
            confidence: r.confidence,
            tapperRecommendation: r.tapperRecommendation,
            warnings: r.warnings,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading readiness')
      } finally {
        setLoading(false)
      }
    }

    fetchReadiness()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-lime-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-orange-400'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-zinc-400">Loading readiness score...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border border-red-900 bg-red-950 bg-opacity-20 p-4 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">Readiness Score</h2>
        <p className="text-sm text-zinc-400 mt-1">Race-day peak prediction: {readiness.peakProbability}% (confidence: {readiness.confidence}%)</p>
      </div>

      <div className="border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Current Readiness</p>
          <p className={`text-6xl font-black mt-2 ${getScoreColor(readiness.score)}`}>{readiness.score}%</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-black ${getScoreColor(readiness.peakProbability)}`}>{readiness.peakProbability}%</p>
          <p className="text-xs text-zinc-500">peak probability</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold text-zinc-400">Sleep</span>
          </div>
          <p className="text-3xl font-black text-blue-400">{readiness.sleep}h</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-lime-400" />
            <span className="text-xs font-bold text-zinc-400">HRV</span>
          </div>
          <p className="text-3xl font-black text-lime-400">{readiness.hrv}ms</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-400">Volume</span>
          </div>
          <p className="text-3xl font-black text-amber-400">{readiness.volume}m</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-bold text-zinc-400">Status</span>
          </div>
          <p className="text-lg font-black text-orange-400">
            {readiness.score >= 90 ? 'Peak' : readiness.score >= 75 ? 'Optimal' : readiness.score >= 60 ? 'Ready' : 'Fatigued'}
          </p>
        </div>
      </div>

      <div className="border border-lime-500/40 bg-lime-500/5 p-4 rounded-lg">
        <p className="text-sm text-lime-300">Follow taper protocol: Light Thursday, Rest Friday, Peak Saturday at 7:00 PM.</p>
      </div>

      {/* Taper Protocol */}
      <div className="border border-lime-900 bg-lime-950 bg-opacity-20 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-lime-300 mb-3">Taper Protocol</h3>
        <p className="text-lime-100 text-sm leading-relaxed">{readiness.tapperRecommendation}</p>
      </div>

      {/* Warnings */}
      {readiness.warnings.length > 0 && (
        <div className="border border-orange-900 bg-orange-950 bg-opacity-20 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-orange-300 mb-2">Alerts</h3>
              <ul className="space-y-1">
                {readiness.warnings.map((warning, i) => (
                  <li key={i} className="text-orange-100 text-sm">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
