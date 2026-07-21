'use client'

import { useState } from 'react'
import { createBatchTeamAccounts } from '@/app/actions/create-batch-teams'

export default function BatchTeamSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateAccounts = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await createBatchTeamAccounts({
        emailPrefix: 'ptown',
        domain: 'motorsportsdata.io',
        password: 'thaddyboy454',
        plans: ['rookie', 'privateer', 'race_team'], // In ascending order
      })

      if (response.success) {
        setResult(response.data)
      } else {
        setError('Failed to create batch accounts')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h1 className="text-2xl font-black uppercase tracking-widest text-lime-400 mb-2">
            Batch Team Setup
          </h1>
          <p className="text-zinc-400 text-sm mb-8">
            Create test accounts for all plan tiers
          </p>

          <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg space-y-2">
            <p className="font-mono text-xs text-zinc-400">Accounts to create:</p>
            <ul className="font-mono text-sm text-zinc-300 space-y-1">
              <li>• ptown1@motorsportsdata.io (Rookie) — password: thaddyboy454</li>
              <li>• ptown2@motorsportsdata.io (Privateer) — password: thaddyboy454</li>
              <li>• ptown3@motorsportsdata.io (Race Team) — password: thaddyboy454</li>
            </ul>
          </div>

          <button
            onClick={handleCreateAccounts}
            disabled={loading}
            className="w-full bg-lime-400 text-zinc-950 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'CREATE BATCH ACCOUNTS'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="font-mono text-sm text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-lime-400/10 border border-lime-400 rounded-lg">
                <p className="font-black uppercase text-lime-400 text-sm mb-3">
                  ✓ Batch Creation Complete
                </p>
                <div className="font-mono text-xs text-zinc-300 space-y-1">
                  <p>Total Accounts: {result.summary.total}</p>
                  <p>Successfully Created: {result.summary.created}</p>
                  <p>Failed: {result.summary.failed}</p>
                </div>
              </div>

              <div className="space-y-2">
                {result.data.map((account: any, i: number) => (
                  <div key={i} className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-mono text-sm text-zinc-300">{account.email}</p>
                      <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-zinc-700 text-zinc-200">
                        {account.tier}
                      </span>
                    </div>
                    {account.success ? (
                      <p className="font-mono text-xs text-lime-400">✓ Created</p>
                    ) : (
                      <p className="font-mono text-xs text-red-400">✗ {account.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
