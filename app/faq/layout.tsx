import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'FAQ — Bike Diagnostics, Coaching & Guardian Accounts',
  description:
    'Answers to common Bike Doctor questions: how AI bike diagnostics work, coach read-only access, shop work orders, guardian accounts for young riders, and data privacy.',
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
}

export default function FaqLayout({ children }: { children: ReactNode }) {
  return children
}
