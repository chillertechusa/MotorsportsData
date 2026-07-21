'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Wrench, Clock, Package, Camera, ChevronRight, X, AlertCircle, CheckCircle2, PlayCircle } from 'lucide-react'
import { getWorkOrders, createWorkOrder, type WorkOrderWithVehicle, type WorkOrderStatus } from '@/app/actions/md-work-orders'
import WorkOrderDetail from './work-order-detail'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface Props {
  vehicles: Vehicle[]
}

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; color: string; icon: typeof AlertCircle }> = {
  open: { label: 'Open', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: PlayCircle },
  closed: { label: 'Closed', color: 'text-lime-400 bg-lime-400/10 border-lime-400/20', icon: CheckCircle2 },
}

export function WorkOrdersList({ vehicles }: Props) {
  const [orders, setOrders] = useState<WorkOrderWithVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [filterVehicle, setFilterVehicle] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('active')

  // Create form state
  const [createVehicleId, setCreateVehicleId] = useState(vehicles[0]?.id ?? '')
  const [createTitle, setCreateTitle] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getWorkOrders()
    setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = orders.filter((o) => {
    const vehicleMatch = filterVehicle === 'all' || o.vehicleId === filterVehicle
    const statusMatch =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? o.status !== 'closed' :
      o.status === filterStatus
    return vehicleMatch && statusMatch
  })

  async function handleCreate() {
    if (!createTitle.trim() || !createVehicleId) return
    setCreating(true)
    try {
      await createWorkOrder({ vehicleId: createVehicleId, title: createTitle.trim(), description: createDesc.trim() || undefined })
      setCreateTitle('')
      setCreateDesc('')
      setShowCreate(false)
      await load()
    } finally {
      setCreating(false)
    }
  }

  if (selectedOrderId) {
    return (
      <WorkOrderDetail
        workOrderId={selectedOrderId}
        vehicles={vehicles}
        onBack={() => { setSelectedOrderId(null); load() }}
      />
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">Work Orders</h2>
          <p className="text-sm text-zinc-500 mt-1">Track jobs, parts, and labor across every bike in your fleet.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-lime-300 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Job
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-zinc-50">New Work Order</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Bike</label>
                <select
                  value={createVehicleId}
                  onChange={(e) => setCreateVehicleId(e.target.value)}
                  className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-lime-400"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} — {v.type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Job Title</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. Full suspension rebuild"
                  className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Notes (optional)</label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Describe the issue or work to be done..."
                  rows={3}
                  className="w-full resize-none rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-bold text-zinc-400 hover:bg-zinc-800">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!createTitle.trim() || creating}
                className="flex-1 rounded-xl bg-lime-400 py-2.5 text-sm font-bold text-zinc-950 hover:bg-lime-300 disabled:opacity-40"
              >
                {creating ? 'Creating...' : 'Open Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
          className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 focus:outline-none focus:border-lime-400"
        >
          <option value="all">All Bikes</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        {(['active', 'open', 'in_progress', 'closed', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition-colors border ${
              filterStatus === s
                ? 'bg-lime-400 text-zinc-950 border-lime-400'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {s === 'active' ? 'Active' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <Wrench className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-bold">No work orders found</p>
          <p className="text-zinc-600 text-sm mt-1">Open a new job to start tracking work on a bike.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status]
            const Icon = cfg.icon
            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className="w-full text-left rounded-2xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-600 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  {/* Status stripe */}
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cfg.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-zinc-100 leading-tight">{order.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{order.vehicleName} · {order.vehicleType}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {order.laborHours > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" />{order.laborHours.toFixed(1)}h
                        </span>
                      )}
                      {order.partsCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Package className="h-3 w-3" />{order.partsCount}
                        </span>
                      )}
                      {order.photosCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Camera className="h-3 w-3" />{order.photosCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
