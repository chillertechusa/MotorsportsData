'use client'

import { useState } from 'react'
import { Cloud, Thermometer, Wind, Droplets, Loader2, Check, Share2, ChevronDown, ChevronUp, Sparkles, AlertCircle, Copy } from 'lucide-react'
import { saveSetupSheet } from '@/app/actions/md-setup-sheet'
import type { Vehicle } from '@/components/data/rig-shell'

type AiRecommendation = {
  summary?: string
  weatherImpact?: string
  suspensionRecommendations?: string[]
  jettigRecommendations?: string[]
  tireRecommendations?: string[]
  priorityAction?: string
  confidenceScore?: number
}

const TRACK_SURFACES = ['Hard pack', 'Loamy', 'Sandy', 'Muddy', 'Mixed', 'Rocky', 'Rutted']
const AIR_FILTER_CONDITIONS = ['Fresh / oiled', 'Good', 'Needs cleaning', 'Needs replacement']
const ENGINE_MAPS = ['Map 1 (standard)', 'Map 2 (aggressive)', 'Map 3 (soft)', 'Custom']

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-left"
    >
      <span className="text-sm font-bold uppercase tracking-widest text-zinc-300">{title}</span>
      {open ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
    </button>
  )
}

function FieldText({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400 transition-colors"
      />
    </div>
  )
}

