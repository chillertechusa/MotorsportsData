import type { Metadata } from 'next'
import MdCampaignBanner from '@/components/md-campaign-banner'
import MdNav from '@/components/md-nav'
import MdHero from '@/components/md-hero'
import MdModuleGrid from '@/components/md-module-grid'
import MdConsoleShowcase from '@/components/md-console-showcase'
import MdModuleShowcase from '@/components/md-module-showcase'
import MdCoPilot from '@/components/md-co-pilot'
import MdAgentHype from '@/components/md-agent-hype'
import MdTeamPartner from '@/components/md-team-partner'
import MdFooter from '@/components/md-footer'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — Run Your Racing Program Like a Business',
  description:
    'The racing management system for every program size and every discipline. Deals, accounting, sponsor CRM, service desk, logistics, athlete readiness, and AI co-pilot — from the family pit to the factory rig. MX, NASCAR, karting, drag, off-road.',
  keywords: [
    'racing management system', 'motorsport business software', 'race team accounting',
    'sponsor CRM racing', 'motocross team management', 'NASCAR team software',
    'karting management', 'race team logistics', 'motorsport AI co-pilot',
    'drag racing management', 'off-road team platform', 'motorsport data',
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
      'The racing management system for every discipline and program size. Deals, accounting, sponsor CRM, service desk, logistics, AI co-pilot. MX, NASCAR, karting, drag, off-road.',
    url: BASE_URL,
    image: `${BASE_URL}/assets/og-preview.png`,
    applicationCategory: 'BusinessApplication',
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

        {/* 2. Breadth — all 14 modules at a glance */}
        <MdModuleGrid />

        {/* 3. Role identity — 6 consoles, lenses, hierarchy, gates */}
        <MdConsoleShowcase />

        {/* 4. Depth — every module with real feature bullets, tier gates, co-pilot badges */}
        <MdModuleShowcase />

        {/* 5. Forward intelligence — co-pilot acts before you ask */}
        <MdCoPilot />

        {/* 6. 2028 fuel — agent marketplace */}
        <MdAgentHype />

        {/* 7. Conversion — 4 tiers */}
        <MdTeamPartner />
      </main>
      <MdFooter />
    </>
  )
}
