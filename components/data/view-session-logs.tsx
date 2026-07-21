'use client'

import { useCallback, useEffect, useState } from 'react'
import { Minus, Plus, Save, Check, Loader2, ClipboardPen, History, ChevronDown, MapPin } from 'lucide-react'
import type { Vehicle } from './rig-shell'

type PastSession = {
  id: string
  trackName: string
  trackConditions: string | null
  riderFeedback: string | null
  sessionDate: string | null
  createdAt: string | null
  setup: { key: string; value: string }[]
}

function NumberStepper({
  label,
  unit,
  value,
  step = 1,
  onChange,
}: {
  label: string
  unit?: string
  value: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">{label}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, +(value - step).toFixed(1)))}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-200 active:bg-zinc-700 transition-colors"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-3xl font-black text-zinc-50 tabular-nums">{value}</span>
          {unit && <span className="text-sm text-zinc-500 ml-1">{unit}</span>}
        </div>
        <button
          onClick={() => onChange(+(value + step).toFixed(1))}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-zinc-950 active:bg-lime-300 transition-colors"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

function Dropdown({
  label,
  options,
  values,
  value,
  onChange,
}: {
  label: string
  options: string[]
  values?: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none appearance-none"
      >
        {options.length === 0 && <option value="">No vehicles</option>}
        {options.map((o, i) => (
          <option key={values?.[i] ?? o} value={values?.[i] ?? o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function ViewSessionLogs({ vehicles }: { vehicles: Vehicle[] }) {
  const [vehicleId, setVehicleId] = useState('')
  const [track, setTrack] = useState('')
  const [sessionType, setSessionType] = useState('Practice')
  const [conditions, setConditions] = useState('Hard Pack')
  const [forkComp, setForkComp] = useState(12)
  const [forkReb, setForkReb] = useState(10)
  const [shock, setShock] = useState(105)
  const [tireF, setTireF] = useState(12.5)
  const [tireR, setTireR] = useState(13.0)
  const [ecu, setEcu] = useState(2)
  const [feedback, setFeedback] = useState('')
  const [bestLapMin, setBestLapMin] = useState(0)
  const [bestLapSec, setBestLapSec] = useState(0)
  const [lapTimedSession, setLapTimedSession] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [tab, setTab] = useState<'new' | 'history'>('new')
  const [history, setHistory] = useState<PastSession[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Default to the first vehicle once the fleet loads; keep selection valid if it changes.
  useEffect(() => {
    if (vehicles.length && !vehicles.some((v) => v.id === vehicleId)) {
      setVehicleId(vehicles[0].id)
    }
  }, [vehicles, vehicleId])

  const loadHistory = useCallback(async (vid: string) => {
    if (!vid) return
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/log-session?vehicleId=${vid}`)
      const data = await res.json()
      if (data.success) setHistory(data.sessions ?? [])
    } catch {
      /* offline */
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'history' && vehicleId) loadHistory(vehicleId)
  }, [tab, vehicleId, loadHistory])

  async function save() {
    setError('')
    if (!vehicleId) {
      setError('Select a vehicle first.')
      return
    }
    if (!track.trim()) {
      setError('Enter a track name.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/log-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          trackName: track.trim(),
          trackConditions: conditions,
          riderFeedback: feedback,
          sessionHours: 0.5,
          bestLapSeconds: lapTimedSession ? bestLapMin * 60 + bestLapSec : undefined,
          setup: [
            { key: 'Session Type', value: sessionType },
            { key: 'Fork Compression', value: `${forkComp} clicks out` },
            { key: 'Fork Rebound', value: `${forkReb} clicks out` },
            { key: 'Shock Sag', value: `${shock}mm` },
            { key: 'Front Tire PSI', value: `${tireF}` },
            { key: 'Rear Tire PSI', value: `${tireR}` },
            { key: 'ECU Map', value: `Map ${ecu}` },
          ],
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Save failed')
      setSaved(true)
      setFeedback('')
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const activeName = vehicles.find((v) => v.id === vehicleId)?.name ?? 'No vehicle selected'

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="inline-flex rounded-xl bg-zinc-900 border border-zinc-800 p-1">
          <button
            onClick={() => setTab('new')}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === 'new' ? 'bg-lime-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <ClipboardPen className="h-4 w-4" /> New Entry
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === 'history' ? 'bg-lime-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <History className="h-4 w-4" /> History
          </button>
        </div>
        <span className="text-sm text-zinc-400">{activeName}</span>
      </div>

      {tab === 'history' ? (
        <div>
          {historyLoading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading history…
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500 mb-4">
                <History className="h-7 w-7" />
              </span>
              <p className="text-lg font-bold text-zinc-200">No sessions logged yet</p>
              <p className="text-sm text-zinc-500 mt-1">Save a setup sheet and it&apos;ll show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((s) => {
                const open = expandedId === s.id
                const dateStr = s.sessionDate || (s.createdAt ? s.createdAt.slice(0, 10) : '')
                return (
                  <div key={s.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <button
                      onClick={() => setExpandedId(open ? null : s.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lime-400/15 text-lime-400">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-100 truncate">{s.trackName}</p>
                        <p className="text-sm text-zinc-500">
                          {dateStr}
                          {s.trackConditions ? ` · ${s.trackConditions}` : ''}
                        </p>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-zinc-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="px-5 pb-5 border-t border-zinc-800 pt-4 space-y-4">
                        {s.setup.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                            {s.setup.map((p, i) => (
                              <div key={i} className="flex items-baseline justify-between gap-3 border-b border-zinc-800/60 py-1.5">
                                <span className="text-sm text-zinc-500">{p.key}</span>
                                <span className="text-sm font-semibold text-zinc-200 text-right">{p.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {s.riderFeedback && (
                          <div>
                            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Rider Feedback</p>
                            <p className="text-sm text-zinc-300 leading-relaxed">{s.riderFeedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Dropdown
            label="Vehicle"
            value={vehicleId}
            onChange={setVehicleId}
            options={vehicles.map((v) => v.name)}
            values={vehicles.map((v) => v.id)}
          />
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Track</label>
            <input
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              placeholder="e.g. Washougal, Thunder Valley"
              className="w-full h-14 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Dropdown
            label="Session Type"
            value={sessionType}
            onChange={setSessionType}
            options={['Practice', 'Qualifying', 'Timed Session', 'Moto 1', 'Moto 2', 'Test Day']}
          />
          <Dropdown
            label="Track Conditions"
            value={conditions}
            onChange={setConditions}
            options={['Hard Pack', 'Loamy', 'Sandy', 'Muddy', 'Rutted', 'Dusty / Dry', 'Prepped / Tacky']}
          />
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-zinc-400 mb-3">Suspension & Setup</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <NumberStepper label="Front Fork — Comp (clicks)" value={forkComp} onChange={setForkComp} />
            <NumberStepper label="Front Fork — Reb (clicks)" value={forkReb} onChange={setForkReb} />
            <NumberStepper label="Rear Shock Sag" unit="mm" value={shock} onChange={setShock} />
            <NumberStepper label="Tire Pressure — Front" unit="psi" value={tireF} step={0.5} onChange={setTireF} />
            <NumberStepper label="Tire Pressure — Rear" unit="psi" value={tireR} step={0.5} onChange={setTireR} />
            <NumberStepper label="ECU Map" value={ecu} onChange={setEcu} />
          </div>
        </div>

        {/* Lap Time — optional */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold uppercase tracking-wide text-zinc-400">Best Lap Time</p>
            <button
              type="button"
              onClick={() => setLapTimedSession((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                lapTimedSession ? 'bg-lime-400' : 'bg-zinc-700'
              }`}
              aria-pressed={lapTimedSession}
              aria-label="Toggle lap timing"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  lapTimedSession ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {lapTimedSession ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Minutes</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setBestLapMin((v) => Math.max(0, v - 1))} className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 active:bg-zinc-700"><Minus className="h-4 w-4" /></button>
                  <span className="flex-1 text-center text-2xl font-black text-zinc-50 tabular-nums">{bestLapMin}</span>
                  <button onClick={() => setBestLapMin((v) => v + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-400 text-zinc-950 active:bg-lime-300"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <span className="text-3xl font-black text-zinc-500 mb-1">:</span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Seconds</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setBestLapSec((v) => Math.max(0, +(v - 0.1).toFixed(1)))} className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 active:bg-zinc-700"><Minus className="h-4 w-4" /></button>
                  <span className="flex-1 text-center text-2xl font-black text-zinc-50 tabular-nums">{bestLapSec.toFixed(1)}</span>
                  <button onClick={() => setBestLapSec((v) => +(Math.min(59.9, v + 0.1)).toFixed(1))} className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-400 text-zinc-950 active:bg-lime-300"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="text-zinc-500 text-sm mb-1 whitespace-nowrap">
                = {bestLapMin}:{bestLapSec.toFixed(1).padStart(4, '0')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-600">Toggle on to record a timed lap for progression tracking.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide text-zinc-400 mb-2">
            Rider Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            placeholder="Front felt harsh over braking bumps, rear squatted on corner exit..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-lg text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none resize-none"
          />
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-400 text-center" role="alert">
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-black uppercase tracking-wide transition-colors disabled:opacity-60 ${
            saved ? 'bg-lime-300 text-zinc-950' : 'bg-lime-400 text-zinc-950 active:bg-lime-300'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <Check className="h-6 w-6" /> Session Saved
            </>
          ) : (
            <>
              <Save className="h-6 w-6" /> Save Session
            </>
          )}
        </button>
      </div>
      )}
    </div>
  )
}
