'use client'

import { saveMyProfile, type ProfileInput } from '@/app/actions/account'
import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

const TEE_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const CLASSES = ['Beginner', 'Novice', 'Intermediate', 'Expert', 'Pro', 'Vet', 'Just Ride']

type Profile = {
  teeSize?: string | null
  hoodieSize?: string | null
  raceNumber?: string | null
  riderClass?: string | null
  homeTrack?: string | null
  shipAddress1?: string | null
  shipAddress2?: string | null
  shipCity?: string | null
  shipState?: string | null
  shipZip?: string | null
  phone?: string | null
} | null

const inputCls =
  'w-full bg-black/40 border border-white/10 text-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none placeholder:text-white/30'
const labelCls = 'block text-white/50 text-xs uppercase tracking-widest mb-1.5'

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<ProfileInput>({
    teeSize: profile?.teeSize ?? '',
    hoodieSize: profile?.hoodieSize ?? '',
    raceNumber: profile?.raceNumber ?? '',
    riderClass: profile?.riderClass ?? '',
    homeTrack: profile?.homeTrack ?? '',
    shipAddress1: profile?.shipAddress1 ?? '',
    shipAddress2: profile?.shipAddress2 ?? '',
    shipCity: profile?.shipCity ?? '',
    shipState: profile?.shipState ?? '',
    shipZip: profile?.shipZip ?? '',
    phone: profile?.phone ?? '',
  })

  function set<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await saveMyProfile(form)
    setSaving(false)
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Fit */}
      <section className="bg-[#151515] border border-white/10 p-5 sm:p-6">
        <h2
          className="text-white text-lg font-black uppercase mb-4"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Your Fit
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tee Size</label>
            <select
              value={form.teeSize}
              onChange={(e) => set('teeSize', e.target.value)}
              className={inputCls}
            >
              <option value="">Select</option>
              {TEE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Hoodie Size</label>
            <select
              value={form.hoodieSize}
              onChange={(e) => set('hoodieSize', e.target.value)}
              className={inputCls}
            >
              <option value="">Select</option>
              {TEE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Rider identity */}
      <section className="bg-[#151515] border border-white/10 p-5 sm:p-6">
        <h2
          className="text-white text-lg font-black uppercase mb-4"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Rider Identity
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Race Number</label>
            <input
              value={form.raceNumber}
              onChange={(e) => set('raceNumber', e.target.value)}
              placeholder="e.g. 247"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Class</label>
            <select
              value={form.riderClass}
              onChange={(e) => set('riderClass', e.target.value)}
              className={inputCls}
            >
              <option value="">Select</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Home Track</label>
            <input
              value={form.homeTrack}
              onChange={(e) => set('homeTrack', e.target.value)}
              placeholder="Where do you ride?"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Shipping */}
      <section className="bg-[#151515] border border-white/10 p-5 sm:p-6">
        <h2
          className="text-white text-lg font-black uppercase mb-4"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          Default Shipping
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Address</label>
            <input
              value={form.shipAddress1}
              onChange={(e) => set('shipAddress1', e.target.value)}
              placeholder="Street address"
              className={inputCls}
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Apt / Suite</label>
            <input
              value={form.shipAddress2}
              onChange={(e) => set('shipAddress2', e.target.value)}
              placeholder="Optional"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input value={form.shipCity} onChange={(e) => set('shipCity', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>State</label>
              <input
                value={form.shipState}
                onChange={(e) => set('shipState', e.target.value)}
                maxLength={2}
                placeholder="UT"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>ZIP</label>
              <input value={form.shipZip} onChange={(e) => set('shipZip', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Phone</label>
            <input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="For shipping updates"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-60"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving' : saved ? 'Saved' : 'Save Profile'}
        </button>
        {saved && <span className="text-primary text-sm">Your profile is locked in.</span>}
      </div>
    </form>
  )
}