function FieldNumber({ label, unit, value, onChange }: { label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 pr-12 text-sm text-zinc-100 focus:outline-none focus:border-lime-400 transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{unit}</span>
      </div>
    </div>
  )
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-lime-400 transition-colors appearance-none"
      >
        <option value="">— select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

type Suspension = { forkComp: string; forkReb: string; shockComp: string; shockReb: string; sagMm: string }

export function SetupSheetForm({ vehicles }: { vehicles: Vehicle[] }) {
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? '')
  const [trackName, setTrackName] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [isPublic, setIsPublic] = useState(false)

  // Weather
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [tempF, setTempF] = useState('')
  const [humidityPct, setHumidityPct] = useState('')
  const [windMph, setWindMph] = useState('')
  const [trackSurface, setTrackSurface] = useState('')
  const [weatherDescription, setWeatherDescription] = useState('')
  const [resolvedLocation, setResolvedLocation] = useState('')

  // Tires
  const [tireFront, setTireFront] = useState('')
  const [tireRear, setTireRear] = useState('')
  const [tirePressureFront, setTirePressureFront] = useState('')
  const [tirePressureRear, setTirePressureRear] = useState('')

  // Engine
  const [fuelMix, setFuelMix] = useState('')
  const [jetNeedle, setJetNeedle] = useState('')
  const [airFilterCondition, setAirFilterCondition] = useState('')
  const [engineMap, setEngineMap] = useState('')

  // Suspension
  const [suspension, setSuspension] = useState<Suspension>({ forkComp: '', forkReb: '', shockComp: '', shockReb: '', sagMm: '' })

  // Rider notes
  const [riderFeedback, setRiderFeedback] = useState('')

  // Section open state
  const [openWeather, setOpenWeather] = useState(true)
  const [openTires, setOpenTires] = useState(true)
  const [openEngine, setOpenEngine] = useState(true)
  const [openSuspension, setOpenSuspension] = useState(true)

  // Save + AI state
  const [saving, setSaving] = useState(false)
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<AiRecommendation | null>(null)
  const [aiError, setAiError] = useState('')

  async function autoFillWeather() {
    if (!trackName.trim()) { setWeatherError('Enter a track name first'); return }
    setWeatherLoading(true)
    setWeatherError('')
    try {
      const res = await fetch(`/api/md-weather?track=${encodeURIComponent(trackName)}`)
      if (!res.ok) { setWeatherError('Location not found — enter manually'); return }
      const data = await res.json()
      setTempF(String(data.tempF))
      setHumidityPct(String(data.humidityPct))
      setWindMph(String(data.windMph))
      setWeatherDescription(data.description)
      setResolvedLocation(data.resolvedLocation)
      if (!trackSurface && data.trackConditions === 'Wet') setTrackSurface('Muddy')
    } finally {
      setWeatherLoading(false)
    }
  }

  async function handleSave() {
    if (!trackName.trim()) return
    setSaving(true)
    const suspensionSetup = [
      suspension.forkComp && { key: 'Fork Compression (clicks out)', value: suspension.forkComp },
      suspension.forkReb && { key: 'Fork Rebound (clicks out)', value: suspension.forkReb },
      suspension.shockComp && { key: 'Shock Compression (clicks out)', value: suspension.shockComp },
      suspension.shockReb && { key: 'Shock Rebound (clicks out)', value: suspension.shockReb },
      suspension.sagMm && { key: 'Sag (mm)', value: suspension.sagMm },
    ].filter(Boolean) as { key: string; value: string }[]

    const result = await saveSetupSheet({
      vehicleId,
      trackName,
      sessionDate,
      ambientTempF: tempF ? Number(tempF) : undefined,
      humidityPct: humidityPct ? Number(humidityPct) : undefined,
      windMph: windMph ? Number(windMph) : undefined,
      trackSurface: trackSurface || undefined,
      tireFront: tireFront || undefined,
      tireRear: tireRear || undefined,
      tirePressureFront: tirePressureFront ? Number(tirePressureFront) : undefined,
      tirePressureRear: tirePressureRear ? Number(tirePressureRear) : undefined,
      fuelMix: fuelMix || undefined,
      jetNeedle: jetNeedle || undefined,
      airFilterCondition: airFilterCondition || undefined,
      engineMap: engineMap || undefined,
      suspensionSetup,
      riderFeedback: riderFeedback || undefined,
      isPublic,
    })
    setSaving(false)
    if (result.success) {
      setSavedSessionId(result.sessionId ?? null)
      setShareToken(result.shareToken ?? null)
    }
  }

  async function getAiRecommendation() {
    if (!savedSessionId) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/md-setup-sheet-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: savedSessionId }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setRecommendation(data.recommendation)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI unavailable')
    } finally {
      setAiLoading(false)
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/setups/${shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (savedSessionId && !recommendation && !aiLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <div className="rounded-2xl bg-zinc-900 border border-lime-400/30 p-6 text-center">
          <Check className="h-10 w-10 text-lime-400 mx-auto mb-3" />
          <h2 className="text-xl font-black text-zinc-50 mb-1">Setup sheet saved</h2>
          <p className="text-sm text-zinc-400 mb-6">Session logged for {trackName}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={getAiRecommendation}
              className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 text-zinc-950 font-bold px-6 py-3 active:bg-lime-300 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Get AI Recommendations
            </button>
            {isPublic && shareToken && (
              <button
                onClick={copyShareLink}
                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold px-6 py-3 active:bg-zinc-700 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-lime-400" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy public link'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (recommendation) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-lime-400" />
            <h2 className="text-lg font-black text-zinc-50">AI Setup Recommendations</h2>
            {recommendation.confidenceScore && (
              <span className="ml-auto text-xs font-bold text-lime-400 bg-lime-400/10 rounded-full px-2 py-0.5">
                {recommendation.confidenceScore}% confidence
              </span>
            )}
          </div>

          {recommendation.summary && (
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">{recommendation.summary}</p>
          )}

          {recommendation.priorityAction && (
            <div className="rounded-xl bg-lime-400/10 border border-lime-400/30 p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-lime-400 font-bold mb-1">Priority action</p>
              <p className="text-sm text-zinc-100 font-semibold">{recommendation.priorityAction}</p>
            </div>
          )}

          {recommendation.weatherImpact && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Weather impact</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{recommendation.weatherImpact}</p>
            </div>
          )}

          {[
            { label: 'Suspension', items: recommendation.suspensionRecommendations },
            { label: 'Jetting', items: recommendation.jettigRecommendations },
            { label: 'Tires', items: recommendation.tireRecommendations },
          ].map(({ label, items }) => items?.length ? (
            <div key={label} className="mb-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
              <ul className="flex flex-col gap-1">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <span className="text-lime-400 shrink-0">—</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null)}

          {isPublic && shareToken && (
            <button
              onClick={copyShareLink}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold px-6 py-3 active:bg-zinc-700 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-lime-400" /> : <Share2 className="h-4 w-4" />}
              {copied ? 'Link copied!' : 'Share setup sheet'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto pb-8">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-black text-zinc-50">Setup Sheet</h1>
        <p className="text-sm text-zinc-400">Log your full setup with live weather. AI analyzes it after saving.</p>
      </div>

      {/* Bike + date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Bike</p>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-lime-400 transition-colors appearance-none"
          >
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Date</p>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>
      </div>

      {/* Track */}
      <FieldText label="Track name" value={trackName} onChange={setTrackName} placeholder="e.g. Pala Raceway, Elsinore GP" />

      {/* Weather section */}
      <div className="flex flex-col gap-3">
        <SectionHeader title="Weather" open={openWeather} onToggle={() => setOpenWeather((v) => !v)} />
        {openWeather && (
          <div className="flex flex-col gap-3 pl-1">
            <button
              type="button"
              onClick={autoFillWeather}
              disabled={weatherLoading}
              className="flex items-center gap-2 self-start rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 active:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {weatherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4 text-sky-400" />}
              Auto-fill from track location
            </button>
            {weatherError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" />{weatherError}</p>
            )}
            {resolvedLocation && (
              <p className="text-xs text-zinc-500">Weather for: <span className="text-zinc-300">{resolvedLocation}</span> — {weatherDescription}</p>
            )}
            <div className="grid grid-cols-3 gap-3">
              <FieldNumber label="Temp" unit="°F" value={tempF} onChange={setTempF} />
              <FieldNumber label="Humidity" unit="%" value={humidityPct} onChange={setHumidityPct} />
              <FieldNumber label="Wind" unit="mph" value={windMph} onChange={setWindMph} />
            </div>
            <FieldSelect label="Track surface" value={trackSurface} onChange={setTrackSurface} options={TRACK_SURFACES} />
          </div>
        )}
      </div>

      {/* Tires section */}
      <div className="flex flex-col gap-3">
        <SectionHeader title="Tires" open={openTires} onToggle={() => setOpenTires((v) => !v)} />
        {openTires && (
          <div className="flex flex-col gap-3 pl-1">
            <div className="grid grid-cols-2 gap-3">
              <FieldText label="Front tire" value={tireFront} onChange={setTireFront} placeholder="e.g. Dunlop MX33" />
              <FieldText label="Rear tire" value={tireRear} onChange={setTireRear} placeholder="e.g. Dunlop MX33" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldNumber label="Front pressure" unit="psi" value={tirePressureFront} onChange={setTirePressureFront} />
              <FieldNumber label="Rear pressure" unit="psi" value={tirePressureRear} onChange={setTirePressureRear} />
            </div>
          </div>
        )}
      </div>

      {/* Engine / Jetting section */}
      <div className="flex flex-col gap-3">
        <SectionHeader title="Engine / Jetting" open={openEngine} onToggle={() => setOpenEngine((v) => !v)} />
        {openEngine && (
          <div className="flex flex-col gap-3 pl-1">
            <div className="grid grid-cols-2 gap-3">
              <FieldText label="Fuel mix" value={fuelMix} onChange={setFuelMix} placeholder="e.g. 40:1" />
              <FieldText label="Jet needle" value={jetNeedle} onChange={setJetNeedle} placeholder="e.g. NFLR clip 3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldSelect label="Air filter" value={airFilterCondition} onChange={setAirFilterCondition} options={AIR_FILTER_CONDITIONS} />
              <FieldSelect label="Engine map" value={engineMap} onChange={setEngineMap} options={ENGINE_MAPS} />
            </div>
          </div>
        )}
      </div>

      {/* Suspension section */}
      <div className="flex flex-col gap-3">
        <SectionHeader title="Suspension" open={openSuspension} onToggle={() => setOpenSuspension((v) => !v)} />
        {openSuspension && (
          <div className="flex flex-col gap-3 pl-1">
            <div className="grid grid-cols-2 gap-3">
              <FieldNumber label="Fork compression" unit="clicks" value={suspension.forkComp} onChange={(v) => setSuspension((s) => ({ ...s, forkComp: v }))} />
              <FieldNumber label="Fork rebound" unit="clicks" value={suspension.forkReb} onChange={(v) => setSuspension((s) => ({ ...s, forkReb: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldNumber label="Shock compression" unit="clicks" value={suspension.shockComp} onChange={(v) => setSuspension((s) => ({ ...s, shockComp: v }))} />
              <FieldNumber label="Shock rebound" unit="clicks" value={suspension.shockReb} onChange={(v) => setSuspension((s) => ({ ...s, shockReb: v }))} />
            </div>
            <FieldNumber label="Sag" unit="mm" value={suspension.sagMm} onChange={(v) => setSuspension((s) => ({ ...s, sagMm: v }))} />
          </div>
        )}
      </div>

      {/* Rider notes */}
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Rider feel notes</p>
        <textarea
          value={riderFeedback}
          onChange={(e) => setRiderFeedback(e.target.value)}
          rows={4}
          placeholder="How did the bike feel? What did you like / dislike?"
          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400 transition-colors resize-none"
        />
      </div>

      {/* Public sharing toggle */}
      <div className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-zinc-200">Share publicly</p>
          <p className="text-xs text-zinc-500">Anyone with the link can view this setup sheet</p>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-lime-400' : 'bg-zinc-700'}`}
          aria-pressed={isPublic}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {aiError && <p className="text-sm text-red-400 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" />{aiError}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !trackName.trim() || !vehicleId}
        className="flex items-center justify-center gap-2 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm py-4 active:bg-lime-300 transition-colors disabled:opacity-40"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {saving ? 'Saving...' : 'Save setup sheet'}
      </button>
    </div>
  )
}
