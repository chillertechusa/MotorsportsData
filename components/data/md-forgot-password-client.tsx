'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { sendPasswordResetEmail } from '@/app/actions/send-password-reset'

export default function MdForgotPasswordClient() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await sendPasswordResetEmail(email)

      if (!result.success) {
        setError(result.error ?? 'Failed to send reset email.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setEmail('')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-50 placeholder:text-zinc-500 focus:border-green-500 focus:outline-none transition-colors text-sm'

  return (
    <div className="w-full max-w-sm">
      {/* Back link */}
      <Link
        href="/data/sign-in"
        className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Sign In
      </Link>

      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-500 mb-2">
          Password Recovery
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-50">
          Reset Your Password
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-green-600/30 bg-green-600/10 px-6 py-4 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Mail className="h-6 w-6 text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-zinc-50 mb-2">Check your email</h2>
          <p className="text-sm text-zinc-400 mb-4">
            We've sent a password reset link to <span className="font-semibold text-zinc-300">{email}</span>
          </p>
          <p className="text-xs text-zinc-500">
            The link expires in 1 hour. If you don't see the email, check your spam folder.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            aria-label="Email address"
            autoComplete="email"
          />

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-green-500 text-zinc-950 font-black uppercase tracking-wider text-sm hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Mail className="h-3.5 w-3.5" />
                Send Reset Link
              </>
            )}
          </button>
        </form>
      )}

      {/* Additional help */}
      <div className="mt-8 text-center text-xs text-zinc-600">
        <p>
          Remember your password?{' '}
          <Link href="/data/sign-in" className="text-green-500 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
