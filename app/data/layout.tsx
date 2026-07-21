import type { Metadata, Viewport } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportdata.com'

export const metadata: Metadata = {
  title: {
    default: 'Motorsport Data — The Rig',
    template: '%s | Motorsport Data',
  },
  description:
    'Pit-lane data platform for professional racing mechanics. Track conditions, bike setup sheets, part-life tracking, and AI setup recall.',
  alternates: { canonical: `${BASE_URL}/data` },
  openGraph: {
    type: 'website',
    siteName: 'Motorsport Data',
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'dark',
}

export default function DataLayout({ children }: { children: React.ReactNode }) {
  // Force dark mode regardless of the device OS setting.
  // The MD platform is dark-only — a light flash mid-moto is unacceptable.
  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 antialiased"
      style={{ colorScheme: 'dark' }}
    >
      {children}
    </div>
  )
}
