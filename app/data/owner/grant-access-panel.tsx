'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Search, ShieldCheck, X, CalendarDays, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'
import { searchTeams, grantPlanAccess, revokePlanAccess, type TeamSearchResult } from '@/app/actions/md-owner'
import { MD_PLAN_IDS, MD_PLAN_LABELS, MD_PLAN_CENTS, type MdPlanId } from '@/lib/md-plans'

const TIER_COLORS: Record<MdPlanId, string> = {
  rookie:      'text-zinc-300 bg-zinc-800 border-zinc-700',
  privateer:   'text-blue-300 bg-blue-950 border-blue-800',
  wrench:      'text-sky-300 bg-sky-950 border-sky-800',
  race_team:   'text-amber-300 bg-amber-950 border-amber-800',
  factory_rig: 'text-lime-300 bg-lime-950 border-lime-800',
  agent:       'text-violet-300 bg-violet-950 border-violet-800',
  fan:         'text-zinc-400 bg-zinc-900 border-zinc-800',
  coach:       'text-emerald-300 bg-emerald-950 border-emerald-800',
}

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}/mo`
}

export function GrantAccessPanel() {
  const [query, setQuery]               = useState('')
  const [results, setResults]           = useState<TeamSearchResult[]>([])
  const [selected, setSelected]         = useState<TeamSearchResult | null>(null)
  const [tier, setTier]                 = useState<MdPlanId>('privateer')
  const [hasExpiry, setHasExpiry]       = useState(false)
  const [expiryDate, setExpiryDate]     = useState('')
  const [toast, setToast]               = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [searching, startSearch]        = useTransition()
  const [granting, startGrant]          = useTransition()
  const [revoking, startRevoke]         = useTransition()
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current)
    if (query.trim().length < 2) { setResults([]); return }
    searchRef.current = setTimeout(() => {
      startSearch(async () => {
        const r = await searchTeams(query)
        setResults(r)
      })
    }, 300)
  }, [query])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  function pickTeam(team: TeamSearchResult) {
    setSelected(team)
    setTier((team.currentTier as MdPlanId) ?? 'privateer')
    setQuery('')
    setResults([])
  }

  function handleGrant() {
    if (!selected) return
    startGrant(async () => {
      const expiry = hasExpiry && expiryDate ? expiryDate : null
      const res = await grantPlanAccess(selected.teamId, tier, expiry)
      if (res.ok) {
        setToast({
          type: 'ok',
          msg: `${res.teamName} granted ${res.tier}${res.expiresAt ? ` — expires ${res.expiresAt}` : ' (permanent)'}`,
        })
        setSelected(null)
        setHasExpiry(false)
        setExpiryDate('')
      } else {
        setToast({ type: 'err', msg: res.error })
      }
    })
  }

  function handleRevoke(teamId: string, teamName: string) {
    startRevoke(async () => {
      const res = await revokePlanAccess(teamId)
      if (res.ok) {
        setToast({ type: 'ok', msg: `${teamName} access revoked.` })
        setSelected(null)
      } else {
        setToast({ type: 'err', msg: res.error ?? 'Revoke failed.' })
      }
    })
  }

  // Min date = tomorrow
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400/10 border border-lime-400/20">
          <ShieldCheck className="h-4.5 w-4.5 text-lime-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-100">Grant Plan Access</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Override any team&apos;s tier instantly — permanent or timed</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm border ${
          toast.type === 'ok'
            ? 'bg-lime-950 border-lime-800 text-lime-300'
            : 'bg-red-950 border-red-800 text-red-300'
        }`}>
          {toast.type === 'ok'
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <AlertCircle   className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Step 1 — search */}
      <div className="mb-4">
        <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
          Step 1 — Search team or owner email
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Yamaha Factory, john@example.com…"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-lime-500 transition-colors"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Search results dropdown */}
        {results.length > 0 && (
          <div className="mt-1 rounded-xl border border-zinc-700 bg-zinc-950 overflow-hidden divide-y divide-zinc-800">
            {results.map((r) => (
              <button
                key={r.teamId}
                onClick={() => pickTeam(r)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{r.teamName}</p>
                  <p className="text-xs text-zinc-500">{r.ownerEmail ?? 'No owner email'}</p>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${TIER_COLORS[r.currentTier as MdPlanId] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
                  {r.currentTierLabel}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected team */}
      {selected && (
        <div className="mb-5 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-zinc-100">{selected.teamName}</p>
            <p className="text-xs text-zinc-500">{selected.ownerEmail ?? 'No owner email'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${TIER_COLORS[selected.currentTier as MdPlanId] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
              Currently: {selected.currentTierLabel}
            </span>
            <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — pick tier */}
      <div className={`mb-4 transition-opacity ${selected ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
          Step 2 — Choose tier to grant
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MD_PLAN_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setTier(id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                tier === id
                  ? 'border-lime-500 bg-lime-950 text-lime-300'
                  : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider">{MD_PLAN_LABELS[id]}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{fmt(MD_PLAN_CENTS[id])}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 — expiry */}
      <div className={`mb-6 transition-opacity ${selected ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
          Step 3 — Duration
        </label>
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="expiry"
              checked={!hasExpiry}
              onChange={() => setHasExpiry(false)}
              className="accent-lime-400"
            />
            <span className="text-sm text-zinc-300">Permanent</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="expiry"
              checked={hasExpiry}
              onChange={() => setHasExpiry(true)}
              className="accent-lime-400"
            />
            <span className="text-sm text-zinc-300">Set expiry date</span>
          </label>
          {hasExpiry && (
            <div className="flex items-center gap-2 ml-2">
              <CalendarDays className="h-4 w-4 text-zinc-500 shrink-0" />
              <input
                type="date"
                min={minDateStr}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-lime-500 transition-colors"
              />
            </div>
          )}
        </div>
        {hasExpiry && expiryDate && (
          <p className="mt-2 text-xs text-zinc-500">
            Access will expire on <span className="text-zinc-300">{new Date(expiryDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>. After that, subscription status remains active until next renewal check — add a cron job to auto-expire if needed.
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGrant}
          disabled={!selected || granting || (hasExpiry && !expiryDate)}
          className="flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {granting
            ? <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            : <ShieldCheck className="h-4 w-4" />}
          {granting ? 'Granting…' : 'Grant Access'}
        </button>

        {selected && selected.status === 'active' && (
          <button
            onClick={() => handleRevoke(selected.teamId, selected.teamName)}
            disabled={revoking}
            className="flex items-center gap-2 rounded-xl border border-red-800 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-red-400 hover:bg-red-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {revoking
              ? <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              : <Trash2 className="h-4 w-4" />}
            {revoking ? 'Revoking…' : 'Revoke Access'}
          </button>
        )}
      </div>
    </div>
  )
}
