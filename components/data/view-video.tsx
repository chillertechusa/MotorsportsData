'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Video,
  Upload,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Trash2,
  Film,
  X,
} from 'lucide-react'
import Link from 'next/link'
import type { Vehicle } from './rig-shell'

const FACTORY_TIER = 'factory_rig'

type CoachingPoint = {
  timestamp: string
  category: string
  observation: string
  recommendation: string
}

type Analysis = {
  summary: string
  coachingPoints: CoachingPoint[]
  strengths: string[]
  improvements: string[]
  overallScore: number
}

type VideoRow = {
  id: string
  blobUrl: string
  originalFilename: string | null
  vehicleId: string | null
  riderNotes: string | null
  analysis: Analysis | null
  status: string
  createdAt: string
}

const CATEGORY_ACCENT: Record<string, string> = {
  'Body Position': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  Cornering: 'text-lime-400 bg-lime-400/10 border-lime-400/30',
  Jumping: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Braking: 'text-red-400 bg-red-400/10 border-red-400/30',
  Acceleration: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Racecraft: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  'Bike Setup': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
}

function categoryAccent(cat: string) {
  return CATEGORY_ACCENT[cat] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-lime-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function UpgradePanel() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] max-w-lg mx-auto text-center px-4">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 mb-6">
        <Lock className="h-8 w-8" />
      </span>
      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-50 mb-3 text-balance">
        Upgrade to Factory Rig to unlock Video Analysis
      </h2>
      <p className="text-zinc-400 leading-relaxed mb-8 text-pretty">
        Upload riding footage and get a frame-by-frame coaching breakdown — body position, cornering,
        jump technique, and racecraft, timestamped and scored by AI. Included on the Factory Rig plan.
      </p>
      <Link
        href="/data/pricing"
        className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wide text-base active:bg-lime-300 transition-colors"
      >
        See Factory Rig <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const radius = 34
  const circ = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, score))
  const dash = (pct / 100) * circ
  const color = pct >= 80 ? '#a3e635' : pct >= 60 ? '#fbbf24' : '#f87171'
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#27272a" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black ${scoreColor(pct)}`}>{pct}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Score</span>
      </div>
    </div>
  )
}

