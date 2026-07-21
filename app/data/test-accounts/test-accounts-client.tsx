'use client'

import { useState } from 'react'
import { seedTestAccounts } from '@/app/actions/md-seed-test-accounts'
import { TEST_ACCOUNTS, type SeedResult } from '@/lib/md-test-accounts'
import { CheckCircle2, RefreshCw, Copy, ExternalLink, Shield } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  rookie: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
  privateer: 'text-lime-400 border-lime-500/40 bg-lime-500/10',
  race_team: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  factory_rig: 'text-red-400 border-red-500/40 bg-red-500/10',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  created: { label: 'Created', color: 'text-lime-400' },
  already_exists: { label: 'Already existed', color: 'text-zinc-400' },
  tier_updated: { label: 'Tier reset', color: 'text-sky-400' },
  error: { label: 'Error', color: 'text-red-400' },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="ml-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
      title="Copy"
    >
      {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-lime-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

export default function TestAccountsPage() {
  const [results, setResults] = useState<SeedResult[] | null>(null)
  const [running, setRunning] = useState(false)

  const handleSeed = async () => {
    setRunning(true)
    try {
      const r = await seedTestAccounts()
      setResults(r)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 font-mono">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-zinc-500" />
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-sans">Internal QA — not indexed</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wide text-zinc-50">Test Accounts</h1>
            <p className="text-zinc-500 text-sm mt-1 font-sans">
              One account per tier. Seed creates them if missing, resets tier if already present.
              Passwords never change once set.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 font-bold text-sm uppercase tracking-wider hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Seeding...' : 'Seed / Reset'}
          </button>
        </div>

        {/* Seed results */}
        {results && (
          <div className="rounded-xl border border-zinc-800 divide-y divide-zinc-800">
            {results.map((r) => {
              const s = STATUS_LABELS[r.status] ?? { label: r.status, color: 'text-zinc-400' }
              return (
                <div key={r.account.email} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-zinc-300">{r.account.email}</span>
                  <span className={`font-bold ${s.color}`}>{s.label}{r.detail ? ` — ${r.detail}` : ''}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Account cards */}
        <div className="space-y-4">
          {TEST_ACCOUNTS.map((account) => {
            const tierClass = TIER_COLORS[account.tier] ?? 'text-zinc-400 border-zinc-700 bg-zinc-800/50'
            return (
              <div
                key={account.email}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4"
              >
                {/* Tier badge + price */}
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest ${tierClass}`}>
                    {account.label}
                  </span>
                  <span className="text-zinc-500 text-sm font-sans">{account.price}</span>
                </div>

                {/* Credentials */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 bg-zinc-950 rounded-lg px-3 py-2">
                    <span className="text-zinc-600 w-16 shrink-0 font-sans text-xs">EMAIL</span>
                    <span className="text-zinc-200 flex-1 break-all">{account.email}</span>
                    <CopyButton text={account.email} />
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950 rounded-lg px-3 py-2">
                    <span className="text-zinc-600 w-16 shrink-0 font-sans text-xs">PASS</span>
                    <span className="text-zinc-200 flex-1">{account.password}</span>
                    <CopyButton text={account.password} />
                  </div>
                </div>

                {/* Login link */}
                <a
                  href={account.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-sans"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open login page
                </a>
              </div>
            )
          })}
        </div>

        {/* Checkout test note */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm font-sans space-y-2">
          <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Checkout test note</p>
          <p className="text-zinc-500 leading-relaxed">
            Square is in <span className="text-red-400 font-bold">PRODUCTION</span> mode — any checkout
            test will charge a real card. To safely test the checkout flow, log in as any account above
            (they are pre-seeded with an active tier so the rig loads), then go to{' '}
            <a href="/data/pricing" className="text-lime-400 underline">/data/pricing</a> and
            attempt to subscribe to a different plan to exercise the full charge path.
            Use a Square sandbox account by adding{' '}
            <code className="text-sky-400">NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-...</code>{' '}
            in Vercel env vars (Preview environment) to run a zero-money end-to-end test.
          </p>
        </div>

      </div>
    </div>
  )
}
