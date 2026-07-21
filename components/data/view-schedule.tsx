'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  CalendarDays, Plus, X, Loader2, MapPin, Trophy, Wrench, Flag,
  Wind, Droplets, Thermometer, ExternalLink, Pencil, Trash2, ChevronDown, ChevronUp,
  Sun, Cloud, CloudRain, ListOrdered, BarChart3,
} from 'lucide-react'
import type { Vehicle } from './rig-shell'
import type { TrackForecast } from '@/lib/md-weather'
import { resolveSeriesLinks } from '@/lib/md-series-links'

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = 'race' | 'practice' | 'maintenance'

interface ScheduleEvent {
  id: string
  title: string
  eventType: EventType
  eventDate: string
  vehicleId: string | null
  trackId: string | null
  lat: number | null
  lng: number | null
  series: string | null
  finishPosition: number | null
  seriesResultUrl: string | null
  entryFeeCents: number
  notes: string | null
  trackName: string | null
  trackCity: string | null
  trackState: string | null
  trackLat: number | null
  trackLng: number | null
}

const EVENT_TYPES: { value: EventType; label: string; icon: typeof Flag }[] = [
  { value: 'race', label: 'Race', icon: Flag },
  { value: 'practice', label: 'Practice', icon: Wrench },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
]

const EVENT_COLORS: Record<EventType, string> = {
  race: 'bg-lime-400/10 border-lime-400/30 text-lime-400',
  practice: 'bg-sky-400/10 border-sky-400/30 text-sky-400',
  maintenance: 'bg-amber-400/10 border-amber-400/30 text-amber-400',
}

const EVENT_ACCENT: Record<EventType, string> = {
  race: 'border-l-lime-400',
  practice: 'border-l-sky-400',
  maintenance: 'border-l-amber-400',
}

const CONDITION_COLOR: Record<string, string> = {
  Ideal: 'text-lime-400',
  Good: 'text-sky-400',
  Fair: 'text-amber-400',
  Rough: 'text-orange-400',
  Wet: 'text-red-400',
}

function conditionIcon(condition: string) {
  if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('shower') || condition.toLowerCase().includes('drizzle')) return CloudRain
  if (condition.toLowerCase().includes('cloud') || condition.toLowerCase().includes('overcast')) return Cloud
  return Sun
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

// ─── Weather Card ─────────────────────────────────────────────────────────────

