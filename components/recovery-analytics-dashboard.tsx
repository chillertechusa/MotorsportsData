'use client'

import { useState, useEffect } from 'react'
import { Mail, CheckCircle, AlertCircle, TrendingUp, RotateCcw } from 'lucide-react'

interface RecoveryData {
  ok: boolean
  period: string
  metrics: {
    totalAbandoned: number
    emailsSent: number
    recovered: number
    pending: number
    recoveryRate: number
    estimatedRecoveredValue: number
  }
  byPlan: Array<{
    plan: string
    abandoned: number
    converted: number
    recoveryRate: number
  }>
}

export function RecoveryAnalyticsDashboard() {
  const [data, setData] = useState<RecoveryData | null>(null)
  const [days, setDays] = useState(30)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/md-analytics/recovery?days=${days}`)
        if (response.ok) {
          setData(await response.json())
        }
      } catch (error) {
        console.error('[Recovery Analytics] Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [days])

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading recovery analytics...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load data
      </div>
    )
  }

  const recoveredValue = (data.metrics.estimatedRecoveredValue / 100).toFixed(0)

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded font-semibold transition ${
              days === d
                ? 'bg-lime-600 text-black'
                : 'bg-zinc-800 text-foreground hover:bg-zinc-700'
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Abandoned */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Abandoned</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {data.metrics.totalAbandoned}
          </div>
          <p className="text-xs text-muted-foreground mt-1">checkout sessions</p>
        </div>

        {/* Emails Sent */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-muted-foreground">Emails Sent</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {data.metrics.emailsSent}
          </div>
          <p className="text-xs text-muted-foreground mt-1">recovery emails</p>
        </div>

        {/* Recovered */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-lime-400" />
            <span className="text-sm text-muted-foreground">Converted</span>
          </div>
          <div className="text-3xl font-bold text-lime-400">
            {data.metrics.recovered}
          </div>
          <p className="text-xs text-muted-foreground mt-1">new subscribers</p>
        </div>

        {/* Recovery Rate */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-muted-foreground">Recovery Rate</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {data.metrics.recoveryRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">of emails</p>
        </div>
      </div>

      {/* Estimated Value Recovered */}
      <div className="bg-gradient-to-r from-lime-950 to-lime-900 border border-lime-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-lime-200 mb-2">Revenue Recovered</h3>
        <div className="text-4xl font-bold text-lime-300 mb-1">
          ${recoveredValue}
        </div>
        <p className="text-sm text-lime-200">
          Estimated value from recovered checkouts (based on average plan value)
        </p>
      </div>

      {/* Recovery by Plan */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-6">Recovery by Plan</h3>
        <div className="space-y-4">
          {data.byPlan.map(plan => (
            <div key={plan.plan} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-foreground capitalize">
                  {plan.plan}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{plan.abandoned} abandoned</span>
                  <span className="text-lime-400">
                    {plan.converted} converted
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-lime-400">
                  {plan.recoveryRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">recovery rate</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending */}
      {data.metrics.pending > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {data.metrics.pending} pending recovery attempts
            </p>
            <p className="text-sm text-muted-foreground">
              Cron job will continue sending emails hourly
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-xs text-muted-foreground text-center">
        <p>Recovery emails sent hourly • Target: 5-10% recovery rate • Email template includes retry link</p>
      </div>
    </div>
  )
}
