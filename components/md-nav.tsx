'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import MdLogo from './md-logo'
import DemoButton from './demo-button'


export default function MdNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/98 backdrop-blur-lg border-b border-zinc-800/40">
      {/* Subtle gradient accent at top */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

      <div className="w-full px-4 sm:px-6 lg:px-10 relative">
        <div className="flex items-center justify-between h-14">

          {/* Logo — home link, smaller on mobile */}
          <Link href="/" className="hover:opacity-80 transition-opacity shrink-0 [&_img]:h-8 sm:[&_img]:h-10 [&_svg]:h-8 sm:[&_svg]:h-10">
            <MdLogo size="sm" asLink={false} />
          </Link>

          {/* Nav CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <DemoButton
              variant="primary"
              size="sm"
              label="Try Demo"
              className="rounded-lg font-black text-[11px] tracking-widest"
            />
            <Link
              href="/auth/sign-in"
              className="px-4 py-1.5 text-xs font-semibold text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-500 hover:text-zinc-200 transition-colors"
            >
              Sign In
            </Link>
          </div>

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
