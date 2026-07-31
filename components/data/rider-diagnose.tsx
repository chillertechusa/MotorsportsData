'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Bot, ChevronRight, Loader2, Send, ShieldAlert, Stethoscope, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const fetcher = (url: string) => fetch(url).then((response) => response.json())
type Vehicle = { id: string; name: string; type: string }
type Message = { role: 'doctor' | 'rider'; text: string }
const QUICK = ['Bike bogs when I crack the throttle', 'Front end pushes in soft corners', 'Hard starting when the engine is hot']

export function RiderDiagnose() {
  const { data } = useSWR<{ vehicles: Vehicle[] }>('/api/md-fleet', fetcher)
  const vehicles = data?.vehicles?.length ? data.vehicles : [{ id: 'demo', name: "Jake's CRF450R", type: '2025 Honda CRF450R' }]
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? 'demo')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingToShop, setSendingToShop] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ role: 'doctor', text: "I'm your Bike Doctor. Tell me what the bike is doing, when it started, and anything that changed. I'll narrow the cause before you buy parts." }])
  const hasMessage = messages.length > 1 && messages[messages.length - 1]?.role === 'doctor'

  async function send(text = input) {
    const prompt = text.trim(); if (!prompt || loading) return
    setMessages((current) => [...current, { role: 'rider', text: prompt }]); setInput(''); setLoading(true)
    try {
      const response = await fetch('/api/md-intel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, vehicleId: vehicleId === 'demo' ? undefined : vehicleId }) })
      const result = await response.json()
      const answer = response.status === 403 ? 'I can run the guided symptom check now. Full OEM-spec diagnosis and your complete setup history unlock with Rider Pro.' : result.answer ?? result.error ?? 'I could not reach the service file. Try again with the symptom and when it occurs.'
      setMessages((current) => [...current, { role: 'doctor', text: answer }])
    } catch { setMessages((current) => [...current, { role: 'doctor', text: 'The service file is offline. Check the connection and try again.' }]) } finally { setLoading(false) }
  }

  async function sendToShop() {
    if (sendingToShop || !hasMessage) return
    setSendingToShop(true)
    try {
      const response = await fetch('/api/md-shop-connect/send-to-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: 'demo-team',
          vehicleId,
          symptom: messages.find((m) => m.role === 'rider')?.text ?? 'No symptom logged',
          diagnosis: messages[messages.length - 1]?.text ?? 'Diagnosis pending',
          shopEmail: 'shop@example.com',
          shopName: 'Your Local Shop',
        }),
      })
      const result = await response.json()
      if (result.success) {
        setMessages((current) => [...current, { role: 'doctor', text: `✓ Work order sent. ${result.message}` }])
      } else {
        setMessages((current) => [...current, { role: 'doctor', text: `⚠ Could not send: ${result.error}` }])
      }
    } catch (error) {
      setMessages((current) => [...current, { role: 'doctor', text: 'Could not reach the shop service. Check your connection and try again.' }])
    } finally {
      setSendingToShop(false)
    }
  }

  return <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-5">
    <header><p className="font-mono text-xs uppercase tracking-widest text-primary">Your bike has a doctor</p><h1 className="mt-1 text-3xl font-black tracking-tight">Diagnose</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Start with the symptom. MD checks the bike file, service history, and known setup.</p></header>
    <div className="flex flex-wrap gap-2" aria-label="Choose bike">{vehicles.map((vehicle) => <Button key={vehicle.id} variant={vehicleId === vehicle.id ? 'default' : 'outline'} size="sm" onClick={() => setVehicleId(vehicle.id)}>{vehicle.name}</Button>)}</div>
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border p-4"><span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><Stethoscope aria-hidden="true" className="size-5" /></span><div><p className="font-bold">MD Bike Doctor</p><p className="text-xs text-muted-foreground">Symptom-first · service-file grounded</p></div></div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'rider' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${message.role === 'rider' ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-foreground'}`}>{message.role === 'doctor' && <p className="mb-1 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-primary"><Bot aria-hidden="true" className="size-3" /> Bike Doctor</p>}{message.text}</div></div>)}
        {messages.length === 1 && <div className="grid gap-2 md:grid-cols-3">{QUICK.map((prompt) => <button key={prompt} onClick={() => send(prompt)} className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-border bg-background px-3 text-left text-xs font-semibold hover:border-primary/50"><span>{prompt}</span><ChevronRight aria-hidden="true" className="size-4 shrink-0 text-primary" /></button>)}</div>}
        {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 aria-hidden="true" className="size-4 animate-spin" /> Checking the bike file…</p>}
      </div>
      <div className="border-t border-border p-3"><div className="flex gap-2"><Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) send() }} placeholder="Describe what the bike is doing…" aria-label="Describe the bike symptom" /><Button size="icon" onClick={() => send()} disabled={loading} aria-label="Send symptom"><Send aria-hidden="true" /></Button></div>{hasMessage && <Button variant="outline" onClick={sendToShop} disabled={sendingToShop} className="mt-2 w-full"><Truck aria-hidden="true" className="size-4" /> {sendingToShop ? 'Sending to shop…' : 'Send diagnosis to my shop'}</Button>}<p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><ShieldAlert aria-hidden="true" className="size-3" /> Shut the bike off for fuel leaks, smoke, locked controls, or abnormal engine noise.</p></div>
    </div>
  </div>
}
