'use client'

import { useBotID } from '@/hooks/use-botid'
import { useState } from 'react'

export default function ContingencyClaimForm() {
  const { check: checkBot, botError } = useBotID('/api/claims/botid-submit')
  const [eventName, setEventName] = useState('')
  const [sponsor, setSponsor] = useState('')
  const [amount, setAmount] = useState('')
  const [proof, setProof] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // BotID verification first
    if (!(await checkBot())) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/claims/botid-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          sponsor,
          amount,
          proof,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Failed to submit claim')
        setLoading(false)
        return
      }

      setSuccess(true)
      setEventName('')
      setSponsor('')
      setAmount('')
      setProof('')
    } catch (err) {
      setError('Connection error. Please try again.')
      console.error('[v0] Claim submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <input
        type="text"
        required
        placeholder="Event Name (e.g., Loretta Lynn's, Local Round 3)"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        className={inputClass}
        aria-label="Event name"
      />

      <input
        type="text"
        required
        placeholder="Sponsor Name"
        value={sponsor}
        onChange={(e) => setSponsor(e.target.value)}
        className={inputClass}
        aria-label="Sponsor"
      />

      <input
        type="number"
        required
        step="0.01"
        placeholder="Contingency Amount ($)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={inputClass}
        aria-label="Amount"
      />

      <textarea
        placeholder="Proof/Documentation (race results link, photo, details)"
        value={proof}
        onChange={(e) => setProof(e.target.value)}
        className={`${inputClass} min-h-24`}
        aria-label="Proof"
      />

      {(error || botError) && (
        <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error || botError}
        </p>
      )}

      {success && (
        <p className="border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-500">
          Claim submitted successfully. We'll review and process it shortly.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary py-3.5 text-sm font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit Claim'}
      </button>
    </form>
  )
}
