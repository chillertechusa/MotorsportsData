import type { Metadata } from 'next'
import MdCampaignBanner from '@/components/md-campaign-banner'
import MdNav from '@/components/md-nav'
import MdHero from '@/components/md-hero'
import MdSeasonTimeline from '@/components/md-season-timeline'
import MdOnsiteRig from '@/components/md-onsite-rig'
import MdTeamPartner from '@/components/md-team-partner'
import MdFeatures from '@/components/md-features'
import MdDemo from '@/components/md-demo'
import MdDemoDetails from '@/components/md-demo-details'

import MdFooter from '@/components/md-footer'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — SMX 2027 Elite Team Data Command Center',
  description:
    'The SMX 2027 elite team data platform. Our Command Rig deploys to every venue — live AI, embedded analyst, and full season analytics for team programs running the 2027 championship. Three programs. No individual riders.',
  keywords: [
    'smx 2027 elite team data', 'supercross 2027 team platform', 'smx command rig', 'smx championship analytics',
    'motocross team software 2027', 'supercross crew chief AI', 'smx embedded analyst', 'race team data platform',
    'smx data command center', 'factory smx data program', 'motorsport data', 'smx 2027 elite program',
    'supercross AI crew chief', 'command partner smx 2027',
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
        <MdOnsiteRig />
        <MdTeamPartner />
        <MdFeatures />
        <MdDemo />
        <MdDemoDetails />
      </main>
      <MdFooter />
    </>
  )
}
