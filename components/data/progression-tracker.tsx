'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar } from 'lucide-react'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface ProgressionData {
  vehicleId: string
  sessions: Array<{
    date: string
    trackName: string
    lapTime: number | null
    feedback: string
    improvement: number | null
  }>
  bestLapTime: number | null
  averageLapTime: number | null
  totalSessions: number
  improvement: number | null
}

export function ProgressionTracker({ vehicles, teamId }: { vehicles: Vehicle[]; teamId: string }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || '')
  const [progression, setProgression] = useState<ProgressionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [filterTrack, setFilterTrack] = useState<string>('')

  useEffect(() => {
    async function fetchProgression() {
      if (!selectedVehicle) return
      setLoading(true)
      try {
        const res = await fetch(`/api/md-progression?vehicleId=${selectedVehicle}&track=${filterTrack}`)
        if (res.ok) {
          const data = await res.json()
          setProgression(data)
        }
      } catch (e) {
        console.error('Failed to fetch progression:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchProgression()
  }, [selectedVehicle, filterTrack])

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs}`
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-zinc-100 mb-2">Ride Progression</h1>
          <p className="text-zinc-400">Track your lap times and improvement trends</p>
        </div>

        {/* Vehicle selector */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <label className="block text-sm font-mono text-zinc-400 uppercase tracking-widest mb-3">Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-zinc-100 focus:outline-none focus:border-lime-400"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.type}
                </option>
              ))}
            </select>
          </div>

          {/* Track filter */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <label className="block text-sm font-mono text-zinc-400 uppercase tracking-widest mb-3">Filter Track (optional)</label>
            <input
              type="text"
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              placeholder="e.g., Southwick"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        {/* Stats */}
        {progression && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Total Sessions</p>
              <p className="text-3xl font-black text-lime-400">{progression.totalSessions}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Best Lap Time</p>
              <p className="text-2xl font-black text-zinc-100">{formatTime(progression.bestLapTime)}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Average Lap Time</p>
              <p className="text-2xl font-black text-zinc-100">{formatTime(progression.averageLapTime)}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Overall Improvement</p>
              <p className={`text-2xl font-black flex items-center gap-2 ${progression.improvement && progression.improvement > 0 ? 'text-green-400' : 'text-zinc-400'}`}>
                <TrendingUp className="h-5 w-5" />
                {progression.improvement ? `${progression.improvement.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Sessions timeline */}
        {progression && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-black text-zinc-100 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Session History
            </h2>

            <div className="space-y-4">
              {progression.sessions.length > 0 ? (
                progression.sessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded border border-zinc-700 hover:border-zinc-600 transition-colors">
                    <div className="flex-1">
                      <p className="font-black text-zinc-100">{session.trackName}</p>
                      <p className="text-sm text-zinc-400 mt-1">{session.date}</p>
                      {session.feedback && <p className="text-sm text-zinc-500 italic mt-2">"{session.feedback}"</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-lime-400">{formatTime(session.lapTime)}</p>
                      {session.improvement && session.improvement !== 0 && (
                        <p className={`text-sm font-mono mt-2 ${session.improvement > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                          {session.improvement > 0 ? '+' : ''}{session.improvement.toFixed(2)}s
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-500 py-8">No sessions yet. Log a session to start tracking progression.</p>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-zinc-500">Loading progression data...</p>
          </div>
        )}
      </div>
    </main>
  )
}
