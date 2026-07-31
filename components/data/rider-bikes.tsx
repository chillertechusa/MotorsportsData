'use client'

import useSWR from 'swr'
import { Bike, Clock3, Gauge, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url).then((response) => response.json())

type Vehicle = { id: string; name: string; type: string; engineHours: number | null; discipline: string | null }

const DEMO_VEHICLES: Vehicle[] = [
  { id: 'jake-450', name: "Jake's CRF450R", type: '2025 Honda CRF450R · #722', engineHours: 18.4, discipline: 'mx_sx' },
  { id: 'mia-85', name: "Mia's YZ85", type: '2024 Yamaha YZ85 · #17', engineHours: 11.2, discipline: 'pit_bike_youth' },
]

export function RiderBikes() {
  const { data, isLoading } = useSWR<{ success: boolean; vehicles: Vehicle[] }>('/api/md-fleet', fetcher)
  const vehicles = data?.vehicles?.length ? data.vehicles : DEMO_VEHICLES

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-mono text-xs uppercase tracking-widest text-primary">Garage</p><h1 className="mt-1 text-balance text-3xl font-black tracking-tight">My Bikes & Rig</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">One health file for every machine that gets your family to the gate.</p></div>
        <Button><Wrench aria-hidden="true" /> Log maintenance</Button>
      </header>

      <section aria-label="Race bikes" className="grid gap-4 lg:grid-cols-2">
        {vehicles.map((vehicle, index) => {
          const serviceDue = Math.max(0, index === 0 ? 20 - Number(vehicle.engineHours ?? 0) : 15 - Number(vehicle.engineHours ?? 0))
          return <article key={vehicle.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4"><span className="flex size-11 items-center justify-center rounded-md bg-primary/12 text-primary"><Bike aria-hidden="true" className="size-5" /></span><span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">Ready</span></div>
            <h2 className="mt-5 text-xl font-black">{vehicle.name}</h2><p className="mt-1 text-sm text-muted-foreground">{vehicle.type}</p>
            <div className="mt-5 grid grid-cols-2 gap-3"><Metric icon={Gauge} label="Engine hours" value={`${Number(vehicle.engineHours ?? 0).toFixed(1)} hrs`} /><Metric icon={Clock3} label="Service due" value={`${serviceDue.toFixed(1)} hrs`} /></div>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><ShieldCheck aria-hidden="true" className="size-4 text-primary" /> Doctor file is current</div>
          </article>
        })}
      </section>

      <article className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground"><Truck aria-hidden="true" className="size-5" /></span><div><p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tow rig</p><h2 className="mt-1 text-xl font-black">2019 Ram 3500 + 28&apos; race trailer</h2><p className="mt-1 text-sm text-muted-foreground">86,420 mi · diesel · 1,284 trailer miles this season</p></div></div><div className="grid grid-cols-2 gap-3 sm:min-w-80"><Metric icon={Gauge} label="Oil life" value="42%" /><Metric icon={Clock3} label="Next service" value="1,580 mi" /></div></div>
      </article>
      {isLoading && <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Syncing garage records…</p>}
    </div>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return <div className="rounded-md border border-border bg-background p-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon aria-hidden="true" className="size-3.5" />{label}</div><p className="mt-2 font-mono text-sm font-bold text-foreground">{value}</p></div>
}
