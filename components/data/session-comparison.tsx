'use client'

import { useState } from 'react'
import { ChevronDown, TrendingUp, Heart, Zap, Gauge, Download, Mail, Loader2 } from 'lucide-react'
import { TelemetryWaveform } from './telemetry-waveform'

interface SessionLap {
  lapNumber: number
  time: number
  heartRate: number
  power: number
  speed: number
  temperature: number
  humidity: number
  notes?: string
}

interface Session {
  id: string
  name: string
  date: string
  laps: SessionLap[]
}

const DEMO_SESSION_A: Session = {
  id: 'session-a',
  name: 'Wednesday Hard Intervals',
  date: '2026-07-09',
  laps: [
    { lapNumber: 1, time: 1258, heartRate: 172, power: 845, speed: 61, temperature: 28, humidity: 65 },
    { lapNumber: 2, time: 1245, heartRate: 175, power: 865, speed: 62, temperature: 28, humidity: 65 },
    { lapNumber: 3, time: 1238, heartRate: 178, power: 885, speed: 63, temperature: 29, humidity: 64 },
  ],
}

const DEMO_SESSION_B: Session = {
  id: 'session-b',
  name: 'Saturday Race Day',
  date: '2026-07-19',
  laps: [
    { lapNumber: 1, time: 1242, heartRate: 188, power: 920, speed: 64, temperature: 32, humidity: 58 },
    { lapNumber: 2, time: 1235, heartRate: 192, power: 945, speed: 65, temperature: 32, humidity: 57 },
    { lapNumber: 3, time: 1238, heartRate: 190, power: 935, speed: 64, temperature: 33, humidity: 56 },
  ],
}

