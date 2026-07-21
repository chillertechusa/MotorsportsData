'use client'

import { useState } from 'react'
import { Play, Pause, Square, Download } from 'lucide-react'

interface SessionControlsProps {
  sessionId: string
  isActive: boolean
  duration: number // in seconds
  lapsCompleted: number
  onStart?: () => Promise<void>
  onPause?: () => Promise<void>
  onEnd?: () => Promise<void>
  onExport?: () => Promise<void>
}

export function SessionControls({
  sessionId,
  isActive,
  duration,
  lapsCompleted,
  onStart,
  onPause,
  onEnd,
  onExport,
}: SessionControlsProps) {
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!onStart) return
    setLoading(true)
    try {
      await onStart()
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async () => {
    if (!onPause) return
    setLoading(true)
    try {
      await onPause()
    } finally {
      setLoading(false)
    }
  }

  const handleEnd = async () => {
    if (!onEnd) return
    if (!confirm('End this session? This cannot be undone.')) return
    setLoading(true)
    try {
      await onEnd()
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!onExport) return
    setLoading(true)
    try {
      await onExport()
    } finally {
      setLoading(false)
    }
  }

  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Session Control</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Duration</p>
            <p className="text-2xl font-black text-slate-100">
              {hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Laps</p>
            <p className="text-2xl font-black text-slate-100">{lapsCompleted}</p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
            <p className={`text-2xl font-black ${isActive ? 'text-lime-400' : 'text-slate-500'}`}>
              {isActive ? 'LIVE' : 'PAUSED'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isActive ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold transition disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Start Session
            </button>
          ) : (
            <button
              onClick={handlePause}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition disabled:opacity-50"
            >
              <Pause className="h-4 w-4" />
              Pause Session
            </button>
          )}

          <button
            onClick={handleEnd}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 transition disabled:opacity-50"
          >
            <Square className="h-4 w-4" />
            End
          </button>

          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  )
}
