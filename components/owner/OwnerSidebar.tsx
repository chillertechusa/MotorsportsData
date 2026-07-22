'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  CreditCard,
  Shield,
  Activity,
  Bot,
  HeartPulse,
  AlertTriangle,
  FileText,
  Search,
  BarChart3,
  GitBranch,
  UserCog,
  Zap,
  Store,
  Puzzle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
  Lock,
  KeyRound,
  FlaskConical,
  BadgeDollarSign,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

type NavGroup = {
  heading: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    heading: 'Revenue',
    items: [
      { label: 'Dashboard',        href: '/data/owner',                  icon: LayoutDashboard },
      { label: 'CEO Doctor',       href: '/data/owner/ceo-doctor',       icon: Brain,          badge: 'AI' },
      { label: 'Analytics',        href: '/data/owner/analytics',        icon: TrendingUp },
      { label: 'Cohorts',          href: '/data/owner/cohorts',          icon: BarChart3 },
      { label: 'Investor',         href: '/data/owner/investor',         icon: BadgeDollarSign },
    ],
  },
  {
    heading: 'Platform',
    items: [
      { label: 'Users',            href: '/data/owner/users',            icon: Users },
      { label: 'Advisors',         href: '/data/owner/advisors',         icon: UserCog },
      { label: 'Mechanic Stats',   href: '/data/owner/mechanic-analytics', icon: GitBranch },
      { label: 'Integrations',     href: '/data/owner/integrations',     icon: Puzzle },
      { label: 'Shop',             href: '/data/owner/shop',             icon: Store },
    ],
  },
  {
    heading: 'Ops',
    items: [
      { label: 'Monitoring',       href: '/data/owner/monitoring',       icon: Activity },
      { label: 'Agents Console',   href: '/data/owner/agents-console',   icon: Bot },
      { label: 'Health Checks',    href: '/data/owner/health-checks',    icon: HeartPulse },
      { label: 'Incidents',        href: '/data/owner/incidents',        icon: AlertTriangle },
      { label: 'Test Agents',      href: '/data/owner/test-agents',      icon: FlaskConical },
    ],
  },
  {
    heading: 'Security',
    items: [
      { label: 'Sentinel',         href: '/data/owner/sentinel',         icon: Shield },
      { label: 'Consent / COPPA',  href: '/data/owner/consent',          icon: FileText },
      { label: 'Legal',            href: '/data/owner/legal',            icon: FileText },
      { label: 'Emergency',        href: '/data/owner/emergency',        icon: Zap },
      { label: 'Backup Codes',     href: '/data/owner/backup-codes',     icon: KeyRound },
      { label: 'Recovery',         href: '/data/owner/recovery',         icon: Lock },
    ],
  },
  {
    heading: 'Growth',
    items: [
      { label: 'SEO Audits',       href: '/data/owner/seo-audits',       icon: Search },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Settings',         href: '/data/owner/setup',            icon: UserCog },
      { label: 'Account',          href: '/data/owner/account',          icon: CreditCard },
    ],
  },
]

export default function OwnerSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) =>
    href === '/data/owner' ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className={`relative flex flex-col shrink-0 h-screen sticky top-0 bg-zinc-950 border-r border-zinc-800 transition-all duration-200 ${
        collapsed ? 'w-[56px]' : 'w-[220px]'
      }`}
    >
      {/* Wordmark */}
      <div className={`flex items-center gap-2.5 px-4 h-14 border-b border-zinc-800 shrink-0 overflow-hidden`}>
        <div className="shrink-0 h-6 w-6 rounded bg-lime-400 flex items-center justify-center">
          <span
            className="text-zinc-950 font-black text-[10px] tracking-tight"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            MD
          </span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p
              className="text-zinc-50 font-black uppercase tracking-tight leading-none text-sm truncate"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Owner Console
            </p>
            <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.2em]">God Mode</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4 scrollbar-none">
        {NAV.map((group) => (
          <div key={group.heading}>
            {!collapsed && (
              <p
                className="px-4 mb-1 text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-600"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                {group.heading}
              </p>
            )}
            {collapsed && (
              <div className="mx-auto w-6 h-px bg-zinc-800 mb-1" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-2.5 mx-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-lime-400/10 text-lime-400'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                      }`}
                    >
                      {/* Active indicator rail */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-lime-400" />
                      )}
                      <Icon
                        className={`shrink-0 h-4 w-4 ${active ? 'text-lime-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                      />
                      {!collapsed && (
                        <span className="truncate font-medium text-[13px]">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded bg-lime-400/15 text-lime-400 border border-lime-400/20 uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-zinc-800 p-2 space-y-1">
        <Link
          href="/data/owner/login"
          className="flex items-center gap-2.5 px-2.5 py-2 mx-0 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-colors"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="shrink-0 h-4 w-4" />
          {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-[52px] z-10 h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}
