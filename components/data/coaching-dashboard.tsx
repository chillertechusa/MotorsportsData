'use client'

import { useState, useEffect } from 'react'
import { Award, TrendingUp, MessageSquare } from 'lucide-react'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface Session {
  id: string
  trackName: string
  sessionDate: string
  riderFeedback: string
}

interface CoachingAnalysis {
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
  overallRating: number
}

export function CoachingDashboard({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || '')
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [analysis, setAnalysis] = useState<CoachingAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchSessions() {
      if (!selectedVehicle) return
      try {
        const res = await fetch(`/api/md-sessions?vehicleId=${selectedVehicle}`)
        if (res.ok) {
          const data = await res.json()
          setSessions(data.sessions || [])
          setSelectedSession(data.sessions?.[0]?.id || '')
          setAnalysis(null)
        }
      } catch (e) {
        console.error('Failed to fetch sessions:', e)
      }
    }
    fetchSessions()
  }, [selectedVehicle])

  async function analyzeSession() {
    if (!selectedSession) return
    setLoading(true)
    try {
      const res = await fetch('/api/md-coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession,
          vehicleId: selectedVehicle,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setAnalysis(data)
      }
    } catch (e) {
      console.error('Failed to analyze:', e)
    } finally {
      setLoading(false)
    }
  }

  const currentSession = sessions.find((s) => s.id === selectedSession)

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-zinc-100 mb-2">Race Coach AI</h1>
          <p className="text-zinc-400">Get personalized coaching feedback on your riding performance</p>
        </div>

        {/* Selectors */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <label className="block text-sm font-mono text-zinc-400 uppercase tracking-widest mb-3">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-zinc-100 focus:outline-none focus:border-lime-400"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.trackName} — {s.sessionDate}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Analyze button */}
        <div className="mb-8">
          <button
            onClick={analyzeSession}
            disabled={!selectedSession || loading}
            className="bg-lime-400 text-zinc-950 px-8 py-4 font-black uppercase tracking-widest rounded hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {loading ? 'Analyzing...' : 'Get Coaching Analysis'}
          </button>
        </div>

        {/* Session info */}
        {currentSession && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-black text-zinc-100 mb-4">{currentSession.trackName}</h2>
            <p className="text-zinc-400 text-sm mb-4">{currentSession.sessionDate}</p>
            {currentSession.riderFeedback && (
              <div className="bg-zinc-800 rounded p-4 border border-zinc-700">
                <p className="text-zinc-300 text-sm leading-relaxed">{currentSession.riderFeedback}</p>
              </div>
            )}
          </div>
        )}

        {/* Coaching analysis */}
        {analysis && (
          <div className="space-y-8">
            {/* Overall Rating */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-black text-zinc-100 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" /> Performance Rating
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black text-lime-400">{analysis.overallRating}/10</div>
                <div className="flex-1">
                  <div className="bg-zinc-800 rounded-full h-3 w-full overflow-hidden">
                    <div
                      className="bg-lime-400 h-full transition-all"
                      style={{ width: `${(analysis.overallRating / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-zinc-900 border border-green-900 rounded-lg p-6">
              <h3 className="text-lg font-black text-green-400 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-400 font-black mt-1">+</span>
                    <span className="text-zinc-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for improvement */}
            <div className="bg-zinc-900 border border-orange-900 rounded-lg p-6">
              <h3 className="text-lg font-black text-orange-400 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 rotate-180" /> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-orange-400 font-black mt-1">→</span>
                    <span className="text-zinc-300">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next steps */}
            <div className="bg-zinc-900 border border-lime-900 rounded-lg p-6">
              <h3 className="text-lg font-black text-lime-400 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Recommended Next Steps
              </h3>
              <ol className="space-y-2">
                {analysis.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-lime-400 font-black mt-1">{i + 1}.</span>
                    <span className="text-zinc-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {!analysis && !loading && (
          <div className="text-center py-12">
            <p className="text-zinc-500">Select a session and click "Get Coaching Analysis" to receive feedback</p>
          </div>
        )}
      </div>
    </main>
  )
}
