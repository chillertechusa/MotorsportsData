'use client'

import { useState } from 'react'
import { MapPin, Zap } from 'lucide-react'

/**
 * Track map visualization with rider positions.
 * Production: Will use Deck.gl + Mapbox for full interactive map.
 * For now: Canvas-based fallback with rider overlay.
 */
export function TrackMapOverlay() {
  const [selectedRider, setSelectedRider] = useState<string>('rider-1')

  const riderData = [
    {
      id: 'rider-1',
      name: 'Rider A',
      position: 'Lead - 0.2s',
      color: 'bg-lime-500',
      speed: 62,
      lapTime: 1245,
      hr: 188,
    },
    {
      id: 'rider-2',
      name: 'Rider B',
      position: 'P2 - 0.8s back',
      color: 'bg-blue-500',
      speed: 60,
      lapTime: 1252,
      hr: 185,
    },
    {
      id: 'rider-3',
      name: 'Rider C',
      position: 'P3 - 2.1s back',
      color: 'bg-amber-500',
      speed: 59,
      lapTime: 1258,
      hr: 182,
    },
  ]

  const selectedData = riderData.find((r) => r.id === selectedRider)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">Track Map</h2>
        <p className="text-sm text-zinc-400 mt-1">Live multi-rider position and telemetry overlay</p>
      </div>

      {/* Track Visualization */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
        <div className="aspect-video flex items-center justify-center relative bg-gradient-to-br from-zinc-800 to-zinc-900">
          {/* Track representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-48 border-2 border-zinc-700 rounded-3xl relative">
              {/* Rider positions on track */}
              {riderData.map((r, idx) => (
                <div
                  key={r.id}
                  className={`absolute w-4 h-4 rounded-full border-2 border-white ${r.color} cursor-pointer transition transform hover:scale-125`}
                  style={{
                    top: `${20 + idx * 25}%`,
                    left: `${30 + idx * 20}%`,
                  }}
                  onClick={() => setSelectedRider(r.id)}
                  title={r.name}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-zinc-50 whitespace-nowrap">
                    {r.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 text-xs text-zinc-500">
            <p>← Production: Mapbox GL JS integration</p>
            <p>→ Click riders to select</p>
          </div>
        </div>
      </div>

      {/* Rider Selection */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-zinc-400 uppercase">Select Rider</p>
        <div className="flex gap-2">
          {riderData.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRider(r.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                selectedRider === r.id
                  ? 'bg-lime-500 text-zinc-950'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${r.color}`}></span>
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Rider Details */}
      {selectedData && (
        <div className="border border-lime-500/40 bg-lime-500/5 rounded-lg p-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-zinc-400 uppercase mb-1">Position</p>
              <p className="text-lg font-black text-lime-400">{selectedData.position}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase mb-1">Speed</p>
              <p className="text-lg font-black text-blue-400">{selectedData.speed} mph</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase mb-1">Current Lap</p>
              <p className="text-lg font-black text-amber-400">{(selectedData.lapTime / 1000).toFixed(2)}s</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase mb-1">Heart Rate</p>
              <p className="text-lg font-black text-red-400">{selectedData.hr} bpm</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <p className="text-xs font-bold text-zinc-400 uppercase">Live Leaderboard</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Position</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Rider</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Lap Time</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Gap</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Speed</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">HR</th>
              </tr>
            </thead>
            <tbody>
              {riderData.map((r, idx) => (
                <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-2 font-bold text-zinc-50">P{idx + 1}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${r.color}`}></div>
                    {r.name}
                  </td>
                  <td className="px-4 py-2 text-lime-400 font-bold">{(r.lapTime / 1000).toFixed(2)}s</td>
                  <td className="px-4 py-2 text-zinc-400">{r.position.split(' - ')[1]}</td>
                  <td className="px-4 py-2 text-blue-400">{r.speed} mph</td>
                  <td className="px-4 py-2 text-red-400">{r.hr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
