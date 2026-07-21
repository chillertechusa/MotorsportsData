'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Lock, Loader2, CheckCircle } from 'lucide-react'

export default function MdResetPasswordClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Token is missing.')
      setValidating(false)
      return
    }
    // Token validation happens during reset submission
    setValidating(false)
    setTokenValid(true)
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (!token) {
      setError('Invalid reset link. Please try again.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Failed to reset password. The link may have expired.')
        setLoading(false)
        return
      }

      setSuccess(true)
      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        router.push('/data/sign-in')
      }, 2000)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-50 placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none transition-colors text-sm'

  if (validating) {
    return (
      <div className="w-full max-w-sm text-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mx-auto mb-4" />
        <p className="text-zinc-400">Validating reset link...</p>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-center">
          <h2 className="text-lg font-bold text-zinc-50 mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-zinc-400 mb-4">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/data/forgot-password"
            className="inline-block px-4 py-2 rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm hover:bg-lime-300 transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-400 mb-2">
          Password Recovery
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-50">
          Create New Password
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Enter a new password for your account.
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 px-6 py-4 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-lime-400/20 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-lime-400" />
          </div>
          <h2 className="text-lg font-bold text-zinc-50 mb-2">Password reset successful</h2>
          <p className="text-sm text-zinc-400">
            Your password has been updated. Redirecting to sign in...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            aria-label="New password"
            autoComplete="new-password"
            minLength={8}
          />
          <input
            required
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            aria-label="Confirm password"
            autoComplete="new-password"
            minLength={8}
          />

          <p className="text-xs text-zinc-500">
            Password must be at least 8 characters long.
          </p>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wider text-sm hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                Reset Password
              </>
            )}
          </button>
        </form>
      )}

      {/* Back to sign-in */}
      <div className="mt-8 text-center text-xs text-zinc-600">
        <p>
          <Link href="/data/sign-in" className="text-lime-400 hover:underline font-semibold">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
