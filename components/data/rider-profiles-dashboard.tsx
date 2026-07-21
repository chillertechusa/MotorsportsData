'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  listRiderProfiles,
  createRiderProfile,
  deleteRiderProfile,
  initiateRiderPromotion,
  checkPromotionEligibility,
} from '@/app/actions/rider-profiles'
import { User, Plus, Trash2, ArrowUpRight, AlertTriangle, ShieldCheck, Loader2, X } from 'lucide-react'

type RiderProfile = {
  id: string
  name: string
  dateOfBirth: string
  ageBracket: string
  isMinor: boolean
  promotionStatus: string
  riderEmail: string | null
  guardianRelationship: string
  teamId: string
  currentAge: number | null
  eligibleForPromotion: boolean
  createdAt: Date | string | null
}

export default function RiderProfilesDashboard({ teamId }: { teamId: string }) {
  const [profiles, setProfiles] = useState<RiderProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Add form state
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [riderEmail, setRiderEmail] = useState('')
  const [relationship, setRelationship] = useState('parent')

  const today = new Date().toISOString().slice(0, 10)
  // Max DOB for someone who is 17 years and 364 days old (must be under 18)
  const maxDob = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  async function load() {
    setLoading(true)
    const result = await listRiderProfiles()
    if (result.ok) setProfiles(result.profiles as RiderProfile[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // Also sweep for any riders who may have turned 18
    checkPromotionEligibility().catch(console.error)
  }, [])

  function resetForm() {
    setName('')
    setDob('')
    setRiderEmail('')
    setRelationship('parent')
    setError(null)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !dob) { setError('Name and date of birth are required.'); return }

    startTransition(async () => {
      const result = await createRiderProfile({ teamId, name, dateOfBirth: dob, riderEmail, guardianRelationship: relationship })
      if (!result.ok) {
        if (result.reason === 'rider_is_adult') {
          setError('This rider is 18 or older. Adults must create their own account.')
        } else {
          setError('Could not add rider. Please try again.')
        }
        return
      }
      setSuccess(`${name} has been added as a sub-rider profile.`)
      setShowAddForm(false)
      resetForm()
      await load()
      setTimeout(() => setSuccess(null), 5000)
    })
  }

  async function handleDelete(id: string, riderName: string) {
    if (!confirm(`Remove ${riderName} from your account? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteRiderProfile(id)
      if (!result.ok) {
        setError(result.reason === 'cannot_delete_promoted' ? 'Promoted riders cannot be removed.' : 'Could not remove rider.')
        return
      }
      setSuccess(`${riderName} has been removed.`)
      await load()
      setTimeout(() => setSuccess(null), 4000)
    })
  }

  async function handlePromote(id: string, riderName: string) {
    if (!confirm(`Promote ${riderName} to their own account? They will need to create their own sign-in. You will no longer manage their profile.`)) return
    startTransition(async () => {
      const result = await initiateRiderPromotion(id)
      if (!result.ok) { setError('Could not initiate promotion.'); return }
      setSuccess(`${riderName} has been promoted. They can now create their own account.`)
      await load()
      setTimeout(() => setSuccess(null), 6000)
    })
  }

  const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-zinc-50 placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none transition-colors text-sm'

  const promotionBadge = (status: string, eligible: boolean) => {
    if (status === 'promoted') return <span className="text-[11px] font-medium text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">Promoted</span>
    if (eligible || status === 'eligible') return <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">Ready to Promote</span>
    return <span className="text-[11px] font-medium text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full">Active Minor</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-50 tracking-tight">Rider Profiles</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage sub-rider profiles for riders under 18 on your account.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => { setShowAddForm(true); setError(null) }}
            className="flex items-center gap-2 rounded-lg bg-lime-400 text-zinc-950 font-semibold text-sm px-4 py-2 hover:bg-lime-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Rider
          </button>
        )}
      </div>

      {/* Compliance callout */}
      <div className="flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
        <ShieldCheck className="h-5 w-5 text-lime-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-zinc-200">You are the account holder for all sub-riders</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
            Riders under 18 cannot create their own accounts. As the parent or guardian, you control
            this data, consent, and privacy settings. When a rider turns 18 you can promote them to their
            own standalone account — their data moves with them.
          </p>
        </div>
      </div>

      {/* Success / error banners */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-400">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Add rider form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-5 space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-zinc-200">Add Sub-Rider Profile</p>
            <button type="button" onClick={() => { setShowAddForm(false); resetForm() }}>
              <X className="h-4 w-4 text-zinc-500 hover:text-zinc-300" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Rider full name <span className="text-red-400">*</span></label>
              <input required type="text" placeholder="e.g. Jordan Martinez" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Date of birth <span className="text-red-400">*</span></label>
              <input required type="date" value={dob} max={maxDob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
              <p className="text-[11px] text-zinc-600 mt-1">Rider must be under 18.</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Rider email (optional)</label>
              <input type="email" placeholder="rider@email.com" value={riderEmail} onChange={(e) => setRiderEmail(e.target.value)} className={inputClass} />
              <p className="text-[11px] text-zinc-600 mt-1">Used when promoting to own account at 18.</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Your relationship to rider</label>
              <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className={inputClass}>
                <option value="parent">Parent</option>
                <option value="legal_guardian">Legal guardian</option>
                <option value="other">Other authorized adult</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-lime-400 text-zinc-950 font-semibold text-sm px-5 py-2.5 hover:bg-lime-300 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Rider
            </button>
            <button type="button" onClick={() => { setShowAddForm(false); resetForm() }} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors px-3">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Profile list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading rider profiles...
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center">
          <User className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">No rider profiles yet</p>
          <p className="text-xs text-zinc-600 mt-1">Add a sub-rider profile for any rider under 18 on your account.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-4 flex items-center gap-4 ${
                p.promotionStatus === 'promoted'
                  ? 'border-zinc-800 bg-zinc-900/40 opacity-60'
                  : p.eligibleForPromotion || p.promotionStatus === 'eligible'
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-zinc-700 bg-zinc-900/60'
              }`}
            >
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-zinc-300">
                  {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-zinc-100">{p.name}</span>
                  {promotionBadge(p.promotionStatus, p.eligibleForPromotion)}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Age {p.currentAge ?? '?'} &middot; {p.ageBracket.replace(/_/g, ' ')} &middot; {p.guardianRelationship}
                  {p.riderEmail && <> &middot; {p.riderEmail}</>}
                </p>
                {(p.eligibleForPromotion || p.promotionStatus === 'eligible') && (
                  <p className="text-xs text-amber-400 mt-1">
                    This rider has turned 18. You can promote them to their own account.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {(p.eligibleForPromotion || p.promotionStatus === 'eligible') && (
                  <button
                    onClick={() => handlePromote(p.id, p.name)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Promote
                  </button>
                )}
                {p.promotionStatus !== 'promoted' && (
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10 disabled:opacity-50"
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
