'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DashboardAuthForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await authClient.signIn.email({ email, password })
    if (authError) {
      setError(authError.message ?? 'Invalid credentials')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-border text-foreground px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
          placeholder="you@motod.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-border text-foreground px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-3 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        style={{ fontFamily: 'var(--font-barlow-condensed)' }}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <p className="text-center text-muted-foreground text-xs mt-4">
        Need an account?{' '}
        <a href="/dashboard/sign-up" className="text-primary hover:underline">
          Register
        </a>
      </p>
    </form>
  )
}
