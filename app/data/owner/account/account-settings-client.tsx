'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Monitor,
  LogOut,
  RefreshCw,
  CheckCircle2,
  XCircle,
  User,
} from 'lucide-react'
import { authClient, useSession } from '@/lib/auth-client'

type SessionRow = {
  id: string
  token: string
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

type Feedback = { kind: 'ok' | 'err'; message: string } | null

const MIN_PASSWORD_LENGTH = 8

export function AccountSettingsClient({
  email,
  name,
}: {
  email: string
  name: string | null
}) {
  const { data: session } = useSession()
  const currentToken = session?.session?.token ?? null

  // ── Change password state ───────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [revokeOthers, setRevokeOthers] = useState(true)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [changing, setChanging] = useState(false)
  const [pwFeedback, setPwFeedback] = useState<Feedback>(null)

  // ── Sessions state ──────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [sessionFeedback, setSessionFeedback] = useState<Feedback>(null)
  const [busyToken, setBusyToken] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true)
    const { data, error } = await authClient.listSessions()
    if (error) {
      setSessionFeedback({ kind: 'err', message: error.message ?? 'Could not load sessions.' })
      setSessions([])
    } else {
      setSessions((data as SessionRow[]) ?? [])
    }
    setLoadingSessions(false)
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const passwordProblem = (): string | null => {
    if (!currentPassword) return 'Enter your current password.'
    if (newPassword.length < MIN_PASSWORD_LENGTH)
      return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    if (newPassword !== confirmPassword) return 'New password and confirmation do not match.'
    if (newPassword === currentPassword)
      return 'New password must be different from your current password.'
    return null
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwFeedback(null)
    const problem = passwordProblem()
    if (problem) {
      setPwFeedback({ kind: 'err', message: problem })
      return
    }
    setChanging(true)
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: revokeOthers,
    })
    setChanging(false)
    if (error) {
      setPwFeedback({
        kind: 'err',
        message:
          error.message ??
          'Could not change password. Double-check your current password.',
      })
      return
    }
    setPwFeedback({ kind: 'ok', message: 'Password updated successfully.' })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    loadSessions()
  }

  async function revokeOne(token: string) {
    setBusyToken(token)
    setSessionFeedback(null)
    const { error } = await authClient.revokeSession({ token })
    setBusyToken(null)
    if (error) {
      setSessionFeedback({ kind: 'err', message: error.message ?? 'Could not revoke session.' })
      return
    }
    setSessionFeedback({ kind: 'ok', message: 'Device signed out.' })
    loadSessions()
  }

  async function revokeAllOthers() {
    setBusyToken('__others__')
    setSessionFeedback(null)
    const { error } = await authClient.revokeOtherSessions()
    setBusyToken(null)
    if (error) {
      setSessionFeedback({ kind: 'err', message: error.message ?? 'Could not sign out other devices.' })
      return
    }
    setSessionFeedback({ kind: 'ok', message: 'All other devices have been signed out.' })
    loadSessions()
  }

  const otherSessionCount = sessions.filter((s) => s.token !== currentToken).length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/data/owner"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors font-mono text-xs uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" />
              Owner Console
            </Link>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-lime-400">
            Account Settings
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-balance">Account &amp; Security</h1>
          <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
            Manage your owner login credentials and see which devices are signed in.
          </p>
        </div>

        {/* Identity */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-lime-400" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-400">Identity</h2>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-zinc-500 mb-1">Name</dt>
              <dd className="text-sm text-zinc-100">{name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500 mb-1">Owner email</dt>
              <dd className="text-sm text-zinc-100 font-mono break-all">{email}</dd>
            </div>
          </dl>
        </section>

        {/* Change password */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="h-4 w-4 text-lime-400" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Change Password
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="current-password" className="text-xs text-zinc-400">
                Current password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-700 px-3 pr-10 text-sm text-zinc-100 focus:outline-none focus:border-lime-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-password" className="text-xs text-zinc-400">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-700 px-3 pr-10 text-sm text-zinc-100 focus:outline-none focus:border-lime-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-zinc-500">At least {MIN_PASSWORD_LENGTH} characters.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-password" className="text-xs text-zinc-400">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-700 px-3 text-sm text-zinc-100 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={revokeOthers}
                onChange={(e) => setRevokeOthers(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-lime-400"
              />
              Sign out all other devices after changing password (recommended)
            </label>

            {pwFeedback && (
              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  pwFeedback.kind === 'ok'
                    ? 'border-lime-400/30 bg-lime-400/10 text-lime-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                {pwFeedback.kind === 'ok' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{pwFeedback.message}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={changing}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-lime-400 hover:bg-lime-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-mono text-xs uppercase tracking-wider text-zinc-950 font-bold"
              >
                {changing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {changing ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        {/* Active sessions */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-lime-400" />
              <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                Active Sessions
              </h2>
            </div>
            <button
              onClick={loadSessions}
              disabled={loadingSessions}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingSessions ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {sessionFeedback && (
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm mb-4 ${
                sessionFeedback.kind === 'ok'
                  ? 'border-lime-400/30 bg-lime-400/10 text-lime-300'
                  : 'border-red-500/30 bg-red-500/10 text-red-300'
              }`}
            >
              {sessionFeedback.kind === 'ok' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{sessionFeedback.message}</span>
            </div>
          )}

          {loadingSessions ? (
            <p className="text-sm text-zinc-500">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-zinc-500">No active sessions found.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sessions.map((s) => {
                const isCurrent = s.token === currentToken
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Monitor className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-200 truncate">
                            {shortUserAgent(s.userAgent)}
                          </span>
                          {isCurrent && (
                            <span className="font-mono text-[10px] uppercase tracking-wider text-lime-400 border border-lime-400/30 rounded px-1.5 py-0.5">
                              This device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {s.ipAddress || 'Unknown IP'} · signed in {formatDate(s.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && (
                      <button
                        onClick={() => revokeOne(s.token)}
                        disabled={busyToken === s.token}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-700 hover:border-red-500/50 hover:text-red-300 text-zinc-300 disabled:opacity-60 transition-colors font-mono text-[11px] uppercase tracking-wider shrink-0"
                      >
                        {busyToken === s.token ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <LogOut className="h-3.5 w-3.5" />
                        )}
                        Sign out
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {otherSessionCount > 0 && (
            <div className="mt-4">
              <button
                onClick={revokeAllOthers}
                disabled={busyToken === '__others__'}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 disabled:opacity-60 transition-colors font-mono text-xs uppercase tracking-wider"
              >
                {busyToken === '__others__' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sign out all other devices ({otherSessionCount})
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function shortUserAgent(ua?: string | null): string {
  if (!ua) return 'Unknown device'
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Browser'
  const os =
    /Windows/.test(ua) ? 'Windows'
    : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iOS/.test(ua) ? 'iOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown OS'
  return `${browser} on ${os}`
}

function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return 'recently'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
