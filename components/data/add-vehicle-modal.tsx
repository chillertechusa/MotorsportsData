'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { MD_SPEC_DATA } from '@/lib/md-specs/data'

const VEHICLE_TYPES = ['Motocross', 'Supercross', 'Off-Road', 'Sand / Dune', 'Quad / ATV', 'Other']

const DISCIPLINES = [
  { value: 'mx_sx',              label: 'Motocross / Supercross' },
  { value: 'enduro_gncc',        label: 'Enduro / GNCC' },
  { value: 'fmx_freestyle',      label: 'FMX / Freestyle' },
  { value: 'flat_track',         label: 'Flat Track' },
  { value: 'trail_recreational', label: 'Trail / Recreational' },
  { value: 'pit_bike_youth',     label: 'Pit Bike / Youth' },
]

interface AddVehicleModalProps {
  open: boolean
  onClose: () => void
  onAdded: () => void
}

export default function AddVehicleModal({ open, onClose, onAdded }: AddVehicleModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState(VEHICLE_TYPES[0])
  const [engineHours, setEngineHours] = useState('0')
  const [specKey, setSpecKey] = useState('')
  const [discipline, setDiscipline] = useState(DISCIPLINES[0].value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setType(VEHICLE_TYPES[0])
      setEngineHours('0')
      setSpecKey('')
      setDiscipline(DISCIPLINES[0].value)
      setError('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, saving, onClose])

  if (!open) return null

  async function save() {
    setError('')
    if (!name.trim()) {
      setError('Enter a vehicle name or number.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/md-fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          engineHours: Number.parseFloat(engineHours) || 0,
          specKey: specKey || null,
          discipline: discipline || null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to add vehicle')
      onAdded()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add vehicle')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" onClick={() => !saving && onClose()} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-vehicle-title"
        className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 id="add-vehicle-title" className="text-xl font-black uppercase tracking-wide text-zinc-50">
            Add Vehicle
          </h3>
          <button
            onClick={() => !saving && onClose()}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Name / Number</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="e.g. #01 YZ450F"
              className="w-full h-13 py-3 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Vehicle Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-13 py-3 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none appearance-none"
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
              Discipline
              <span className="ml-1.5 text-zinc-600 normal-case tracking-normal">(personalizes AI coaching)</span>
            </label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full h-13 py-3 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none appearance-none"
            >
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Starting Engine Hours</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={engineHours}
              onChange={(e) => setEngineHours(e.target.value)}
              className="w-full h-13 py-3 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
              OEM Spec Book{' '}
              <span className="text-zinc-600 normal-case tracking-normal">(optional — links real service data)</span>
            </label>
            <select
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              className="w-full h-13 py-3 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none appearance-none"
            >
              <option value="">No spec book selected</option>
              {MD_SPEC_DATA.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.year} {s.make} {s.model}
                </option>
              ))}
            </select>
            {specKey && (
              <p className="mt-1.5 text-[11px] text-lime-400 font-mono">
                Spec Book linked — MD Intel will use OEM data for this bike.
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="w-full h-14 rounded-xl flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-black uppercase tracking-wide active:bg-lime-300 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Adding…
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" /> Add to Fleet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
