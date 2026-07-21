'use client'

import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface SetupHealth {
  tireCondition: 'good' | 'degraded' | 'critical'
  brakeHealth: 'good' | 'degraded' | 'critical'
  fuelLevel: 'good' | 'low' | 'critical'
  engineHealth: 'good' | 'warning' | 'critical'
  suspensionBalance: 'balanced' | 'adjusting' | 'imbalanced'
  overallScore: number // 0-100
}

interface SetupHealthCardProps {
  health: SetupHealth
  recommendation?: string
}

function HealthIndicator({
  label,
  status,
  icon: Icon,
}: {
  label: string
  status: 'good' | 'degraded' | 'critical' | 'low' | 'warning' | 'balanced' | 'adjusting' | 'imbalanced'
  icon: React.ComponentType<{ className: string }>
}) {
  const statusConfig: Record<
    string,
    { color: string; bg: string; text: string }
  > = {
    good: { color: 'lime', bg: 'bg-lime-500/10', text: 'Good' },
    degraded: { color: 'orange', bg: 'bg-orange-500/10', text: 'Degraded' },
    critical: { color: 'red', bg: 'bg-red-500/10', text: 'Critical' },
    low: { color: 'orange', bg: 'bg-orange-500/10', text: 'Low' },
    warning: { color: 'orange', bg: 'bg-orange-500/10', text: 'Warning' },
    balanced: { color: 'lime', bg: 'bg-lime-500/10', text: 'Balanced' },
    adjusting: { color: 'blue', bg: 'bg-blue-500/10', text: 'Adjusting' },
    imbalanced: { color: 'red', bg: 'bg-red-500/10', text: 'Imbalanced' },
  }

  const config = statusConfig[status]

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} border border-${config.color}-500/20`}>
      <Icon className={`h-4 w-4 text-${config.color}-400`} />
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`text-sm font-bold text-${config.color}-400`}>{config.text}</p>
      </div>
    </div>
  )
}

export function SetupHealthCard({
  health,
  recommendation,
}: SetupHealthCardProps) {
  const scoreColor =
    health.overallScore > 80
      ? 'lime'
      : health.overallScore > 60
        ? 'orange'
        : 'red'

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Setup Health</h3>
        <div className="text-right">
          <p className="text-xs text-slate-500">Overall Score</p>
          <p className={`text-3xl font-black text-${scoreColor}-400`}>
            {health.overallScore}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <HealthIndicator
          label="Tire Condition"
          status={health.tireCondition}
          icon={CheckCircle}
        />
        <HealthIndicator
          label="Brake Health"
          status={health.brakeHealth}
          icon={AlertCircle}
        />
        <HealthIndicator
          label="Fuel Level"
          status={health.fuelLevel}
          icon={CheckCircle}
        />
        <HealthIndicator
          label="Engine Health"
          status={health.engineHealth}
          icon={AlertTriangle}
        />
        <HealthIndicator
          label="Suspension Balance"
          status={health.suspensionBalance}
          icon={CheckCircle}
        />
      </div>

      {recommendation && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-100">{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
