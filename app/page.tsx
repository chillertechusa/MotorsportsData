import type { Metadata } from 'next'
import MdNav from '@/components/md-nav'
import MdFooter from '@/components/md-footer'
import DoctorHero from '@/components/landing/doctor-hero'
import DoctorProblem from '@/components/landing/doctor-problem'
import DoctorHow from '@/components/landing/doctor-how'
import DoctorProgram from '@/components/landing/doctor-program'
import DoctorPricing from '@/components/landing/doctor-pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'MD — Your Bike Has a Doctor | Free Rider Platform',
  description:
    'Describe what you feel on the track. The AI Doctor diagnoses your bike, rates the severity, and sends the full history to your shop. Free for every rider — bike file, body file, ride log, and family program money tools.',
  keywords: [
    'motocross bike diagnosis', 'dirt bike problems diagnosis', 'motocross maintenance app',
    'dirt bike maintenance log', 'motocross rider app', 'bike setup notebook',
    'motocross season budget', 'racing family expenses', 'dirt bike engine hours tracker',
    'motocross injury log', 'AI bike mechanic',
  ],
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'MD — Your Bike Has a Doctor',
    description:
      'AI diagnosis for your dirt bike, free forever. Symptom to shop in three steps.',
    type: 'website',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/assets/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'MD — Your Bike Has a Doctor',
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
      'The free rider platform. AI bike diagnosis, maintenance log, setup notebook, injury and readiness tracking, ride log, and family program money tools. Symptom to shop in three steps.',
    url: BASE_URL,
    applicationCategory: 'SportsApplication',
    offers: [
      {
        '@type': 'Offer',
        name: 'Rider',
        priceCurrency: 'USD',
        price: '0',
        description:
          'Free forever — AI Doctor, bike file, body file, ride log, program money tools, send to shop.',
      },
      {
        '@type': 'Offer',
        name: 'Coach Connect',
        priceCurrency: 'USD',
        price: '49',
        description:
          'See your athletes\u2019 bikes in real time. Riders invite you; they own their data.',
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
        <DoctorHero />
        <DoctorProblem />
        <DoctorHow />
        <DoctorProgram />
        <DoctorPricing />
      </main>
      <MdFooter />
    </>
  )
}
