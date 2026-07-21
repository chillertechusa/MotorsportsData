'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lock, Upload, Archive, Eye, Trash2, Plus, Shield, Clock, X, AlertTriangle } from 'lucide-react'

export interface CoachTemplate {
  id: string
  name: string
  type: 'periodization' | 'hrz_zones' | 'workout' | 'taper' | 'custom'
  accessLevel: 'team_only' | 'coach_only'
  displayWatermark: boolean
  createdAt: string
  updatedAt: string
}

interface AccessLogEntry {
  id: string
  action: string
  ipAddress: string
  userAgent: string
  accessedAt: string
}

interface TemplateDetail extends CoachTemplate {
  content: unknown
  accessLog: AccessLogEntry[]
}

const TYPE_LABELS: Record<string, string> = {
  periodization: 'Periodization',
  hrz_zones: 'HR Zones',
  workout: 'Workout',
  taper: 'Taper',
  custom: 'Custom',
}

export function ViewIPVault(_props: { tier?: string } = {}) {
  const [templates, setTemplates] = useState<CoachTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<TemplateDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<CoachTemplate['type']>('periodization')
  const [formAccess, setFormAccess] = useState<'team_only' | 'coach_only'>('team_only')
  const [formWatermark, setFormWatermark] = useState(true)
  const [formContent, setFormContent] = useState('')

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/md-ip-vault')
      if (!res.ok) throw new Error('Failed to load vault')
      const data = await res.json()
      setTemplates(data.templates ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading vault')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const openDetail = async (template: CoachTemplate) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/md-ip-vault?id=${template.id}`)
      const data = await res.json()
      setSelectedDetail({ ...template, content: data.template?.content, accessLog: data.accessLog ?? [] })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formName.trim() || !formContent.trim()) return
    setSaving(true)
    try {
      let parsed: unknown = formContent
      try { parsed = JSON.parse(formContent) } catch { /* keep as string */ }

      const res = await fetch('/api/md-ip-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          type: formType,
          content: parsed,
          accessLevel: formAccess,
          displayWatermark: formWatermark,
        }),
      })
      if (!res.ok) throw new Error('Failed to create template')

      setShowCreate(false)
      setFormName('')
      setFormContent('')
      await fetchTemplates()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await fetch(`/api/md-ip-vault?id=${id}`, { method: 'DELETE' })
      setTemplates(prev => prev.filter(t => t.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-48 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50 flex items-center gap-2">
            <Lock className="h-6 w-6 text-lime-400" />
            The IP Vault
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Proprietary training templates, encrypted and access-logged.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-10 px-5 rounded-lg bg-lime-400 text-zinc-950 font-bold uppercase text-xs tracking-wider hover:bg-lime-300 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Vault status bar */}
      <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-4 flex items-start gap-3">
        <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-amber-300 text-sm">
          All templates are encrypted at rest. Riders see assignments only — no raw methodology export. Every access is logged with IP and timestamp.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {templates.length === 0 && !loading && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <Lock className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">No templates in the vault yet.</p>
          <p className="text-zinc-600 text-sm mt-1">Click &quot;New Template&quot; to encrypt your first training methodology.</p>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-lime-400/40 transition-colors relative"
          >
            {template.displayWatermark && (
              <div className="absolute top-2 right-2 text-xs font-bold uppercase tracking-wider text-zinc-700 pointer-events-none select-none">
                PROPRIETARY
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-50">{template.name}</h3>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mt-1">
                  {TYPE_LABELS[template.type] ?? template.type}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                template.accessLevel === 'coach_only'
                  ? 'bg-red-950 text-red-300'
                  : 'bg-blue-950 text-blue-300'
              }`}>
                {template.accessLevel === 'coach_only' ? 'Coach Only' : 'Team Access'}
              </span>
            </div>

            <div className="text-xs text-zinc-600 space-y-0.5 mb-4">
              <p>Created {new Date(template.createdAt).toLocaleDateString()}</p>
              <p>Updated {new Date(template.updatedAt).toLocaleDateString()}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openDetail(template)}
                disabled={detailLoading}
                className="flex-1 h-9 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-3.5 w-3.5" />
                View + Log
              </button>
              <button
                title="Archive"
                className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 transition-colors flex items-center justify-center"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                disabled={deleting === template.id}
                className="h-9 w-9 rounded-lg border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 transition-colors flex items-center justify-center"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black uppercase tracking-wide text-zinc-50 flex items-center gap-2">
                <Lock className="h-5 w-5 text-lime-400" />
                {selectedDetail.name}
              </h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 p-4 rounded-lg border border-amber-600/30 bg-amber-950/20">
              <p className="text-amber-300 text-sm">
                Proprietary coaching methodology. Your access has been logged. No export or screenshot.
              </p>
            </div>

            {/* Decrypted Content */}
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 font-mono text-xs text-zinc-300 max-h-64 overflow-y-auto mb-6">
              <pre className="whitespace-pre-wrap break-words">
                {typeof selectedDetail.content === 'string'
                  ? selectedDetail.content
                  : JSON.stringify(selectedDetail.content, null, 2)}
              </pre>
            </div>

            {/* Access Log */}
            <div>
              <h4 className="font-bold uppercase text-zinc-400 text-xs tracking-widest mb-3 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Access History ({selectedDetail.accessLog.length})
              </h4>
              {selectedDetail.accessLog.length === 0 ? (
                <p className="text-zinc-600 text-sm">No access events logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDetail.accessLog.map(log => (
                    <div key={log.id} className="text-xs p-2 bg-zinc-900 rounded border border-zinc-800 flex items-center gap-3">
                      <span className="text-zinc-500 uppercase font-bold tracking-wide shrink-0">{log.action}</span>
                      <span className="text-zinc-600 font-mono shrink-0">{log.ipAddress}</span>
                      <span className="text-zinc-700 truncate">{new Date(log.accessedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="h-9 px-5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 max-w-xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black uppercase tracking-wide text-zinc-50 flex items-center gap-2">
                <Upload className="h-5 w-5 text-lime-400" />
                New Template
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
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Template Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g., Spring Supercross Periodization"
                  className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Type</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as CoachTemplate['type'])}
                  className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-lime-400 focus:outline-none"
                >
                  <option value="periodization">Periodization</option>
                  <option value="hrz_zones">Heart Rate Zones</option>
                  <option value="workout">Workout</option>
                  <option value="taper">Taper Protocol</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Access</label>
                <div className="flex gap-2">
                  {(['team_only', 'coach_only'] as const).map(level => (
                    <label
                      key={level}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formAccess === level
                          ? 'border-lime-400 bg-lime-950/30 text-lime-200'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="access"
                        value={level}
                        checked={formAccess === level}
                        onChange={() => setFormAccess(level)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">
                        {level === 'team_only' ? 'Team Can View' : 'Coach Only'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                <input
                  type="checkbox"
                  id="watermark"
                  checked={formWatermark}
                  onChange={e => setFormWatermark(e.target.checked)}
                  className="accent-lime-400"
                />
                <label htmlFor="watermark" className="text-sm text-zinc-300 cursor-pointer">
                  Show &quot;PROPRIETARY&quot; watermark when viewed
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Content * (JSON or plain text)</label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder={'{\n  "weeks": 12,\n  "phases": ["build", "peak", "taper"]\n}'}
                  className="w-full h-36 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-xs focus:border-lime-400 focus:outline-none resize-none"
                />
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
                  disabled={saving || !formName.trim() || !formContent.trim()}
                  className="flex-1 h-10 rounded-lg bg-lime-400 text-zinc-950 font-bold transition-colors hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {saving ? 'Encrypting...' : 'Encrypt & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
