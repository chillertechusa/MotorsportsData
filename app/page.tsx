import type { Metadata } from 'next'
import MdNav from '@/components/md-nav'
import MdFooter from '@/components/md-footer'
import FoundingHero from '@/components/landing/founding-hero'
import Capabilities from '@/components/landing/capabilities'
import FoundingPricing from '@/components/landing/founding-pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — The Operating System for Your Race Team',
  description:
    'Lap times, telemetry, bike data, rider health, finances, payroll, invoicing, and AI coaching — one platform built for race teams. 50 founding slots open until August 31, 2026.',
  keywords: [
    'race team management software', 'motocross team platform', 'lap time tracking',
    'bike telemetry', 'race team operations', 'dirt bike data', 'racing AI coach',
    'motocross payroll', 'sponsor ROI racing', 'race team finances', 'founding race team',
  ],
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'Motorsport Data — The Operating System for Your Race Team',
    description: '50 founding team slots. Lock your price before August 31, 2026.',
    type: 'website',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/images/md-hero-bg.png`,
        width: 1200,
        height: 630,
        alt: 'Motorsport Data — Race Team Operating System',
      },
    ],
  },
}

export default function HomePage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Motorsport Data',
    description:
      'The operating system for a racing career. Lap times, telemetry, bike data, rider health, team finances, invoicing, payroll, and AI coaching — one platform for race teams.',
    url: BASE_URL,
    applicationCategory: 'SportsApplication',
    offers: [
      {
        '@type': 'Offer',
        name: 'Privateer',
        priceCurrency: 'USD',
        price: '89',
        description: 'Solo racer plan — lap tracking, bike log, AI Rig Doctor, rider health.',
      },
      {
        '@type': 'Offer',
        name: 'Race Team',
        priceCurrency: 'USD',
        price: '399',
        description: 'Up to 8 riders — team ops, coaching AI, invoicing, payroll, P&L.',
      },
      {
        '@type': 'Offer',
        name: 'Factory Rig',
        priceCurrency: 'USD',
        price: '3999',
        description: 'Unlimited riders, custom AI, white-label, API access.',
      },
    ],
    author: {
      '@type': 'Organization',
      name: 'Motorsport Data',
      url: BASE_URL,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <MdNav />
      <main>
        <FoundingHero />
        <Capabilities />
        <FoundingPricing />
      </main>
      <MdFooter />
    </>
  )
}
