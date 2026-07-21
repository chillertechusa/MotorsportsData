'use client'

import { useState } from 'react'
import { Download, Share2, Eye, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const legalDocs = [
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'Platform usage, IP ownership, acceptable use, AI features, data licensing, arbitration',
    lastUpdated: '2026-07-16',
    version: '2.0.0-draft',
    status: 'draft',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'Data collection, minors/COPPA & GDPR handling, rider data ownership, privacy rights',
    lastUpdated: '2026-07-16',
    version: '2.0.0-draft',
    status: 'draft',
  },
  {
    id: 'data-consent',
    title: 'Data Sharing & Consent',
    description: 'External-account data access, aggregate data licensing, and rider platform credit',
    lastUpdated: '2026-07-16',
    version: '1.0.0-draft',
    status: 'draft',
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    description: 'Tracking cookies, analytics, and consent management practices',
    lastUpdated: '2026-07-16',
    version: '1.0.0-draft',
    status: 'draft',
  },
]

const reviewChecklist = [
  'Confirm legal entity name, address, and governing-law jurisdiction',
  'Attorney review of IP ownership, aggregate-data licensing, and coach IP custodian clauses',
  'Verify COPPA verifiable-parental-consent mechanism meets FTC requirements',
  'Confirm GDPR/CCPA data-subject rights and retention periods',
  'Review external-account (agent/sponsor/promoter/brand) data-access terms',
  'Publish: flip each document from draft to published once counsel signs off',
]

export default function OwnerLegalPage() {
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({})

  const handleDownloadPDF = async (docId: string) => {
    try {
      const response = await fetch(`/api/owner/legal/export?doc=${docId}&format=pdf`)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `md-${docId}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF download error:', error)
    }
  }

  const handleGenerateShareLink = async (docId: string) => {
    try {
      const response = await fetch('/api/owner/legal/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, expiresInDays: 7 }),
      })
      if (!response.ok) throw new Error('Share link generation failed')
      const { shareLink } = await response.json()
      navigator.clipboard.writeText(shareLink)
      setCopyStates({ ...copyStates, [docId]: true })
      setTimeout(() => setCopyStates({ ...copyStates, [docId]: false }), 2000)
    } catch (error) {
      console.error('Share link error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-zinc-100 mb-2">Legal Documents</h1>
            <p className="text-zinc-400">Manage, download, and share legal docs with your legal team</p>
          </div>
          <a
            href="/data/owner/consent"
            className="inline-flex items-center gap-2 rounded-lg border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-400 hover:bg-lime-400/20 transition-colors"
          >
            View Consent Audit
          </a>
        </div>

        {/* DRAFT — pending legal review banner */}
        <div className="mb-8 rounded-lg border border-amber-400/40 bg-amber-400/10 p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-400 mb-1">
            Draft — Pending Legal Review
          </p>
          <p className="text-sm text-amber-200/80 leading-relaxed">
            These documents were drafted by v0 as a starting point. They are <strong>not</strong> legal
            advice and must be reviewed and approved by the platform owner and a qualified attorney
            before launch. Each document currently displays a draft banner to end users.
          </p>
        </div>

        <div className="grid gap-6">
          {legalDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 hover:border-lime-400/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">{doc.title}</h2>
                  <p className="text-sm text-zinc-400 mt-1">{doc.description}</p>
                </div>
                <div className="text-right">
                  {doc.status === 'draft' && (
                    <span className="inline-block rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                      Draft
                    </span>
                  )}
                  <p className="text-xs text-zinc-500 font-mono">{doc.version}</p>
                  <p className="text-xs text-zinc-500 mt-1">Updated {doc.lastUpdated}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/legal/${doc.id}`, '_blank')}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(doc.id)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateShareLink(doc.id)}
                  className="gap-2"
                >
                  {copyStates[doc.id] ? (
                    <>
                      <Check className="h-4 w-4 text-lime-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Share Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h3 className="text-sm font-bold text-zinc-100 mb-3">Attorney Review Checklist</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            {reviewChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-lime-400">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
