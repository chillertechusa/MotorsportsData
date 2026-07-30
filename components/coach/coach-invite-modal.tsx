'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Loader2, X } from 'lucide-react'

export function CoachInviteModal({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const [coachEmail, setCoachEmail] = useState('')
  const [riderEmail, setRiderEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!coachEmail.trim() || !riderEmail.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/md-coach/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, coachEmail: coachEmail.toLowerCase(), riderEmail: riderEmail.toLowerCase() }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setMessage(`Invite sent to ${coachEmail}`)
        setCoachEmail('')
        setRiderEmail('')
        setTimeout(onClose, 2000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Could not send invite')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-96 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Invite Coach</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Coach Email</label>
            <Input
              type="email"
              value={coachEmail}
              onChange={(e) => setCoachEmail(e.target.value)}
              placeholder="coach@example.com"
              disabled={loading}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Rider Email</label>
            <Input
              type="email"
              value={riderEmail}
              onChange={(e) => setRiderEmail(e.target.value)}
              placeholder="rider@example.com"
              disabled={loading}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          {status === 'success' && <p className="text-green-400 text-sm">{message}</p>}
          {status === 'error' && <p className="text-red-400 text-sm">{message}</p>}

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !coachEmail.trim() || !riderEmail.trim()}
              className="flex-1 bg-lime-500 hover:bg-lime-600 text-black"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
