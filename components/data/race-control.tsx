'use client'

import { useState, useEffect } from 'react'
import { Play, Square, Clock, Users, Activity, AlertCircle, CheckCircle } from 'lucide-react'

interface Session {
  id: string
  name: string
  discipline?: string
  location?: string
  status: 'pending' | 'active' | 'completed' | 'archived'
  startTime?: string
  endTime?: string
  riderCount: number
  totalTelemetryPoints: number
  createdAt: string
}

interface RaceControlProps {
  teamId: string
  onSessionCreated?: (session: Session) => void
}

export function RaceControl({ teamId, onSessionCreated }: RaceControlProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [showNewSessionForm, setShowNewSessionForm] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [newSessionDiscipline, setNewSessionDiscipline] = useState('motocross')
  const [newSessionLocation, setNewSessionLocation] = useState('')

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 5000) // Refresh every 5s if active
    return () => clearInterval(interval)
  }, [teamId])

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/sessions?teamId=${teamId}`)
      if (!res.ok) throw new Error('Failed to fetch sessions')
      const data = await res.json()
      setSessions(data.sessions || [])
      const active = data.sessions?.find((s: Session) => s.status === 'active')
      setActiveSession(active || null)
      setLoading(false)
    } catch (error) {
      console.error('[RaceControl] Error fetching sessions:', error)
      setLoading(false)
    }
  }

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSessionName.trim()) return

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          name: newSessionName,
          discipline: newSessionDiscipline,
          location: newSessionLocation,
        }),
      })

      if (!res.ok) throw new Error('Failed to create session')
      const newSession = await res.json()

      setSessions((prev) => [newSession, ...prev])
      setNewSessionName('')
      setNewSessionLocation('')
      setShowNewSessionForm(false)

      if (onSessionCreated) onSessionCreated(newSession)
    } catch (error) {
      console.error('[RaceControl] Error creating session:', error)
    }
  }

  const startSession = async (session: Session) => {
    try {
      const res = await fetch(`/api/sessions/${session.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })

      if (!res.ok) throw new Error('Failed to start session')
      setActiveSession(session)
      await fetchSessions()
    } catch (error) {
      console.error('[RaceControl] Error starting session:', error)
    }
  }

  const stopSession = async (session: Session) => {
    try {
      const res = await fetch(`/api/sessions/${session.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      if (!res.ok) throw new Error('Failed to stop session')
      setActiveSession(null)
      await fetchSessions()
    } catch (error) {
      console.error('[RaceControl] Error stopping session:', error)
    }
  }

  if (loading) {
    return <div className="text-zinc-400">Loading race control...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">Race Control</h2>
        <p className="text-sm text-zinc-400 mt-1">Start/stop sessions, track real-time telemetry</p>
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <div className="border border-green-500/30 bg-green-500/5 rounded-lg p-4 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-green-400">Session Active: {activeSession.name}</p>
            <p className="text-sm text-zinc-300 mt-1">
              {activeSession.riderCount ?? 0} riders • {(activeSession.totalTelemetryPoints ?? 0).toLocaleString()} telemetry points
            </p>
          </div>
          <button
            onClick={() => stopSession(activeSession)}
            className="px-3 py-2 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-500"
          >
            Stop Session
          </button>
        </div>
      )}

      {/* New Session Form */}
      {showNewSessionForm && (
        <form onSubmit={createSession} className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
          <h3 className="font-bold text-zinc-50 mb-4">Create New Session</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">Session Name</label>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="e.g., SX Las Vegas Round 5"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-50 placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">Discipline</label>
              <select
                value={newSessionDiscipline}
                onChange={(e) => setNewSessionDiscipline(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-50"
              >
                <option value="motocross">Motocross</option>
                <option value="sx">Supercross</option>
                <option value="enduro">Enduro/GNCC</option>
                <option value="fmx">FMX</option>
                <option value="flat_track">Flat Track</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">Location (Optional)</label>
              <input
                type="text"
                value={newSessionLocation}
                onChange={(e) => setNewSessionLocation(e.target.value)}
                placeholder="e.g., Las Vegas Motor Speedway"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-50 placeholder-zinc-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-lime-500 text-zinc-950 rounded font-bold hover:bg-lime-400"
              >
                Create Session
              </button>
              <button
                type="button"
                onClick={() => setShowNewSessionForm(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-50 rounded font-bold hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* New Session Button */}
      {!showNewSessionForm && (
        <button
          onClick={() => setShowNewSessionForm(true)}
          className="px-4 py-3 bg-lime-500 text-zinc-950 rounded font-bold hover:bg-lime-400 w-full"
        >
          + Create New Session
        </button>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        <h3 className="font-bold text-zinc-50">Recent Sessions</h3>

        {sessions.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6 text-center text-zinc-400">
            No sessions yet. Create one to get started.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="border border-zinc-800 bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800/50 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-zinc-50">{session.name}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded font-bold ${
                        session.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : session.status === 'completed'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {(session.status ?? 'completed').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mt-3 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>{session.discipline || 'motocross'}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{session.riderCount} riders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{session.totalTelemetryPoints.toLocaleString()} points</span>
                    </div>
                  </div>
                </div>

                {session.status === 'pending' && (
                  <button
                    onClick={() => startSession(session)}
                    className="px-3 py-2 bg-lime-500 text-zinc-950 rounded font-bold text-sm hover:bg-lime-400 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </button>
                )}

                {session.status === 'active' && (
                  <button
                    onClick={() => stopSession(session)}
                    className="px-3 py-2 bg-red-600 text-white rounded font-bold text-sm hover:bg-red-500 flex items-center gap-2"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </button>
                )}

                {session.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-bold">Complete</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
