import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Help Center — Troubleshooting, Setup & Maintenance Guides',
  description:
    'Bike Doctor help center: dirt bike troubleshooting guides, setup by model, maintenance schedules (5hr/20hr/50hr), coaching tools, and pro tips for motocross riders.',
  alternates: {
    canonical: `${BASE_URL}/help`,
  },
}

export default function HelpLayout({ children }: { children: ReactNode }) {
  return children
}