function AnalysisReport({ analysis, filename }: { analysis: Analysis; filename?: string | null }) {
  return (
    <div className="space-y-4">
      {/* Summary + score */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-start gap-5">
        <ScoreRing score={analysis.overallScore} />
        <div className="min-w-0">
          {filename && (
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1 truncate">{filename}</p>
          )}
          <h3 className="text-sm font-black uppercase tracking-wide text-lime-400 mb-2">Coach&apos;s Read</h3>
          <p className="text-sm text-zinc-300 leading-relaxed text-pretty">{analysis.summary}</p>
        </div>
      </div>

      {/* Strengths + improvements */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-lime-400" />
            <h3 className="text-sm font-black uppercase tracking-wide text-zinc-200">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
                <span className="text-lime-400 shrink-0">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-wide text-zinc-200">Work On</h3>
          </div>
          <ul className="space-y-2">
            {analysis.improvements.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
                <span className="text-amber-400 shrink-0">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Timestamped coaching points */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-black uppercase tracking-wide text-zinc-200">
            Timestamped Breakdown
          </h3>
        </div>
        <div className="space-y-3">
          {analysis.coachingPoints.map((cp, i) => (
            <div key={i} className="flex gap-3 border-l-2 border-zinc-700 pl-4 py-1">
              <div className="shrink-0">
                <span className="inline-block font-mono text-xs font-bold text-zinc-400 bg-zinc-800 rounded px-2 py-1">
                  {cp.timestamp}
                </span>
              </div>
              <div className="min-w-0">
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wide rounded px-2 py-0.5 border mb-1.5 ${categoryAccent(
                    cp.category,
                  )}`}
                >
                  {cp.category}
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed mb-1">{cp.observation}</p>
                <p className="text-sm text-lime-400/90 leading-relaxed">
                  <span className="font-bold">Fix: </span>
                  {cp.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type Tab = 'upload' | 'history'

export default function ViewVideo({ vehicles, tier }: { vehicles: Vehicle[]; tier?: string }) {
  const [locked, setLocked] = useState(tier !== undefined && tier !== FACTORY_TIER)
  const [tab, setTab] = useState<Tab>('upload')
  const [history, setHistory] = useState<VideoRow[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Upload form state
  const [file, setFile] = useState<File | null>(null)
  const [vehicleId, setVehicleId] = useState('')
  const [notes, setNotes] = useState('')
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ analysis: Analysis; filename: string | null } | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadHistory() {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/md-video-analyze')
      if (res.status === 403) {
        setLocked(true)
        return
      }
      if (res.ok) setHistory(await res.json())
    } finally {
      setLoadingHistory(false)
    }
  }

  function pickFile(f: File | null) {
    setError('')
    setResult(null)
    if (!f) return
    if (!f.type.startsWith('video/')) {
      setError('Please choose a video file (MP4, MOV, AVI, or WebM).')
      return
    }
    if (f.size > 250 * 1024 * 1024) {
      setError('That file is over 250 MB. Trim the clip and try again.')
      return
    }
    setFile(f)
  }

  async function runAnalysis() {
    if (!file || phase !== 'idle') return
    setError('')
    setResult(null)

    try {
      // 1. Upload to Blob
      setPhase('uploading')
      const fd = new FormData()
      fd.append('file', file)
      const upRes = await fetch('/api/md-video-upload', { method: 'POST', body: fd })
      if (upRes.status === 403) {
        setLocked(true)
        return
      }
      if (!upRes.ok) {
        const j = await upRes.json().catch(() => ({}))
        setError(j.error || 'Upload failed. Try again.')
        setPhase('idle')
        return
      }
      const { url, pathname, filename } = await upRes.json()

      // 2. Analyze
      setPhase('analyzing')
      const anRes = await fetch('/api/md-video-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobUrl: url,
          blobPathname: pathname,
          originalFilename: filename,
          vehicleId: vehicleId || null,
          riderNotes: notes || null,
        }),
      })
      if (!anRes.ok) {
        const j = await anRes.json().catch(() => ({}))
        setError(j.error || 'Analysis failed. The clip may be too long or unclear.')
        setPhase('idle')
        return
      }
      const { analysis } = await anRes.json()
      if (analysis?.analysis) {
        setResult({ analysis: analysis.analysis, filename: analysis.originalFilename })
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
      }
      // Reset form + refresh history
      setFile(null)
      setNotes('')
      setVehicleId('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadHistory()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setPhase('idle')
    }
  }

  async function deleteAnalysis(id: string) {
    setHistory((h) => h.filter((r) => r.id !== id))
    await fetch(`/api/md-video-analyze?id=${id}`, { method: 'DELETE' })
  }

  if (locked) return <UpgradePanel />

  const busy = phase !== 'idle'

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-400">
          <Video className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-zinc-50">Video Analysis</h1>
          <p className="text-sm text-zinc-500">AI coaching breakdown of your riding footage</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['upload', 'history'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-10 px-5 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === t
                ? 'bg-lime-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 active:bg-zinc-800'
            }`}
          >
            {t === 'upload' ? 'New Analysis' : `History${history.length ? ` (${history.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <div className="space-y-5">
          {/* Dropzone */}
          <div
            onClick={() => !busy && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (!busy) pickFile(e.dataTransfer.files?.[0] ?? null)
            }}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
              file ? 'border-lime-400/50 bg-lime-400/5' : 'border-zinc-700 bg-zinc-900/50 active:border-zinc-600'
            } ${busy ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <Film className="h-6 w-6 text-lime-400 shrink-0" />
                <span className="text-sm font-medium text-zinc-200 truncate">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-zinc-500 active:text-zinc-300"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-300">Tap to choose a video, or drop one here</p>
                <p className="text-xs text-zinc-600 mt-1">MP4, MOV, AVI, or WebM · up to 250 MB</p>
              </>
            )}
          </div>

          {/* Optional context */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
                Bike (optional)
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={busy}
                className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:border-lime-400/50 focus:outline-none"
              >
                <option value="">No specific bike</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
                What to focus on (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={busy}
                placeholder="e.g. my cornering in the ruts"
                className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-lime-400/50 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-400/10 border border-red-400/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={runAnalysis}
            disabled={!file || busy}
            className="w-full h-14 rounded-2xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wide text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:bg-lime-300 transition-colors"
          >
            {phase === 'uploading' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Uploading footage...
              </>
            ) : phase === 'analyzing' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Coach is reviewing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Analyze Riding
              </>
            )}
          </button>

          {phase === 'analyzing' && (
            <p className="text-center text-xs text-zinc-500">
              Breaking down body position, cornering, and racecraft frame by frame. This can take up to a minute.
            </p>
          )}

          {result && (
            <div ref={resultRef} className="pt-2">
              <AnalysisReport analysis={result.analysis} filename={result.filename} />
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <Film className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No analyses yet. Upload your first clip to get started.</p>
            </div>
          ) : (
            history.map((row) => {
              const isOpen = expanded === row.id
              const bike = vehicles.find((v) => v.id === row.vehicleId)
              return (
                <div key={row.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-cyan-400 shrink-0">
                      <Film className="h-5 w-5" />
                    </span>
                    <button
                      onClick={() => setExpanded(isOpen ? null : row.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {row.originalFilename || 'Riding clip'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span>{timeAgo(row.createdAt)}</span>
                        {bike && (
                          <>
                            <span>·</span>
                            <span className="truncate">{bike.name}</span>
                          </>
                        )}
                        {row.status === 'error' && <span className="text-red-400">· Failed</span>}
                        {row.status === 'processing' && <span className="text-amber-400">· Processing</span>}
                      </div>
                    </button>
                    {row.analysis && (
                      <span className={`text-lg font-black ${scoreColor(row.analysis.overallScore)} shrink-0`}>
                        {row.analysis.overallScore}
                      </span>
                    )}
                    <button
                      onClick={() => deleteAnalysis(row.id)}
                      className="text-zinc-600 active:text-red-400 shrink-0 p-1"
                      aria-label="Delete analysis"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {isOpen && row.analysis && (
                    <div className="border-t border-zinc-800 p-4">
                      <AnalysisReport analysis={row.analysis} filename={null} />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
