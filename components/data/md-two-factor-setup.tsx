'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { authClient } from '@/lib/auth-client'
import { ShieldCheck, Loader2, ArrowRight, Copy, Check } from 'lucide-react'

type Step = 'intro' | 'qr' | 'verify' | 'done'

export default function MdTwoFactorSetup() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [totpUri, setTotpUri] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const inputClass =
    'w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/30 transition-colors'

  async function handleEnable() {
    if (!password) {
      setError('Enter your current password to continue.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const result = await authClient.twoFactor.enable({ password })

      if (result.error) {
        setError(result.error.message ?? 'Failed to initiate 2FA setup.')
        setLoading(false)
        return
      }

      // Better Auth returns totpURI and backupCodes
      const data = result.data as any
      if (data?.totpURI) {
        setTotpUri(data.totpURI)
        // Generate QR code locally as a data URL — no external request
        const dataUrl = await QRCode.toDataURL(data.totpURI, { width: 200, margin: 2 })
        setQrCodeUrl(dataUrl)
      }
      if (data?.backupCodes) setBackupCodes(data.backupCodes)

      setStep('qr')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const result = await authClient.twoFactor.verifyTotp({ code })

      if (result.error) {
        setError(result.error.message ?? 'Incorrect code. Try again.')
        setLoading(false)
        return
      }

      setStep('done')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  function handleCopySecret() {
    // Extract secret from URI: otpauth://totp/...?secret=XXXX&...
    const match = totpUri.match(/secret=([^&]+)/)
    if (match) {
      navigator.clipboard.writeText(match[1])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (step === 'done') {
    return (
      <div className="w-full max-w-md rounded-2xl border border-lime-400/30 bg-zinc-900 p-8 text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/10 border border-lime-400/20">
          <ShieldCheck className="h-8 w-8 text-lime-400" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-50 mb-2">
          2FA Enabled
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Your account is now protected with two-factor authentication.
        </p>

        {backupCodes.length > 0 && (
          <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Backup Codes — Save These Now
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((c) => (
                <code key={c} className="text-xs font-mono text-lime-400 bg-zinc-900 rounded px-2 py-1">
                  {c}
                </code>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              Each code can be used once if you lose access to your authenticator app.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push('/data')}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 transition-colors"
        >
          Enter Platform
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (step === 'qr') {
    return (
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h2 className="text-xl font-black uppercase tracking-tight text-zinc-50 mb-1 text-center">
          Scan QR Code
        </h2>
        <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
          Open your authenticator app (Google Authenticator, Authy, 1Password) and scan this code.
        </p>

        {qrCodeUrl && (
          <div className="flex justify-center mb-4">
            <div className="rounded-xl border border-zinc-700 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="2FA QR Code"
                width={200}
                height={200}
              />
            </div>
          </div>
        )}

        {/* Manual entry fallback */}
        {totpUri && (
          <div className="mb-6">
            <p className="text-xs text-zinc-500 text-center mb-2">Can&apos;t scan? Enter this key manually:</p>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2">
              <code className="flex-1 text-xs font-mono text-lime-400 break-all">
                {totpUri.match(/secret=([^&]+)/)?.[1] ?? ''}
              </code>
              <button
                onClick={handleCopySecret}
                className="shrink-0 text-zinc-400 hover:text-lime-400 transition-colors"
                aria-label="Copy secret"
              >
                {copied ? <Check className="h-4 w-4 text-lime-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <p className="text-sm text-zinc-400 mb-3 font-medium">Enter the 6-digit code to confirm:</p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(null) }}
          className={`${inputClass} text-center text-xl tracking-[0.5em] font-mono mb-4`}
          autoFocus
        />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-bold uppercase tracking-wider text-sm hover:bg-lime-300 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Confirm & Enable <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    )
  }

  // intro step
  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="mb-5 flex justify-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
          <ShieldCheck className="h-8 w-8 text-amber-400" />
        </div>
      </div>
      <h2 className="text-xl font-black uppercase tracking-tight text-zinc-50 mb-1 text-center">
        Enable Two-Factor Auth
      </h2>
      <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
        Confirm your password to generate a QR code for your authenticator app.
      </p>

      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
        Current Password
      </label>
      <input
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(null) }}
        className={`${inputClass} mb-4`}
        autoComplete="current-password"
      />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleEnable}
        disabled={loading || !password}
        className="w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-bold uppercase tracking-wider text-sm hover:bg-lime-300 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
      </button>
    </div>
  )
}
