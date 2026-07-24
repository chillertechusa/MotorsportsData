import type { Metadata } from 'next'
import MdCampaignBanner from '@/components/md-campaign-banner'
import MdNav from '@/components/md-nav'
import MdHero from '@/components/md-hero'
import MdModuleGrid from '@/components/md-module-grid'
import MdFeatures from '@/components/md-features'
import MdDemo from '@/components/md-demo'
import MdDemoDetails from '@/components/md-demo-details'
import MdAgentHype from '@/components/md-agent-hype'
import MdTeamPartner from '@/components/md-team-partner'
import MdFooter from '@/components/md-footer'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — Run Your Entire Racing Program. Like a Business.',
  description:
    'The full racing management system. 14 modules covering every role and every dollar — Deals, Accounting, Logistics, Service Desk, Crew Chief AI, Sponsor CRM, Fleet, Warranty, and more. From the $49/mo family program to the $18K/mo factory rig.',
  keywords: [
    'racing management system', 'motocross team management software', 'supercross business platform',
    'race team accounting software', 'motocross deals contracts invoicing', 'rig doctor AI hauler',
    'crew chief AI supercross', 'motocross sponsor CRM', 'race team operations software',
    'smx 2027 team platform', 'factory motocross data platform', 'motorsport data',
    'racing logistics software', 'motocross work orders', 'supercross team dashboard',
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'Motorsport Data — Run Your Entire Racing Program. Like a Business.',
    description:
      '14 modules. Every role. Every dollar. The operating system for a racing business — from the family pit to the factory rig.',
    type: 'website',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/assets/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'Motorsport Data — Racing Management System',
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
      'The full racing management system. 14 modules covering every role and every dollar — from the $49/mo family program to the $18K/mo factory rig.',
    url: BASE_URL,
    image: `${BASE_URL}/assets/og-preview.png`,
    applicationCategory: 'SportsApplication',
    offers: [
      {
        '@type': 'Offer',
        name: 'Grassroots',
        priceCurrency: 'USD',
        price: '49',
        description: 'Grassroots — $49/mo. Fleet (2 bikes), expense tracker, race calendar, maintenance log, injury log.',
        url: `${BASE_URL}/#pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Privateer',
        priceCurrency: 'USD',
        price: '199',
        description: 'Privateer — $199/mo. AI coach, setup sheets, sponsor CRM, Finance & Insurance.',
        url: `${BASE_URL}/#pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Race Team',
        priceCurrency: 'USD',
        price: '599',
        description: 'Race Team — $599/mo. Deals module, Accounting P&L, Service Desk, Team Command, Logistics.',
        url: `${BASE_URL}/#pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Factory Command',
        priceCurrency: 'USD',
        price: '18000',
        description: 'Factory Command — $18K/mo. Embedded analyst, Command Rig onsite, private infrastructure, all modules.',
        url: `${BASE_URL}/#pricing`,
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
      <MdCampaignBanner />
      <MdNav />
      <main>
        {/* 1. Hero — "Run your entire racing program. Like a business." */}
        <MdHero />

        {/* 2. Module Grid — 14 modules, ClutchDMS style */}
        <MdModuleGrid />

        {/* 3. Features — role-by-role deep dive */}
        <MdFeatures />

        {/* 4. Demo — 5-role E2E walkthrough */}
        <MdDemo />
        <MdDemoDetails />

        {/* 5. Agent Hype — 2028 marketplace, email capture */}
        <MdAgentHype />

        {/* 6. Pricing — 4 tiers */}
        <MdTeamPartner />
      </main>
      <MdFooter />
    </>
  )
}
