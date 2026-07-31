import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Help Center — Troubleshooting, Setup & Maintenance Guides',
  description:
    'Motorsports Data help center: contingency claim walkthroughs, dirt bike troubleshooting, setup by model, maintenance schedules (5hr/20hr/50hr), team onboarding, and coaching tools.',
  alternates: {
    canonical: `${BASE_URL}/help`,
  },
}

export default function HelpLayout({ children }: { children: ReactNode }) {
  return children
}
