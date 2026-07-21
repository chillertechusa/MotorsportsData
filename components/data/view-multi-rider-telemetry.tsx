'use client'

import { useState } from 'react'
import { DEMO_MULTI_RIDER_TELEMETRY } from '@/lib/md-demo-data'
import { TrendingUp, Heart, Zap, Gauge, TrendingDown } from 'lucide-react'
import { TelemetryWaveform } from './telemetry-waveform'

export function ViewMultiRiderTelemetry() {
  const [selectedRider, setSelectedRider] = useState<string | null>(null)
  const [selectedLap, setSelectedLap] = useState(1)
  const [comparisonRider, setComparisonRider] = useState<string | null>(null)

  const riders = DEMO_MULTI_RIDER_TELEMETRY
  const riderData = riders.find((r) => r.riderId === selectedRider) || riders[0]
  const lapData = riderData.laps.find((l) => l.lapNumber === selectedLap)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">Multi-Rider Telemetry</h2>
        <p className="text-sm text-zinc-400 mt-1">Real-time comparison across all factory team riders.</p>
      </div>

      {/* Track Map with Rider Positions */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900">
        <div className="aspect-video flex items-center justify-center relative bg-gradient-to-br from-zinc-800 to-zinc-900 p-8">
          {/* SVG Track Layout */}
          <svg viewBox="0 0 400 300" className="w-full h-full max-w-2xl" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
            {/* Track border */}
            <ellipse cx="200" cy="150" rx="160" ry="110" fill="none" stroke="#52525b" strokeWidth="2" />
            <ellipse cx="200" cy="150" rx="140" ry="90" fill="none" stroke="#52525b" strokeWidth="1" strokeDasharray="4" />

            {/* Apex markers (dots around track) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180
              const x = 200 + 150 * Math.cos(rad)
              const y = 150 + 105 * Math.sin(rad)
              return <circle key={angle} cx={x} cy={y} r="3" fill="#71717a" opacity="0.5" />
            })}

            {/* Rider positions (animated circles) */}
            {riders.map((r, idx) => {
              const angle = (idx * 120 + (selectedLap - 1) * 30) % 360
              const rad = (angle * Math.PI) / 180
              const x = 200 + 130 * Math.cos(rad)
              const y = 150 + 80 * Math.sin(rad)
              const isSelected = selectedRider === r.riderId
              return (
                <g key={r.riderId}>
                  {/* Rider dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 8 : 5}
                    fill={r.color}
                    opacity="0.9"
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedRider(r.riderId)}
                  />
                  {/* Label */}
                  <text x={x} y={y - 18} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#f4f4f5" className="pointer-events-none">
                    {r.riderName}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 text-xs text-zinc-400 space-y-1">
            <p>Lap {selectedLap} positions</p>
            <p className="text-zinc-600">Click rider to focus</p>
          </div>
        </div>
      </div>

      {/* Rider Selection */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-zinc-400 uppercase">Select Rider</p>
        <div className="flex gap-2">
          {riders.map((r) => (
            <button
              key={r.riderId}
              onClick={() => setSelectedRider(r.riderId)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                selectedRider === r.riderId || (selectedRider === null && r === riders[0])
                  ? 'bg-lime-500 text-zinc-950'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: r.color }}></span>
              {r.riderName}
            </button>
          ))}
        </div>
      </div>

      {/* Lap Selection */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-zinc-400 uppercase">Lap</p>
        <div className="flex gap-2">
          {riderData.laps.map((lap) => (
            <button
              key={lap.lapNumber}
              onClick={() => setSelectedLap(lap.lapNumber)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                selectedLap === lap.lapNumber
                  ? 'bg-lime-500 text-zinc-950'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              Lap {lap.lapNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry Waveform Overlay */}
      {lapData && (
        <div className="space-y-4 border border-zinc-800 bg-zinc-900 rounded-lg p-6">
          <div>
            <p className="text-sm font-bold text-zinc-50 mb-1">Telemetry Overlay: {riderData.riderName}</p>
            <p className="text-xs text-zinc-400">Lap {selectedLap} waveforms</p>
          </div>

          {/* Generate synthetic waveform data for the selected rider */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heart Rate Waveform */}
            <div className="border border-zinc-700 rounded bg-zinc-800/50 p-3">
              <TelemetryWaveform
                data={Array.from({ length: 60 }, (_, i) => ({
                  timestamp: i,
                  heartRate: lapData.avgHR + Math.sin(i / 10) * (lapData.peakHR - lapData.avgHR) + Math.random() * 5,
                }))}
                metric="heartRate"
                color="#ef4444"
                label="Heart Rate"
              />
            </div>

            {/* Power Waveform */}
            <div className="border border-zinc-700 rounded bg-zinc-800/50 p-3">
              <TelemetryWaveform
                data={Array.from({ length: 60 }, (_, i) => ({
                  timestamp: i,
                  power: (lapData.peakPower * 0.6) + Math.sin(i / 8) * (lapData.peakPower * 0.4) + Math.random() * 50,
                }))}
                metric="power"
                color="#fbbf24"
                label="Power Output"
              />
            </div>
          </div>

          {/* Comparison with other riders */}
          {riders.length > 1 && (
            <div className="pt-4 border-t border-zinc-700">
              <p className="text-xs font-bold text-zinc-400 uppercase mb-3">Compare with:</p>
              <div className="flex gap-2">
                {riders
                  .filter((r) => r.riderId !== selectedRider)
                  .map((r) => (
                    <button
                      key={r.riderId}
                      onClick={() => setComparisonRider(comparisonRider === r.riderId ? null : r.riderId)}
                      className={`px-3 py-1 rounded text-xs font-bold transition ${
                        comparisonRider === r.riderId
                          ? 'bg-lime-500 text-zinc-950'
                          : 'border border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: r.color }}></span>
                      {r.riderName}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Telemetry Stats */}
      {lapData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-zinc-400">Lap Time</span>
            </div>
            <p className="text-2xl font-black text-amber-400">{(lapData.lapTime / 1000).toFixed(2)}s</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-xs font-bold text-zinc-400">Peak HR</span>
            </div>
            <p className="text-2xl font-black text-red-400">{lapData.peakHR} bpm</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-bold text-zinc-400">Peak Power</span>
            </div>
            <p className="text-2xl font-black text-yellow-400">{lapData.peakPower}W</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-zinc-400">Max Speed</span>
            </div>
            <p className="text-2xl font-black text-blue-400">{lapData.maxSpeed} mph</p>
          </div>
        </div>
      )}

      {/* Rider Comparison Table */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <p className="text-xs font-bold text-zinc-400 uppercase">Lap {selectedLap} Comparison</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-zinc-800">
              <tr>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Rider</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Lap Time</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Avg HR</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Power</th>
                <th className="px-4 py-2 text-left text-zinc-400 font-bold">Speed</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => {
                const lap = r.laps.find((l) => l.lapNumber === selectedLap)
                if (!lap) return null
                return (
                  <tr key={r.riderId} className="border-b border-zinc-800/50">
                    <td className="px-4 py-2 font-bold text-zinc-50">
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: r.color }}></span>
                      {r.riderName}
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{(lap.lapTime / 1000).toFixed(2)}s</td>
                    <td className="px-4 py-2 text-zinc-300">{lap.avgHR} bpm</td>
                    <td className="px-4 py-2 text-zinc-300">{lap.peakPower}W</td>
                    <td className="px-4 py-2 text-zinc-300">{lap.maxSpeed} mph</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
