'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Activity, Battery, HeartPulse, Moon, Save, Watch, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const fetcher = (url: string) => fetch(url).then((response) => response.json())
type Readiness = { sleepHours: number | null; sleepScore: number | null; hrv: number | null; restingHr: number | null; energy: number | null; fatigue: number | null; source: string }

export function RiderBody() {
  const { data, isLoading } = useSWR<{ latest?: Readiness; calculated?: { readiness: { overall: number; peakProbability: number; tapperRecommendation: string } } }>('/api/md-readiness?calculate=true&daysUntilRace=3', fetcher)
  const latest = data?.latest ?? { sleepHours: 7.8, sleepScore: 88, hrv: 64, restingHr: 52, energy: 82, fatigue: 22, source: 'Garmin' }
  const score = data?.calculated?.readiness.overall ?? 84
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false)

  async function submit(formData: FormData) {
    setSaving(true); setSaved(false)
    const payload = { entryDate: String(formData.get('date')), sleepHours: Number(formData.get('sleepHours')), sleepScore: Number(formData.get('sleepScore')), hrv: Number(formData.get('hrv')), restingHr: Number(formData.get('restingHr')), energy: Number(formData.get('energy')), fatigue: Number(formData.get('fatigue')), notes: String(formData.get('notes')), source: 'manual' }
    const response = await fetch('/api/md-readiness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false); if (response.ok) { setSaved(true); await mutate('/api/md-readiness?calculate=true&daysUntilRace=3') }
  }

  return <div className="flex flex-col gap-6">
    <header><p className="font-mono text-xs uppercase tracking-widest text-primary">The rider is part of the machine</p><h1 className="mt-1 text-3xl font-black tracking-tight">Body</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A private readiness file for sleep, recovery, fatigue, and race-day preparation.</p></header>
    <section className="grid gap-4 lg:grid-cols-[1.15fr_2fr]">
      <article className="flex min-h-64 flex-col justify-between rounded-lg border border-primary/30 bg-card p-6"><div className="flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground"><Activity aria-hidden="true" className="size-5" /></span><span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">Optimal</span></div><div><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Today&apos;s readiness</p><p className="mt-2 font-mono text-7xl font-black tracking-tighter text-primary">{score}</p><p className="mt-2 text-sm text-muted-foreground">{data?.calculated?.readiness.peakProbability ?? 91}% projected race-day peak</p></div></article>
      <div className="grid grid-cols-2 gap-4"><Metric icon={Moon} label="Sleep" value={`${latest.sleepHours ?? '—'} hrs`} detail={`${latest.sleepScore ?? '—'} score`} /><Metric icon={Zap} label="HRV" value={`${latest.hrv ?? '—'} ms`} detail="Above 14-day baseline" /><Metric icon={HeartPulse} label="Resting HR" value={`${latest.restingHr ?? '—'} bpm`} detail="Stable" /><Metric icon={Battery} label="Energy" value={`${latest.energy ?? '—'}%`} detail={`${latest.fatigue ?? '—'}% fatigue`} /></div>
    </section>
    <article className="rounded-lg border border-border bg-card p-5"><div className="flex items-center gap-3"><Watch aria-hidden="true" className="size-5 text-primary" /><div><h2 className="font-bold">Wearable sync</h2><p className="text-xs text-muted-foreground">Garmin · last synced 8:14 AM</p></div><span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Connected</span></div></article>
    <form action={submit} className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-3"><div className="md:col-span-3"><h2 className="font-bold">Manual check-in</h2><p className="mt-1 text-xs text-muted-foreground">Use this when the wearable is off or you want to record how the rider actually feels.</p></div><Field label="Date"><Input name="date" type="date" defaultValue="2026-07-30" required /></Field><Field label="Sleep hours"><Input name="sleepHours" type="number" step="0.1" defaultValue={latest.sleepHours ?? 7.5} /></Field><Field label="Sleep score"><Input name="sleepScore" type="number" min="0" max="100" defaultValue={latest.sleepScore ?? 80} /></Field><Field label="HRV"><Input name="hrv" type="number" defaultValue={latest.hrv ?? 60} /></Field><Field label="Resting HR"><Input name="restingHr" type="number" defaultValue={latest.restingHr ?? 54} /></Field><Field label="Energy (0–100)"><Input name="energy" type="number" min="0" max="100" defaultValue={latest.energy ?? 80} /></Field><Field label="Fatigue (0–100)"><Input name="fatigue" type="number" min="0" max="100" defaultValue={latest.fatigue ?? 20} /></Field><div className="md:col-span-2"><Field label="Notes"><Textarea name="notes" placeholder="Soreness, hydration, stress, or anything unusual…" /></Field></div><div className="flex items-end"><Button type="submit" disabled={saving} className="w-full"><Save aria-hidden="true" />{saving ? 'Saving…' : saved ? 'Saved' : 'Save check-in'}</Button></div></form>
    {isLoading && <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Syncing body file…</p>}
  </div>
}
function Metric({ icon: Icon, label, value, detail }: { icon: typeof Moon; label: string; value: string; detail: string }) { return <article className="rounded-lg border border-border bg-card p-4"><Icon aria-hidden="true" className="size-4 text-primary" /><p className="mt-5 text-xs text-muted-foreground">{label}</p><p className="mt-1 font-mono text-xl font-black">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></article> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="flex flex-col gap-2 text-sm font-semibold">{label}{children}</label> }
