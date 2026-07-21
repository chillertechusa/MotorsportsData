'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MdLogo from '@/components/md-logo'
import { AlertCircle, LogIn } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('motorsportsdata@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Authenticate with Better Auth (same client used across the app)
      const { error: signInError } = await authClient.signIn.email({ email, password })

      if (signInError) {
        setError(signInError.message ?? 'Invalid email or password.')
        setLoading(false)
        return
      }

      // Success — redirect to owner dashboard
      // The /data/owner page will verify owner status server-side and redirect non-owners
      router.push('/data/owner')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 h-16 px-5 lg:px-8 border-b border-zinc-800">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <span className="text-zinc-700 font-mono text-xs">/</span>
        <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-mono">
          Platform Owner
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-black text-white">Owner Access</h1>
              <p className="text-zinc-400">
                Enter credentials to access platform backend and financials
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition"
                  placeholder="motorsportsdata@gmail.com"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full px-4 py-3 bg-lime-400 text-zinc-950 font-black uppercase tracking-widest rounded hover:bg-lime-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                {loading ? 'Authenticating...' : 'Sign In as Owner'}
              </button>
            </form>

            {/* Info box */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded space-y-2">
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                Platform Owner Access
              </p>
              <p className="text-sm text-zinc-400">
                This login grants access to platform financials, all team data, and system administration.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
