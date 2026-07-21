'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check, X, AlertCircle, Clock, Plus, Shield, ChevronDown,
  ChevronUp, Trash2, FileCheck, Eye,
} from 'lucide-react'

interface Assignment {
  id: string
  teamId: string
  riderEmail: string
  assignmentSpec: string
  assignedAt: string
  acknowledgedAt: string | null
  acknowledgedIp: string | null
  status: 'pending' | 'acknowledged' | 'completed' | 'failed' | 'skipped'
  dueAt: string | null
  complianceResult: 'COMPLIANT' | 'FAILED' | 'PENDING' | null
  complianceNotes: string | null
}

interface AuditEntry {
  id: string
  action: string
  ipAddress: string | null
  userAgent: string | null
  eventData: Record<string, unknown> | null
  actionAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-zinc-800 text-zinc-400',
  acknowledged: 'bg-blue-950 text-blue-300',
  completed: 'bg-lime-950 text-lime-300',
  failed: 'bg-red-950 text-red-300',
  skipped: 'bg-zinc-800 text-zinc-500',
}

const COMPLIANCE_BADGE: Record<string, { label: string; cls: string }> = {
  COMPLIANT: { label: 'COMPLIANT', cls: 'text-lime-400' },
  FAILED: { label: 'FAILED', cls: 'text-orange-400' },
  PENDING: { label: 'PENDING', cls: 'text-zinc-500' },
}