function WeatherCard({ lat, lng }: { lat: number; lng: number }) {
  const [weather, setWeather] = useState<TrackForecast | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/md-weather?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(d => setWeather(d))
      .finally(() => setLoading(false))
  }, [lat, lng])

  if (loading) return (
    <div className="flex items-center gap-2 text-zinc-500 text-xs mt-3">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>Loading weather...</span>
    </div>
  )
  if (!weather) return null

  const c = weather.current
  const CondIcon = conditionIcon(c.condition)

  return (
    <div className="mt-3 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <CondIcon className="h-5 w-5 text-sky-400 shrink-0" />
          <div>
            <p className="text-base font-bold text-zinc-100">{c.temp_c}°C <span className="text-zinc-500 font-normal text-sm">/ {Math.round(c.temp_c * 9/5 + 32)}°F</span></p>
            <p className="text-xs text-zinc-400">{c.condition}</p>
          </div>
        </div>
        <div className={`text-xs font-bold px-2 py-0.5 rounded-full border ${CONDITION_COLOR[weather.track_conditions]} border-current`}>
          Track: {weather.track_conditions}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
        <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{c.humidity}% humidity</span>
        <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{c.wind_kph} km/h {c.wind_dir}</span>
        <span className="flex items-center gap-1"><Sun className="h-3 w-3" />UV {c.uv_index}</span>
      </div>
      {/* 5-day strip */}
      <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
        {weather.daily.slice(0, 5).map((day) => {
          const DayIcon = conditionIcon(day.condition)
          return (
            <div key={day.date} className="flex-1 min-w-[52px] rounded-lg bg-zinc-800/60 p-1.5 text-center">
              <p className="text-[10px] text-zinc-500">{new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <DayIcon className="h-3 w-3 text-sky-400 mx-auto my-0.5" />
              <p className="text-[10px] font-semibold text-zinc-200">{day.max_c}°</p>
              {day.rain_chance > 0 && <p className="text-[10px] text-sky-400">{day.rain_chance}%</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({
  event,
  vehicles,
  onDelete,
  onResultSaved,
}: {
  event: ScheduleEvent
  vehicles: Vehicle[]
  onDelete: (id: string) => void
  onResultSaved: (id: string, pos: number | null, url: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)
  const [pos, setPos] = useState(event.finishPosition?.toString() ?? '')
  const [url, setUrl] = useState(event.seriesResultUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const days = daysUntil(event.eventDate)
  const isPast = days < 0
  const effectiveLat = event.lat ?? event.trackLat
  const effectiveLng = event.lng ?? event.trackLng
  const vehicle = vehicles.find(v => v.id === event.vehicleId)
  const seriesLinks = event.eventType === 'race' ? resolveSeriesLinks(event.series) : null

  async function saveResult() {
    setSaving(true)
    await fetch(`/api/md-schedule?id=${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        finishPosition: pos ? parseInt(pos) : null,
        seriesResultUrl: url || null,
      }),
    })
    onResultSaved(event.id, pos ? parseInt(pos) : null, url)
    setShowResultForm(false)
    setSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/md-schedule?id=${event.id}`, { method: 'DELETE' })
    onDelete(event.id)
  }

  const TypeIcon = EVENT_TYPES.find(t => t.value === event.eventType)?.icon ?? Flag

  return (
    <div className={`rounded-2xl bg-zinc-900 border border-l-4 border-zinc-800 ${EVENT_ACCENT[event.eventType]} transition-all`}>
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${EVENT_COLORS[event.eventType]}`}>
              <TypeIcon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-zinc-100 leading-tight truncate">{event.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {formatDate(event.eventDate)}
                {event.trackName && <span className="ml-2 text-zinc-600">· {event.trackName}{event.trackState ? `, ${event.trackState}` : ''}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isPast && event.finishPosition && (
              <span className="flex items-center gap-1 text-xs font-bold text-lime-400">
                <Trophy className="h-3 w-3" />P{event.finishPosition}
              </span>
            )}
            {!isPast && days <= 7 && (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                {days === 0 ? 'Today' : `${days}d`}
              </span>
            )}
            {expanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {vehicle && (
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-zinc-500 mb-0.5">Bike</p>
                <p className="font-semibold text-zinc-200">{vehicle.name}</p>
              </div>
            )}
            {event.series && (
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-zinc-500 mb-0.5">Series</p>
                <p className="font-semibold text-zinc-200">{event.series}</p>
              </div>
            )}
            {event.entryFeeCents > 0 && (
              <div className="rounded-lg bg-zinc-800/50 p-2">
                <p className="text-zinc-500 mb-0.5">Entry Fee</p>
                <p className="font-semibold text-zinc-200">${(event.entryFeeCents / 100).toFixed(0)}</p>
              </div>
            )}
            {event.trackCity && (
              <div className="rounded-lg bg-zinc-800/50 p-2 col-span-2 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                <p className="font-semibold text-zinc-200">{event.trackCity}{event.trackState ? `, ${event.trackState}` : ''}</p>
              </div>
            )}
          </div>

          {event.notes && (
            <p className="text-xs text-zinc-400 bg-zinc-800/40 rounded-lg px-3 py-2 leading-relaxed">{event.notes}</p>
          )}

          {/* Official series results + standings deep-links */}
          {seriesLinks && (
            <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/60 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Trophy className="h-3.5 w-3.5 text-lime-400" />
                <p className="text-xs font-semibold text-zinc-300">{seriesLinks.label}</p>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2.5">Official results & points — {seriesLinks.org}</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={seriesLinks.resultsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:border-lime-400 hover:text-lime-400 transition-colors"
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                  Results
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <a
                  href={seriesLinks.standingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:border-sky-400 hover:text-sky-400 transition-colors"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Standings
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          )}

          {/* Weather — show for upcoming events with a location */}
          {!isPast && effectiveLat && effectiveLng && (
            <WeatherCard lat={effectiveLat} lng={effectiveLng} />
          )}

          {/* Result section — for past race events */}
          {isPast && event.eventType === 'race' && (
            <div>
              {!showResultForm ? (
                <button
                  onClick={() => setShowResultForm(true)}
                  className="flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 font-semibold"
                >
                  <Pencil className="h-3 w-3" />
                  {event.finishPosition ? `Edit result (P${event.finishPosition})` : 'Log finish position'}
                </button>
              ) : (
                <div className="rounded-xl bg-zinc-800/60 p-3 space-y-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Race Result</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Finish pos."
                      value={pos}
                      onChange={e => setPos(e.target.value)}
                      className="w-24 h-9 rounded-lg bg-zinc-950 border border-zinc-700 px-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
                    />
                    <input
                      type="url"
                      placeholder="Official results URL (optional)"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      className="flex-1 h-9 rounded-lg bg-zinc-950 border border-zinc-700 px-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveResult}
                      disabled={saving}
                      className="h-8 px-4 rounded-lg bg-lime-400 text-zinc-950 text-xs font-bold flex items-center gap-1 disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                    </button>
                    <button onClick={() => setShowResultForm(false)} className="h-8 px-3 rounded-lg bg-zinc-700 text-zinc-300 text-xs">Cancel</button>
                  </div>
                </div>
              )}
              {event.seriesResultUrl && (
                <a href={event.seriesResultUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300">
                  <ExternalLink className="h-3 w-3" />Official results
                </a>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors"
            >
              {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────

function AddEventModal({
  open,
  vehicles,
  onClose,
  onAdded,
}: {
  open: boolean
  vehicles: Vehicle[]
  onClose: () => void
  onAdded: (event: ScheduleEvent) => void
}) {
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState<EventType>('practice')
  const [eventDate, setEventDate] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [trackName, setTrackName] = useState('')
  const [series, setSeries] = useState('')
  const [entryFee, setEntryFee] = useState('')
  const [notes, setNotes] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [geoResult, setGeoResult] = useState<{ lat: number; lng: number; display: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setTitle(''); setEventType('practice'); setEventDate(''); setVehicleId('')
      setTrackName(''); setSeries(''); setEntryFee(''); setNotes('')
      setGeoResult(null); setError('')
    }
  }, [open])

  async function handleGeocodeTrack() {
    if (!trackName.trim()) return
    setGeocoding(true)
    try {
      const res = await fetch(`/api/md-weather?track=${encodeURIComponent(trackName.trim())}`)
      // We only need geocode — fetch weather to confirm location exists
      if (res.ok) {
        // Get coords from geocoding API directly
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trackName.trim())}&count=1&language=en&format=json`)
        const geoData = await geoRes.json()
        const r = geoData?.results?.[0]
        if (r) {
          setGeoResult({ lat: r.latitude, lng: r.longitude, display: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}` })
        }
      }
    } catch { /* silent */ }
    setGeocoding(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !eventDate) { setError('Title and date are required.'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/md-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          eventType,
          eventDate,
          vehicleId: vehicleId || null,
          lat: geoResult?.lat ?? null,
          lng: geoResult?.lng ?? null,
          series: series.trim() || null,
          entryFeeCents: entryFee ? Math.round(parseFloat(entryFee) * 100) : 0,
          notes: notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }
      // Attach display fields for immediate render
      onAdded({
        ...data.event,
        trackName: trackName || null,
        trackCity: geoResult?.display ?? null,
        trackState: null,
        trackLat: geoResult?.lat ?? null,
        trackLng: geoResult?.lng ?? null,
      })
      onClose()
    } catch {
      setError('Network error. Try again.')
    }
    setSaving(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 px-4 pb-4 sm:pb-0" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-zinc-100">Add Event</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Event type tabs */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Event Type</label>
            <div className="flex gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setEventType(t.value)}
                  className={`flex-1 h-10 rounded-xl text-sm font-semibold border transition-colors ${eventType === t.value ? EVENT_COLORS[t.value] + ' border-current' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Event Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Round 3 — Red Bud MX"
              className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Bike</label>
              <select
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
                className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none appearance-none"
              >
                <option value="">Any / all bikes</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Track / Venue</label>
            <div className="flex gap-2">
              <input
                value={trackName}
                onChange={e => { setTrackName(e.target.value); setGeoResult(null) }}
                placeholder="e.g. Red Bud MX, Buchanan MI"
                className="flex-1 h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGeocodeTrack}
                disabled={!trackName.trim() || geocoding}
                className="h-12 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:border-sky-400 hover:text-sky-400 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {geocoding ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                Pin
              </button>
            </div>
            {geoResult && (
              <p className="mt-1.5 text-[11px] text-sky-400 font-mono flex items-center gap-1">
                <MapPin className="h-3 w-3" />{geoResult.display} — weather pinned
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {eventType === 'race' && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Series</label>
                <input
                  value={series}
                  onChange={e => setSeries(e.target.value)}
                  placeholder="e.g. AMA Pro MX"
                  className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
                />
                {resolveSeriesLinks(series) && (
                  <p className="mt-1.5 text-[11px] text-lime-400 flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {resolveSeriesLinks(series)!.label} — official results linked
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Entry Fee ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={entryFee}
                onChange={e => setEntryFee(e.target.value)}
                placeholder="0"
                className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Gate position, class, setup goals..."
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Event
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────

const VIEW_FILTERS = ['All', 'Upcoming', 'Past', 'Race', 'Practice'] as const
type Filter = (typeof VIEW_FILTERS)[number]

export default function ViewSchedule({ vehicles }: { vehicles: Vehicle[] }) {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('Upcoming')
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/md-schedule')
      const data = await res.json()
      setEvents(data.events ?? [])
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function handleAdded(event: ScheduleEvent) {
    setEvents(prev => [...prev, event].sort((a, b) => a.eventDate.localeCompare(b.eventDate)))
  }

  function handleDelete(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  function handleResultSaved(id: string, pos: number | null, url: string) {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, finishPosition: pos, seriesResultUrl: url } : e))
  }

  const today = new Date(); today.setHours(0,0,0,0)
  const filtered = events.filter(e => {
    const d = new Date(e.eventDate + 'T00:00:00')
    if (filter === 'Upcoming') return d >= today
    if (filter === 'Past') return d < today
    if (filter === 'Race') return e.eventType === 'race'
    if (filter === 'Practice') return e.eventType === 'practice'
    return true
  })

  const nextRace = events.find(e => e.eventType === 'race' && daysUntil(e.eventDate) >= 0)

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight">Schedule</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Race & practice calendar with live track weather</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm hover:bg-lime-300 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      {/* Next race banner */}
      {nextRace && (
        <div className="rounded-2xl bg-lime-400/5 border border-lime-400/20 p-4 flex items-center gap-3">
          <Flag className="h-5 w-5 text-lime-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Next Race</p>
            <p className="font-bold text-zinc-100 truncate">{nextRace.title}</p>
            <p className="text-xs text-zinc-400">{formatDate(nextRace.eventDate)}{nextRace.trackName ? ` — ${nextRace.trackName}` : ''}</p>
          </div>
          {daysUntil(nextRace.eventDate) === 0 ? (
            <span className="ml-auto text-sm font-black text-lime-400">TODAY</span>
          ) : (
            <span className="ml-auto text-2xl font-black text-lime-400 tabular-nums">{daysUntil(nextRace.eventDate)}<span className="text-sm font-normal text-zinc-500 ml-0.5">d</span></span>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {VIEW_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${filter === f ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <CalendarDays className="h-10 w-10 text-zinc-700" />
          <p className="text-zinc-400 font-semibold">No events yet</p>
          <p className="text-xs text-zinc-600 max-w-xs">Add your races and practice days to get live track weather and a countdown to gate drop.</p>
          <button onClick={() => setShowAdd(true)} className="mt-2 h-9 px-4 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700">
            Add your first event
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(event => (
            <EventCard
              key={event.id}
              event={event}
              vehicles={vehicles}
              onDelete={handleDelete}
              onResultSaved={handleResultSaved}
            />
          ))}
        </div>
      )}

      <AddEventModal
        open={showAdd}
        vehicles={vehicles}
        onClose={() => setShowAdd(false)}
        onAdded={handleAdded}
      />
    </div>
  )
}
