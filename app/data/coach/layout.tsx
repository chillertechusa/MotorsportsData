'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, CalendarDays, ClipboardList, FileText,
  BarChart3, Settings, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import DemoAccountBanner from '@/components/coach/demo-account-banner'

function getDemoCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

function DemoAccountBannerWrapper() {
  const [demoTeamId, setDemoTeamId] = useState('')
  const [demoCreatedAt, setDemoCreatedAt] = useState('')

  useEffect(() => {
    const teamId = getDemoCookie('x-demo-team')
    if (teamId.startsWith('demo-')) {
      setDemoTeamId(teamId)
      setDemoCreatedAt(getDemoCookie('x-demo-created') || new Date().toISOString())
    }
  }, [])

  if (!demoTeamId) return null
  return <DemoAccountBanner teamId={demoTeamId} createdAt={demoCreatedAt} />
}

const NAV = [
  { href: '/data/coach',          label: 'Command',  icon: BarChart3,     exact: true },
  { href: '/data/coach/roster',   label: 'Roster',   icon: Users,         exact: false },
  { href: '/data/coach/sessions', label: 'Sessions', icon: CalendarDays,  exact: false },
  { href: '/data/coach/plans',    label: 'Plans',    icon: ClipboardList, exact: false },
  { href: '/data/coach/billing',  label: 'Billing',  icon: FileText,      exact: false },
  { href: '/data/coach/settings', label: 'Settings', icon: Settings,      exact: false },
]

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex" style={{ colorScheme: 'dark' }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-zinc-800 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-zinc-800">
          <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-0.5">Motorsport Data</p>
          <p className="text-sm font-bold text-zinc-100 leading-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: '1.1rem' }}>
            Coach OS
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5" aria-label="Coach navigation">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href) && href !== '/data/coach'
              || (exact && pathname === href)
            const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm transition-colors',
                  isActive
                    ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto opacity-60" aria-hidden="true" />}
              </Link>
            )
          })}
        </nav>

        {/* Back to platform */}
        <div className="px-3 py-4 border-t border-zinc-800">
          <Link
            href="/data"
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors rounded-sm hover:bg-zinc-800/40"
          >
            <ChevronRight className="h-3 w-3 rotate-180" aria-hidden="true" />
            Back to Platform
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto flex flex-col">
        <DemoAccountBannerWrapper />
        {children}
      </main>
    </div>
  )
}
