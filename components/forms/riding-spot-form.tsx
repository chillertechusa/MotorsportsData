'use client'

import { useBotID } from '@/hooks/use-botid'
import { useState } from 'react'

export default function RidingSpotForm() {
  const { check: checkBot, botError } = useBotID('/api/spots/botid-submit')
  const [spotName, setSpotName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('intermediate')
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
      const response = await fetch('/api/spots/botid-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotName,
          location,
          description,
          difficulty,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Failed to submit riding spot')
        setLoading(false)
        return
      }

      setSuccess(true)
      setSpotName('')
      setLocation('')
      setDescription('')
      setDifficulty('intermediate')
    } catch (err) {
      setError('Connection error. Please try again.')
      console.error('[v0] Spot submission error:', err)
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
        placeholder="Spot Name (e.g., Glamis, Pismo Beach)"
        value={spotName}
        onChange={(e) => setSpotName(e.target.value)}
        className={inputClass}
        aria-label="Spot name"
      />

      <input
        type="text"
        required
        placeholder="Location / Address"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className={inputClass}
        aria-label="Location"
      />

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className={inputClass}
        aria-label="Difficulty level"
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
        <option value="expert">Expert</option>
      </select>

      <textarea
        placeholder="Describe the riding spot (terrain, conditions, parking, tips, best times to visit)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className={`${inputClass} min-h-32`}
        aria-label="Description"
      />

      {(error || botError) && (
        <p className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error || botError}
        </p>
      )}

      {success && (
        <p className="border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-500">
          Riding spot submitted! Thanks for contributing to the community map.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary py-3.5 text-sm font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Share Riding Spot'}
      </button>
    </form>
  )
}