export function ViewAccountability() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [auditCache, setAuditCache] = useState<Record<string, AuditEntry[]>>({})
  const [auditLoading, setAuditLoading] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [assessing, setAssessing] = useState<string | null>(null)

  // Create form
  const [newEmail, setNewEmail] = useState('')
  const [newSpec, setNewSpec] = useState('')
  const [newDue, setNewDue] = useState('')

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/md-accountability')
      if (!res.ok) throw new Error('Failed to load assignments')
      const data = await res.json()
      setAssignments(data.assignments ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAssignments() }, [fetchAssignments])

  const loadAuditTrail = async (id: string) => {
    if (auditCache[id]) return
    setAuditLoading(id)
    try {
      const res = await fetch(`/api/md-accountability?id=${id}`)
      const data = await res.json()
      setAuditCache(prev => ({ ...prev, [id]: data.auditLog ?? [] }))
    } finally {
      setAuditLoading(null)
    }
  }

  const toggleExpanded = (id: string) => {
    if (expanded === id) {
      setExpanded(null)
    } else {
      setExpanded(id)
      loadAuditTrail(id)
    }
  }

  const handleCreate = async () => {
    if (!newEmail.trim() || !newSpec.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/md-accountability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          riderEmail: newEmail.trim(),
          assignmentSpec: newSpec.trim(),
          dueAt: newDue || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      setShowCreate(false)
      setNewEmail('')
      setNewSpec('')
      setNewDue('')
      await fetchAssignments()
    } finally {
      setSaving(false)
    }
  }

  const handleAssess = async (id: string, result: 'COMPLIANT' | 'FAILED', notes?: string) => {
    setAssessing(id)
    try {
      await fetch('/api/md-accountability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assess', assignmentId: id, complianceResult: result, complianceNotes: notes }),
      })
      setAuditCache(prev => ({ ...prev, [id]: [] })) // invalidate cache
      await fetchAssignments()
    } finally {
      setAssessing(null)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/md-accountability?id=${id}`, { method: 'DELETE' })
    setAssignments(prev => prev.filter(a => a.id !== id))
  }

  const pending = assignments.filter(a => a.status === 'pending')
  const acknowledged = assignments.filter(a => a.status === 'acknowledged')
  const closed = assignments.filter(a => ['completed', 'failed', 'skipped'].includes(a.status))

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">Accountability Trails</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Assignments require explicit acknowledgment. Compliance auto-assessed against telemetry.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-10 px-5 rounded-lg bg-lime-400 text-zinc-950 font-bold uppercase text-xs tracking-wider hover:bg-lime-300 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Assign
        </button>
      </div>

      {/* Audit notice */}
      <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 flex items-start gap-3">
        <Shield className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-blue-300 text-sm">
          Every acknowledgment logs rider IP, timestamp, and device fingerprint. This log is immutable and legally admissible.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Stats row */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-black text-amber-400">{pending.length}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Awaiting Acknowledgment</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-black text-lime-400">
              {assignments.filter(a => a.complianceResult === 'COMPLIANT').length}
            </p>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Compliant</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-2xl font-black text-orange-400">
              {assignments.filter(a => a.complianceResult === 'FAILED').length}
            </p>
            <p className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Non-Compliant</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {assignments.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <FileCheck className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">No assignments yet.</p>
          <p className="text-zinc-600 text-sm mt-1">Push an assignment to a rider and they must acknowledge before starting.</p>
        </div>
      )}

      {/* Assignment Lists */}
      {[
        { label: 'Awaiting Acknowledgment', items: pending, accent: 'amber' },
        { label: 'Acknowledged / In Progress', items: acknowledged, accent: 'blue' },
        { label: 'Closed', items: closed, accent: 'zinc' },
      ].map(({ label, items, accent }) => items.length > 0 && (
        <section key={label}>
          <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 text-${accent}-400`}>{label}</h3>
          <div className="space-y-3">
            {items.map(a => (
              <div key={a.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                {/* Row */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Compliance indicator */}
                    <div className="shrink-0 mt-0.5">
                      {a.complianceResult === 'COMPLIANT' && <Check className="h-5 w-5 text-lime-400" />}
                      {a.complianceResult === 'FAILED' && <X className="h-5 w-5 text-orange-400" />}
                      {!a.complianceResult && <Clock className="h-5 w-5 text-zinc-600" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-50 leading-snug">{a.assignmentSpec}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        <span className="text-zinc-400">{a.riderEmail}</span>
                        {' · '}
                        Assigned {new Date(a.assignedAt).toLocaleString()}
                      </p>
                      {a.acknowledgedAt && (
                        <p className="text-xs text-blue-400 mt-0.5">
                          Acknowledged {new Date(a.acknowledgedAt).toLocaleString()} from {a.acknowledgedIp}
                        </p>
                      )}
                      {a.dueAt && (
                        <p className="text-xs text-zinc-600 mt-0.5">
                          Due {new Date(a.dueAt).toLocaleDateString()}
                        </p>
                      )}
                      {a.complianceNotes && (
                        <p className="text-xs text-zinc-400 mt-1 italic">{a.complianceNotes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status badge */}
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${STATUS_COLORS[a.status] ?? 'bg-zinc-800 text-zinc-400'}`}>
                        {a.status}
                      </span>

                      {/* Compliance badge */}
                      {a.complianceResult && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${COMPLIANCE_BADGE[a.complianceResult]?.cls ?? ''}`}>
                          {a.complianceResult === 'COMPLIANT' && <Check className="h-3 w-3" />}
                          {a.complianceResult === 'FAILED' && <X className="h-3 w-3" />}
                          {COMPLIANCE_BADGE[a.complianceResult]?.label}
                        </span>
                      )}

                      {/* Audit trail toggle */}
                      <button
                        onClick={() => toggleExpanded(a.id)}
                        className="h-7 w-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center transition-colors"
                        title="View audit trail"
                      >
                        {expanded === a.id ? <ChevronUp className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="h-7 w-7 rounded-lg border border-red-900/30 bg-red-950/20 hover:bg-red-950/40 text-red-500 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Compliance action buttons for acknowledged-but-not-assessed */}
                  {a.status === 'acknowledged' && !a.complianceResult && (
                    <div className="flex gap-2 mt-4 pl-9">
                      <button
                        onClick={() => handleAssess(a.id, 'COMPLIANT')}
                        disabled={assessing === a.id}
                        className="h-8 px-4 rounded-lg bg-lime-950 border border-lime-800 text-lime-300 hover:bg-lime-900 text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> Mark Compliant
                      </button>
                      <button
                        onClick={() => handleAssess(a.id, 'FAILED', 'Did not meet assignment spec.')}
                        disabled={assessing === a.id}
                        className="h-8 px-4 rounded-lg bg-orange-950 border border-orange-800 text-orange-300 hover:bg-orange-900 text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" /> Mark Failed
                      </button>
                    </div>
                  )}
                </div>

                {/* Audit trail drawer */}
                {expanded === a.id && (
                  <div className="border-t border-zinc-800 bg-zinc-950/60 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Immutable Audit Trail</p>
                    {auditLoading === a.id && (
                      <p className="text-xs text-zinc-600">Loading...</p>
                    )}
                    {!auditLoading && (auditCache[a.id] ?? []).length === 0 && (
                      <p className="text-xs text-zinc-600">No audit events yet.</p>
                    )}
                    <div className="space-y-2">
                      {(auditCache[a.id] ?? []).map(entry => (
                        <div key={entry.id} className="flex items-start gap-3 text-xs">
                          <span className="font-bold text-zinc-400 uppercase tracking-wide w-28 shrink-0">
                            {entry.action.replace(/_/g, ' ')}
                          </span>
                          <span className="font-mono text-zinc-600 shrink-0">{entry.ipAddress ?? '—'}</span>
                          <span className="text-zinc-700 truncate flex-1">
                            {new Date(entry.actionAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Create Assignment Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black uppercase tracking-wide text-zinc-50 flex items-center gap-2">
                <Plus className="h-5 w-5 text-lime-400" />
                New Assignment
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Rider Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="rider@team.com"
                  className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Assignment Spec *</label>
                <textarea
                  value={newSpec}
                  onChange={e => setNewSpec(e.target.value)}
                  placeholder="e.g., 40 min cycling at 150 BPM, easy effort, no jumps"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-lime-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Due Date (optional)</label>
                <input
                  type="datetime-local"
                  value={newDue}
                  onChange={e => setNewDue(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300">
                Rider must tap &quot;I Acknowledge&quot; before starting. Their IP, timestamp, and device are logged automatically.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-10 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !newEmail.trim() || !newSpec.trim()}
                  className="flex-1 h-10 rounded-lg bg-lime-400 text-zinc-950 font-bold transition-colors hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {saving ? 'Sending...' : 'Push Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
