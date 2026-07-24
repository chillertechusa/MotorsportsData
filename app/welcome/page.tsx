'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const SERIES_OPTIONS = [
  'AMA Pro Motocross', 'AMA Supercross', 'SMX Championship',
  'Amateur MX / Regional', 'MXGP / International', 'Women\'s MX (WMX)',
  'Vet / Masters', 'Youth / Mini', 'Other',
]

const ACCOUNTING_OPTIONS = ['QuickBooks Online', 'QuickBooks Desktop', 'Xero', 'Excel / Google Sheets', 'None yet']
const PAYROLL_OPTIONS   = ['ADP', 'Gusto', 'QuickBooks Payroll', 'Paychex', 'Manage it manually', 'No staff payroll']
const DATA_SOURCES      = ['MotoScan', 'LINK ECU', 'AiM Sports', 'Manual entry only', 'Other data-logger', 'No data yet']

type Step = 'team' | 'riders' | 'tools' | 'done'

type FormState = {
  // Team
  teamName: string
  primaryContact: string
  contactEmail: string
  contactPhone: string
  series: string
  homeBase: string
  // Riders
  riderCount: string
  bikeCount: string
  riderNames: string
  // Tools
  currentAccounting: string
  currentPayroll: string
  currentDataSources: string[]
  onboardingAvailability: string
  additionalNotes: string
}

