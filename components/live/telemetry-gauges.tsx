'use client'

import { Gauge, Thermometer, Wind } from 'lucide-react'

interface TelemetryMetrics {
  speed: number
  throttle: number
  brakePressure?: number
  engineTempC?: number
  tireTempFront?: number
  tireTempRear?: number
  engineRpmK?: number
}

interface TelemetryGaugesProps {
  metrics: TelemetryMetrics
  maxSpeed: number
  maxTemp: number
}

function GaugeCard({
  label,
  value,
  unit,
  max,
  icon: Icon,
  color = 'lime',
}: {
  label: string
  value: number
  unit: string
  max: number
  icon: React.ComponentType<{ className: string }>
  color?: 'lime' | 'orange' | 'red' | 'blue'
}) {
  const percent = (value / max) * 100
  const colorClass =
    percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-orange-500' : `bg-${color}-500`

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        </div>
        <span className="text-sm text-slate-400">{percent.toFixed(0)}%</span>
      </div>
      <div className="mb-2 h-2 rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-100`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="text-2xl font-black text-slate-50">
        {value.toFixed(1)}{unit}
      </p>
    </div>
  )
}

export function TelemetryGauges({ metrics, maxSpeed, maxTemp }: TelemetryGaugesProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <GaugeCard
        label="Speed"
        value={metrics.speed}
        unit=" mph"
        max={maxSpeed}
        icon={Wind}
        color="blue"
      />
      <GaugeCard
        label="Throttle"
        value={metrics.throttle * 100}
        unit="%"
        max={100}
        icon={Gauge}
        color="lime"
      />
      {metrics.engineTempC !== undefined && (
        <GaugeCard
          label="Engine Temp"
          value={metrics.engineTempC}
          unit="°C"
          max={maxTemp}
          icon={Thermometer}
          color="orange"
        />
      )}
      {metrics.tireTempFront !== undefined && (
        <GaugeCard
          label="Tire Temp (F)"
          value={metrics.tireTempFront}
          unit="°C"
          max={maxTemp}
          icon={Thermometer}
          color="red"
        />
      )}
    </div>
  )
}
