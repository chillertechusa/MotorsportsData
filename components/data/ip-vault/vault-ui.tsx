'use client'

import { useState } from 'react'
import { Lock, Upload, Trash2, Eye, EyeOff, Plus, Share2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  type: 'periodization' | 'training-plan' | 'workout' | 'nutrition'
  uploadedAt: string
  isEncrypted: boolean
  accessCount: number
  lastAccessedBy?: string
}

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Pre-Season Periodization 2026',
    type: 'periodization',
    uploadedAt: '2026-07-10',
    isEncrypted: true,
    accessCount: 12,
    lastAccessedBy: 'Rider A',
  },
  {
    id: '2',
    name: 'Supercross Taper Protocol',
    type: 'training-plan',
    uploadedAt: '2026-07-08',
    isEncrypted: true,
    accessCount: 5,
    lastAccessedBy: 'Rider C',
  },
  {
    id: '3',
    name: 'High-Altitude Training',
    type: 'workout',
    uploadedAt: '2026-07-05',
    isEncrypted: true,
    accessCount: 0,
  },
]

export function VaultUI() {
  const [templates, setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES)
  const [showUpload, setShowUpload] = useState(false)
  const [encryptNew, setEncryptNew] = useState(true)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50 flex items-center gap-3">
          <Lock className="h-6 w-6 text-lime-500" />
          IP Vault
        </h2>
        <p className="text-sm text-zinc-400 mt-2">
          Your proprietary training methods, encrypted and protected. Riders see assignments but cannot export.
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Templates', value: templates.length, color: 'text-lime-500' },
          { label: 'Total Access', value: templates.reduce((sum, t) => sum + t.accessCount, 0), color: 'text-blue-500' },
          { label: 'Encrypted', value: templates.filter((t) => t.isEncrypted).length, color: 'text-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="border border-zinc-800 bg-zinc-900 p-4 rounded-lg">
            <p className="text-sm text-zinc-400 mb-2">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-zinc-50">Add Template</h3>
          {showUpload && (
            <button
              onClick={() => setShowUpload(false)}
              className="text-xs text-zinc-500 hover:text-zinc-400"
            >
              Cancel
            </button>
          )}
        </div>

        {showUpload ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">Template Name</label>
              <input
                type="text"
                placeholder="e.g. Pre-Season Periodization 2027"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-50 placeholder-zinc-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">Type</label>
              <select className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-50">
                <option value="periodization">Periodization</option>
                <option value="training-plan">Training Plan</option>
                <option value="workout">Workout</option>
                <option value="nutrition">Nutrition</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={encryptNew}
                  onChange={(e) => setEncryptNew(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold text-zinc-300">Encrypt template (AES-256)</span>
              </label>
              <p className="text-xs text-zinc-500 mt-1">
                {encryptNew
                  ? 'Template is encrypted at rest. Riders cannot export or screenshot.'
                  : 'Warning: Template will not be encrypted.'}
              </p>
            </div>

            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-lime-500 transition">
              <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-300">Drop your file here</p>
              <p className="text-xs text-zinc-500 mt-1">PDF, Word, or image file</p>
            </div>

            <button className="w-full px-4 py-3 bg-lime-500 text-zinc-950 font-bold rounded hover:bg-lime-400 transition">
              Upload Template
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded font-bold text-zinc-300 hover:border-lime-500 transition"
          >
            <Plus className="h-4 w-4" />
            Add New Template
          </button>
        )}
      </div>

      {/* Templates List */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="font-bold text-zinc-50">Your Templates</h3>
        </div>

        <div className="divide-y divide-zinc-800">
          {templates.map((template) => (
            <div key={template.id} className="p-6 hover:bg-zinc-800/50 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-zinc-50">{template.name}</h4>
                    {template.isEncrypted && (
                      <Lock className="h-4 w-4 text-lime-500" aria-label="Encrypted" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="px-2 py-1 bg-zinc-800 rounded">
                      {template.type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span>Uploaded {template.uploadedAt}</span>
                    <span>{template.accessCount} access</span>
                    {template.lastAccessedBy && (
                      <span>Last: {template.lastAccessedBy}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-zinc-700 rounded transition">
                    <Eye className="h-4 w-4 text-zinc-500" />
                  </button>
                  <button className="p-2 hover:bg-zinc-700 rounded transition">
                    <Share2 className="h-4 w-4 text-zinc-500" />
                  </button>
                  <button className="p-2 hover:bg-red-900/30 rounded transition">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Watermark Preview */}
              <div className="bg-zinc-800/30 border border-zinc-700 rounded p-4 text-xs text-zinc-500 font-mono">
                [WATERMARK: Proprietary — Confidential — {template.name}]
                <br />
                Riders see this watermark on all pages.
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="border border-lime-500/30 bg-lime-500/5 rounded-lg p-4">
        <p className="text-sm text-zinc-300">
          <strong>IP Protection:</strong> All templates are encrypted AES-256. Riders can view assignments but cannot
          export, screenshot, or share. When a rider leaves your program, access is immediately revoked.
        </p>
      </div>
    </div>
  )
}
