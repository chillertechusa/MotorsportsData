import type { Metadata } from 'next'
import MdNav from '@/components/md-nav'
import MdFooter from '@/components/md-footer'
import MdHero from '@/components/landing/md-hero'
import MdMoney from '@/components/landing/md-money'
import MdCareer from '@/components/landing/md-career'
import MdWmx from '@/components/landing/md-wmx'
import MdDoctor from '@/components/landing/md-doctor'
import MdTeam from '@/components/landing/md-team'
import MdPlatform from '@/components/landing/md-platform'
import MdPricing from '@/components/landing/md-pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'MD — Run Your Entire Racing Program | Motorsports Data',
  description:
    'Contingency automation, sponsor money tracking, season P&L, rider readiness, setup history, and AI coaching on one platform. From the PW50 to the factory rig — including first-class WMX support.',
  keywords: [
    'motocross contingency tracking', 'racing sponsor management', 'motocross season budget',
    'race team management software', 'motocross program platform', 'WMX data platform',
    'women\u2019s motocross software', 'racing P&L', 'motocross team roster software',
    'dirt bike maintenance log', 'AI bike diagnosis',
  ],
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'MD — Run Your Entire Racing Program',
    description:
      'Contingency money, sponsor P&L, season budget, team roles, and AI coaching. One platform, age 4 to Factory Rig.',
    type: 'website',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/assets/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'MD — Run Your Entire Racing Program',
      },
    ],
  },
}

export default function HomePage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MD — Motorsports Data',
    description:
      'The racing program platform. Contingency automation, sponsor money tracking, season P&L, rider readiness, setup history, team roles, and AI coaching — from the PW50 to the factory rig, with first-class WMX support.',
    url: BASE_URL,
    applicationCategory: 'SportsApplication',
    offers: [
      {
        '@type': 'Offer',
        name: 'Rookie',
        priceCurrency: 'USD',
        price: '9',
        description:
          'Ages 4–12. Season budget, schedule, injury and return-to-ride tracking, AI Doctor.',
      },
      {
        '@type': 'Offer',
        name: 'Privateer',
        priceCurrency: 'USD',
        price: '49',
        description:
          'Contingency automation, season P&L, sponsor dashboard, AI Doctor, one coach seat.',
      },
      {
        '@type': 'Offer',
        name: 'Race Team',
        priceCurrency: 'USD',
        price: '299',
        description:
          'Up to 8 riders, 11 team roles with scoped access, team budget and travel planning.',
      },
      {
        '@type': 'Offer',
        name: 'Factory Rig',
        priceCurrency: 'USD',
        price: '2499',
        description:
          'Unlimited riders and staff, full season logistics, dedicated analyst tooling.',
      },
    ],
    author: {
      '@type': 'Organization',
      name: 'Motorsports Data',
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
        <MdHero />
        <MdMoney />
        <MdCareer />
        <MdWmx />
        <MdDoctor />
        <MdTeam />
        <MdPlatform />
        <MdPricing />
      </main>
      <MdFooter />
    </>
  )
}
