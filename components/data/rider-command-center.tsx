import Link from 'next/link'
import { Activity, ArrowRight, Bike, Bot, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, Dog, HeartPulse, ShieldAlert, Truck, Users, Wrench } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const HEALTH = [
  { name: 'Jake’s KTM 450 SX-F', detail: '47.3 hr · piston due in 12.7 hr', score: 84, icon: Bike },
  { name: 'Mia’s KTM 85 SX', detail: '21.8 hr · air filter due now', score: 68, icon: Bike },
  { name: 'Ram 2500 + toy hauler', detail: 'Oil service in 640 mi', score: 91, icon: Truck },
]

const AGENT_FEED = [
  { time: '2m', title: 'Contingency match found', detail: 'Kawasaki Team Green regional payout: up to $750 at Pala.', icon: CircleDollarSign, tone: 'text-primary' },
  { time: '18m', title: 'Bike doctor flagged Mia’s 85', detail: 'Air filter interval reached. Added to weekend checklist.', icon: ShieldAlert, tone: 'text-amber-400' },
  { time: '1h', title: 'Sponsor payment reconciled', detail: 'West Coast Concrete invoice MD-2026-0007 marked paid.', icon: CheckCircle2, tone: 'text-primary' },
  { time: '3h', title: 'Rig check updated', detail: 'Trailer tire pressures confirmed by Dad.', icon: Truck, tone: 'text-secondary-foreground' },
]

export function RiderCommandCenter() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">Thursday · July 30</p>
          <h1 className="text-balance text-3xl font-black uppercase tracking-tight sm:text-4xl">Good evening, Dad.</h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">The family is 78% ready for race weekend. Three items need attention.</p>
        </div>
        <Button render={<Link href="/data/rider/weekend" />} size="lg">
          <Bot data-icon="inline-start" aria-hidden="true" /> Run weekend agent
        </Button>
      </header>

      <section aria-labelledby="next-gate-heading">
        <Card className="overflow-hidden border-primary/40 bg-card">
          <div className="h-1 bg-primary" aria-hidden="true" />
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2"><Badge>Next gate</Badge><Badge variant="outline">AMA District 38</Badge></div>
              <CardTitle id="next-gate-heading" className="text-2xl font-black uppercase sm:text-3xl">Pala Raceway · Round 7</CardTitle>
              <CardDescription>Sunday, August 2 · Pala, California · Gates open 6:00 AM</CardDescription>
            </div>
            <CalendarDays className="hidden size-8 text-primary sm:block" aria-hidden="true" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            {[['02','Days'],['11','Hours'],['24','Minutes'],['78%','Ready']].map(([value,label]) => (
              <div key={label} className="rounded-md border border-border bg-background p-4"><p className="font-mono text-3xl font-black text-primary">{value}</p><p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</p></div>
            ))}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Progress value={78} aria-label="Race weekend readiness: 78 percent" className="flex-1" />
            <span className="font-mono text-xs text-muted-foreground">14 of 18 checks clear</span>
          </CardFooter>
        </Card>
      </section>

      <section aria-label="Household race program metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Money found', value: '$2,450', sub: '3 open opportunities', icon: CircleDollarSign, href: '/data/rider/program' },
          { label: 'Bike health', value: '2 need eyes', sub: 'Mia’s filter is due', icon: Wrench, href: '/data/rider/bikes' },
          { label: 'Body status', value: 'Jake 86', sub: 'Mia check-in missing', icon: HeartPulse, href: '/data/rider/body' },
          { label: 'Household', value: '4 + Duke', sub: 'Rig 91% ready', icon: Users, href: '/data/rider/household' },
        ].map(({ label, value, sub, icon: Icon, href }) => (
          <Card key={label} className="group transition-colors hover:border-primary/50">
            <CardHeader className="flex-row items-start justify-between gap-3 pb-2"><CardDescription className="font-mono text-xs uppercase tracking-widest">{label}</CardDescription><Icon className="size-4 text-primary" aria-hidden="true" /></CardHeader>
            <CardContent><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs text-muted-foreground">{sub}</p></CardContent>
            <CardFooter><Button render={<Link href={href} />} variant="ghost" size="sm">Open <ArrowRight data-icon="inline-end" aria-hidden="true" /></Button></CardFooter>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section aria-labelledby="garage-health-heading">
          <Card>
            <CardHeader><CardTitle id="garage-health-heading" className="flex items-center gap-2 text-lg"><Activity className="size-5 text-primary" aria-hidden="true" /> Garage health</CardTitle><CardDescription>Every race machine and the rig, one file.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {HEALTH.map(({ name, detail, score, icon: Icon }, index) => (
                <div key={name} className="flex flex-col gap-3">
                  {index > 0 && <Separator />}
                  <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-md bg-muted"><Icon className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-bold">{name}</p><span className="font-mono text-sm font-bold text-primary">{score}%</span></div><p className="truncate text-xs text-muted-foreground">{detail}</p><Progress value={score} aria-label={`${name} health: ${score} percent`} className="mt-2" /></div></div>
                </div>
              ))}
            </CardContent>
            <CardFooter><Button render={<Link href="/data/rider/bikes" />} variant="outline">Open garage <ArrowRight data-icon="inline-end" aria-hidden="true" /></Button></CardFooter>
          </Card>
        </section>

        <section aria-labelledby="agent-feed-heading">
          <Card>
            <CardHeader><CardTitle id="agent-feed-heading" className="flex items-center gap-2 text-lg"><Bot className="size-5 text-primary" aria-hidden="true" /> MD agent feed</CardTitle><CardDescription>What the system handled for the family.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {AGENT_FEED.map(({ time, title, detail, icon: Icon, tone }, index) => (
                <div key={title} className="flex flex-col gap-3">
                  {index > 0 && <Separator />}
                  <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted"><Icon className={`size-4 ${tone}`} aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-bold">{title}</p><span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Clock3 className="size-3" aria-hidden="true" />{time}</span></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p></div></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <section aria-labelledby="family-heading">
        <Card>
          <CardHeader><CardTitle id="family-heading" className="text-lg">Household file</CardTitle><CardDescription>Dad owns the account. Rider profiles stay separate and guardian-controlled.</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {[
              { initials:'JM', name:'Jake #722', role:'450 A · ready 86%' },
              { initials:'MM', name:'Mia #314', role:'85cc · guardian managed' },
              { initials:'DM', name:'Dad', role:'Account owner · rig' },
              { initials:'DK', name:'Duke', role:'Track dog · snacks packed', dog:true },
            ].map((person) => (
              <div key={person.name} className="flex min-w-56 flex-1 items-center gap-3 rounded-md border border-border bg-background p-3"><Avatar><AvatarFallback>{person.dog ? <Dog className="size-4" aria-hidden="true" /> : person.initials}</AvatarFallback></Avatar><div><p className="text-sm font-bold">{person.name}</p><p className="text-xs text-muted-foreground">{person.role}</p></div></div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
