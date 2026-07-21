'use client'

import { useCallback, useRef, useState } from 'react'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Database,
  Cpu,
  Zap,
  Clock,
  Activity,
  ArrowRight,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { DEVICE_REGISTRY, DeviceType, FileFormat } from '@/lib/telemetry/device-registry'
import { normalizeFieldName, inferDeviceType } from '@/lib/telemetry/data-mapper'

// ── Types ─────────────────────────────────────────────────────────────────────

type ImportPhase = 'idle' | 'parsing' | 'preview' | 'committing' | 'done' | 'error'

interface ParsedPreview {
  recordCount: number
  format: FileFormat
  detectedFields: string[]
  canonicalFields: string[]
  sampleRows: Record<string, unknown>[]
  hasHeartRate: boolean
  hasGPS: boolean
  hasLapTimes: boolean
  hasPower: boolean
  hasSuspension: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FORMAT_COLORS: Record<string, string> = {
  CSV: 'text-lime-400 bg-lime-400/10 border-lime-400/30',
  XML: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  GPX: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  FIT: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  TCX: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  TXT: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30',
}

const SUPPORTED_FORMATS: FileFormat[] = ['CSV', 'XML', 'GPX', 'TCX', 'TXT']

function detectFormat(filename: string): FileFormat | null {
  const ext = filename.split('.').pop()?.toUpperCase()
  if (!ext) return null
  if (SUPPORTED_FORMATS.includes(ext as FileFormat)) return ext as FileFormat
  if (ext === 'FIT') return 'FIT'
  return null
}

function detectDeviceFromFields(fields: string[]): string | null {
  const lower = fields.map(f => f.toLowerCase())
  if (lower.some(f => f.includes('mylaps') || f.includes('transponder'))) return 'MYLAPSTR2'
  if (lower.some(f => f.includes('westhold') || f.includes('g3_'))) return 'Westhold G3'
  if (lower.some(f => f.includes('aim') || f.includes('xrk'))) return 'AiM Solo'
  if (lower.some(f => f.includes('racebox'))) return 'RaceBox'
  if (lower.some(f => f.includes('crossbox'))) return 'Crossbox CBX20'
  if (lower.some(f => f.includes('stella'))) return 'Anubesport Stella'
  if (lower.some(f => f.includes('heart_rate') || f.includes('hr') || f.includes('bpm'))) {
    if (lower.some(f => f.includes('cadence') || f.includes('power'))) return 'Garmin HRM-Pro'
    return 'Polar H10'
  }
  return null
}

/** Quick client-side CSV sniff — returns fields + first 5 rows without full parse */
function sniffCSV(content: string): { fields: string[]; rows: Record<string, unknown>[] } {
  const lines = content.trim().split('\n').slice(0, 11)
  if (lines.length < 2) return { fields: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows = lines.slice(1, 6).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, isNaN(Number(vals[i])) ? vals[i] : Number(vals[i])]))
  })
  return { fields: headers, rows }
}

/** Count XML records */
function sniffXML(content: string): { fields: string[]; rows: Record<string, unknown>[] } {
  const recordCount = (content.match(/<record>/gi) || []).length
  const tagMatches = [...content.matchAll(/<(\w+)>[^<>]+<\/\1>/g)]
  const fields = [...new Set(tagMatches.map(m => m[1]).filter(t => t !== 'record'))]
  return { fields: fields.slice(0, 20), rows: Array(Math.min(recordCount, 5)).fill({}) }
}

function sniffGPX(content: string): { fields: string[]; rows: Record<string, unknown>[] } {
  const trkpts = content.match(/<trkpt[^>]*>/g) || []
  const hasEle = content.includes('<ele>')
  const hasTime = content.includes('<time>')
  const hasHR = content.includes('hr') || content.includes('heartrate')
  const fields = ['lat', 'lon', ...(hasEle ? ['elevation'] : []), ...(hasTime ? ['time'] : []), ...(hasHR ? ['heartRate'] : [])]
  return { fields, rows: Array(Math.min(trkpts.length, 5)).fill({}) }
}

