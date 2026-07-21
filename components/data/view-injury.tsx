'use client'

import { useState, useEffect } from 'react'
import { Plus, ChevronRight, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Clock, X, Brain, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────

type Injury = {
  id: string
  teamId: string
  bodyRegion: string
  injuryType: string
  severity: number
  incidentDate: string
  status: string
  isConcussion: boolean
  rtrStage: number
  rtrStageStartedAt: string | null
  rtrClearedAt: string | null
  clearedBy: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BODY_REGIONS = [
  'Head / Skull', 'Brain (Concussion)', 'Neck / Cervical', 'Shoulder', 'Collarbone',
  'Upper Arm', 'Elbow', 'Forearm', 'Wrist', 'Hand / Fingers',
  'Chest / Ribs', 'Upper Back', 'Lower Back', 'Hip / Pelvis',
  'Thigh', 'Knee', 'Shin / Tibia', 'Ankle', 'Foot / Toes', 'Other',
]

const INJURY_TYPES = [
  'Fracture', 'Break', 'Dislocation', 'Ligament Sprain', 'Muscle Strain',
  'Tendon Injury', 'Contusion / Bruise', 'Laceration / Cut', 'Concussion',
  'Road Rash', 'Internal', 'Nerve Damage', 'Other',
]

// Standard 5-stage RTR protocol (non-concussion)
const RTR_STAGES = [
  { stage: 0, label: 'Injured / Rest', desc: 'No physical activity. Rest and recovery only.', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  { stage: 1, label: 'Light Aerobic', desc: 'Walking, swimming, or stationary cycling. No resistance training. Goal: increase heart rate.', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  { stage: 2, label: 'Sport-Specific Exercise', desc: 'Running drills, skating, bike ergometer. No head impact activities. Goal: add movement.', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { stage: 3, label: 'Non-Contact Training', desc: 'Moto skills drills, technique work. Progression to complex movement. Goal: exercise, coordination, thinking.', color: 'text-lime-400', bg: 'bg-lime-500/10 border-lime-500/30' },
  { stage: 4, label: 'Full Contact Practice', desc: 'Normal training activity. Assess functional skills. Medical clearance required.', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  { stage: 5, label: 'Return to Competition', desc: 'Full clearance. Return to racing.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
]

// Berlin Consensus 6-stage concussion RTR
const CONCUSSION_STAGES = [
  { stage: 0, label: 'Symptom-Limited Activity', desc: 'Daily activities that do not provoke symptoms. Cognitive rest if needed. Limit screen time, bright lights, loud noise.', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  { stage: 1, label: 'Light Aerobic Exercise', desc: 'Walking, swimming, or stationary cycling. Keep intensity low. Goal: increase heart rate without symptom recurrence.', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  { stage: 2, label: 'Sport-Specific Exercise', desc: 'Running drills. No head impact activities. Goal: add movement patterns.', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  { stage: 3, label: 'Non-Contact Training', desc: 'Complex drills. Resistance training begins. No contact. Goal: exercise, coordination, and cognitive load.', color: 'text-lime-400', bg: 'bg-lime-500/10 border-lime-500/30' },
  { stage: 4, label: 'Full Contact Practice', desc: 'Normal training following medical clearance. Functional assessment. Physician sign-off required.', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  { stage: 5, label: 'Return to Competition', desc: 'Full clearance to race. Must have physician medical clearance on file.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
]

const SEVERITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Minor', color: 'text-zinc-400' },
  2: { label: 'Mild', color: 'text-yellow-400' },
  3: { label: 'Moderate', color: 'text-orange-400' },
  4: { label: 'Severe', color: 'text-red-400' },
  5: { label: 'Critical', color: 'text-red-500' },
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr + 'T00:00:00').getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// ─── Add Injury Modal ─────────────────────────────────────────────────────────

function AddInjuryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    bodyRegion: '', injuryType: '', severity: 2,
    incidentDate: new Date().toISOString().split('T')[0],
    isConcussion: false, notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.bodyRegion || !form.injuryType || !form.incidentDate) {
      setError('Body region, injury type, and date are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/md-injuries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save.'); return }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  // Auto-set isConcussion when region/type suggest it
  useEffect(() => {
    const isConcussion = form.bodyRegion === 'Brain (Concussion)' || form.injuryType === 'Concussion'
    setForm(f => ({ ...f, isConcussion }))
  }, [form.bodyRegion, form.injuryType])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h3 className="font-bold text-white">Log Injury</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Body Region */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Body Region</label>
            <select
              value={form.bodyRegion}
              onChange={e => setForm(f => ({ ...f, bodyRegion: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
            >
              <option value="">Select region...</option>
              {BODY_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Injury Type */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Injury Type</label>
            <select
              value={form.injuryType}
              onChange={e => setForm(f => ({ ...f, injuryType: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
            >
              <option value="">Select type...</option>
              {INJURY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Date + Severity row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Incident Date</label>
              <input
                type="date"
                value={form.incidentDate}
                onChange={e => setForm(f => ({ ...f, incidentDate: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
                Severity — <span className={SEVERITY_LABELS[form.severity].color}>{SEVERITY_LABELS[form.severity].label}</span>
              </label>
              <input
                type="range" min={1} max={5} value={form.severity}
                onChange={e => setForm(f => ({ ...f, severity: Number(e.target.value) }))}
                className="w-full accent-lime-400 mt-1"
              />
            </div>
          </div>

          {/* Concussion flag */}
          <label className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700">
            <input
              type="checkbox"
              checked={form.isConcussion}
              onChange={e => setForm(f => ({ ...f, isConcussion: e.target.checked }))}
              className="accent-lime-400"
            />
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-red-400" /> Concussion / Head Injury
              </p>
              <p className="text-xs text-zinc-500">Activates the Berlin Consensus 6-stage protocol</p>
            </div>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Mechanism of injury, initial assessment, treatment..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-lime-500 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="flex gap-3 p-5 border-t border-zinc-800">
          <Button variant="outline" onClick={onClose} className="flex-1 border-zinc-700 text-zinc-400 hover:text-white bg-transparent">Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="flex-1 bg-lime-400 hover:bg-lime-300 text-black font-bold">
            {saving ? 'Saving...' : 'Log Injury'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── RTR Protocol Panel ───────────────────────────────────────────────────────

function RtrPanel({ injury, onUpdated }: { injury: Injury; onUpdated: () => void }) {
  const stages = injury.isConcussion ? CONCUSSION_STAGES : RTR_STAGES
  const maxStage = stages.length - 1
  const [advancing, setAdvancing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearedBy, setClearedBy] = useState('')
  const [showClearForm, setShowClearForm] = useState(false)

  const advance = async () => {
    if (injury.rtrStage >= maxStage) return
    setAdvancing(true)
    await fetch('/api/md-injuries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: injury.id, rtrStage: injury.rtrStage + 1, rtrStageStartedAt: new Date().toISOString() }),
    })
    setAdvancing(false)
    onUpdated()
  }

  const clearInjury = async () => {
    setClearing(true)
    await fetch('/api/md-injuries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: injury.id,
        status: 'cleared',
        rtrStage: maxStage,
        rtrClearedAt: new Date().toISOString(),
        clearedBy: clearedBy || 'Self-cleared',
      }),
    })
    setClearing(false)
    onUpdated()
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
          {injury.isConcussion ? 'Berlin Consensus Protocol' : 'Return-to-Racing Protocol'}
        </p>
        <span className="text-xs text-zinc-500">Stage {injury.rtrStage}/{maxStage}</span>
      </div>

      {/* Stage stepper */}
      <div className="space-y-2">
        {stages.map((s) => {
          const isActive = s.stage === injury.rtrStage
          const isDone = s.stage < injury.rtrStage
          return (
            <div
              key={s.stage}
              className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-all ${
                isActive ? s.bg : isDone ? 'bg-zinc-900/40 border-zinc-800 opacity-60' : 'bg-zinc-900/20 border-zinc-900 opacity-40'
              }`}
            >
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isDone ? 'bg-lime-400 border-lime-400' : isActive ? 'border-current bg-transparent' : 'border-zinc-700 bg-transparent'
              } ${isActive ? s.color : ''}`}>
                {isDone && <CheckCircle2 className="h-3 w-3 text-black" />}
                {isActive && <div className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${isActive ? s.color : isDone ? 'text-zinc-500' : 'text-zinc-700'}`}>
                  {s.stage}. {s.label}
                </p>
                {isActive && <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{s.desc}</p>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      {injury.status === 'active' && (
        <div className="pt-2 space-y-2">
          {injury.rtrStage < maxStage && (
            <Button
              onClick={advance}
              disabled={advancing}
              className="w-full bg-lime-400 hover:bg-lime-300 text-black font-bold"
            >
              {advancing ? 'Advancing...' : `Advance to Stage ${injury.rtrStage + 1}: ${stages[injury.rtrStage + 1]?.label}`}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {injury.rtrStage === maxStage && !showClearForm && (
            <Button
              onClick={() => setShowClearForm(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark Cleared to Race
            </Button>
          )}
          {showClearForm && (
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-white">Cleared by</p>
              <input
                value={clearedBy}
                onChange={e => setClearedBy(e.target.value)}
                placeholder="Dr. Smith / Team Physician / Self"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-lime-500"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowClearForm(false)} className="flex-1 border-zinc-700 text-zinc-400 bg-transparent text-xs">Cancel</Button>
                <Button onClick={clearInjury} disabled={clearing} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs">
                  {clearing ? 'Clearing...' : 'Confirm Clearance'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {injury.status === 'cleared' && injury.rtrClearedAt && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">Cleared to Race</p>
            <p className="text-xs text-zinc-500">
              {new Date(injury.rtrClearedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {injury.clearedBy ? ` — ${injury.clearedBy}` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Injury Card ──────────────────────────────────────────────────────────────

function InjuryCard({ injury, onUpdated }: { injury: Injury; onUpdated: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const sev = SEVERITY_LABELS[injury.severity] ?? { label: 'Unknown', color: 'text-zinc-400' }
  const isActive = injury.status === 'active'
  const stages = injury.isConcussion ? CONCUSSION_STAGES : RTR_STAGES
  const currentStage = stages[injury.rtrStage]

  return (
    <div className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${
      isActive ? 'border-zinc-700' : 'border-zinc-800 opacity-70'
    }`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        {/* Status indicator */}
        <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${
          injury.status === 'cleared' ? 'bg-emerald-400' :
          injury.rtrStage === 0 ? 'bg-red-400' :
          injury.rtrStage >= (stages.length - 1) ? 'bg-lime-400' : 'bg-yellow-400'
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{injury.bodyRegion}</span>
            <span className="text-xs text-zinc-500">—</span>
            <span className="text-sm text-zinc-300">{injury.injuryType}</span>
            {injury.isConcussion && (
              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Concussion
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs font-medium ${sev.color}`}>{sev.label}</span>
            <span className="text-xs text-zinc-600">{formatDate(injury.incidentDate)}</span>
            <span className="text-xs text-zinc-600">{daysSince(injury.incidentDate)}d ago</span>
            {isActive && (
              <span className={`text-xs font-medium ${currentStage?.color ?? 'text-zinc-400'}`}>
                Stage {injury.rtrStage}: {currentStage?.label}
              </span>
            )}
            {injury.status === 'cleared' && (
              <span className="text-xs font-medium text-emerald-400">Cleared</span>
            )}
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 text-zinc-600 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3">
          {injury.notes && (
            <p className="text-sm text-zinc-400 mb-3 italic">{injury.notes}</p>
          )}
          <RtrPanel injury={injury} onUpdated={onUpdated} />
        </div>
      )}
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function ViewInjury() {
  const [injuries, setInjuries] = useState<Injury[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  const fetchInjuries = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/md-injuries')
      if (res.ok) {
        const data = await res.json()
        setInjuries(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInjuries() }, [])

  const active = injuries.filter(i => i.status === 'active')
  const history = injuries.filter(i => i.status !== 'active')

  const hasConcussion = active.some(i => i.isConcussion)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Injury Tracker</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {active.length === 0 ? 'No active injuries' : `${active.length} active ${active.length === 1 ? 'injury' : 'injuries'}`}
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-lime-400 hover:bg-lime-300 text-black font-bold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Log Injury
        </Button>
      </div>

      {/* Concussion Alert Banner */}
      {hasConcussion && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Active Concussion Protocol</p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Berlin Consensus 6-stage RTR is active. Rider must not advance stages if any symptoms are present.
              Medical clearance required before Stage 5 (Return to Competition).
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
        {(['active', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${
              activeTab === t ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'active' ? `Active (${active.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>

      {/* Injury list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'active' ? (
        active.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-2xl">
            <Activity className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-semibold">No active injuries</p>
            <p className="text-sm text-zinc-600 mt-1">Stay healthy and send it.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map(injury => (
              <InjuryCard key={injury.id} injury={injury} onUpdated={fetchInjuries} />
            ))}
          </div>
        )
      ) : (
        history.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-2xl">
            <CheckCircle2 className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-semibold">No injury history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(injury => (
              <InjuryCard key={injury.id} injury={injury} onUpdated={fetchInjuries} />
            ))}
          </div>
        )
      )}

      {/* Protocol reference */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <button
          onClick={() => {}}
          className="w-full flex items-center justify-between p-4 bg-zinc-900 text-left"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-zinc-300">RTR Protocol Reference</span>
          </div>
        </button>
        <div className="p-4 border-t border-zinc-800 space-y-4">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">Standard RTR (5 Stages)</p>
            <div className="space-y-1">
              {RTR_STAGES.map(s => (
                <div key={s.stage} className="flex items-start gap-2 text-xs">
                  <span className={`font-bold shrink-0 w-4 ${s.color}`}>{s.stage}</span>
                  <span className="text-zinc-500"><span className="text-zinc-300 font-medium">{s.label}</span> — {s.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5 text-red-400" /> Berlin Consensus Concussion RTR (6 Stages)
            </p>
            <div className="space-y-1">
              {CONCUSSION_STAGES.map(s => (
                <div key={s.stage} className="flex items-start gap-2 text-xs">
                  <span className={`font-bold shrink-0 w-4 ${s.color}`}>{s.stage}</span>
                  <span className="text-zinc-500"><span className="text-zinc-300 font-medium">{s.label}</span> — {s.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-red-400/80 mt-3 leading-relaxed">
              Each stage requires minimum 24 hours symptom-free before advancing. If symptoms return, drop back to previous stage and re-attempt after 24h rest.
            </p>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddInjuryModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchInjuries() }}
        />
      )}
    </div>
  )
}
