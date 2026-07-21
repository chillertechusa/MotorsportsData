'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Trophy, Flag, TrendingUp, Bike, Star, Award, Calendar, Edit2, Trash2, ArrowUpRight, Baby } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isRookieTier } from '@/lib/md-tiers'

// ─── Types ──────────────────────────────────────────────────────────────────

type Milestone = {
  id: string
  teamId: string
  title: string
  category: string
  milestoneDate: string
  notes: string | null
  createdAt: string
}

type RiderProfile = {
  riderName: string | null
  riderBirthYear: number | null
  riderClass: string | null
  subscriptionTier: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, { label: string; icon: typeof Trophy; color: string; bg: string }> = {
  first: { label: 'First', icon: Star, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
  skill: { label: 'New Skill', icon: TrendingUp, color: 'text-lime-400', bg: 'bg-lime-500/10 border-lime-500/30' },
  class_move: { label: 'Moved Up', icon: ArrowUpRight, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' },
  race: { label: 'Race', icon: Flag, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  podium: { label: 'Podium', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  bike: { label: 'New Bike', icon: Bike, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  award: { label: 'Award', icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  other: { label: 'Milestone', icon: Calendar, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/30' },
}

// Quick-add suggestions to make the first entries effortless for a moto parent.
const SUGGESTIONS = [
  { title: 'First ride', category: 'first' },
  { title: 'First jump cleared', category: 'skill' },
  { title: 'First race', category: 'race' },
  { title: 'First holeshot', category: 'race' },
  { title: 'First podium', category: 'podium' },
  { title: 'Moved up a class', category: 'class_move' },
  { title: 'First trophy', category: 'award' },
  { title: 'New bike', category: 'bike' },
]

// Youth class ladder — used to estimate whether a Rookie rider is aging out.
const YOUTH_CLASSES = ['50cc (4-6)', '50cc (7-8)', '65cc (7-9)', '65cc (10-11)', '85cc (9-11)', '85cc (12-13)', 'Supermini', '250F / Big Bike']

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function riderAge(birthYear: number | null): number | null {
  if (!birthYear) return null
  return new Date().getFullYear() - birthYear
}

// ─── Rider Profile Card ─────────────────────────────────────────────────────

function ProfileCard({ profile, onEdit }: { profile: RiderProfile; onEdit: () => void }) {
  const age = riderAge(profile.riderBirthYear)
  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center">
            <Baby className="h-7 w-7 text-lime-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{profile.riderName || 'Your Rider'}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-zinc-400">
              {age !== null && <span>{age} years old</span>}
              {age !== null && profile.riderClass && <span className="text-zinc-600">•</span>}
              {profile.riderClass && <span>{profile.riderClass}</span>}
              {age === null && !profile.riderClass && <span className="text-zinc-500">Add rider details to start the story</span>}
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:border-lime-400 hover:text-lime-400 transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
    </div>
  )
}

// ─── Graduation Nudge ─────────────────────────────────────────────────────────

function GraduationNudge({ profile }: { profile: RiderProfile }) {
  const age = riderAge(profile.riderBirthYear)
  const cls = (profile.riderClass ?? '').toLowerCase()

  // Fire when a Rookie rider is aging up (>= 12) or has reached a big-bike class.
  const agedUp = age !== null && age >= 12
  const bigBike = cls.includes('supermini') || cls.includes('250') || cls.includes('big bike') || cls.includes('85')
  if (!agedUp && !bigBike) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-lime-500/15 to-emerald-500/5 border border-lime-500/40 p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center shrink-0">
          <ArrowUpRight className="h-5 w-5 text-lime-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-lime-300">Time to move up to Privateer</h4>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            {profile.riderName || 'Your rider'} is stepping up{age !== null ? ` at ${age}` : ''}
            {bigBike ? ' onto a bigger bike' : ''}. The Privateer plan unlocks setup sheets, the full part vault,
            session logging, and MD Intel — the tools a racing program needs.
          </p>
          <a href="/data/checkout?plan=privateer">
            <Button className="mt-3 h-9 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs">
              Upgrade to Privateer
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Add / Edit Milestone Modal ─────────────────────────────────────────────

function MilestoneModal({
  existing, onClose, onSaved,
}: {
  existing: Milestone | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    category: existing?.category ?? 'first',
    milestoneDate: existing?.milestoneDate ?? new Date().toISOString().split('T')[0],
    notes: existing?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Add a title'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/md-milestones', {
        method: existing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existing ? { id: existing.id, ...form } : form),
      })
      if (!res.ok) throw new Error('Save failed')
      onSaved()
      onClose()
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-zinc-100">{existing ? 'Edit milestone' : 'Add a milestone'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>

        {!existing && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-zinc-400 mb-2">Quick add</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.title}
                  onClick={() => setForm(f => ({ ...f, title: s.title, category: s.category }))}
                  className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:border-lime-400 hover:text-lime-400 transition-colors"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Title</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. First podium"
              className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(CATEGORIES).map(([key, c]) => {
                const Icon = c.icon
                const active = form.category === key
                return (
                  <button
                    key={key}
                    onClick={() => setForm(f => ({ ...f, category: key }))}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-medium transition-colors ${active ? c.bg + ' ' + c.color : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Date</label>
            <input
              type="date"
              value={form.milestoneDate}
              onChange={e => setForm(f => ({ ...f, milestoneDate: e.target.value }))}
              className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Notes <span className="text-zinc-600">(optional)</span></label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="What happened, how it felt, who was there..."
              rows={3}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button onClick={handleSubmit} disabled={saving} className="w-full h-12 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold">
            {saving ? 'Saving...' : existing ? 'Save changes' : 'Add milestone'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Rider Profile Edit Modal ─────────────────────────────────────────────────

function ProfileModal({
  profile, onClose, onSaved,
}: {
  profile: RiderProfile
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    riderName: profile.riderName ?? '',
    riderBirthYear: profile.riderBirthYear ? String(profile.riderBirthYear) : '',
    riderClass: profile.riderClass ?? '',
  })
  const [saving, setSaving] = useState(false)
  const currentYear = new Date().getFullYear()

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/md-rider-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-zinc-100">Rider details</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Rider name</label>
            <input
              value={form.riderName}
              onChange={e => setForm(f => ({ ...f, riderName: e.target.value }))}
              placeholder="e.g. Cody"
              className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Birth year</label>
            <input
              type="number"
              min={currentYear - 25}
              max={currentYear}
              value={form.riderBirthYear}
              onChange={e => setForm(f => ({ ...f, riderBirthYear: e.target.value }))}
              placeholder="e.g. 2017"
              className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Current class</label>
            <select
              value={form.riderClass}
              onChange={e => setForm(f => ({ ...f, riderClass: e.target.value }))}
              className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-4 text-sm text-zinc-100 focus:border-lime-400 focus:outline-none"
            >
              <option value="">Select a class...</option>
              {YOUTH_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full h-12 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold">
            {saving ? 'Saving...' : 'Save details'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main View ──────────────────────────────────────────────────────────────

export default function ViewProgression() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [profile, setProfile] = useState<RiderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Milestone | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  const load = useCallback(async () => {
    const [mRes, pRes] = await Promise.all([
      fetch('/api/md-milestones'),
      fetch('/api/md-rider-profile'),
    ])
    if (mRes.ok) setMilestones(await mRes.json())
    if (pRes.ok) setProfile(await pRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    setMilestones(ms => ms.filter(m => m.id !== id))
    await fetch('/api/md-milestones', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-lime-400 animate-spin" />
      </div>
    )
  }

  const isRookie = isRookieTier(profile?.subscriptionTier)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Progression</h2>
          <p className="text-sm text-zinc-500">Every first, every step up — the rider&apos;s story from day one.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="h-10 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {/* Rider profile */}
      {profile && <ProfileCard profile={profile} onEdit={() => setShowProfile(true)} />}

      {/* Graduation nudge — only for Rookie-tier riders aging up */}
      {isRookie && profile && <GraduationNudge profile={profile} />}

      {/* Timeline */}
      {milestones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-7 w-7 text-zinc-600" />
          </div>
          <p className="text-sm font-semibold text-zinc-300">Start the story</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">Log that first ride, first jump, first race. You&apos;ll be glad you kept track.</p>
          <Button onClick={() => setShowAdd(true)} className="mt-4 h-9 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add first milestone
          </Button>
        </div>
      ) : (
        <div className="relative pl-6">
          {/* vertical spine */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-zinc-800" />
          <div className="space-y-4">
            {milestones.map(m => {
              const cat = CATEGORIES[m.category] ?? CATEGORIES.other
              const Icon = cat.icon
              return (
                <div key={m.id} className="relative">
                  {/* node */}
                  <div className={`absolute -left-[23px] top-1 h-5 w-5 rounded-full border flex items-center justify-center ${cat.bg}`}>
                    <Icon className={`h-3 w-3 ${cat.color}`} />
                  </div>
                  <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${cat.color}`}>{cat.label}</span>
                          <span className="text-xs text-zinc-500">{formatDate(m.milestoneDate)}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-zinc-100 mt-1">{m.title}</h4>
                        {m.notes && <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{m.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => setEditing(m)} className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-lime-400">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showAdd && <MilestoneModal existing={null} onClose={() => setShowAdd(false)} onSaved={load} />}
      {editing && <MilestoneModal existing={editing} onClose={() => setEditing(null)} onSaved={load} />}
      {showProfile && profile && <ProfileModal profile={profile} onClose={() => setShowProfile(false)} onSaved={load} />}
    </div>
  )
}
