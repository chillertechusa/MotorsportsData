'use client'

import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Home, LayoutDashboard, LogOut, Package, Shirt, User, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'Orders & Tracking', icon: Package },
  { href: '/account/locker', label: 'Gear Locker', icon: Shirt },
  { href: '/account/profile', label: 'Rider Profile', icon: User },
  { href: '/account/subscription', label: 'Subscription', icon: CreditCard },
]

export default function AccountSidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null }
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (item: (typeof navItems)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between bg-[#111] border-b border-white/10 px-4 h-14 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <span
              className="text-primary-foreground font-black text-sm"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              MD
            </span>
          </div>
          <span
            className="text-white font-black uppercase text-sm"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            My Garage
          </span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-white/70 text-sm uppercase tracking-wide"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <aside
        className={cn(
          'bg-[#111] border-r border-white/10 w-60 flex-col shrink-0',
          'lg:flex lg:sticky lg:top-0 lg:h-screen',
          open ? 'flex fixed inset-x-0 top-14 bottom-0 z-40' : 'hidden',
        )}
      >
        {/* Brand */}
        <div className="hidden lg:flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <div className="w-9 h-9 bg-primary flex items-center justify-center">
            <span
              className="text-primary-foreground font-black"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              MD
            </span>
          </div>
          <div>
            <p
              className="text-white font-black uppercase text-sm leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              My Garage
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-none mt-1">
              Rider Account
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Quick links */}
        <Link
          href="/shop"
          className="flex items-center gap-3 px-5 py-3 text-white/40 hover:text-white text-xs uppercase tracking-widest border-t border-white/10"
        >
          <Home className="w-3.5 h-3.5" />
          Back To Shop
        </Link>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <p className="text-white text-sm font-medium truncate">
            {user.name || 'Rider'}
          </p>
          <p className="text-white/40 text-xs truncate mb-3">{user.email}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-white/60 hover:text-primary text-xs uppercase tracking-wide transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
