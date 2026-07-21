'use client'

import { CheckCircle2, Clock, AlertCircle, TrendingDown } from 'lucide-react'

interface Optimization {
  id: string
  title: string
  parameter: string
  valueBefore: string
  valueAfter: string
  estimatedLapTimeDelta?: number
  actualLapTimeDelta?: number
  status: 'suggested' | 'applied' | 'evaluated'
  createdAt: string
}

interface MechanicOptimizationTimelineProps {
  optimizations: Optimization[]
}

export function MechanicOptimizationTimeline({
  optimizations,
}: MechanicOptimizationTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'evaluated':
        return <CheckCircle2 className="w-5 h-5 text-lime-400" />
      case 'applied':
        return <Clock className="w-5 h-5 text-yellow-400" />
      case 'suggested':
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluated':
        return 'bg-lime-950 border-l-2 border-lime-500'
      case 'applied':
        return 'bg-yellow-950 border-l-2 border-yellow-500'
      case 'suggested':
      default:
        return 'bg-blue-950 border-l-2 border-blue-500'
    }
  }

  if (optimizations.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No optimizations yet. Start creating work orders to track improvements.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">Recent Optimizations</h3>
      <div className="space-y-4">
        {optimizations.map((opt) => (
          <div key={opt.id} className={`rounded p-4 ${getStatusColor(opt.status)}`}>
            <div className="flex items-start gap-4">
              <div className="mt-1">{getStatusIcon(opt.status)}</div>
              <div className="flex-1">
                {/* Title and parameter */}
                <div className="mb-2">
                  <h4 className="font-semibold text-foreground">{opt.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Parameter: <span className="font-mono">{opt.parameter}</span>
                  </p>
                </div>

                {/* Before/After */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Before</p>
                    <p className="font-mono text-sm bg-black/40 rounded px-2 py-1">{opt.valueBefore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">After</p>
                    <p className="font-mono text-sm bg-black/40 rounded px-2 py-1">{opt.valueAfter}</p>
                  </div>
                </div>

                {/* Lap time delta */}
                <div className="flex items-center gap-4 text-xs">
                  {opt.estimatedLapTimeDelta && (
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-blue-300" />
                      <span className="text-muted-foreground">
                        Est: <span className="font-semibold text-blue-300">
                          {opt.estimatedLapTimeDelta < 0 ? '-' : '+'}{Math.abs(opt.estimatedLapTimeDelta).toFixed(2)}s
                        </span>
                      </span>
                    </div>
                  )}
                  {opt.actualLapTimeDelta && (
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-lime-300" />
                      <span className="text-muted-foreground">
                        Actual: <span className="font-semibold text-lime-300">
                          {opt.actualLapTimeDelta < 0 ? '-' : '+'}{Math.abs(opt.actualLapTimeDelta).toFixed(2)}s
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className="mt-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-black/30 rounded capitalize">
                    {opt.status}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="text-right text-xs text-muted-foreground">
                {new Date(opt.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
