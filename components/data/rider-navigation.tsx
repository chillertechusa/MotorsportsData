'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bike, Bot, CalendarCheck2, CircleDollarSign, HeartPulse, Home, Menu, NotebookTabs, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/data/rider', label: 'Home', icon: Home },
  { href: '/data/rider/bikes', label: 'My Bikes', icon: Bike },
  { href: '/data/rider/diagnose', label: 'Diagnose', icon: HeartPulse },
  { href: '/data/rider/log', label: 'Ride Log', icon: NotebookTabs },
  { href: '/data/rider/body', label: 'Body', icon: HeartPulse },
  { href: '/data/rider/program', label: 'Program', icon: CircleDollarSign },
  { href: '/data/rider/household', label: 'Household', icon: Users },
  { href: '/data/rider/weekend', label: 'Race Weekend', icon: CalendarCheck2 },
] as const

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Rider console" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/data/rider' && pathname.startsWith(`${href}/`))
        const link = (
          <Link
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        )
        return mobile ? <SheetClose key={href} render={link} /> : <div key={href}>{link}</div>
      })}
    </nav>
  )
}

function RailHeader() {
  return (
    <div className="flex items-center gap-3 px-3">
      <span className="flex size-10 items-center justify-center rounded-md bg-primary font-black text-primary-foreground">MD</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-black uppercase tracking-tight">Martinez Racing</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Family command</p>
      </div>
    </div>
  )
}

export function RiderDesktopNavigation() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-card px-3 py-5 md:flex md:flex-col" aria-label="Rider navigation">
      <RailHeader />
      <div className="mt-7 flex-1"><NavLinks /></div>
      <div className="rounded-md border border-border bg-background p-3">
        <div className="flex items-center gap-2 text-xs font-bold"><Bot className="size-4 text-primary" aria-hidden="true" /> Weekend Agent</div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">6 checks ready for Pala.</p>
      </div>
    </aside>
  )
}

export function RiderMobileHeader() {
  return (
    <header className="sticky top-0 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-xs font-black text-primary-foreground">MD</span>
        <div><p className="text-sm font-black">Martinez Racing</p><p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Family command</p></div>
      </div>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Open rider navigation" />}><Menu aria-hidden="true" /></SheetTrigger>
        <SheetContent side="left" className="flex w-[19rem] flex-col gap-6">
          <SheetHeader><SheetTitle className="sr-only">Rider navigation</SheetTitle><SheetDescription className="sr-only">Navigate the Martinez family racing console.</SheetDescription></SheetHeader>
          <RailHeader />
          <NavLinks mobile />
        </SheetContent>
      </Sheet>
    </header>
  )
}
