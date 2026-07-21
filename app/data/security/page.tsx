import SecurityView from '@/components/data/security-view'
import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Security & Trust | Motorsport Data',
  description:
    'The Zero-Leak Guarantee. How Motorsport Data protects your proprietary suspension settings, ECU maps, and race intelligence with enterprise-grade, database-level security.',
  keywords: ['motorsport data security', 'racing platform security', 'motocross data protection', 'zero-leak guarantee'],
  alternates: { canonical: `${BASE_URL}/data/security` },
  openGraph: {
    title: 'Security & Trust | Motorsport Data',
    description: 'The Zero-Leak Guarantee. Enterprise-grade protection for your race intelligence.',
    url: `${BASE_URL}/data/security`,
    type: 'website',
  },
}

export default function SecurityPage() {
  return <SecurityView />
}
