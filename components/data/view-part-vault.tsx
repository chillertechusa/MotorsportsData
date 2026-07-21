'use client'

import { useCallback, useEffect, useState } from 'react'
import { Wrench, Search, Plus, Pencil, Trash2, Loader2, X, Package } from 'lucide-react'
import type { Vehicle } from './rig-shell'
import BaselineScanner from './baseline-scanner'
import ConfirmModal from './confirm-modal'

type Part = {
  id: string
  vehicleId: string
  partName: string
  currentHours: number
  maxHours: number
  stockInTruck: number
}

type PartStatus = 'good' | 'warn' | 'replace'

function partStatus(current: number, max: number): PartStatus {
  const ratio = max > 0 ? current / max : 0
  if (ratio >= 0.9) return 'replace'
  if (ratio >= 0.75) return 'warn'
  return 'good'
}

const badge: Record<PartStatus, string> = {
  good: 'bg-lime-400/15 text-lime-300 border-lime-400/30',
  warn: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  replace: 'bg-red-500/15 text-red-300 border-red-500/30',
}
const badgeLabel: Record<PartStatus, string> = { good: 'Good', warn: 'Warn', replace: 'Replace' }
const barColor: Record<PartStatus, string> = { good: 'bg-lime-400', warn: 'bg-amber-400', replace: 'bg-red-500' }

