'use client'

import { useEffect, useRef, useState } from 'react'

interface RiderPosition {
  id: string
  lat: number
  lon: number
  speed: number
  lapNumber: number
  timestamp: number
}

interface TrackBoundary {
  type: string
  coordinates: Array<Array<[number, number]>>
}

interface TrackMapProps {
  riders: RiderPosition[]
  trackName?: string
  boundary?: TrackBoundary
  centerLat?: number
  centerLng?: number
  zoom?: number
}

const SPEED_COLORS = {
  slow: '#ef4444',      // Red: 0-30 mph
  moderate: '#eab308',  // Yellow: 30-50 mph
  fast: '#84cc16',      // Lime: 50+ mph
}

export function TrackMap({ 
  riders, 
  trackName = 'Track',
  boundary,
  centerLat = 0,
  centerLng = 0,
  zoom = 15
}: TrackMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [riderHistories, setRiderHistories] = useState<Record<string, RiderPosition[]>>({})

  // Track rider history for trail rendering
  useEffect(() => {
    setRiderHistories(prev => {
      const updated = { ...prev }
      riders.forEach(rider => {
        if (!updated[rider.id]) updated[rider.id] = []
        updated[rider.id] = [...updated[rider.id].slice(-100), rider] // Keep last 100 points
      })
      return updated
    })
  }, [riders])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#09090b'
    ctx.fillRect(0, 0, width, height)

    // Normalize GPS to canvas coordinates
    const normalize = (lat: number, lng: number) => {
      // Simple mercator projection approximation
      const x = ((lng - centerLng) * Math.cos(centerLat * Math.PI / 180)) * zoom * 20 + width / 2
      const y = ((centerLat - lat) * zoom * 20) + height / 2
      return { x, y }
    }

    // Draw track boundary polygon if available
    if (boundary && boundary.coordinates && boundary.coordinates[0]) {
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      boundary.coordinates[0].forEach((coord, idx) => {
        const { x, y } = normalize(coord[1], coord[0])
        if (idx === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.stroke()

      // Fill track with subtle color
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'
      ctx.fill()
    } else {
      // Fallback: simple ellipse track
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(width / 2, height / 2, width * 0.35, height * 0.35, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw start/finish line
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(width / 2 - 20, height * 0.2)
    ctx.lineTo(width / 2 + 20, height * 0.2)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw rider trails (history)
    Object.entries(riderHistories).forEach(([riderId, history], idx) => {
      if (history.length < 2) return
      
      const color = ['#a3e635', '#60a5fa', '#f97316', '#ec4899'][idx % 4]
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      
      history.forEach((pos, i) => {
        const { x, y } = normalize(pos.lat, pos.lon)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // Draw current rider positions
    riders.forEach((rider, idx) => {
      const { x, y } = normalize(rider.lat, rider.lon)

      // Determine color based on speed
      let color = SPEED_COLORS.slow
      if (rider.speed > 50) color = SPEED_COLORS.fast
      else if (rider.speed > 30) color = SPEED_COLORS.moderate

      // Rider circle with glow
      ctx.shadowColor = color
      ctx.shadowBlur = 12
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Speed text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.round(rider.speed)}`, x, y - 20)

      // Lap indicator
      ctx.fillStyle = '#a3e635'
      ctx.font = 'bold 9px monospace'
      ctx.fillText(`L${rider.lapNumber}`, x, y + 22)
    })

    // Draw legend
    ctx.fillStyle = '#71717a'
    ctx.font = '11px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`${riders.length} rider${riders.length !== 1 ? 's' : ''} · ${trackName}`, 10, height - 10)
  }, [riders, riderHistories, boundary, centerLat, centerLng, zoom])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">{trackName} — Live GPS</h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={450}
        className="w-full border border-zinc-800 rounded bg-black"
      />
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground font-mono">
        <div>Red: Slow {'(<30 mph)'}</div>
        <div>Yellow: Moderate</div>
        <div>Lime: Fast {('50+ mph')}</div>
      </div>
    </div>
  )
}
