'use client'

import { useState } from 'react'
import { KeyRound, Loader2, Copy, Check, Download, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react'
import {
  generateOwnerBackupCodes,
  type BackupCodesStatus,
} from '@/app/actions/owner-backup-codes'

export function OwnerBackupCodesClient({ initialStatus }: { initialStatus: BackupCodesStatus }) {
  const [status, setStatus] = useState<BackupCodesStatus>(initialStatus)
  const [codes, setCodes] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmingRegen, setConfirmingRegen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setError('')
    setLoading(true)
    try {
      const { codes: newCodes } = await generateOwnerBackupCodes()
      setCodes(newCodes)
      setStatus({
        total: newCodes.length,
        used: 0,
        remaining: newCodes.length,
        generatedAt: new Date().toISOString(),
      })
      setConfirmingRegen(false)
    } catch {
      setError('Could not generate codes. Make sure you are signed in as the owner.')
    } finally {
      setLoading(false)
    }
  }

  function copyCodes() {
    if (!codes) return
    navigator.clipboard.writeText(codes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadCodes() {
    if (!codes) return
    const content = [
      'Motorsports Data — Owner Recovery Backup Codes',
      `Generated: ${new Date().toLocaleString()}`,
      'Each code works ONCE. Store these somewhere safe and private.',
      '',
      ...codes.map((c, i) => `${String(i + 1).padStart(2, '0')}.  ${c}`),
    ].join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'md-owner-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasCodes = status.total > 0
  const lowRemaining = hasCodes && status.remaining <= 3

  return (
    <div className="flex flex-col gap-6">
      {/* Status / countdown */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Recovery Status</h2>
            <p className="text-sm text-muted-foreground">
              {hasCodes
                ? status.generatedAt
                  ? `Generated ${new Date(status.generatedAt).toLocaleDateString()}`
                  : 'Active batch'
                : 'No backup codes generated yet'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <p className="text-2xl font-bold text-card-foreground">{status.remaining}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{status.used}</p>
            <p className="text-xs text-muted-foreground">Used</p>
          </div>
          <div className="rounded-md border border-border bg-background p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{status.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        {lowRemaining && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">
              Only {status.remaining} code{status.remaining === 1 ? '' : 's'} left. Generate a new batch soon.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Freshly generated codes — shown once */}
      {codes && (
        <div className="rounded-lg border border-primary/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-card-foreground">Your Backup Codes</h2>
              <p className="text-sm text-muted-foreground">Save these now — they will not be shown again.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            {codes.map((c, i) => (
              <div
                key={c}
                className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
              >
                <span className="text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-mono text-sm tracking-widest text-card-foreground">{c}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={copyCodes}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy all'}
            </button>
            <button
              onClick={downloadCodes}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              Download .txt
            </button>
          </div>
        </div>
      )}

      {/* Generate / regenerate */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-bold text-card-foreground">
          {hasCodes ? 'Regenerate Codes' : 'Generate Backup Codes'}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          {hasCodes
            ? 'Generating a new batch of 10 codes immediately invalidates all existing codes.'
            : 'Create 10 one-time codes you can use to recover the owner account if you ever lose email or password access.'}
        </p>

        {hasCodes && !confirmingRegen ? (
          <button
            onClick={() => setConfirmingRegen(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-bold text-card-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate Codes
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {hasCodes ? 'Yes, invalidate & generate' : 'Generate 10 Codes'}
            </button>
            {confirmingRegen && (
              <button
                onClick={() => setConfirmingRegen(false)}
                disabled={loading}
                className="rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
