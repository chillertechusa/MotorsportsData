'use client'

import { useState } from 'react'
import { Play, RotateCcw, Copy, Check } from 'lucide-react'

export default function TestTelemetryPage() {
  const [logs, setLogs] = useState<{ timestamp: string; message: string; type: 'info' | 'success' | 'error' }[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    }
    setLogs((prev) => [...prev, log])
    console.log(`[${type}] ${message}`)
  }

  const sendTelemetry = async (type: 'single' | 'batch' | 'invalid') => {
    setLoading(true)
    addLog(`Sending ${type} telemetry...`, 'info')

    try {
      let payload: any

      if (type === 'single') {
        payload = {
          timestamp: Date.now(),
          sessionId: 'race-test-' + Date.now(),
          riderId: 'rider-demo',
          teamId: 'team-demo',
          heartRate: 170,
          powerWatts: 315,
          speedMph: 68.5,
          cadenceRpm: 98,
          lapNumber: 5,
          sector: 3,
          deviceId: 'garmin-edge-1540',
          deviceType: 'garmin',
        }
      } else if (type === 'batch') {
        payload = Array.from({ length: 5 }, (_, i) => ({
          timestamp: Date.now() + i * 1000,
          sessionId: 'race-test-' + Date.now(),
          riderId: 'rider-demo',
          teamId: 'team-demo',
          heartRate: 170 + i,
          powerWatts: 315 + Math.random() * 20,
          speedMph: 68.5 + i * 0.1,
          cadenceRpm: 98,
          deviceId: 'garmin-edge-1540',
          deviceType: 'garmin',
        }))
      } else {
        // Invalid: missing required fields
        payload = {
          heartRate: 170,
          // Missing sessionId, riderId, teamId, deviceId, deviceType
        }
      }

      const response = await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        addLog(`Success: ${result.pointsIngested} points ingested`, 'success')
        if (result.pointsRejected > 0) {
          addLog(`${result.pointsRejected} points rejected`, 'info')
        }
      } else {
        addLog(`Error: ${result.error}`, 'error')
      }

      addLog(`Response: ${JSON.stringify(result)}`, 'info')
    } catch (error: any) {
      addLog(`Error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const curlCommand = `curl -X POST https://motorsportsdata.io/api/telemetry/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "timestamp": 1720569600000,
    "sessionId": "race-test",
    "riderId": "rider-123",
    "teamId": "team-demo",
    "heartRate": 170,
    "powerWatts": 315,
    "speedMph": 68.5,
    "deviceId": "garmin-edge-1540",
    "deviceType": "garmin"
  }'`

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Telemetry Ingestion Test</h1>
          <p className="text-zinc-400">Test the /api/telemetry/ingest endpoint</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => sendTelemetry('single')}
            disabled={loading}
            className="px-4 py-3 bg-lime-500 text-zinc-950 font-bold rounded hover:bg-lime-400 disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Send Single Point
          </button>

          <button
            onClick={() => sendTelemetry('batch')}
            disabled={loading}
            className="px-4 py-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-400 disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Send Batch (5 points)
          </button>

          <button
            onClick={() => sendTelemetry('invalid')}
            disabled={loading}
            className="px-4 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-500 disabled:opacity-50 flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Test Invalid Data
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* CURL Command */}
          <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">CURL Command</h2>
            <div className="bg-zinc-950 p-4 rounded font-mono text-xs overflow-x-auto mb-4">
              <pre>{curlCommand}</pre>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(curlCommand)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-bold"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Command'}
            </button>
          </div>

          {/* Stats */}
          <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-400">Total Requests</p>
                <p className="text-2xl font-black text-lime-500">
                  {logs.filter((l) => l.type === 'success').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Endpoint Status</p>
                <p className="text-lg font-bold text-green-500">🟢 Live</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Database</p>
                <p className="text-sm text-zinc-400">TimescaleDB (pending migration)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="mt-8 border border-zinc-800 bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Activity Log</h2>
            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-2 px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded"
            >
              <RotateCcw className="h-3 w-3" />
              Clear
            </button>
          </div>

          <div className="bg-zinc-950 rounded p-4 h-96 overflow-y-auto font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-zinc-500">Click a button above to send test telemetry...</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.type === 'success'
                      ? 'text-green-400'
                      : log.type === 'error'
                        ? 'text-red-400'
                        : 'text-zinc-300'
                  }`}
                >
                  <span className="text-zinc-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 border border-lime-500/30 bg-lime-500/5 rounded-lg p-6">
          <h3 className="font-bold mb-3">Next Steps</h3>
          <ol className="space-y-2 text-sm text-zinc-300">
            <li>✅ Test ingestion (this page)</li>
            <li>⏳ Enable TimescaleDB: run migration from docs/INFRASTRUCTURE_DEPLOYMENT.md</li>
            <li>⏳ Add LiveRaceDashboard component to coach console</li>
            <li>⏳ Set up device pairing (Garmin, Polar, Apple Watch)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
