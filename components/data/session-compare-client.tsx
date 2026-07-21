'use client'

import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface Session {
  id: string
  trackName: string
  trackConditions: string
  sessionDate: string
  riderFeedback: string
}

interface SetupParam {
  key: string
  value: string
  diff?: 'added' | 'removed' | 'changed' | 'same'
}

export function SessionCompareClient({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || '')
  const [sessions, setSessions] = useState<Session[]>([])
  const [session1, setSession1] = useState<Session | null>(null)
  const [session2, setSession2] = useState<Session | null>(null)
  const [comparison, setComparison] = useState<{ setup1: SetupParam[]; setup2: SetupParam[] } | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch sessions for selected vehicle
  useEffect(() => {
    async function fetchSessions() {
      if (!selectedVehicle) return
      setLoading(true)
      try {
        const result = await fetch(`/api/md-sessions?vehicleId=${selectedVehicle}`)
        if (result.ok) {
          const data = await result.json()
          setSessions(data.sessions || [])
          setSession1(null)
          setSession2(null)
          setComparison(null)
        }
      } catch (e) {
        console.error('Failed to fetch sessions:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [selectedVehicle])

  // Compare two sessions
  async function compareSessions() {
    if (!session1 || !session2) return
    setLoading(true)
    try {
      const res = await fetch('/api/md-session-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session1Id: session1.id,
          session2Id: session2.id,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setComparison(data)
      }
    } catch (e) {
      console.error('Failed to compare:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-zinc-100 mb-2">Compare Sessions</h1>
          <p className="text-zinc-400">Side-by-side suspension and setup analysis</p>
        </div>

        {/* Vehicle selector */}
        <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <label className="block text-sm font-mono text-zinc-400 uppercase tracking-widest mb-3">Select Vehicle</label>
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

        {/* Session selectors */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Session 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-black text-zinc-100 mb-4">Session 1</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSession1(s)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    session1?.id === s.id
                      ? 'border-lime-400 bg-lime-400/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <p className="font-mono text-xs text-zinc-500">{s.trackName}</p>
                  <p className="text-zinc-100 font-medium">{s.sessionDate}</p>
                  <p className="text-zinc-400 text-sm mt-1">{s.trackConditions}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Session 2 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-black text-zinc-100 mb-4">Session 2</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSession2(s)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    session2?.id === s.id
                      ? 'border-lime-400 bg-lime-400/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <p className="font-mono text-xs text-zinc-500">{s.trackName}</p>
                  <p className="text-zinc-100 font-medium">{s.sessionDate}</p>
                  <p className="text-zinc-400 text-sm mt-1">{s.trackConditions}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compare button */}
        <div className="mb-8">
          <button
            onClick={compareSessions}
            disabled={!session1 || !session2 || loading}
            className="bg-lime-400 text-zinc-950 px-8 py-4 font-black uppercase tracking-widest rounded hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            {loading ? 'Comparing...' : 'Compare Setup'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Comparison results */}
        {comparison && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Session 1 Setup */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-black text-zinc-100 mb-4">{session1?.trackName}</h3>
              <div className="space-y-2">
                {comparison.setup1.map((param, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border ${
                      param.diff === 'changed'
                        ? 'border-orange-400/50 bg-orange-400/10'
                        : param.diff === 'same'
                          ? 'border-zinc-700 bg-zinc-800/50'
                          : 'border-zinc-700'
                    }`}
                  >
                    <p className="font-mono text-xs text-zinc-500">{param.key}</p>
                    <p className="text-zinc-100 font-medium">{param.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Session 2 Setup */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-black text-zinc-100 mb-4">{session2?.trackName}</h3>
              <div className="space-y-2">
                {comparison.setup2.map((param, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border ${
                      param.diff === 'changed'
                        ? 'border-orange-400/50 bg-orange-400/10'
                        : param.diff === 'same'
                          ? 'border-zinc-700 bg-zinc-800/50'
                          : 'border-zinc-700'
                    }`}
                  >
                    <p className="font-mono text-xs text-zinc-500">{param.key}</p>
                    <p className="text-zinc-100 font-medium">{param.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!comparison && session1 && session2 && !loading && (
          <div className="text-center py-12">
            <p className="text-zinc-500">Click "Compare Setup" to see the differences</p>
          </div>
        )}
      </div>
    </main>
  )
}
