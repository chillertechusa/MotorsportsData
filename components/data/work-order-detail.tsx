'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft, Clock, Package, Camera, Wrench, Plus, X, Trash2,
  ChevronDown, ChevronUp, CheckCircle2, PlayCircle, AlertCircle,
  Timer, DollarSign, Loader2, Upload
} from 'lucide-react'
import {
  getWorkOrderDetail, updateWorkOrder, addWorkOrderPart,
  removeWorkOrderPart, addWorkOrderPhoto, removeWorkOrderPhoto,
  deleteWorkOrder,
  type WorkOrderStatus, type WorkOrderPart, type WorkOrderPhoto
} from '@/app/actions/md-work-orders'

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkOrderFull {
  id: string
  vehicleId: string
  vehicleName: string
  vehicleType: string
  title: string
  description: string | null
  status: WorkOrderStatus
  laborHours: number
  suspensionBefore: Record<string, string> | null
  suspensionAfter: Record<string, string> | null
  createdAt: string
  parts: WorkOrderPart[]
  photos: WorkOrderPhoto[]
}

interface Props {
  workOrderId: string
  vehicles: { id: string; name: string; type: string }[]
  onBack: () => void
}

const SUSPENSION_KEYS = [
  'Fork Compression (clicks)',
  'Fork Rebound (clicks)',
  'Fork Spring Rate',
  'Fork Oil Height',
  'Shock Sag (mm)',
  'Shock Compression (clicks)',
  'Shock Rebound (clicks)',
  'Shock Spring Rate',
  'Rear Ride Height',
  'Clicker Position Notes',
]

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; color: string; icon: typeof AlertCircle; next: WorkOrderStatus | null; nextLabel: string }> = {
  open: { label: 'Open', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: AlertCircle, next: 'in_progress', nextLabel: 'Start Job' },
  in_progress: { label: 'In Progress', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: PlayCircle, next: 'closed', nextLabel: 'Close Job' },
  closed: { label: 'Closed', color: 'text-lime-400 bg-lime-400/10 border-lime-400/20', icon: CheckCircle2, next: null, nextLabel: '' },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SuspensionGrid({
  label,
  data,
  onChange,
  readonly,
}: {
  label: string
  data: Record<string, string>
  onChange?: (key: string, val: string) => void
  readonly?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {SUSPENSION_KEYS.map((k) => (
          <div key={k} className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{k}</p>
            {readonly ? (
              <p className="text-sm font-bold text-zinc-200">{data[k] || '—'}</p>
            ) : (
              <input
                type="text"
                value={data[k] || ''}
                onChange={(e) => onChange?.(k, e.target.value)}
                placeholder="—"
                className="w-full bg-transparent text-sm font-bold text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WorkOrderDetail({ workOrderId, onBack }: Props) {
  const [order, setOrder] = useState<WorkOrderFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [laborHours, setLaborHours] = useState(0)
  const [suspBefore, setSuspBefore] = useState<Record<string, string>>({})
  const [suspAfter, setSuspAfter] = useState<Record<string, string>>({})

  // Section expand
  const [showSuspension, setShowSuspension] = useState(false)
  const [showParts, setShowParts] = useState(true)
  const [showPhotos, setShowPhotos] = useState(true)

  // Parts form
  const [newPartName, setNewPartName] = useState('')
  const [newPartQty, setNewPartQty] = useState(1)
  const [newPartCost, setNewPartCost] = useState('')
  const [addingPart, setAddingPart] = useState(false)

  // Photo upload
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadCaption, setUploadCaption] = useState('')

  // Labor timer
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerStart, setTimerStart] = useState<number | null>(null)
  const [timerElapsed, setTimerElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getWorkOrderDetail(workOrderId)
    if (data) {
      setOrder(data as WorkOrderFull)
      setTitle(data.title)
      setDescription(data.description ?? '')
      setLaborHours(data.laborHours ?? 0)
      setSuspBefore((data.suspensionBefore as Record<string, string>) ?? {})
      setSuspAfter((data.suspensionAfter as Record<string, string>) ?? {})
    }
    setLoading(false)
  }, [workOrderId])

  useEffect(() => { load() }, [load])

  // Labor timer tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  function startTimer() {
    setTimerStart(Date.now())
    setTimerElapsed(0)
    setTimerRunning(true)
  }

  async function stopTimer() {
    setTimerRunning(false)
    const addedHours = timerElapsed / 3600
    const newTotal = Math.round((laborHours + addedHours) * 100) / 100
    setLaborHours(newTotal)
    await updateWorkOrder(workOrderId, { laborHours: newTotal })
    setTimerElapsed(0)
    setTimerStart(null)
    await load()
  }

  function formatTimer(secs: number) {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateWorkOrder(workOrderId, {
        title: title.trim(),
        description: description.trim() || undefined,
        laborHours,
        suspensionBefore: Object.keys(suspBefore).length ? suspBefore : undefined,
        suspensionAfter: Object.keys(suspAfter).length ? suspAfter : undefined,
      })
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusAdvance() {
    if (!order) return
    const next = STATUS_CONFIG[order.status].next
    if (!next) return
    await updateWorkOrder(workOrderId, { status: next })
    await load()
  }

  async function handleAddPart() {
    if (!newPartName.trim()) return
    setAddingPart(true)
    try {
      await addWorkOrderPart(workOrderId, {
        partName: newPartName.trim(),
        quantity: newPartQty,
        unitCostCents: Math.round((parseFloat(newPartCost) || 0) * 100),
      })
      setNewPartName('')
      setNewPartQty(1)
      setNewPartCost('')
      await load()
    } finally {
      setAddingPart(false)
    }
  }

  async function handleRemovePart(partId: string) {
    await removeWorkOrderPart(partId)
    await load()
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('workOrderId', workOrderId)
      const res = await fetch('/api/md-work-order-photo/upload', { method: 'POST', body: fd })
      const { pathname } = await res.json()
      if (pathname) {
        await addWorkOrderPhoto(workOrderId, pathname, uploadCaption || undefined)
        setUploadCaption('')
        await load()
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleRemovePhoto(photoId: string, pathname: string) {
    await removeWorkOrderPhoto(photoId, pathname)
    await load()
  }

  async function handleDelete() {
    if (!confirm('Delete this work order? This cannot be undone.')) return
    await deleteWorkOrder(workOrderId)
    onBack()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 text-center text-zinc-500">
        <p>Work order not found.</p>
        <button onClick={onBack} className="mt-4 text-lime-400 text-sm font-bold">Go back</button>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[order.status]
  const StatusIcon = cfg.icon
  const partsCost = order.parts.reduce((sum, p) => sum + p.quantity * p.unitCostCents, 0)

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl">

      {/* Back + header */}
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-1 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-xl font-black text-zinc-50 focus:outline-none"
          />
          <p className="text-sm text-zinc-500 mt-0.5">{order.vehicleName} · {order.vehicleType}</p>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.color}`}>
          <StatusIcon className="h-3 w-3" />
          {cfg.label}
        </span>
        {cfg.next && (
          <button
            onClick={handleStatusAdvance}
            className="rounded-full bg-lime-400 px-3 py-1 text-xs font-bold text-zinc-950 hover:bg-lime-300 transition-colors"
          >
            {cfg.nextLabel}
          </button>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <Clock className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-sm font-bold text-zinc-300">{order.laborHours.toFixed(2)}h logged</span>
        </div>
      </div>

      {/* Labor timer */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-zinc-400" />
            <p className="text-sm font-bold uppercase tracking-wide text-zinc-400">Labor Timer</p>
          </div>
          {timerRunning && (
            <span className="text-2xl font-black tabular-nums text-lime-400">{formatTimer(timerElapsed)}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!timerRunning ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-400 transition-colors"
            >
              <PlayCircle className="h-4 w-4" />
              Start Timer
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="flex items-center gap-2 rounded-xl bg-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-100 hover:bg-zinc-600 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Stop + Log
            </button>
          )}
          <div className="flex items-center gap-2 flex-1">
            <input
              type="number"
              step="0.25"
              min="0"
              value={laborHours}
              onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-sm text-center font-bold text-zinc-100 focus:outline-none focus:border-lime-400"
            />
            <span className="text-sm text-zinc-500">hours total</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Mechanic Notes</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="What was done, observations, next steps..."
          className="w-full resize-none rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
        />
      </div>

      {/* Suspension before / after */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <button
          onClick={() => setShowSuspension((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-300">Suspension Before / After</span>
            {(order.suspensionBefore || order.suspensionAfter) && (
              <span className="rounded-full bg-lime-400/20 px-2 py-0.5 text-[10px] font-bold text-lime-400">Saved</span>
            )}
          </div>
          {showSuspension ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </button>
        {showSuspension && (
          <div className="px-4 pb-4 space-y-4 border-t border-zinc-800 pt-4">
            <SuspensionGrid
              label="Before"
              data={suspBefore}
              onChange={(k, v) => setSuspBefore((prev) => ({ ...prev, [k]: v }))}
            />
            <SuspensionGrid
              label="After"
              data={suspAfter}
              onChange={(k, v) => setSuspAfter((prev) => ({ ...prev, [k]: v }))}
            />
          </div>
        )}
      </div>

      {/* Parts */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <button
          onClick={() => setShowParts((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-300">Parts Used</span>
            {order.parts.length > 0 && (
              <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-300">{order.parts.length}</span>
            )}
            {partsCost > 0 && (
              <span className="text-xs text-zinc-500">${(partsCost / 100).toFixed(2)}</span>
            )}
          </div>
          {showParts ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </button>
        {showParts && (
          <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-4">
            {order.parts.length > 0 && (
              <div className="space-y-2">
                {order.parts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl bg-zinc-800/60 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-100 truncate">{p.partName}</p>
                      <p className="text-xs text-zinc-500">Qty {p.quantity} {p.unitCostCents > 0 ? `· $${(p.unitCostCents / 100).toFixed(2)} ea` : ''}</p>
                    </div>
                    {p.unitCostCents > 0 && (
                      <span className="text-sm font-bold text-zinc-300">${((p.quantity * p.unitCostCents) / 100).toFixed(2)}</span>
                    )}
                    <button onClick={() => handleRemovePart(p.id)} className="rounded-lg p-1 text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Add part */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="Part name..."
                  className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
                />
                <input
                  type="number"
                  min="1"
                  value={newPartQty}
                  onChange={(e) => setNewPartQty(parseInt(e.target.value) || 1)}
                  className="w-16 rounded-xl bg-zinc-800 border border-zinc-700 px-2 py-2 text-sm text-center text-zinc-100 focus:outline-none focus:border-lime-400"
                  placeholder="Qty"
                />
                <div className="relative w-24">
                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPartCost}
                    onChange={(e) => setNewPartCost(e.target.value)}
                    className="w-full rounded-xl bg-zinc-800 border border-zinc-700 pl-6 pr-2 py-2 text-sm text-zinc-100 focus:outline-none focus:border-lime-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <button
                onClick={handleAddPart}
                disabled={!newPartName.trim() || addingPart}
                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-700 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-zinc-600 disabled:opacity-40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Part
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <button
          onClick={() => setShowPhotos((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-300">Photos</span>
            {order.photos.length > 0 && (
              <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-300">{order.photos.length}</span>
            )}
          </div>
          {showPhotos ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
        </button>
        {showPhotos && (
          <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-4">
            {order.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {order.photos.map((ph) => (
                  <div key={ph.id} className="relative group rounded-xl overflow-hidden bg-zinc-800 aspect-video">
                    <img
                      src={`/api/md-work-order-photo?pathname=${encodeURIComponent(ph.blobPathname)}`}
                      alt={ph.caption ?? 'Work order photo'}
                      className="w-full h-full object-cover"
                    />
                    {ph.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-[10px] text-zinc-300 truncate">{ph.caption}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemovePhoto(ph.id, ph.blobPathname)}
                      className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Upload */}
            <div className="flex gap-2">
              <input
                type="text"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Caption (optional)..."
                className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-xl bg-zinc-700 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-zinc-600 disabled:opacity-40 transition-colors"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? 'Uploading...' : 'Add Photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
          </div>
        )}
      </div>

      {/* Save / Delete */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-lime-400 py-3 text-sm font-bold text-zinc-950 hover:bg-lime-300 disabled:opacity-40 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold text-red-400 hover:bg-zinc-800 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
