import type { Metadata } from 'next'
import MdNav from '@/components/md-nav'
import MdFooter from '@/components/md-footer'
import FoundingHero from '@/components/landing/founding-hero'
import Capabilities from '@/components/landing/capabilities'
import MultiSportDemo from '@/components/landing/multi-sport-demo'
import FoundingPricing from '@/components/landing/founding-pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — One Platform for Every Racing Program',
  description:
    'The operating system for riders, race teams, and professional coaches across motocross, NASCAR, drag racing, rally, karting, and more. Performance data, race-day operations, and business in one platform.',
  keywords: [
    'motorsport management software', 'race team management software', 'motorsport coaching platform',
    'motocross telemetry', 'NASCAR team software', 'drag racing data', 'rally analytics',
    'karting data', 'race team operations', 'coaching business software', 'racing AI coach',
  ],
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'Motorsport Data — One Platform. Every Racing Program.',
    description: 'For riders, race teams, and professional coaches across every discipline.',
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
        name: 'Coach Pro',
        priceCurrency: 'USD',
        price: '499',
        description: 'Professional coaching business OS — athletes, plans, scheduling, invoicing, and AI.',
      },
      {
        '@type': 'Offer',
        name: 'Academy',
        priceCurrency: 'USD',
        price: '2499',
        description: 'Elite multi-coach academy and performance-facility operations.',
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
        <MultiSportDemo />
        <Capabilities />
        <FoundingPricing />
      </main>
      <MdFooter />
    </>
  )
}
