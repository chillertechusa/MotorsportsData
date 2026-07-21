'use client'

import { useState } from 'react'
import { createTestTeamAccount } from '@/app/actions/create-test-team'

export default function SetupTestTeamPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await createTestTeamAccount()
      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h1 className="text-3xl font-black mb-2 text-lime-400">QA Test Team Setup</h1>
          <p className="text-zinc-400 mb-8">Create a full operational team account for testing</p>

          <div className="space-y-6">
            <div className="rounded-lg bg-zinc-800/50 p-4">
              <p className="text-sm font-mono text-zinc-300">
                <span className="text-zinc-500">Email:</span> fab0891@gmail.com
              </p>
              <p className="text-sm font-mono text-zinc-300">
                <span className="text-zinc-500">Password:</span> thaddyboy44
              </p>
              <p className="text-sm font-mono text-zinc-300">
                <span className="text-zinc-500">Tier:</span> Race Team ($599/mo)
              </p>
            </div>

            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full px-6 py-3 bg-lime-400 text-zinc-950 font-black uppercase tracking-wider hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
            >
              {loading ? 'Setting up...' : 'Create Test Team Account'}
            </button>

            {result && (
              <div className="rounded-lg bg-green-900/20 border border-green-800 p-4">
                <h3 className="font-black text-green-400 mb-3">Account Created Successfully!</h3>
                <dl className="space-y-2 text-sm font-mono">
                  <div>
                    <dt className="text-zinc-400">User ID:</dt>
                    <dd className="text-green-300 break-all">{result.userId}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">Team ID:</dt>
                    <dd className="text-green-300 break-all">{result.teamId}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">Vehicle ID:</dt>
                    <dd className="text-green-300 break-all">{result.vehicleId}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">Team Name:</dt>
                    <dd className="text-green-300">{result.team}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">Tier:</dt>
                    <dd className="text-green-300">{result.tier}</dd>
                  </div>
                </dl>
                <p className="text-xs text-zinc-400 mt-4">
                  Account is ready for testing. Sign in with the credentials above.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-900/20 border border-red-800 p-4">
                <h3 className="font-black text-red-400 mb-2">Error</h3>
                <p className="text-sm text-red-300 font-mono">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
