'use client'

import { useState } from 'react'
import { X, Send, Loader } from 'lucide-react'

interface InviteMemberModalProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
  onInviteSent: () => void
}

export function InviteMemberModal({ teamId, isOpen, onClose, onInviteSent }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('mechanic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Add member to team
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: teamId,
          email,
          role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to invite member')
      }

      // Send invitation email
      await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          team_id: teamId,
          role,
        }),
      })

      setSuccess(true)
      setEmail('')
      setRole('mechanic')
      onInviteSent()

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invite Team Member</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="bg-primary/10 border border-primary/30 rounded p-4 text-foreground">
            <p className="font-medium">Invitation sent successfully!</p>
            <p className="text-sm mt-1">{email} will receive an invitation email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-destructive text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
                required
                className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <optgroup label="Leadership">
                  <option value="owner">Owner</option>
                  <option value="team_manager">Team Manager</option>
                </optgroup>
                <optgroup label="Technical">
                  <option value="crew_chief">Crew Chief</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="mechanic_coach">Mechanic Coach</option>
                  <option value="data_analyst">Data Analyst</option>
                </optgroup>
                <optgroup label="Coaching & Health">
                  <option value="coach">Coach</option>
                  <option value="trainer">Trainer</option>
                  <option value="physio">Physio</option>
                </optgroup>
                <optgroup label="Operations">
                  <option value="truck_driver">Truck Driver</option>
                  <option value="media_manager">Media Manager</option>
                </optgroup>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
