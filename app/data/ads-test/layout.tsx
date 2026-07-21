import type { Metadata } from 'next'

// Internal QA tool — do not index, no static prerender
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdsTestLayout({ children }: { children: React.ReactNode }) {
  return children
}
