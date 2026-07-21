'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function AccountAuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({ email, password, name })
        if (error) {
          setError(error.message ?? 'Could not create account.')
          setLoading(false)
          return
        }
      } else {
        const result = await authClient.signIn.email(
          { email, password },
          { onError: (ctx) => setError(ctx.error.message ?? 'Invalid email or password.') }
        )
        if (result.error) {
          setError(result.error.message ?? 'Invalid email or password.')
          setLoading(false)
          return
        }
      }
      // Post-signup: redirect to onboarding if first-time coach
      if (isSignUp) {
        router.push('/data/onboarding')
      } else {
        router.push('/account')
      }
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {isSignUp && (
        <input
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          aria-label="Name"
        />
      )}
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
        aria-label="Email"
      />
      <input
        type="password"
        required
        minLength={8}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
        aria-label="Password"
      />

      {error && (
        <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary py-3.5 text-sm font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        style={{ fontFamily: 'var(--font-barlow-condensed)' }}
      >
        {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account?' : 'New to Moto D?'}{' '}
        <Link
          href={isSignUp ? '/account/sign-in' : '/account/sign-up'}
          className="font-semibold text-primary hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </form>
  )
}