export default function WelcomePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('team')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    teamName: '', primaryContact: '', contactEmail: '', contactPhone: '',
    series: '', homeBase: '',
    riderCount: '', bikeCount: '', riderNames: '',
    currentAccounting: '', currentPayroll: '', currentDataSources: [], onboardingAvailability: '', additionalNotes: '',
  })

  function set(field: keyof FormState, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleDataSource(src: string) {
    set('currentDataSources',
      form.currentDataSources.includes(src)
        ? form.currentDataSources.filter((s) => s !== src)
        : [...form.currentDataSources, src],
    )
  }

  async function submit() {
    setSaving(true)
    try {
      const res = await fetch('/api/onboarding/rig-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      setStep('done')
    } catch (err) {
      toast.error('Could not save your profile. Please try again.')
      console.error('[welcome] submit error:', err)
    } finally {
      setSaving(false)
    }
  }

  const fieldCls = 'w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-4 py-3 placeholder:text-zinc-600 focus:outline-none focus:border-lime-400/70 transition-colors'
  const labelCls = 'block font-mono text-[11px] text-zinc-500 uppercase tracking-widest mb-1.5'

  const STEPS: Step[] = ['team', 'riders', 'tools']
  const stepIdx = STEPS.indexOf(step as Step)

  if (step === 'done') {
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-lime-400 mb-6" aria-hidden="true" />
        <h1
          className="text-zinc-100 text-4xl uppercase mb-4"
          style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
        >
          You&apos;re In.
        </h1>
        <p className="text-zinc-400 text-lg max-w-md leading-relaxed mb-8">
          Your founding rig profile has been saved. Our team will reach out within 24 hours to
          begin your onboarding and start importing your data.
        </p>
        <button
          onClick={() => router.push('/data')}
          className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-black text-sm uppercase tracking-widest px-8 py-4 hover:bg-lime-300 transition-colors"
        >
          Go to Platform
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-3">
            // Founding Rig Onboarding
          </p>
          <h1
            className="text-zinc-100 text-4xl uppercase leading-none mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
          >
            Welcome to Motorsport Data.
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            Tell us about your operation so we can set up your rig before we go live together.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10">
          {(['Team', 'Riders', 'Tools'] as const).map((label, i) => {
            const active = i === stepIdx
            const done = i < stepIdx
            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center h-7 w-7 text-xs font-black font-mono border transition-colors ${
                  done ? 'bg-lime-400 border-lime-400 text-zinc-950' :
                  active ? 'border-lime-400 text-lime-400' : 'border-zinc-700 text-zinc-600'
                }`}>
                  {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </div>
                <span className={`mx-2 font-mono text-[11px] uppercase tracking-widest ${active ? 'text-zinc-100' : done ? 'text-zinc-500' : 'text-zinc-700'}`}>
                  {label}
                </span>
                {i < 2 && <div className="h-px w-6 bg-zinc-800 mr-2" aria-hidden="true" />}
              </div>
            )
          })}
        </div>

        {/* ── Step: Team ── */}
        {step === 'team' && (
          <div className="flex flex-col gap-6">
            <div>
              <label className={labelCls} htmlFor="teamName">Team Name</label>
              <input id="teamName" className={fieldCls} placeholder="e.g. Moto42 Racing" value={form.teamName} onChange={(e) => set('teamName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="primaryContact">Your Full Name</label>
              <input id="primaryContact" className={fieldCls} placeholder="Team owner / contact" value={form.primaryContact} onChange={(e) => set('primaryContact', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="contactEmail">Email</label>
                <input id="contactEmail" type="email" className={fieldCls} placeholder="you@team.com" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
              </div>
              <div>
                <label className={labelCls} htmlFor="contactPhone">Phone</label>
                <input id="contactPhone" type="tel" className={fieldCls} placeholder="+1 555 000 0000" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="series">Primary Series / Championship</label>
              <select id="series" className={fieldCls} value={form.series} onChange={(e) => set('series', e.target.value)}>
                <option value="">Select series...</option>
                {SERIES_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="homeBase">Home Base (City, State)</label>
              <input id="homeBase" className={fieldCls} placeholder="e.g. Murrieta, CA" value={form.homeBase} onChange={(e) => set('homeBase', e.target.value)} />
            </div>
            <button
              type="button"
              onClick={() => setStep('riders')}
              disabled={!form.teamName || !form.primaryContact || !form.contactEmail}
              className="inline-flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-black text-sm uppercase tracking-widest px-8 py-4 hover:bg-lime-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              Next: Riders & Bikes <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ── Step: Riders ── */}
        {step === 'riders' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="riderCount">Number of Riders</label>
                <input id="riderCount" type="number" min={1} max={100} className={fieldCls} placeholder="e.g. 3" value={form.riderCount} onChange={(e) => set('riderCount', e.target.value)} />
              </div>
              <div>
                <label className={labelCls} htmlFor="bikeCount">Number of Bikes</label>
                <input id="bikeCount" type="number" min={1} max={200} className={fieldCls} placeholder="e.g. 6" value={form.bikeCount} onChange={(e) => set('bikeCount', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="riderNames">Rider Names (optional)</label>
              <textarea
                id="riderNames"
                rows={3}
                className={fieldCls}
                placeholder="One per line or comma-separated"
                value={form.riderNames}
                onChange={(e) => set('riderNames', e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setStep('team')} className="flex-1 border border-zinc-700 text-zinc-400 font-semibold text-sm px-6 py-3.5 hover:border-zinc-500 transition-colors">
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep('tools')}
                disabled={!form.riderCount}
                className="flex-[2] inline-flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-black text-sm uppercase tracking-widest px-8 py-3.5 hover:bg-lime-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Tools & Data <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Tools ── */}
        {step === 'tools' && (
          <div className="flex flex-col gap-6">
            <div>
              <label className={labelCls} htmlFor="currentAccounting">Current Accounting Software</label>
              <select id="currentAccounting" className={fieldCls} value={form.currentAccounting} onChange={(e) => set('currentAccounting', e.target.value)}>
                <option value="">Select...</option>
                {ACCOUNTING_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="currentPayroll">Payroll Method</label>
              <select id="currentPayroll" className={fieldCls} value={form.currentPayroll} onChange={(e) => set('currentPayroll', e.target.value)}>
                <option value="">Select...</option>
                {PAYROLL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Current Data Sources (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {DATA_SOURCES.map((src) => {
                  const active = form.currentDataSources.includes(src)
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => toggleDataSource(src)}
                      className={`font-mono text-[11px] uppercase tracking-widest px-3 py-2 border transition-colors ${
                        active ? 'border-lime-400 text-lime-400 bg-lime-400/5' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                      }`}
                    >
                      {src}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="onboardingAvailability">Best time for onboarding call</label>
              <input id="onboardingAvailability" className={fieldCls} placeholder="e.g. Weekdays after 4pm PST" value={form.onboardingAvailability} onChange={(e) => set('onboardingAvailability', e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="additionalNotes">Anything else we should know</label>
              <textarea
                id="additionalNotes"
                rows={3}
                className={fieldCls}
                placeholder="Data files you have, team structure, special requirements..."
                value={form.additionalNotes}
                onChange={(e) => set('additionalNotes', e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setStep('riders')} className="flex-1 border border-zinc-700 text-zinc-400 font-semibold text-sm px-6 py-3.5 hover:border-zinc-500 transition-colors">
                Back
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="flex-[2] inline-flex items-center justify-center gap-2 bg-lime-400 text-zinc-950 font-black text-sm uppercase tracking-widest px-8 py-3.5 hover:bg-lime-300 transition-colors disabled:opacity-50"
              >
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving...</> : <>Submit Rig Profile <CheckCircle2 className="h-4 w-4" aria-hidden="true" /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
