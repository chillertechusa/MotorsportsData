import type { Metadata } from 'next'
import MdNav from '@/components/md-nav'
import MdHero from '@/components/md-hero'
import MdFeatures from '@/components/md-features'
import MdDemo from '@/components/md-demo'
import MdDemoDetails from '@/components/md-demo-details'
import MdFreeRiderHero from '@/components/md-free-rider-hero'
import MdFooter from '@/components/md-footer'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — Peak Performance Starts With Data',
  description:
    'Track your bike, log setups, read telemetry, and let Rig Doctor AI call your next move. One account grows with a rider from youth mini-bikes through Privateer, Race Team, and Factory Rig. Start free, upgrade when ready.',
  keywords: [
    'motorsport data', 'racing platform', 'motocross app', 'youth motocross tracking',
    'motocross setup logs', 'part lifecycle tracking', 'race coach AI', 'motocross video analysis',
    'bike telemetry', 'dirt bike maintenance tracker', 'supercross setup', 'rider progression',
    'womens motocross', 'WMX', 'SMX', 'factory team roles', 'crew chief', 'data analyst', 'Rig Doctor AI',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'Motorsport Data — Peak Performance Starts With Data',
    description: 'Track bike data, log setups, access AI coaching. Plans from $9/mo to factory operations.',
    type: 'website',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/images/md-hero-bg.png`,
        width: 1200,
        height: 630,
        alt: 'Motorsport Data — Peak Performance Platform',
      },
    ],
  },
}

export default function HomePage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Motorsport Data',
    description: 'Track your bike. Log setups. Coach your mind. AI-powered performance data for every rider, from youth through factory racing.',
    url: BASE_URL,
    image: `${BASE_URL}/images/md-hero-bg.png`,
    applicationCategory: 'SportsApplication',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '9',
      priceValidUntil: '2026-12-31',
      description: 'Start free forever. Plans from $9/mo (Rookie) to $2,499/mo (Factory Rig). Full feature access to all.',
      url: `${BASE_URL}/data/pricing`,
    },
    author: {
      '@type': 'Organization',
      name: 'Motorsport Data',
      url: BASE_URL,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <MdNav />
      <main>
        <MdHero />
        <MdFeatures />
        <MdDemo />
        <MdDemoDetails />
        <MdFreeRiderHero />
      </main>
      <MdFooter />
    </>
  )
}
