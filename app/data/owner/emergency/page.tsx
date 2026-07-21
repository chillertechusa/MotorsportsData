'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react'
import { OWNER_BACKUP_EMAIL } from '@/lib/owner-backup-codes'

export default function OwnerEmergencyResetPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/owner/emergency-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Recovery failed')
        setLoading(false)
        return
      }

      setRemaining(typeof data.remainingCodes === 'number' ? data.remainingCodes : null)
      setSuccess(true)
      setTimeout(() => router.push('/data/owner/login'), 3000)
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-bold text-card-foreground">Password Reset</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your owner password has been reset. Redirecting to login...
          </p>
          {remaining !== null && (
            <p className="mt-4 text-sm text-muted-foreground">
              Backup codes remaining:{' '}
              <span className="font-semibold text-card-foreground">{remaining}</span>
            </p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
            <ShieldAlert className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">Emergency Recovery</h1>
            <p className="text-sm text-muted-foreground">Reset owner password with a backup code</p>
          </div>
        </div>

        <div className="mb-6 rounded-md border border-border bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter one of your one-time <span className="font-semibold text-card-foreground">8-digit backup codes</span>{' '}
            to reset the password for{' '}
            <span className="font-semibold text-card-foreground">{OWNER_BACKUP_EMAIL}</span>. Each code
            works only once.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-sm font-medium text-card-foreground">
              Backup Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoComplete="off"
              maxLength={12}
              className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm tracking-widest text-foreground focus:border-primary focus:outline-none"
              placeholder="8-digit code"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="new" className="text-sm font-medium text-card-foreground">
              New Password
            </label>
            <input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="At least 12 characters"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm" className="text-sm font-medium text-card-foreground">
              Confirm New Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Owner Password'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
