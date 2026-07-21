'use client'

import { useEffect, useRef } from 'react'

interface TelemetryPoint {
  timestamp: number
  lapNumber: number
  speed: number
  throttle: number
  brakePressure?: number
}

interface TelemetryWaveformProps {
  points: TelemetryPoint[]
  metric: 'speed' | 'throttle' | 'brake'
  height?: number
}

export function TelemetryWaveform({ points, metric, height = 200 }: TelemetryWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const h = canvas.height

    // Clear canvas
    ctx.fillStyle = '#09090b'
    ctx.fillRect(0, 0, width, h)

    // Get metric values
    const values = points.map(p => {
      if (metric === 'speed') return p.speed
      if (metric === 'throttle') return p.throttle
      return p.brakePressure || 0
    })

    const maxValue = Math.max(...values, 1)
    const minValue = 0

    // Draw grid
    ctx.strokeStyle = '#27272a'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = (h / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw waveform
    const colors: Record<string, string> = {
      speed: '#22c55e',
      throttle: '#3b82f6',
      brake: '#f97316',
    }

    ctx.strokeStyle = colors[metric]
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i < values.length; i++) {
      const x = (i / values.length) * width
      const value = values[i]
      const y = h - (value / maxValue) * (h * 0.9)

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Draw current value indicator
    if (values.length > 0) {
      const lastValue = values[values.length - 1]
      const y = h - (lastValue / maxValue) * (h * 0.9)

      ctx.fillStyle = colors[metric]
      ctx.beginPath()
      ctx.arc(width - 5, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points, metric])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
        {metric}
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full border border-zinc-800 rounded bg-black"
      />
    </div>
  )
}
