'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Bike, CalendarDays, Clock3, Flag, Gauge, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const fetcher = (url: string) => fetch(url).then((response) => response.json())
type Vehicle = { id: string; name: string }
type Session = { id: string; name: string; trackName: string; createdAt: string; trackConditions?: string; bestLapSeconds?: number }

export function RiderRideLog() {
  const { data: fleet } = useSWR<{ vehicles: Vehicle[] }>('/api/md-fleet', fetcher)
  const { data: log, isLoading } = useSWR<{ sessions: Session[] }>('/api/sessions?limit=20', fetcher)
  const vehicles = fleet?.vehicles ?? []
  const sessions = log?.sessions?.length ? log.sessions : [
    { id: '1', name: 'Fox Raceway', trackName: 'Fox Raceway', createdAt: '2026-07-26T10:00:00Z', trackConditions: 'Dry, deep prep', bestLapSeconds: 126.4 },
    { id: '2', name: 'Lake Elsinore MX', trackName: 'Lake Elsinore MX', createdAt: '2026-07-19T10:00:00Z', trackConditions: 'Hard pack', bestLapSeconds: 132.8 },
  ]
  const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState('')

  async function submit(formData: FormData) {
    setSaving(true); setError('')
    const payload = { vehicleId: String(formData.get('vehicleId')), trackName: String(formData.get('trackName')), trackConditions: String(formData.get('trackConditions')), riderFeedback: String(formData.get('feedback')), sessionHours: Number(formData.get('hours')), bestLapSeconds: Number(formData.get('lap')) || undefined, sessionDate: String(formData.get('date')) }
    const response = await fetch('/api/log-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const result = await response.json(); setSaving(false)
    if (!response.ok) { setError(result.error ?? 'Could not save ride.'); return }
    setOpen(false); await mutate('/api/sessions?limit=20')
  }

  return <div className="flex flex-col gap-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs uppercase tracking-widest text-primary">Every lap remembers</p><h1 className="mt-1 text-3xl font-black tracking-tight">Ride Log</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Track seat time, setup, feedback, and the machine hours that trigger service.</p></div><Button onClick={() => setOpen((value) => !value)}><Plus aria-hidden="true" /> Log a ride</Button></header>
    {open && <form action={submit} className="grid gap-4 rounded-lg border border-primary/30 bg-card p-5 md:grid-cols-2">
      <FormField label="Bike"><select name="vehicleId" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}</select></FormField>
      <FormField label="Ride date"><Input name="date" type="date" defaultValue="2026-07-30" required /></FormField><FormField label="Track"><Input name="trackName" placeholder="Pala Raceway" required /></FormField><FormField label="Conditions"><Input name="trackConditions" placeholder="Deep prep, drying by noon" /></FormField><FormField label="Seat time (hours)"><Input name="hours" type="number" step="0.1" min="0" placeholder="1.4" /></FormField><FormField label="Best lap (seconds)"><Input name="lap" type="number" step="0.1" min="0" placeholder="124.8" /></FormField><div className="md:col-span-2"><FormField label="Rider notes"><Textarea name="feedback" placeholder="What felt good? What changed?" /></FormField></div>{error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}<div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save ride'}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
    </form>}
    <section aria-label="Ride history" className="overflow-hidden rounded-lg border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="font-bold">Recent rides</h2></div><div className="divide-y divide-border">{sessions.map((session) => <article key={session.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary"><Flag aria-hidden="true" className="size-4" /></span><div><h3 className="font-bold">{session.trackName ?? session.name}</h3><p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CalendarDays aria-hidden="true" className="size-3" />{new Date(session.createdAt).toLocaleDateString()}</span><span className="flex items-center gap-1"><MapPin aria-hidden="true" className="size-3" />{session.trackConditions ?? 'Conditions not logged'}</span></p></div></div><div className="flex gap-5 text-xs"><div><p className="text-muted-foreground">Best lap</p><p className="mt-1 font-mono font-bold">{session.bestLapSeconds ? `${Math.floor(session.bestLapSeconds / 60)}:${(session.bestLapSeconds % 60).toFixed(1).padStart(4, '0')}` : '—'}</p></div><div><p className="text-muted-foreground">Status</p><p className="mt-1 font-bold text-primary">Filed</p></div></div></article>)}</div></section>
    {isLoading && <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading ride history…</p>}
  </div>
}
function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="flex flex-col gap-2 text-sm font-semibold">{label}{children}</label> }
