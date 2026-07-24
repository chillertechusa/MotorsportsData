'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import MdLogo from './md-logo'

const NAV_LINKS = [
  { label: 'Modules', href: '#modules' },
  { label: 'Consoles', href: '#consoles' },
  { label: 'Co-Pilot', href: '#copilot' },
  { label: 'Agent 2028', href: '#agent', accent: true },
  { label: 'Pricing', href: '#pricing' },
]

export default function MdNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled ? 'bg-zinc-950/98 backdrop-blur-lg border-b border-zinc-800/50' : 'bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/20'
      }`}
      style={{ top: 'var(--banner-offset, 0px)' }}
    >
      {/* Top accent line */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity shrink-0" aria-label="Motorsport Data home">
            <MdLogo size="sm" asLink={false} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-mono text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 transition-colors rounded ${
                  l.accent
                    ? 'text-sky-400 hover:text-sky-300'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/smx2027"
              className="flex items-center gap-1.5 font-mono text-[11px] text-lime-400 uppercase tracking-[0.2em] px-3 py-1.5 hover:text-lime-300 transition-colors rounded"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
              SMX 2027
            </Link>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/data/sign-in?redirect=/data"
              className="hidden sm:inline-flex px-4 py-1.5 text-xs font-semibold text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-lime-400 text-zinc-950 hover:bg-lime-300 transition-colors"
            >
              Get Started
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          className="md:hidden bg-zinc-900/99 border-t border-zinc-800 px-4 py-5"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`font-mono text-xs uppercase tracking-[0.2em] px-3 py-2.5 transition-colors border-b border-zinc-800/50 last:border-0 ${
                  l.accent ? 'text-sky-400' : 'text-zinc-300 hover:text-zinc-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/smx2027"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-mono text-xs text-lime-400 uppercase tracking-[0.2em] px-3 py-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
              SMX 2027
            </Link>
            <div className="flex gap-2 pt-3 mt-1 border-t border-zinc-800">
              <Link
                href="/data/sign-in?redirect=/data"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="#pricing"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-bold bg-lime-400 text-zinc-950 hover:bg-lime-300 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
