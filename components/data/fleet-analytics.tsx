'use client'

import { useState, useEffect } from 'react'
import { Wrench, TrendingDown, AlertTriangle } from 'lucide-react'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface VehicleAnalytics {
  vehicleId: string
  vehicleName: string
  totalSessions: number
  totalHours: number
  maintenanceCost: number
  partsAtRisk: number
  maintenanceEvents: Array<{
    partName: string
    currentHours: number
    maxHours: number
    percentageUsed: number
    status: 'good' | 'warning' | 'critical'
  }>
}

interface FleetMetrics {
  totalVehicles: number
  totalSessions: number
  totalMaintenanceCost: number
  averageCostPerVehicle: number
  partsNeedingService: number
}

export function FleetAnalytics({ vehicles }: { vehicles: Vehicle[] }) {
  const [analytics, setAnalytics] = useState<VehicleAnalytics[]>([])
  const [metrics, setMetrics] = useState<FleetMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      try {
        const res = await fetch('/api/md-fleet-analytics')
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data.vehicles)
          setMetrics(data.metrics)
        }
      } catch (e) {
        console.error('Failed to fetch analytics:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400 border-green-900'
      case 'warning':
        return 'text-orange-400 border-orange-900'
      case 'critical':
        return 'text-red-400 border-red-900'
      default:
        return 'text-zinc-400 border-zinc-800'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-900/20'
      case 'warning':
        return 'bg-orange-900/20'
      case 'critical':
        return 'bg-red-900/20'
      default:
        return 'bg-zinc-800/20'
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-zinc-100 mb-2">Fleet Analytics</h1>
          <p className="text-zinc-400">Maintenance costs and fleet operational metrics</p>
        </div>

        {/* Fleet metrics */}
        {metrics && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Total Vehicles</p>
              <p className="text-3xl font-black text-lime-400">{metrics.totalVehicles}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Total Sessions</p>
              <p className="text-3xl font-black text-zinc-100">{metrics.totalSessions}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-2">Fleet Maintenance Cost</p>
              <p className="text-2xl font-black text-zinc-100">${metrics.totalMaintenanceCost.toLocaleString()}</p>
              <p className="text-xs text-zinc-500 mt-2">${metrics.averageCostPerVehicle.toLocaleString()} avg per vehicle</p>
            </div>

            <div className="bg-zinc-900 border border-red-900 rounded-lg p-6">
              <p className="text-sm font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Parts Needing Service
              </p>
              <p className="text-3xl font-black text-red-400">{metrics.partsNeedingService}</p>
            </div>
          </div>
        )}

        {/* Per-vehicle analytics */}
        {analytics.length > 0 && (
          <div className="space-y-8">
            {analytics.map((vehicle) => (
              <div key={vehicle.vehicleId} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                {/* Vehicle header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-100">{vehicle.vehicleName}</h2>
                    <p className="text-sm text-zinc-500 mt-1 font-mono">
                      {vehicle.totalSessions} sessions • {vehicle.totalHours.toFixed(1)} hours
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-lime-400">${vehicle.maintenanceCost.toLocaleString()}</p>
                    <p className="text-sm text-zinc-500">maintenance cost</p>
                  </div>
                </div>

                {/* Parts maintenance */}
                <div className="grid grid-cols-1 gap-4">
                  {vehicle.maintenanceEvents.length > 0 ? (
                    vehicle.maintenanceEvents.map((part, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded border ${getStatusColor(part.status)} ${getStatusBg(part.status)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-black text-zinc-100 flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            {part.partName}
                          </p>
                          <p className="text-sm font-mono">{part.percentageUsed.toFixed(0)}% used</p>
                        </div>
                        <div className="bg-zinc-800 rounded-full h-2 w-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              part.status === 'critical'
                                ? 'bg-red-400'
                                : part.status === 'warning'
                                  ? 'bg-orange-400'
                                  : 'bg-green-400'
                            }`}
                            style={{ width: `${part.percentageUsed}%` }}
                          />
                        </div>
                        <p className="text-xs text-zinc-400 mt-2">
                          {part.currentHours.toFixed(1)} / {part.maxHours.toFixed(1)} hours
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-center py-8">No maintenance data yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-zinc-500">Loading fleet analytics...</p>
          </div>
        )}
      </div>
    </main>
  )
}
