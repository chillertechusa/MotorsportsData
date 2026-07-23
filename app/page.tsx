import type { Metadata } from 'next'
import MdCampaignBanner from '@/components/md-campaign-banner'
import MdNav from '@/components/md-nav'
import MdHero from '@/components/md-hero'
import MdSeasonTimeline from '@/components/md-season-timeline'
import MdTeamPartner from '@/components/md-team-partner'
import MdFeatures from '@/components/md-features'
import MdDemo from '@/components/md-demo'
import MdDemoDetails from '@/components/md-demo-details'
import MdFreeRiderHero from '@/components/md-free-rider-hero'
import MdFooter from '@/components/md-footer'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — SMX 2027 Data Command Center',
  description:
    'AI-powered race data platform for the SMX 2027 Championship. Setup coaching, live AI support, and team analytics for every round — from Anaheim to Las Vegas. Team partnerships now open.',
  keywords: [
    'smx 2027', 'supercross 2027 data', 'smx championship analytics', 'motocross team software 2027',
    'supercross team data platform', 'race crew chief AI', 'motocross setup logs', 'bike telemetry',
    'smx data command center', 'motorsport data', 'racing platform', 'privateer smx', 'factory team data',
    'Rig Doctor AI', 'supercross AI coach', 'smx team partnership',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'OG_MotorsportsData',
    description:
      'Comprehensive power sports and racing analytics platform engineered for speed and regional scalability.',
    type: 'website',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/assets/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'Motorsport Data — SMX 2027 Data Command Center',
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
      <MdCampaignBanner />
      <MdNav />
      <main>
        <MdHero />
        <MdSeasonTimeline />
        <MdTeamPartner />
        <MdFeatures />
        <MdDemo />
        <MdDemoDetails />
        <MdFreeRiderHero />
      </main>
      <MdFooter />
    </>
  )
}