// Add / edit form modal — shared for both create and update.
function PartFormModal({
  open,
  mode,
  initial,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'add' | 'edit'
  initial: { partName: string; maxHours: string; stockInTruck: string }
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (values: { partName: string; maxHours: number; stockInTruck: number }) => void
}) {
  const [partName, setPartName] = useState(initial.partName)
  const [maxHours, setMaxHours] = useState(initial.maxHours)
  const [stockInTruck, setStockInTruck] = useState(initial.stockInTruck)

  useEffect(() => {
    if (open) {
      setPartName(initial.partName)
      setMaxHours(initial.maxHours)
      setStockInTruck(initial.stockInTruck)
    }
  }, [open, initial.partName, initial.maxHours, initial.stockInTruck])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" onClick={() => !saving && onClose()} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-black uppercase tracking-wide text-zinc-50">
            {mode === 'add' ? 'Add Part' : 'Edit Part'}
          </h3>
          <button onClick={() => !saving && onClose()} className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Part Name</label>
            <input
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              autoFocus
              placeholder="e.g. Clutch Pack, Piston & Rings"
              className="w-full py-3 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Life (hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={maxHours}
                onChange={(e) => setMaxHours(e.target.value)}
                placeholder="15"
                className="w-full py-3 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Stock on Truck</label>
              <input
                type="number"
                min="0"
                step="1"
                value={stockInTruck}
                onChange={(e) => setStockInTruck(e.target.value)}
                placeholder="0"
                className="w-full py-3 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-lg font-semibold text-zinc-100 focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-red-400" role="alert">{error}</p>}

          <button
            onClick={() =>
              onSubmit({
                partName: partName.trim(),
                maxHours: Number.parseFloat(maxHours) || 0,
                stockInTruck: Number.parseInt(stockInTruck, 10) || 0,
              })
            }
            disabled={saving}
            className="w-full h-14 rounded-xl flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-black uppercase tracking-wide active:bg-lime-300 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            {mode === 'add' ? 'Add Part' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ViewPartVault({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState('')
  const [activeVehicleId, setActiveVehicleId] = useState('')
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [editing, setEditing] = useState<Part | null>(null)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Part | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [maintaining, setMaintaining] = useState<string | null>(null)

  // Keep the selected vehicle valid as the fleet changes.
  useEffect(() => {
    if (vehicles.length && !vehicles.some((v) => v.id === activeVehicleId)) {
      setActiveVehicleId(vehicles[0].id)
    }
  }, [vehicles, activeVehicleId])

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId)

  const loadParts = useCallback(async (vehicleId: string) => {
    if (!vehicleId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/md-parts?vehicleId=${vehicleId}`)
      const data = await res.json()
      if (data.success) setParts(data.parts ?? [])
    } catch {
      /* offline */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeVehicleId) loadParts(activeVehicleId)
  }, [activeVehicleId, loadParts])

  function openAdd() {
    setFormMode('add')
    setEditing(null)
    setFormError('')
    setFormOpen(true)
  }

  function openEdit(part: Part) {
    setFormMode('edit')
    setEditing(part)
    setFormError('')
    setFormOpen(true)
  }

  async function submitForm(values: { partName: string; maxHours: number; stockInTruck: number }) {
    setFormError('')
    if (!values.partName) {
      setFormError('Enter a part name.')
      return
    }
    if (!(values.maxHours > 0)) {
      setFormError('Enter a positive life in hours.')
      return
    }
    setFormSaving(true)
    try {
      let res: Response
      if (formMode === 'add') {
        res = await fetch('/api/md-parts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleId: activeVehicleId, ...values }),
        })
      } else {
        res = await fetch(`/api/md-parts/${editing!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partName: values.partName, maxHours: values.maxHours, stockInTruck: values.stockInTruck }),
        })
      }
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Save failed')
      setFormOpen(false)
      loadParts(activeVehicleId)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setFormSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/md-parts/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDeleteTarget(null)
        loadParts(activeVehicleId)
      }
    } catch {
      /* keep modal open */
    } finally {
      setDeleting(false)
    }
  }

  async function logMaintenance(part: Part) {
    setMaintaining(part.id)
    try {
      const res = await fetch(`/api/md-parts/${part.id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usedFromStock: part.stockInTruck > 0 }),
      })
      const data = await res.json()
      if (data.success) loadParts(activeVehicleId)
    } catch {
      /* offline */
    } finally {
      setMaintaining(null)
    }
  }

  const filtered = parts.filter((p) => p.partName.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      {activeVehicle && <BaselineScanner vehicleId={activeVehicle.id} vehicleName={activeVehicle.name} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold uppercase tracking-wide text-zinc-100">Part Vault</h2>
          {vehicles.length > 0 && (
            <select
              value={activeVehicleId}
              onChange={(e) => setActiveVehicleId(e.target.value)}
              className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-sm text-zinc-300 focus:border-lime-400 focus:outline-none"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search parts..."
              className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 pl-11 pr-4 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-lime-400 focus:outline-none"
            />
          </div>
          <button
            onClick={openAdd}
            disabled={!activeVehicleId}
            className="flex items-center gap-2 h-12 px-4 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm uppercase tracking-wide active:bg-lime-300 transition-colors disabled:opacity-50 shrink-0"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Part</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1.6fr] gap-4 px-6 py-3 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
          <span>Part Name</span>
          <span>Hours / Life</span>
          <span>Stock</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading parts…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500 mb-4">
              <Package className="h-7 w-7" />
            </span>
            <p className="text-lg font-bold text-zinc-200">{query ? 'No parts match your search' : 'No parts tracked yet'}</p>
            <p className="text-sm text-zinc-500 mt-1 mb-5">
              {query ? 'Try a different term.' : 'Add engine, suspension, and consumable parts to track their lifecycle.'}
            </p>
            {!query && activeVehicleId && (
              <button onClick={openAdd} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm uppercase tracking-wide active:bg-lime-300 transition-colors">
                <Plus className="h-4 w-4" /> Add First Part
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filtered.map((p) => {
              const status = partStatus(p.currentHours, p.maxHours)
              const pct = Math.min(100, Math.round((p.currentHours / p.maxHours) * 100))
              return (
                <div key={p.id} className="grid grid-cols-2 lg:grid-cols-[2fr_2fr_1fr_1fr_1.6fr] gap-4 px-5 lg:px-6 py-4 items-center">
                  <div>
                    <p className="font-semibold text-zinc-100">{p.partName}</p>
                  </div>
                  <div className="col-span-2 lg:col-auto order-last lg:order-none">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-500 tabular-nums">{p.currentHours} / {p.maxHours} h</span>
                      <span className="text-zinc-500">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className={`h-full rounded-full ${barColor[status]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-sm text-zinc-300 tabular-nums">
                    <span className="lg:hidden text-zinc-500 uppercase text-xs tracking-wider mr-1">Stock:</span>
                    {p.stockInTruck}
                  </div>
                  <div>
                    <span className={`inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${badge[status]}`}>
                      {badgeLabel[status]}
                    </span>
                  </div>
                  <div className="flex justify-end items-center gap-1.5">
                    {status !== 'good' && (
                      <button
                        onClick={() => logMaintenance(p)}
                        disabled={maintaining === p.id}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-lime-400 text-zinc-950 font-bold text-xs uppercase active:bg-lime-300 transition-colors disabled:opacity-60"
                        title="Reset part life after replacement"
                      >
                        {maintaining === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                        <span className="hidden xl:inline">Log</span>
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(p)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      aria-label={`Edit ${p.partName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={`Delete ${p.partName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <PartFormModal
        open={formOpen}
        mode={formMode}
        initial={{
          partName: editing?.partName ?? '',
          maxHours: editing ? String(editing.maxHours) : '',
          stockInTruck: editing ? String(editing.stockInTruck) : '0',
        }}
        saving={formSaving}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this part?"
        message={`Are you sure you want to delete "${deleteTarget?.partName}"? This cannot be undone.`}
        confirmLabel="Delete Part"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  )
}
