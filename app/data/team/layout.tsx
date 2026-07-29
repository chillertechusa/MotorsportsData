'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays, DollarSign, Award, Wrench,
  HeartPulse, LayoutDashboard, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import DemoAccountBanner from '@/components/coach/demo-account-banner'

function getDemoCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

function DemoBannerWrapper() {
  const [demoTeamId, setDemoTeamId] = useState('')
  const [demoCreatedAt, setDemoCreatedAt] = useState('')
  useEffect(() => {
    const teamId = getDemoCookie('x-demo-team')
    const role   = getDemoCookie('x-demo-role')
    if (teamId && role === 'family_team') {
      setDemoTeamId(teamId)
      setDemoCreatedAt(getDemoCookie('x-demo-created'))
    }
  }, [])
  if (!demoTeamId) return null
  return <DemoAccountBanner demoTeamId={demoTeamId} demoCreatedAt={demoCreatedAt} />
}

const NAV = [
  { href: '/data/team',          label: 'Overview',    icon: LayoutDashboard },
  { href: '/data/team/calendar', label: 'Race Calendar', icon: CalendarDays },
  { href: '/data/team/budget',   label: 'Budget',       icon: DollarSign },
  { href: '/data/team/sponsors', label: 'Sponsors',     icon: Award },
  { href: '/data/team/mechanic', label: 'Mechanic',     icon: Wrench },
  { href: '/data/team/health',   label: 'Rider Health', icon: HeartPulse },
]

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DemoBannerWrapper />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-zinc-800 min-h-screen sticky top-0 flex flex-col pt-4" aria-label="Team OS navigation">
          <div className="px-5 mb-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">Team OS</p>
            <p className="text-xs font-bold text-zinc-300 mt-0.5 truncate">Family Race Team</p>
          </div>
          <nav className="flex flex-col gap-0.5 px-2 flex-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-zinc-800 text-sky-400'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                  {active && <ChevronRight className="h-3 w-3 ml-auto text-zinc-600" aria-hidden="true" />}
                </Link>
              )
            })}
          </nav>
          <div className="px-4 pb-6 mt-auto">
            <Link
              href="/auth/sign-up?plan=privateer&utm_source=team_demo"
              className="block w-full text-center text-xs font-black uppercase tracking-widest bg-sky-400 text-zinc-950 px-3 py-2.5 hover:bg-sky-300 transition-colors"
            >
              Get Full Access
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
