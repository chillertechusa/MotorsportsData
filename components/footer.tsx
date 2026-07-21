'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter strip */}
      <div className="bg-primary py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p
              className="text-primary-foreground text-3xl font-black uppercase tracking-wider leading-tight"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Join the Tribe
            </p>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Get drops, race updates, and community news delivered.
            </p>
          </div>
          <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 md:w-72 px-4 py-3 bg-primary-foreground text-background placeholder-background/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-background"
              aria-label="Email address for newsletter"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary-foreground text-background font-bold uppercase tracking-widest text-sm hover:bg-primary-foreground/90 transition-colors shrink-0"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Send It
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/images/md-logo.jpg"
                alt="Moto D — Motorsports Dirt"
                width={160}
                height={75}
                className="object-contain"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Passion. Drive. Results. Born from the dirt, built for riders who live on the edge of
              supercross, FMX, Baja, and open sand. Est. MMXVIII.
            </p>
            {/* Social links */}
            <div className="flex gap-4 mt-6">
              {['Instagram', 'YouTube', 'Facebook', 'TikTok'].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="text-muted-foreground hover:text-primary text-xs font-semibold uppercase tracking-widest transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3
              className="text-foreground text-sm font-black uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Explore
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/community', label: 'Community' },
                { href: '/community#supercross', label: 'Supercross' },
                { href: '/community#fmx', label: 'FMX' },
                { href: '/community#baja', label: 'Baja Racing' },
                { href: '/community#sand-rails', label: 'Sand Rails' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3
              className="text-foreground text-sm font-black uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Shop
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/shop', label: 'All Gear' },
                { href: '/shop#tees', label: 'T-Shirts' },
                { href: '/shop#hoodies', label: 'Hoodies' },
                { href: '/shop#accessories', label: 'Accessories' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            &copy; 2026 Moto D — Motorsports Dirt. All rights reserved. Est. MMXVIII.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