export function SessionComparison() {
  const [sessionA, setSessionA] = useState(DEMO_SESSION_A)
  const [sessionB, setSessionB] = useState(DEMO_SESSION_B)
  const [selectedLap, setSelectedLap] = useState(1)
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/md-sessions/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionA,
          sessionB,
          riderName: 'Alex Martinez',
          vehicleName: 'Kawasaki KX450 #7',
        }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session-report-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[v0] PDF export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleEmailShare = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/md-sessions/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionA,
          sessionB,
          riderName: 'Alex Martinez',
          vehicleName: 'Kawasaki KX450 #7',
        }),
      })

      if (!response.ok) throw new Error('Export failed')

      // In real app, this would send via email API
      // For now, show toast confirmation
      alert('Report would be emailed to team')
    } catch (err) {
      console.error('[v0] Email share error:', err)
    } finally {
      setExporting(false)
    }
  }

  const lapA = sessionA.laps.find((l) => l.lapNumber === selectedLap)
  const lapB = sessionB.laps.find((l) => l.lapNumber === selectedLap)

  const getDelta = (a: number, b: number) => {
    const delta = b - a
    const percent = ((delta / a) * 100).toFixed(1)
    return { delta: delta.toFixed(0), percent }
  }

  const timeDelta = lapA && lapB ? getDelta(lapA.time, lapB.time) : null
  const hrDelta = lapA && lapB ? getDelta(lapA.heartRate, lapB.heartRate) : null
  const powerDelta = lapA && lapB ? getDelta(lapA.power, lapB.power) : null
  const speedDelta = lapA && lapB ? getDelta(lapA.speed, lapB.speed) : null

  const renderMetricCard = (
    icon: React.ReactNode,
    label: string,
    valueA: number | string,
    valueB: number | string,
    unit: string,
    delta?: { delta: string; percent: string } | null,
    highlight?: boolean
  ) => {
    const deltaNum = Number(delta?.delta || 0)
    const isImprovement = deltaNum < 0
    return (
      <div className={`border ${highlight ? 'border-lime-500/50 bg-lime-500/5' : 'border-zinc-800 bg-zinc-900'} rounded-lg p-4`}>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <span className="text-xs font-bold text-zinc-400 uppercase">{label}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Training</p>
            <p className="text-2xl font-black text-blue-400">
              {valueA}
              <span className="text-xs text-zinc-500 ml-1">{unit}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Race Day</p>
            <p className="text-2xl font-black text-lime-400">
              {valueB}
              <span className="text-xs text-zinc-500 ml-1">{unit}</span>
            </p>
          </div>
        </div>
        {delta && (
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <p className={`text-xs font-bold ${isImprovement ? 'text-lime-400' : 'text-orange-400'}`}>
              {isImprovement ? '↓' : '↑'} {Math.abs(Number(delta.delta))} {unit} ({Math.abs(Number(delta.percent))}%)
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">Session Comparison</h2>
          <p className="text-sm text-zinc-400 mt-1">Side-by-side lap analysis: Training session vs. Race day</p>
        </div>

        {/* Export Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500/10 border border-lime-500/30 hover:border-lime-500/50 text-lime-400 text-sm font-bold transition disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </button>
          <button
            onClick={handleEmailShare}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 text-sm font-bold transition disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Share via Email
          </button>
        </div>
      </div>

      {/* Session Headers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-blue-500/40 bg-blue-500/5 rounded-lg p-4">
          <p className="text-xs font-bold text-blue-400 uppercase">Training Session</p>
          <p className="text-sm text-zinc-50 font-bold mt-1">{sessionA.name}</p>
          <p className="text-xs text-zinc-500 mt-1">{sessionA.date}</p>
        </div>
        <div className="border border-lime-500/40 bg-lime-500/5 rounded-lg p-4">
          <p className="text-xs font-bold text-lime-400 uppercase">Race Day</p>
          <p className="text-sm text-zinc-50 font-bold mt-1">{sessionB.name}</p>
          <p className="text-xs text-zinc-500 mt-1">{sessionB.date}</p>
        </div>
      </div>

      {/* Lap Selection */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-zinc-400 uppercase">Compare Lap</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((lapNum) => (
            <button
              key={lapNum}
              onClick={() => setSelectedLap(lapNum)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                selectedLap === lapNum
                  ? 'bg-lime-500 text-zinc-950'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              Lap {lapNum}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Comparison */}
      {lapA && lapB && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {renderMetricCard(
            <TrendingUp className="h-4 w-4 text-amber-400" />,
            'Lap Time',
            (lapA.time / 1000).toFixed(2),
            (lapB.time / 1000).toFixed(2),
            's',
            timeDelta,
            Math.abs(Number(timeDelta?.delta || 0)) < 10
          )}

          {renderMetricCard(
            <Heart className="h-4 w-4 text-red-400" />,
            'Heart Rate',
            lapA.heartRate,
            lapB.heartRate,
            'bpm',
            hrDelta
          )}

          {renderMetricCard(
            <Zap className="h-4 w-4 text-yellow-400" />,
            'Peak Power',
            lapA.power,
            lapB.power,
            'W',
            powerDelta
          )}

          {renderMetricCard(
            <Gauge className="h-4 w-4 text-blue-400" />,
            'Speed',
            lapA.speed,
            lapB.speed,
            'mph',
            speedDelta
          )}
        </div>
      )}

      {/* Detailed Comparison Table */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <p className="text-xs font-bold text-zinc-400 uppercase">Lap {selectedLap} Full Telemetry</p>
        </div>
        {lapA && lapB && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-zinc-800">
                <tr className="bg-zinc-800/50">
                  <th className="px-4 py-2 text-left text-zinc-400 font-bold">Metric</th>
                  <th className="px-4 py-2 text-left text-blue-400 font-bold">Training</th>
                  <th className="px-4 py-2 text-left text-lime-400 font-bold">Race</th>
                  <th className="px-4 py-2 text-left text-orange-400 font-bold">Delta</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-2 text-zinc-300">Lap Time</td>
                  <td className="px-4 py-2 text-blue-400 font-bold">{(lapA.time / 1000).toFixed(2)}s</td>
                  <td className="px-4 py-2 text-lime-400 font-bold">{(lapB.time / 1000).toFixed(2)}s</td>
                  <td className="px-4 py-2 text-orange-400 font-bold">{timeDelta?.delta}ms</td>
                </tr>
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-2 text-zinc-300">Avg Heart Rate</td>
                  <td className="px-4 py-2 text-blue-400 font-bold">{lapA.heartRate}</td>
                  <td className="px-4 py-2 text-lime-400 font-bold">{lapB.heartRate}</td>
                  <td className="px-4 py-2 text-orange-400 font-bold">+{Number(hrDelta?.delta)}</td>
                </tr>
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-2 text-zinc-300">Peak Power</td>
                  <td className="px-4 py-2 text-blue-400 font-bold">{lapA.power}W</td>
                  <td className="px-4 py-2 text-lime-400 font-bold">{lapB.power}W</td>
                  <td className="px-4 py-2 text-orange-400 font-bold">+{Number(powerDelta?.delta)}W</td>
                </tr>
                <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-4 py-2 text-zinc-300">Max Speed</td>
                  <td className="px-4 py-2 text-blue-400 font-bold">{lapA.speed} mph</td>
                  <td className="px-4 py-2 text-lime-400 font-bold">{lapB.speed} mph</td>
                  <td className="px-4 py-2 text-orange-400 font-bold">+{Number(speedDelta?.delta)} mph</td>
                </tr>
                <tr className="hover:bg-zinc-800/20">
                  <td className="px-4 py-2 text-zinc-300">Temperature</td>
                  <td className="px-4 py-2 text-blue-400 font-bold">{lapA.temperature}°C</td>
                  <td className="px-4 py-2 text-lime-400 font-bold">{lapB.temperature}°C</td>
                  <td className="px-4 py-2 text-orange-400 font-bold">+{lapB.temperature - lapA.temperature}°</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Waveform Overlay */}
      {lapA && lapB && (
        <div className="space-y-4 border border-zinc-800 bg-zinc-900 rounded-lg p-6">
          <h3 className="text-sm font-bold text-zinc-300 mb-4">Waveform Overlay: Lap {selectedLap}</h3>

          {/* Heart Rate Comparison */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-400">Heart Rate Progression</p>
              <div className="flex gap-2 text-xs">
                <span className="text-blue-400">Training</span>
                <span className="text-lime-400">Race Day</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-zinc-700 rounded bg-zinc-800/50 p-3">
                <TelemetryWaveform
                  data={Array.from({ length: 60 }, (_, i) => ({
                    timestamp: i,
                    heartRate: lapA.heartRate + Math.sin(i / 10) * 8 + Math.random() * 3,
                  }))}
                  metric="heartRate"
                  color="#3b82f6"
                  label="Training Session"
                />
              </div>

              <div className="border border-zinc-700 rounded bg-zinc-800/50 p-3">
                <TelemetryWaveform
                  data={Array.from({ length: 60 }, (_, i) => ({
                    timestamp: i,
                    heartRate: lapB.heartRate + Math.sin(i / 10) * 10 + Math.random() * 4,
                  }))}
                  metric="heartRate"
                  color="#22c55e"
                  label="Race Day"
                />
              </div>
            </div>
          </div>

          {/* Power Comparison */}
          <div className="space-y-2 pt-4 border-t border-zinc-700">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-400">Power Output</p>
              <div className="flex gap-2 text-xs">
                <span className="text-blue-400">Training</span>
                <span className="text-lime-400">Race Day</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-zinc-700 rounded bg-zinc-800/50 p-3">
                <TelemetryWaveform
                  data={Array.from({ length: 60 }, (_, i) => ({
                    timestamp: i,
                    power: lapA.power * 0.6 + Math.sin(i / 8) * (lapA.power * 0.4) + Math.random() * 40,
                  }))}
                  metric="power"
                  color="#3b82f6"
                  label="Training Session"
                />
              </div>

              <div className="border border-zinc-700 rounded bg-zinc-800/50 p-3">
                <TelemetryWaveform
                  data={Array.from({ length: 60 }, (_, i) => ({
                    timestamp: i,
                    power: lapB.power * 0.6 + Math.sin(i / 8) * (lapB.power * 0.4) + Math.random() * 50,
                  }))}
                  metric="power"
                  color="#22c55e"
                  label="Race Day"
                />
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="pt-4 border-t border-zinc-700">
            <p className="text-xs text-zinc-400">
              Race day waveforms show {Math.abs(Number(powerDelta?.percent))}% higher peak power with {Math.abs(Number(hrDelta?.percent))}% elevated HR response — 
              {Number(powerDelta?.delta) > 50 ? ' excellent' : ' good'} aerobic progression and readiness achieved.
            </p>
          </div>
        </div>
      )}

      <div className="border border-lime-500/40 bg-lime-500/5 p-4 rounded-lg">
        <p className="text-sm text-lime-300">✓ Race day shows 8-10% power increase and 5-10 bpm higher, proving peak readiness achieved.</p>
      </div>
    </div>
  )
}
