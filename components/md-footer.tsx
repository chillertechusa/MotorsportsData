import Link from 'next/link'
import { ShieldCheck, Phone } from 'lucide-react'
import MdLogo from './md-logo'

const footerLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'See It Live', href: '/demo' },
  { label: 'Pricing', href: '/data/pricing' },
  { label: 'Security', href: '/data/security' },
  { label: 'Buy Merch', href: '/shop' },
  { label: 'Login', href: '/data' },
]

const legalLinks = [
  { label: 'Terms of Service', href: '/legal/terms' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'IP & DMCA', href: '/legal/ip' },
  { label: 'Data & Consent', href: '/legal/data-consent' },
]

export default function MdFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-5">
              <MdLogo size="md" asLink={true} />
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-5">
              The operating system for a racing career. From the mini-bike in the driveway to
              the factory rig. Bike, setup, body, mind, and three AI co-pilots — plans from $9/mo.
            </p>
            <a
              href="tel:+18884698475"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-lime-400 transition-colors"
            >
              <Phone className="h-4 w-4 text-lime-400 shrink-0" aria-hidden="true" />
              (888) 469-8475
            </a>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-5">
              Platform
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-lime-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-5">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-lime-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-5">
              Infrastructure
            </h3>
            <div className="flex items-start gap-3 p-4 border border-zinc-800 bg-zinc-900">
              <ShieldCheck className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-zinc-100 text-sm font-semibold mb-1">
                  Enterprise-Grade Security
                </p>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Firewalled data silos, row-level access controls, and 24/7 trackside
                  backup. Your data never leaves your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
            &copy; 2026 Motorsport Data. All rights reserved.
          </p>
          <p className="font-mono text-xs text-zinc-700 uppercase tracking-widest">
            Built for the sport. Owned by the rider.
          </p>
        </div>
      </div>
    </footer>
  )
}
