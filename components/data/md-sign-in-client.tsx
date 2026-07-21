'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { assignRookieTier } from '@/app/actions/assign-rookie-tier'
import { recordSignupCompliance } from '@/app/actions/legal-consent'
import { reportFailedLogin } from '@/app/actions/security-events'
import { computeAge, requiresGuardian, SIGNUP_REQUIRED_DOCS } from '@/lib/legal'
import { Lock, Loader2 } from 'lucide-react'
import { useAnalytics } from '@/lib/use-analytics'

export default function MdSignInClient({
  redirectTo,
  initialMode,
}: {
  redirectTo: string
  initialMode: 'sign-in' | 'sign-up'
}) {
  const router = useRouter()
  const analytics = useAnalytics()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tosAgreed, setTosAgreed] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')
  const [guardianRelationship, setGuardianRelationship] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  // Derive age + guardian requirement live so the form can reveal guardian fields.
  const age = dateOfBirth ? computeAge(dateOfBirth) : null
  const needsGuardian = age !== null && requiresGuardian(age)
  const isMinor = age !== null && age < 18
  // Under-18 riders cannot create their own account — a parent must sign up and
  // add them as a sub-rider profile. Block sign-up entirely for this age group.
  const blockedAsMinor = isSignUp && isMinor && dateOfBirth.length === 10

  function resetSignupFields() {
    setConfirmPassword('')
    setTosAgreed(false)
    setDateOfBirth('')
    setGuardianName('')
    setGuardianEmail('')
    setGuardianRelationship('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        if (name.trim().length < 2) {
          setError('Enter your full name.')
          setLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        if (!tosAgreed) {
          setError('You must agree to the Terms, Privacy Policy, and Data Sharing & Consent policy to create an account.')
          setLoading(false)
          return
        }
        if (!dateOfBirth) {
          setError('Please enter your date of birth.')
          setLoading(false)
          return
        }
        if (age === null || age < 0 || age > 120) {
          setError('Please enter a valid date of birth.')
          setLoading(false)
          return
        }
        // Hard block: riders under 18 cannot create their own account.
        // A parent or guardian must sign up and add the rider as a sub-profile.
        if (age < 18) {
          setError(
            'Riders under 18 cannot create their own account. A parent or guardian must sign up and add the rider as a sub-profile from their account settings.',
          )
          setLoading(false)
          return
        }
        if (needsGuardian && (guardianName.trim().length < 2 || !guardianEmail.trim() || !guardianRelationship.trim())) {
          setError('Riders under 13 require a parent or guardian to provide consent. Please complete the guardian details.')
          setLoading(false)
          return
        }
        const { error: signUpError } = await authClient.signUp.email(
          { email, password, name },
          undefined
        )
        if (signUpError) {
          setError(signUpError.message ?? 'Could not create account.')
          setLoading(false)
          return
        }

        // After sign-up, sign them in immediately
        const { error: signInError } = await authClient.signIn.email(
          { email, password },
          {}
        )
        if (signInError) {
          // Sign-up worked but auto sign-in failed — send to sign-in mode
          setMode('sign-in')
          setError('Account created. Please sign in.')
          setLoading(false)
          return
        }

        // Small delay to let the session cookie propagate before calling server action
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Record versioned consent + DOB/COPPA compliance (immutable audit trail).
        // This must succeed for a compliant signup; a minor without guardian info
        // is already blocked above, so this call captures the accepted doc versions.
        try {
          const complianceResult = await recordSignupCompliance({
            dateOfBirth,
            guardian: needsGuardian
              ? { name: guardianName.trim(), email: guardianEmail.trim(), relationship: guardianRelationship.trim() }
              : undefined,
          })
          if (!complianceResult.ok) {
            console.error('[v0] recordSignupCompliance failed:', complianceResult.reason)
          }
        } catch (complianceError) {
          console.error('[v0] Failed to record signup compliance:', complianceError)
        }

        // Assign new user to Rookie (free) tier and create default team
        try {
          await assignRookieTier()
        } catch (tierError) {
          console.error('Failed to assign rookie tier (non-blocking):', tierError)
          // Don't block signup if tier assignment fails — user can still access the platform
        }

        // Fire GA4 key event: sign_up
        analytics.trackSignUp('email')
      } else {
        const { error: signInError } = await authClient.signIn.email(
          { email, password },
          {}
        )
        if (signInError) {
          // Security Sentinel: report the failed attempt (fire-and-forget).
          void reportFailedLogin(email)
          setError(signInError.message ?? 'Invalid email or password.')
          setLoading(false)
          return
        }
        // Fire GA4 key event: login
        analytics.trackLogin('email')
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-50 placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none transition-colors text-sm'

  return (
    <div className="w-full max-w-sm">
      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-400 mb-2">
          Motorsport Data
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-50">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {isSignUp
            ? 'Set up your account to complete checkout'
            : 'Sign in to continue to checkout'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <input
            required
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            aria-label="Full name"
            autoComplete="name"
          />
        )}
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
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          aria-label="Password"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          minLength={8}
        />
        {isSignUp && (
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
        )}

        {isSignUp && (
          <div className="space-y-4">
            {/* Date of birth — drives the COPPA / guardian gate */}
            <div>
              <label htmlFor="dob" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Date of birth
              </label>
              <input
                id="dob"
                required
                type="date"
                value={dateOfBirth}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => { setDateOfBirth(e.target.value); if (error) setError(null) }}
                className={inputClass}
                aria-label="Date of birth"
              />
              {blockedAsMinor && (
                <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Parent or Guardian Account Required
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Riders under 18 cannot create their own account. A parent or guardian must sign
                    up with their own details, then add the rider as a sub-profile from their account
                    settings.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Already have a parent account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('sign-in'); setDateOfBirth('') }}
                      className="text-lime-400 hover:underline font-medium"
                    >
                      Sign in here.
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Guardian details — only for under-13 (COPPA verifiable parental consent) */}
            {needsGuardian && (
              <div className="space-y-3 rounded-xl border border-lime-400/30 bg-lime-400/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-lime-400">
                  Parent / Guardian Consent
                </p>
                <input
                  type="text"
                  placeholder="Parent or guardian full name"
                  value={guardianName}
                  onChange={(e) => { setGuardianName(e.target.value); if (error) setError(null) }}
                  className={inputClass}
                  aria-label="Guardian full name"
                  autoComplete="off"
                />
                <input
                  type="email"
                  placeholder="Parent or guardian email"
                  value={guardianEmail}
                  onChange={(e) => { setGuardianEmail(e.target.value); if (error) setError(null) }}
                  className={inputClass}
                  aria-label="Guardian email"
                  autoComplete="off"
                />
                <select
                  value={guardianRelationship}
                  onChange={(e) => { setGuardianRelationship(e.target.value); if (error) setError(null) }}
                  className={inputClass}
                  aria-label="Guardian relationship"
                >
                  <option value="">Relationship to rider</option>
                  <option value="parent">Parent</option>
                  <option value="legal_guardian">Legal guardian</option>
                  <option value="other">Other authorized adult</option>
                </select>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  By continuing, the named parent or guardian provides verifiable consent for this
                  rider&apos;s account and data, as described in our Privacy Policy.
                </p>
              </div>
            )}

            {/* Combined consent for all signup-required documents */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tosAgreed}
                onChange={(e) => { setTosAgreed(e.target.checked); if (error) setError(null) }}
                className="mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-sm border border-zinc-600 bg-zinc-900 checked:bg-lime-400 checked:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/50 cursor-pointer transition-colors"
              />
              <span className="text-xs text-zinc-400 leading-relaxed select-none">
                {needsGuardian ? 'As the parent/guardian, I have' : 'I have'} read and agree to the{' '}
                {SIGNUP_REQUIRED_DOCS.map((doc, i) => (
                  <span key={doc.key}>
                    {i > 0 && (i === SIGNUP_REQUIRED_DOCS.length - 1 ? ', and ' : ', ')}
                    <Link href={doc.href} target="_blank" className="text-lime-400 hover:underline font-medium">
                      {doc.title}
                    </Link>
                  </span>
                ))}
                .
              </span>
            </label>
          </div>
        )}

        {!isSignUp && (
          <div className="flex justify-end">
            <Link
              href="/data/forgot-password"
              className="text-xs text-zinc-500 hover:text-lime-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || blockedAsMinor}
          className="w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wider text-sm hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              {isSignUp ? 'Create Account' : 'Sign In'}
            </>
          )}
        </button>
      </form>

      {/* Toggle sign-in / sign-up */}
      <div className="mt-6 text-center">
        {isSignUp ? (
          <p className="text-sm text-zinc-500">
            Already have an account?{' '}
            <button
              onClick={() => { setMode('sign-in'); setError(null); resetSignupFields() }}
              className="text-lime-400 hover:underline font-semibold"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            New to Motorsport Data?{' '}
            <button
              onClick={() => { setMode('sign-up'); setError(null); resetSignupFields() }}
              className="text-lime-400 hover:underline font-semibold"
            >
              Create account
            </button>
          </p>
        )}
      </div>

      {/* Back to pricing */}
      <div className="mt-4 text-center">
        <Link
          href="/data/pricing"
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Back to Pricing
        </Link>
      </div>
    </div>
  )
}
