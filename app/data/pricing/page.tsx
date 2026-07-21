import type { Metadata } from 'next'
import PricingView from '@/components/data/pricing-view'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Motorsport Data — Pricing & Plans',
  description:
    'Choose your rig. From solo privateers to factory operations, Motorsport Data scales with your program. Enterprise-grade security by Chiller Tech Support LLC.',
  keywords: ['motorsport data pricing', 'racing platform plans', 'motocross data subscription', 'factory mechanic software cost'],
  alternates: { canonical: `${BASE_URL}/data/pricing` },
  openGraph: {
    title: 'Motorsport Data — Pricing & Plans',
    description: 'From solo privateers to factory operations. Choose your plan.',
    url: `${BASE_URL}/data/pricing`,
    type: 'website',
  },
}

export default function DataPricingPage() {
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Motorsport Data — Plans & Pricing',
    description: 'Racing platform plans for riders at every stage: Rookie, Privateer, Race Team, and Factory Rig.',
    url: `${BASE_URL}/data/pricing`,
    image: `${BASE_URL}/images/md-hero-bg.png`,
    brand: {
      '@type': 'Brand',
      name: 'Motorsport Data',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Rookie',
        description: 'Single rider, first bike to amateur racing',
        price: '0',
        priceCurrency: 'USD',
        url: `${BASE_URL}/data/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Privateer',
        description: 'Independent riders sponsoring themselves through racing',
        price: '79',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'InStock',
      },
      {
        '@type': 'Offer',
        name: 'Race Team',
        description: 'Regional and semi-pro teams with multiple riders and mechanics',
        price: '599',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'InStock',
      },
      {
        '@type': 'Offer',
        name: 'Factory Rig',
        description: 'Professional factory operations, unlimited riders, enterprise features',
        price: '15000',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'InStock',
        url: `${BASE_URL}/data/pricing`,
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }} />
      <PricingView />
    </>
  )
}
