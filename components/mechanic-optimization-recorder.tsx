'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'

const COMMON_PARAMETERS = [
  'fork_compression_clicks',
  'fork_rebound_clicks',
  'shock_compression_clicks',
  'shock_rebound_clicks',
  'tire_pressure_front_psi',
  'tire_pressure_rear_psi',
  'brake_lever_adjustment',
  'throttle_cable_tension',
  'engine_jetting_needle',
  'suspension_height_mm',
]

interface MechanicOptimizationRecorderProps {
  vehicleId: string
  workOrderId?: string
  sessionId?: string
  onRecorded?: () => void
}

export function MechanicOptimizationRecorder({
  vehicleId,
  workOrderId,
  sessionId,
  onRecorded,
}: MechanicOptimizationRecorderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    parameter: '',
    valueBefore: '',
    valueAfter: '',
    rationale: '',
    estimatedDelta: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/md-mechanic/optimizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          workOrderId,
          sessionId,
          parameter: formData.parameter,
          valueBefore: formData.valueBefore,
          valueAfter: formData.valueAfter,
          rationale: formData.rationale,
          estimatedLapTimeDelta: formData.estimatedDelta ? parseFloat(formData.estimatedDelta) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to record optimization')
      }

      // Reset form
      setFormData({
        parameter: '',
        valueBefore: '',
        valueAfter: '',
        rationale: '',
        estimatedDelta: '',
      })
      setIsOpen(false)
      onRecorded?.()
    } catch (error) {
      console.error('Error recording optimization:', error)
      alert('Failed to record optimization')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-lime-600 text-white rounded-lg font-semibold hover:bg-lime-500 transition"
        >
          <Plus className="w-5 h-5" />
          Record Optimization
        </button>
      ) : (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Log Setup Optimization</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Parameter dropdown */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Parameter *
              </label>
              <select
                value={formData.parameter}
                onChange={(e) => setFormData({ ...formData, parameter: e.target.value })}
                required
                className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-foreground focus:outline-none focus:border-lime-500"
              >
                <option value="">Select parameter...</option>
                {COMMON_PARAMETERS.map((param) => (
                  <option key={param} value={param}>
                    {param.replace(/_/g, ' ')}
                  </option>
                ))}
                <option value="custom">Other (custom)</option>
              </select>
            </div>

            {/* Before / After */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Before Value *
                </label>
                <input
                  type="text"
                  value={formData.valueBefore}
                  onChange={(e) => setFormData({ ...formData, valueBefore: e.target.value })}
                  required
                  placeholder="e.g., 22 clicks"
                  className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-foreground focus:outline-none focus:border-lime-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  After Value *
                </label>
                <input
                  type="text"
                  value={formData.valueAfter}
                  onChange={(e) => setFormData({ ...formData, valueAfter: e.target.value })}
                  required
                  placeholder="e.g., 18 clicks"
                  className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-foreground focus:outline-none focus:border-lime-500"
                />
              </div>
            </div>

            {/* Rationale */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Rationale
              </label>
              <textarea
                value={formData.rationale}
                onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                placeholder="Why did you make this change? What improvement do you expect?"
                rows={3}
                className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-foreground focus:outline-none focus:border-lime-500"
              />
            </div>

            {/* Estimated lap time delta */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Estimated Lap Time Gain (seconds)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.estimatedDelta}
                onChange={(e) => setFormData({ ...formData, estimatedDelta: e.target.value })}
                placeholder="e.g., -0.3 for 0.3s faster"
                className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-foreground focus:outline-none focus:border-lime-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Negative values = faster laps. This helps train our AI on your accuracy.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-zinc-700">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-lime-600 text-white rounded font-semibold hover:bg-lime-500 disabled:opacity-50 transition"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Recording...' : 'Record Optimization'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 text-foreground rounded font-semibold hover:bg-zinc-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
