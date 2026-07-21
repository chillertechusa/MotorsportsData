'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Lock,
  Search,
  UserPlus,
  Clock,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { searchRiders, requestRiderAccess } from '@/app/actions/agent-portal'

type Entry = {
  grantId: string
  teamId: string
  riderName: string
  riderClass: string | null
  discipline: string | null
  status: string
  requestedAt: string | null
  grantedAt: string | null
}

type SearchResult = {
  teamId: string
  riderName: string
  riderClass: string | null
  discipline: string | null
}

export function AgentRoster({
  account,
  entitled,
  entries,
}: {
  account: { orgName: string; verificationStatus: string; seatIncludedRiders: number }
  entitled: boolean
  entries: Entry[]
}) {
  const granted = entries.filter((e) => e.status === 'granted')
  const pending = entries.filter((e) => e.status === 'pending')

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10 ring-1 ring-lime-400/30">
              <Briefcase className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">Agent Portal</p>
              <h1 className="text-2xl font-black tracking-tight">{account.orgName}</h1>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              account.verificationStatus === 'verified'
                ? 'bg-lime-400/10 text-lime-300 ring-1 ring-lime-400/30'
                : 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {account.verificationStatus === 'verified' ? 'Verified' : 'Verification pending'}
          </span>
        </div>

        {!entitled && <EntitlementGate />}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Active Riders" value={granted.length} />
          <Stat label="Pending Requests" value={pending.length} />
          <Stat label="Seat Includes" value={account.seatIncludedRiders} />
        </div>

        <RequestAccess entitled={entitled} />

        {/* Roster */}
        <section className="mt-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            Your Roster
          </h2>
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
              <p className="text-zinc-400">
                No riders yet. Use the search above to request access to riders you represent.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {entries.map((e) => (
                <RosterRow key={e.grantId} entry={e} entitled={entitled} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

function EntitlementGate() {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-lime-400/30 bg-gradient-to-br from-lime-400/10 to-zinc-900/40 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-lime-400/15">
          <Lock className="h-5 w-5 text-lime-300" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-black">Activate your subscription to unlock rider data</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-300">
            Your account is set up, but rider performance profiles and pitch exports stay locked until your
            agent subscription is active. Your base seat includes 3 riders, with per-rider pricing as your
            roster grows.
          </p>
          <Link
            href="/checkout/tier?tier=agent"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-zinc-950 transition-colors hover:bg-lime-300"
          >
            Activate subscription
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <p className="text-2xl font-black text-lime-400">{value}</p>
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">{label}</p>
    </div>
  )
}

function RequestAccess({ entitled }: { entitled: boolean }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, startSearch] = useTransition()
  const [isRequesting, startRequest] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startSearch(async () => {
      const res = await searchRiders(query)
      setResults(res)
      if (res.length === 0) setMessage('No riders matched that search.')
    })
  }

  function handleRequest(teamId: string, name: string) {
    startRequest(async () => {
      const res = await requestRiderAccess(teamId)
      if (res.ok) {
        setMessage(`Access requested for ${name}. They'll be notified to approve.`)
        setResults((r) => r.filter((x) => x.teamId !== teamId))
        router.refresh()
      } else {
        setMessage(res.error)
      }
    })
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
        <UserPlus className="h-4 w-4" /> Request rider access
      </h2>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search riders by name…"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-9 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/40"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || query.trim().length < 2}
          className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-white disabled:opacity-50"
        >
          {isSearching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-zinc-400">{message}</p>}

      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((r) => (
            <li
              key={r.teamId}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-100">{r.riderName}</p>
                <p className="text-xs text-zinc-500">
                  {[r.riderClass, r.discipline].filter(Boolean).join(' • ') || 'No class info'}
                </p>
              </div>
              <button
                onClick={() => handleRequest(r.teamId, r.riderName)}
                disabled={isRequesting}
                className="rounded-lg border border-lime-400/40 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-lime-300 transition-colors hover:bg-lime-400/10 disabled:opacity-50"
              >
                Request
              </button>
            </li>
          ))}
        </ul>
      )}
      {!entitled && (
        <p className="mt-3 text-xs text-zinc-600">
          You can request riders now; their data unlocks once you&apos;re subscribed and they approve.
        </p>
      )}
    </section>
  )
}

function RosterRow({ entry, entitled }: { entry: Entry; entitled: boolean }) {
  const isGranted = entry.status === 'granted'
  const canView = isGranted && entitled

  return (
    <li className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold text-zinc-100">{entry.riderName}</p>
          {isGranted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-300">
              <CheckCircle2 className="h-3 w-3" /> Granted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
              <Clock className="h-3 w-3" /> Pending
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {[entry.riderClass, entry.discipline].filter(Boolean).join(' • ') || 'No class info'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {canView ? (
          <>
            <Link
              href={`/data/agent/rider/${entry.teamId}`}
              className="rounded-lg bg-lime-400 px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-950 transition-colors hover:bg-lime-300"
            >
              View Profile
            </Link>
            <a
              href={`/api/agent/pitch/${entry.teamId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-500"
            >
              <FileText className="h-3.5 w-3.5" /> Pitch PDF
            </a>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-600">
            <Lock className="h-3.5 w-3.5" />
            {isGranted ? 'Subscribe to view' : 'Awaiting approval'}
          </span>
        )}
      </div>
    </li>
  )
}
