'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import MdLogo from './md-logo'


export default function MdNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/98 backdrop-blur-lg border-b border-zinc-800/40" style={{ top: 'var(--banner-offset, 0px)' }}>
      {/* Subtle gradient accent at top */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent" />

      <div className="w-full px-4 sm:px-6 lg:px-10 relative">
        <div className="flex items-center justify-between h-14">

          {/* Logo — home link, smaller on mobile */}
          <Link href="/" className="hover:opacity-80 transition-opacity shrink-0 [&_img]:h-8 sm:[&_img]:h-10 [&_svg]:h-8 sm:[&_svg]:h-10">
            <MdLogo size="sm" asLink={false} />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
            <Link
              href="/smx2027"
              className="flex items-center gap-1.5 font-mono text-xs text-lime-400 uppercase tracking-widest hover:text-lime-300 transition-colors"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
              SMX 2027
            </Link>
            <Link
              href="/#team-partner"
              className="font-mono text-xs text-zinc-400 uppercase tracking-widest hover:text-zinc-100 transition-colors"
            >
              Teams
            </Link>
            <Link
              href="/#demo"
              className="font-mono text-xs text-zinc-400 uppercase tracking-widest hover:text-zinc-100 transition-colors"
            >
              Platform
            </Link>
          </nav>

          {/* Sign In — always visible, far right */}
          <Link
            href="/data/sign-in?redirect=/data"
            className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-lime-400 border border-lime-400/40 rounded-lg hover:bg-lime-400/10 transition-colors"
          >
            Sign In
          </Link>

          {/* Mobile toggle — hidden, Sign In button replaces it */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {open && (
        <nav
          className="md:hidden relative bg-zinc-900/98 border-t border-zinc-800 px-4 pb-6 pt-4"
          aria-label="Mobile navigation"
        >
        </nav>
      )}
    </header>
  )
}
