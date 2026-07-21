'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle, FileImage, Loader2, ScanLine, Upload, X } from 'lucide-react'

type BaselineSetup = {
  fork_compression_clicks_out: number | null
  fork_rebound_clicks_out: number | null
  shock_sag_mm: number | null
  shock_low_speed_comp_clicks_out: number | null
  shock_high_speed_comp_turns_out: number | null
  tire_pressure_front_psi: number | null
  tire_pressure_rear_psi: number | null
}

const FIELD_LABELS: Record<keyof BaselineSetup, string> = {
  fork_compression_clicks_out: 'Fork Compression',
  fork_rebound_clicks_out: 'Fork Rebound',
  shock_sag_mm: 'Shock Sag',
  shock_low_speed_comp_clicks_out: 'Shock LSC',
  shock_high_speed_comp_turns_out: 'Shock HSC',
  tire_pressure_front_psi: 'Front Tire PSI',
  tire_pressure_rear_psi: 'Rear Tire PSI',
}

const FIELD_UNITS: Record<keyof BaselineSetup, string> = {
  fork_compression_clicks_out: 'clicks out',
  fork_rebound_clicks_out: 'clicks out',
  shock_sag_mm: 'mm',
  shock_low_speed_comp_clicks_out: 'clicks out',
  shock_high_speed_comp_turns_out: 'turns out',
  tire_pressure_front_psi: 'PSI',
  tire_pressure_rear_psi: 'PSI',
}

function toSetupEntries(setup: BaselineSetup): { key: string; value: string }[] {
  return (Object.entries(setup) as [keyof BaselineSetup, number | null][])
    .filter(([, v]) => v !== null)
    .map(([k, v]) => ({
      key: `${FIELD_LABELS[k]} (${FIELD_UNITS[k]})`,
      value: String(v),
    }))
}

type Phase = 'idle' | 'scanning' | 'confirm' | 'saving' | 'done' | 'error'

type Props = {
  vehicleId: string
  vehicleName: string
}

