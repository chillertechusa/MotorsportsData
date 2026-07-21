'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react'

export default function MdTwoFactorVerify({ callbackURL }: { callbackURL: string }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [useBackup, setUseBackup] = useState(false)

  const inputClass =
    'w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/30 transition-colors'

  async function handleVerify() {
    if (!code) {
      setError(`Enter your ${useBackup ? 'backup code' : '6-digit authenticator code'}.`)
      return
    }
    setError(null)
    setLoading(true)

    try {
      let result
      if (useBackup) {
        result = await authClient.twoFactor.verifyBackupCode({ code })
      } else {
        result = await authClient.twoFactor.verifyTotp({ code })
      }

      if (result.error) {
        setError(result.error.message ?? 'Incorrect code. Please try again.')
        setLoading(false)
        return
      }

      router.push(callbackURL)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleVerify()
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="mb-5 flex justify-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-lime-400/10 border border-lime-400/20">
          <ShieldCheck className="h-8 w-8 text-lime-400" />
        </div>
      </div>

      <h2 className="text-xl font-black uppercase tracking-tight text-zinc-50 mb-1 text-center">
        Two-Factor Verification
      </h2>
      <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
        {useBackup
          ? 'Enter one of your saved backup codes.'
          : 'Open your authenticator app and enter the 6-digit code.'}
      </p>

      <input
        type="text"
        inputMode={useBackup ? 'text' : 'numeric'}
        maxLength={useBackup ? 20 : 6}
        placeholder={useBackup ? 'xxxxxx-xxxxxx' : '000000'}
        value={code}
        onChange={(e) => {
          const val = useBackup ? e.target.value : e.target.value.replace(/\D/g, '')
          setCode(val)
          setError(null)
        }}
        onKeyDown={handleKeyDown}
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
        disabled={loading || !code}
        className="w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-bold uppercase tracking-wider text-sm hover:bg-lime-300 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mb-4"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify <ArrowRight className="h-4 w-4" /></>}
      </button>

      <button
        onClick={() => { setUseBackup(!useBackup); setCode(''); setError(null) }}
        className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center"
      >
        {useBackup ? 'Use authenticator app instead' : 'Use a backup code instead'}
      </button>
    </div>
  )
}
