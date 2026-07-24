'use client'

import { useState } from 'react'
import { createAgentAndFanAccounts } from '@/app/actions/create-agent-fan-accounts'

export default function SetupAgentFanPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null | undefined>(null)

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await createAgentAndFanAccounts()
      if (res.success) {
        setResult(res.data)
      } else {
        setError(res.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 pt-32">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-black text-zinc-50 mb-4">Create Agent + Fan Test Accounts</h1>
        <p className="text-zinc-400 mb-12">Setup accounts for Agent tier ($999/mo) and Fan tier (free)</p>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-black text-zinc-50 mb-4">Accounts to Create</h2>
          <div className="space-y-4">
            <div className="border border-zinc-800 bg-zinc-950/50 p-4 rounded">
              <p className="font-semibold text-zinc-300">Agent Tier</p>
              <p className="text-sm text-zinc-400 mt-1">Email: ptown_agent@motorsportsdata.io</p>
              <p className="text-sm text-zinc-400">Password: thaddyboy454</p>
              <p className="text-sm text-lime-400 mt-2">Premium B2B ($999/mo)</p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950/50 p-4 rounded">
              <p className="font-semibold text-zinc-300">Fan Tier</p>
              <p className="text-sm text-zinc-400 mt-1">Email: ptown_fan@motorsportsdata.io</p>
              <p className="text-sm text-zinc-400">Password: thaddyboy454</p>
              <p className="text-sm text-lime-400 mt-2">Community Engagement (Free)</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-lime-400 text-zinc-950 px-8 py-4 rounded font-black uppercase tracking-widest hover:bg-lime-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'CREATE AGENT + FAN ACCOUNTS'}
        </button>

        {error && (
          <div className="mt-8 bg-red-950/30 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 font-semibold">Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 bg-lime-950/30 border border-lime-800 rounded-lg p-4">
            <p className="text-lime-400 font-semibold">✓ Accounts Created</p>
            <div className="mt-4 space-y-3">
              <div className="border-l-2 border-lime-400 pl-3">
                <p className="text-lime-300 text-sm font-semibold">{result.agent.email}</p>
                <p className="text-lime-400 text-xs mt-1">Agent Tier • $999/mo</p>
              </div>
              <div className="border-l-2 border-lime-400 pl-3">
                <p className="text-lime-300 text-sm font-semibold">{result.fan.email}</p>
                <p className="text-lime-400 text-xs mt-1">Fan Tier • Free</p>
              </div>
            </div>
            <p className="text-lime-300 text-xs mt-4">Both accounts ready for testing at /data/sign-in</p>
          </div>
        )}
      </div>
    </main>
  )
}