export default function BaselineScanner({ vehicleId, vehicleName }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [baseline, setBaseline] = useState<BaselineSetup | null>(null)
  const [edited, setEdited] = useState<BaselineSetup | null>(null)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Keep edited values in sync when a new scan comes in.
  useEffect(() => {
    if (baseline) setEdited({ ...baseline })
  }, [baseline])

  const processFile = useCallback(
    async (file: File) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setError('Please upload a JPG, PNG, WebP, or PDF file.')
        setPhase('error')
        return
      }
      setFileName(file.name)
      setPhase('scanning')
      setError('')

      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('vehicleId', vehicleId)
        const res = await fetch('/api/scan-manual', { method: 'POST', body: fd })
        
        // Check HTTP status first before parsing JSON
        if (!res.ok) {
          // Map common HTTP errors to user-friendly messages
          const statusMessages: Record<number, string> = {
            413: 'File is too large. Service manuals must be under 10 MB.',
            415: 'Invalid file type. Please upload a JPEG, PNG, WebP, HEIC, or PDF.',
            429: 'Too many scan requests. Please wait a moment and try again.',
            500: 'Server error. Please try again.',
          }
          const message = statusMessages[res.status] || `Server error: ${res.status}`
          throw new Error(message)
        }
        
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Scan failed.')
        setBaseline(data.baselineSetup)
        setPhase('confirm')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Scan failed.')
        setPhase('error')
      }
    },
    [vehicleId],
  )

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function updateField(key: keyof BaselineSetup, raw: string) {
    const n = parseFloat(raw)
    setEdited((prev) => prev ? { ...prev, [key]: isNaN(n) ? null : n } : prev)
  }

  async function saveBaseline() {
    if (!edited) return
    setPhase('saving')
    try {
      const res = await fetch('/api/log-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          trackName: 'Factory Baseline',
          trackConditions: 'FACTORY_BASELINE',
          riderFeedback: `Factory baseline extracted from service manual: ${fileName}`,
          sessionHours: 0,
          setup: toSetupEntries(edited),
        }),
      })
      
      // Check HTTP status first before parsing JSON
      if (!res.ok) {
        const statusMessages: Record<number, string> = {
          429: 'Too many requests. Please wait before saving again.',
          500: 'Server error. Please try again.',
        }
        const message = statusMessages[res.status] || `Server error: ${res.status}`
        throw new Error(message)
      }
      
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Save failed.')
      setSessionId(data.sessionId)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.')
      setPhase('error')
    }
  }

  function reset() {
    setPhase('idle')
    setBaseline(null)
    setEdited(null)
    setError('')
    setFileName('')
    setSessionId('')
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-6">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-400/10 border border-lime-400/20">
            <ScanLine className="h-5 w-5 text-lime-400" />
          </span>
          <div>
            <p className="font-bold uppercase tracking-wide text-zinc-100 text-sm">Baseline Scanner</p>
            <p className="text-xs text-zinc-500">{vehicleName}</p>
          </div>
        </div>
        {phase !== 'idle' && phase !== 'scanning' && (
          <button
            onClick={reset}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            aria-label="Reset scanner"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {/* IDLE — drag-and-drop zone */}
        {phase === 'idle' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed py-12 px-6 text-center transition-colors cursor-pointer ${
              dragging
                ? 'border-lime-400 bg-lime-400/5'
                : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/40'
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={onFileInput}
            />
            <span className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${dragging ? 'bg-lime-400/15' : 'bg-zinc-800'}`}>
              <Upload className={`h-8 w-8 ${dragging ? 'text-lime-400' : 'text-zinc-500'}`} />
            </span>
            <div>
              <p className="font-bold text-zinc-200">Drop service manual here</p>
              <p className="text-sm text-zinc-500 mt-1">
                Upload a photo of your factory service manual to automatically set your baseline setup.
              </p>
              <p className="text-xs text-zinc-600 mt-2">JPG · PNG · WebP · PDF</p>
            </div>
            <span className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-lime-400/10 border border-lime-400/25 text-lime-400 text-sm font-semibold">
              <FileImage className="h-4 w-4" />
              Browse Files
            </span>
          </div>
        )}

        {/* SCANNING — animated spinner */}
        {phase === 'scanning' && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <div className="relative flex items-center justify-center">
              {/* Outer glow ring */}
              <span className="absolute h-20 w-20 rounded-full bg-lime-400/15 animate-ping" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/10 border border-lime-400/30">
                <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
              </span>
            </div>
            <div className="text-center">
              <p className="font-bold text-zinc-100 text-lg">Scanning manual for factory baselines...</p>
              <p className="text-sm text-zinc-500 mt-1 truncate max-w-xs">{fileName}</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-8 rounded-full bg-lime-400/30 animate-pulse"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* CONFIRM — extracted values for verification */}
        {(phase === 'confirm' || phase === 'saving') && edited && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-lime-400 uppercase tracking-wider mb-1">
                Factory Baseline Extracted
              </p>
              <p className="text-sm text-zinc-500">
                Review and adjust any values before saving. Null fields were not found in the manual.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(edited) as (keyof BaselineSetup)[]).map((key) => (
                <div key={key} className="rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3">
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1.5">
                    {FIELD_LABELS[key]}
                    <span className="ml-1 text-zinc-700 normal-case tracking-normal">({FIELD_UNITS[key]})</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={edited[key] ?? ''}
                    placeholder="Not found"
                    onChange={(e) => updateField(key, e.target.value)}
                    className="w-full bg-transparent text-xl font-bold text-zinc-100 focus:outline-none placeholder:text-zinc-700"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-zinc-600">Will be saved as <span className="text-zinc-400 font-mono">FACTORY_BASELINE</span> and pinned to this vehicle&apos;s history.</p>
              <button
                onClick={saveBaseline}
                disabled={phase === 'saving'}
                className="flex items-center gap-2.5 h-12 px-6 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wide text-sm transition-colors active:bg-lime-300 disabled:opacity-60"
              >
                {phase === 'saving' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><CheckCircle className="h-4 w-4" /> Confirm & Save</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* DONE — success state */}
        {phase === 'done' && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/15 border border-lime-400/30">
              <CheckCircle className="h-9 w-9 text-lime-400" />
            </span>
            <div>
              <p className="text-lg font-black text-zinc-50 uppercase tracking-wide">Baseline Saved</p>
              <p className="text-sm text-zinc-500 mt-1">
                Factory baseline pinned to <span className="text-zinc-300">{vehicleName}</span>. MD Intel can now reference it for setup comparisons.
              </p>
              <p className="text-xs text-zinc-700 mt-2 font-mono">session {sessionId.slice(0, 8)}...</p>
            </div>
            <button
              onClick={reset}
              className="h-10 px-5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-sm font-semibold transition-colors"
            >
              Scan Another
            </button>
          </div>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <X className="h-9 w-9 text-red-400" />
            </span>
            <div>
              <p className="text-lg font-black text-zinc-50 uppercase tracking-wide">Scan Failed</p>
              <p className="text-sm text-red-400 mt-1">{error}</p>
            </div>
            <button
              onClick={reset}
              className="h-10 px-5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 text-sm font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
