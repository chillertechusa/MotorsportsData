'use client'

import { useState } from 'react'
import { Lock, Check, AlertCircle, Loader2 } from 'lucide-react'

export default function OwnerSetupPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!password || !confirmPassword) {
      setError('Both password fields are required')
      return
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain uppercase, lowercase, and numbers')
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch('/api/owner/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create owner account')
        return
      }

      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-lime-400 rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-lime-400 text-zinc-950 rounded-full p-3">
              <Check className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Account Created!</h1>
          <p className="text-zinc-400">
            Platform owner account for motorsportsdata@gmail.com is ready.
          </p>
          <a
            href="/data/owner/login"
            className="inline-block w-full px-6 py-3 bg-lime-400 text-zinc-950 font-black rounded hover:bg-lime-300 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-lime-400 text-zinc-950 rounded-full p-3">
              <Lock className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white">Set Owner Password</h1>
          <p className="text-zinc-400 text-sm">
            Create a secure password for motorsportsdata@gmail.com
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-mono text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password (12+ chars)"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none transition-colors"
              disabled={isLoading}
            />
            <p className="text-xs text-zinc-500">
              Must be 12+ characters with uppercase, lowercase, and numbers
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-mono text-zinc-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:border-lime-400 focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-lime-400 text-zinc-950 font-black rounded hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Owner Account'
            )}
          </button>
        </form>

        {/* Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-400 space-y-2">
          <p className="font-mono font-bold text-lime-400">Platform Owner Account</p>
          <p>This account provides full access to:</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500">
            <li>All team data and analytics</li>
            <li>Backend financials and payments</li>
            <li>System monitoring dashboard</li>
            <li>Member management audit logs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
