import Link from 'next/link'
import { ShieldCheck, Phone, Zap } from 'lucide-react'
import MdLogo from './md-logo'

const platformLinks = [
  { label: 'Module Grid', href: '#modules' },
  { label: 'Consoles', href: '#consoles' },
  { label: 'Co-Pilot AI', href: '#copilot' },
  { label: 'Agent Marketplace', href: '#agent' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'SMX 2027', href: '/smx2027' },
]

const moduleLinks = [
  { label: 'Deals & Contracts', href: '#modules' },
  { label: 'Accounting P&L', href: '#modules' },
  { label: 'Sponsor CRM', href: '#modules' },
  { label: 'Service Desk', href: '#modules' },
  { label: 'Fleet & Parts', href: '#modules' },
  { label: 'Logistics', href: '#modules' },
  { label: 'Finance & Insurance', href: '#modules' },
  { label: 'Warranty', href: '#modules' },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-5">
              <MdLogo size="md" asLink={true} />
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-5">
              The racing management system for every program and every discipline. MX, NASCAR, karting, drag, off-road, and beyond. One platform. Every role. Every dollar.
            </p>
            <a
              href="tel:+18884698475"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-lime-400 transition-colors"
            >
              <Phone className="h-4 w-4 text-lime-400 shrink-0" aria-hidden="true" />
              (888) 469-8475
            </a>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-5">
              Platform
            </h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
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

          {/* Modules */}
          <div>
            <h3 className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-5">
              Modules
            </h3>
            <ul className="space-y-3">
              {moduleLinks.map((link) => (
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

          {/* Legal + Trust */}
          <div className="flex flex-col gap-8">
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

            {/* Trust badge */}
            <div className="flex items-start gap-3 p-4 border border-zinc-800 bg-zinc-900/60">
              <ShieldCheck className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-zinc-100 text-xs font-semibold mb-1">
                  Your data stays yours
                </p>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Row-level access controls. Org-isolated silos. No data sharing between programs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Co-pilot teaser strip */}
        <div className="mb-10 flex items-center gap-3 px-5 py-4 border border-zinc-800 bg-zinc-900/40">
          <Zap className="h-4 w-4 text-lime-400 shrink-0" aria-hidden="true" />
          <p className="text-zinc-400 text-xs leading-relaxed">
            <span className="text-zinc-100 font-semibold">Co-Pilot AI is included at every tier.</span>{' '}
            Signals surface before problems hit — expense anomalies, contract expiries, setup conflicts, athlete readiness flags. It acts before you ask.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
            &copy; 2026 Motorsport Data. All rights reserved.
          </p>
          <p className="font-mono text-xs text-zinc-700 uppercase tracking-widest">
            Any discipline. Any program size. One platform.
          </p>
        </div>
      </div>
    </footer>
  )
}
