import type { Metadata } from 'next'
import MdCampaignBanner from '@/components/md-campaign-banner'
import MdNav from '@/components/md-nav'
import MdHero from '@/components/md-hero'
import MdRoleStrip from '@/components/md-role-strip'
import MdSeasonTimeline from '@/components/md-season-timeline'
import MdOnsiteRig from '@/components/md-onsite-rig'
import MdTeamPartner from '@/components/md-team-partner'
import MdFeatures from '@/components/md-features'
import MdDemo from '@/components/md-demo'
import MdDemoDetails from '@/components/md-demo-details'

import MdFooter from '@/components/md-footer'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — SMX 2027 Racing Management System',
  description:
    'The SMX 2027 Racing Management System. A console for every role — hauler driver, mechanic, crew chief, team manager, and data analyst. Live AI, embedded analyst, and full season operations for team programs running the 2027 championship.',
  keywords: [
    'smx 2027 racing management system', 'supercross team management platform', 'motocross racing management software',
    'smx crew chief AI', 'motocross mechanic work order software', 'hauler driver race team app',
    'smx 2027 team platform', 'supercross data analyst console', 'race team operations software 2027',
    'smx command rig', 'factory smx data program', 'motorsport data', 'smx 2027 elite program',
    'supercross team manager dashboard', 'motocross championship analytics',
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
    description: 'The SMX 2027 Racing Management System. A purpose-built console for every role on the team — hauler driver, mechanic, crew chief, team manager, and data analyst. Live AI, embedded analyst, and full-season operations across all 17 rounds.',
    url: BASE_URL,
    image: `${BASE_URL}/assets/og-preview.png`,
    applicationCategory: 'SportsApplication',
    offers: [
      {
        '@type': 'Offer',
        name: 'Team Partner',
        priceCurrency: 'USD',
        price: '42500',
        description: 'Team Partner — SMX 2027 full season program. $2,500/mo, 17-round coverage.',
        url: `${BASE_URL}/#team-partner`,
      },
      {
        '@type': 'Offer',
        name: 'Command Partner',
        priceCurrency: 'USD',
        price: '127500',
        description: 'Command Partner — SMX 2027 full season with embedded analyst and rig desk at every venue.',
        url: `${BASE_URL}/#team-partner`,
      },
      {
        '@type': 'Offer',
        name: 'Factory Command',
        priceCurrency: 'USD',
        price: '306000',
        description: 'Factory Command — manufacturer-backed program with private data infrastructure.',
        url: `${BASE_URL}/#team-partner`,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <MdCampaignBanner />
      <MdNav />
      <main>
        <MdHero />
        <MdRoleStrip />
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
