'use client'

import { useState } from 'react'
import { createFinalTeamAccounts } from '@/app/actions/create-final-teams'

export default function SetupFinalTeamsPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleCreateAccounts = async () => {
    setLoading(true)
    try {
      const result = await createFinalTeamAccounts()
      setResults(result)
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-2">Setup Final Test Accounts</h1>
        <p className="text-zinc-400 mb-8">Create ptown4 and ptown5 for Factory Rig and Wrench tiers</p>

        {/* Account Preview */}
        <div className="grid gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="font-mono text-sm text-zinc-300">
              ptown4@motorsportsdata.io • Factory Rig • thaddyboy454
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="font-mono text-sm text-zinc-300">
              ptown5@motorsportsdata.io • Wrench • thaddyboy454
            </p>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateAccounts}
          disabled={loading}
          className="w-full px-8 py-4 bg-lime-400 text-zinc-950 font-black uppercase tracking-widest rounded-xl hover:bg-lime-300 disabled:opacity-50 transition-colors mb-8"
        >
          {loading ? 'Creating Accounts...' : 'CREATE FINAL ACCOUNTS'}
        </button>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Results</h2>
            {results.success ? (
              <div className="rounded-xl border border-green-800 bg-green-900/20 p-4">
                <p className="text-green-400 font-medium mb-4">Accounts created successfully!</p>
                <div className="space-y-2">
                  {results.results?.map((r: any) => (
                    <div
                      key={r.email}
                      className={`text-sm font-mono ${r.success ? 'text-green-300' : 'text-red-300'}`}
                    >
                      {r.success ? '✓' : '✗'} {r.email}
                      {r.error && <span className="text-red-300 ml-2">({r.error})</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
                <p className="text-red-400">{results.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