function buildPreview(filename: string, content: string, format: FileFormat): ParsedPreview {
  let fields: string[] = []
  let rows: Record<string, unknown>[] = []
  let recordCount = 0

  if (format === 'CSV') {
    const sniff = sniffCSV(content)
    fields = sniff.fields
    rows = sniff.rows
    recordCount = content.trim().split('\n').length - 1
  } else if (format === 'XML') {
    const sniff = sniffXML(content)
    fields = sniff.fields
    rows = sniff.rows
    recordCount = (content.match(/<record>/gi) || []).length
  } else if (format === 'GPX') {
    const sniff = sniffGPX(content)
    fields = sniff.fields
    rows = sniff.rows
    recordCount = (content.match(/<trkpt/gi) || []).length
  } else if (format === 'TCX') {
    fields = ['time', 'heartRate', 'speed', 'distance', 'cadence', 'latitude', 'longitude']
    recordCount = (content.match(/<Trackpoint>/gi) || []).length
    rows = []
  } else {
    const sniff = sniffCSV(content)
    fields = sniff.fields
    rows = sniff.rows
    recordCount = content.trim().split('\n').length - 1
  }

  const canonicalFields = [...new Set(fields.map(f => normalizeFieldName(f)).filter(f => f !== f.toLowerCase() || fields.includes(f)))]

  return {
    recordCount,
    format,
    detectedFields: fields,
    canonicalFields,
    sampleRows: rows,
    hasHeartRate: fields.some(f => ['hr', 'heart_rate', 'heartrate', 'bpm', 'pulse'].includes(f.toLowerCase())),
    hasGPS: fields.some(f => ['lat', 'latitude', 'lon', 'longitude'].includes(f.toLowerCase())),
    hasLapTimes: fields.some(f => f.toLowerCase().includes('lap')),
    hasPower: fields.some(f => ['power', 'watts', 'avg_power'].includes(f.toLowerCase())),
    hasSuspension: fields.some(f => f.toLowerCase().includes('suspension') || f.toLowerCase().includes('travel')),
  }
}

// ── Channel badge ─────────────────────────────────────────────────────────────

function ChannelBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
      active
        ? 'border-lime-400/40 bg-lime-400/10 text-lime-300'
        : 'border-zinc-700 bg-zinc-800 text-zinc-500'
    }`}>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />}
      {label}
    </span>
  )
}

// ── Waveform mini sparkline (canvas) ──────────────────────────────────────────

function MiniSparkline({ values, color = '#a3e635' }: { values: number[]; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  // Use a layout effect pattern — draw once on mount
  const draw = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas || values.length < 2) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 4) - 2
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
  }, [values, color])

  return (
    <canvas
      ref={(el) => { draw(el) }}
      width={120}
      height={28}
      className="opacity-80"
    />
  )
}

// ── Field mapping row ─────────────────────────────────────────────────────────

function FieldMapRow({ raw, canonical }: { raw: string; canonical: string }) {
  const mapped = canonical !== raw
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-zinc-800/60 last:border-0">
      <span className="w-40 font-mono text-xs text-zinc-400 truncate">{raw}</span>
      <ArrowRight className="h-3 w-3 shrink-0 text-zinc-600" />
      <span className={`font-mono text-xs truncate ${mapped ? 'text-lime-400' : 'text-zinc-500'}`}>{canonical}</span>
      {mapped && (
        <span className="ml-auto shrink-0 rounded border border-lime-400/30 bg-lime-400/10 px-1.5 py-0.5 text-[10px] text-lime-400">mapped</span>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ViewTelemetryImport() {
  const [phase, setPhase] = useState<ImportPhase>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [format, setFormat] = useState<FileFormat | null>(null)
  const [preview, setPreview] = useState<ParsedPreview | null>(null)
  const [detectedDevice, setDetectedDevice] = useState<string | null>(null)
  const [showAllFields, setShowAllFields] = useState(false)
  const [importResult, setImportResult] = useState<{ importId: string; recordCount: number; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    const detectedFormat = detectFormat(file.name)
    if (!detectedFormat) {
      setError(`Unsupported format. Supported: ${SUPPORTED_FORMATS.join(', ')}`)
      setPhase('error')
      return
    }
    if (detectedFormat === 'FIT') {
      setError('FIT files require the Garmin SDK (coming soon). Please export as CSV or TCX from Garmin Connect.')
      setPhase('error')
      return
    }

    setSelectedFile(file)
    setFormat(detectedFormat)
    setPhase('parsing')
    setError(null)

    const content = await file.text()
    const p = buildPreview(file.name, content, detectedFormat)
    // Use the authoritative inferDeviceType from data-mapper (density-based matching)
    const inferredType = inferDeviceType(p.detectedFields)
    const device = inferredType
      ? (DEVICE_REGISTRY[inferredType]?.name ?? detectDeviceFromFields(p.detectedFields))
      : detectDeviceFromFields(p.detectedFields)
    setPreview(p)
    setDetectedDevice(device)
    setPhase('preview')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleCommit = async () => {
    if (!selectedFile || !format) return
    setPhase('committing')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('format', format)
      const res = await fetch('/api/md-telemetry/import', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Import failed')
      setImportResult({ importId: json.importId, recordCount: json.recordCount, message: json.message })
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setPhase('error')
    }
  }

  const reset = () => {
    setPhase('idle')
    setSelectedFile(null)
    setFormat(null)
    setPreview(null)
    setDetectedDevice(null)
    setImportResult(null)
    setError(null)
    setShowAllFields(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  // ── Idle / drop zone ───────────────────────────────────────────────────────
  if (phase === 'idle' || phase === 'parsing') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Telemetry Import</h2>
          <p className="mt-1 text-sm text-zinc-400">Upload session data from any supported device. Fields are auto-mapped to the MD canonical schema.</p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-14 cursor-pointer transition-all ${
            dragOver
              ? 'border-lime-400/60 bg-lime-400/5'
              : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xml,.gpx,.tcx,.txt,.fit"
            className="sr-only"
            onChange={handleFileInput}
          />
          {phase === 'parsing' ? (
            <>
              <RefreshCw className="h-10 w-10 text-lime-400 animate-spin" />
              <p className="text-sm font-medium text-zinc-300">Parsing file…</p>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800">
                <Upload className="h-7 w-7 text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Drop a telemetry file here</p>
                <p className="mt-1 text-sm text-zinc-500">or click to browse</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUPPORTED_FORMATS.map(f => (
                  <span key={f} className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${FORMAT_COLORS[f] || 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>{f}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Supported devices grid */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Supported Devices</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {Object.values(DEVICE_REGISTRY).map(device => (
              <div key={device.id} className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-200">{device.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {device.supportedFormats.slice(0, 3).map(f => (
                      <span key={f} className="rounded border border-zinc-700 px-1 py-0.5 font-mono text-[10px] text-zinc-500">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold text-red-300">Import failed</p>
            <p className="mt-1 text-sm text-red-400/80">{error}</p>
          </div>
        </div>
        <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </div>
    )
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (phase === 'done' && importResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4 rounded-2xl border border-lime-400/30 bg-lime-400/5 p-6">
          <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-lime-400" />
          <div>
            <p className="font-semibold text-lime-300">Import successful</p>
            <p className="mt-1 text-sm text-zinc-300">{importResult.message}</p>
            <p className="mt-1 font-mono text-xs text-zinc-500">Import ID: {importResult.importId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-center">
            <p className="text-2xl font-bold text-white">{importResult.recordCount.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">records imported</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-center">
            <p className="text-2xl font-bold text-white">{format}</p>
            <p className="text-xs text-zinc-500">file format</p>
          </div>
        </div>
        <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors">
          <Upload className="h-4 w-4" /> Import another file
        </button>
      </div>
    )
  }

  // ── Preview + commit ───────────────────────────────────────────────────────
  if ((phase === 'preview' || phase === 'committing') && preview) {
    const visibleFields = showAllFields ? preview.detectedFields : preview.detectedFields.slice(0, 8)

    // Generate demo sparkline values for channels that exist
    const demoHR = preview.hasHeartRate ? Array.from({ length: 40 }, (_, i) => 140 + Math.sin(i * 0.4) * 20 + Math.random() * 8) : []
    const demoSpeed = preview.hasGPS ? Array.from({ length: 40 }, (_, i) => 50 + Math.sin(i * 0.3) * 20 + Math.random() * 5) : []
    const demoLap = preview.hasLapTimes ? Array.from({ length: 20 }, (_, i) => 90 + i * 0.3 + Math.random() * 2) : []

    return (
      <div className="space-y-6">
        {/* File header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800">
              <FileText className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{selectedFile?.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${FORMAT_COLORS[format!] || 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>{format}</span>
                <span className="text-xs text-zinc-500">{preview.recordCount.toLocaleString()} records</span>
                {detectedDevice && (
                  <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-2 py-0.5 text-xs text-blue-300">
                    {detectedDevice}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={reset} className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Data channels detected */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-3 text-sm font-semibold text-zinc-200">Detected channels</p>
          <div className="flex flex-wrap gap-2">
            <ChannelBadge label="Heart Rate" active={preview.hasHeartRate} />
            <ChannelBadge label="GPS / Speed" active={preview.hasGPS} />
            <ChannelBadge label="Lap Times" active={preview.hasLapTimes} />
            <ChannelBadge label="Power" active={preview.hasPower} />
            <ChannelBadge label="Suspension" active={preview.hasSuspension} />
          </div>

          {/* Waveform previews for active channels */}
          {(demoHR.length > 0 || demoSpeed.length > 0 || demoLap.length > 0) && (
            <div className="mt-4 space-y-2">
              {demoHR.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="w-20 text-xs text-zinc-500">Heart Rate</span>
                  <MiniSparkline values={demoHR} color="#f87171" />
                  <span className="text-xs text-zinc-600">~{Math.round(demoHR.reduce((a,b)=>a+b)/demoHR.length)} avg bpm</span>
                </div>
              )}
              {demoSpeed.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="w-20 text-xs text-zinc-500">Speed</span>
                  <MiniSparkline values={demoSpeed} color="#60a5fa" />
                  <span className="text-xs text-zinc-600">~{Math.round(demoSpeed.reduce((a,b)=>a+b)/demoSpeed.length)} mph avg</span>
                </div>
              )}
              {demoLap.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="w-20 text-xs text-zinc-500">Lap Time</span>
                  <MiniSparkline values={demoLap} color="#a3e635" />
                  <span className="text-xs text-zinc-600">{demoLap.length} laps</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Field mapping table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-200">Field mapping</p>
              <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">{preview.detectedFields.length} fields</span>
            </div>
            {preview.detectedFields.length > 8 && (
              <button
                onClick={() => setShowAllFields(!showAllFields)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                {showAllFields ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show all {preview.detectedFields.length}</>}
              </button>
            )}
          </div>
          <div className="divide-y divide-zinc-800/0">
            {visibleFields.map(field => (
              <FieldMapRow key={field} raw={field} canonical={normalizeFieldName(field)} />
            ))}
          </div>
        </div>

        {/* Sample rows */}
        {preview.sampleRows.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-200">Sample rows</p>
              <span className="text-xs text-zinc-500">(first {preview.sampleRows.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    {preview.detectedFields.slice(0, 6).map(f => (
                      <th key={f} className="whitespace-nowrap border-b border-zinc-800 pb-2 pr-4 text-left font-mono text-zinc-500">{f}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleRows.map((row, i) => (
                    <tr key={i}>
                      {preview.detectedFields.slice(0, 6).map(f => (
                        <td key={f} className="whitespace-nowrap border-b border-zinc-800/50 py-1.5 pr-4 font-mono text-zinc-300">
                          {String(row[f] ?? '—').slice(0, 20)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Commit bar */}
        <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-2xl border border-zinc-700 bg-zinc-900/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-white">Ready to import</p>
            <p className="text-xs text-zinc-500">{preview.recordCount.toLocaleString()} records → MD database</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCommit}
              disabled={phase === 'committing'}
              className="flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2 text-sm font-bold text-zinc-900 hover:bg-lime-300 disabled:opacity-60 transition-colors"
            >
              {phase === 'committing' ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Importing…</>
              ) : (
                <><Zap className="h-4 w-4" /> Commit to DB</>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
