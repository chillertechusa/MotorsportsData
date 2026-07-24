import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Barlow, Barlow_Condensed, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { CartProvider } from '@/lib/cart-context'
import CartDrawer from '@/components/store/cart-drawer'
import { Toaster } from 'sonner'

import { ServiceWorkerInit } from '@/components/service-worker-init'
import MdNav from '@/components/md-nav'
import LaunchCountdownBanner from '@/components/launch-countdown-banner'
import './globals.css'

const GTM_ID = 'GTM-M3VJNV6L'
const GA4_ID = 'G-BMKR7LRFJR'
const CLARITY_ID = 'xjwgur186s'

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://motorsportsdata.io'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Motorsport Data — From First Throttle to Factory Ride',
    template: '%s | Motorsport Data',
  },
  description:
    'The operating system for a racing career. Track the bike, log every setup, coach the rider, and let AI tell you if you\u2019re race-ready \u2014 from the mini-bike in the driveway to the factory rig. Plans from $9/mo.',
  keywords: [
    'motorsport data', 'motocross app', 'dirt bike maintenance tracker', 'racing platform',
    'race coach AI', 'motocross setup log', 'part lifecycle tracking', 'youth motocross',
    'supercross data', 'video analysis motocross', 'rider progression', 'factory mechanic software',
    'MD Intel', 'MXGP', 'AMA Pro MX', 'motocross injury tracker',
  ],
  authors: [{ name: 'Motorsport Data', url: BASE_URL }],
  creator: 'Motorsport Data',
  publisher: 'Motorsport Data',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'OG_MotorsportsData',
    description:
      'Comprehensive power sports and racing analytics platform engineered for speed and regional scalability.',
    type: 'website',
    url: BASE_URL,
    siteName: 'Motorsport Data',
    locale: 'en_US',
    images: [
      {
        url: `${BASE_URL}/assets/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'Motorsport Data — Comprehensive power sports and racing analytics platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OG_MotorsportsData',
    description:
      'Comprehensive power sports and racing analytics platform engineered for speed and regional scalability.',
    images: [`${BASE_URL}/assets/og-preview.png`],
  },
  // NOTE: intentionally NO `alternates.canonical` here. A canonical set in the
  // root layout is inherited by every child page that doesn't override it,
  // which told Google that every page was a duplicate of the homepage. Each
  // page now declares its own self-referencing canonical instead.
  // Only emit verification meta tags when the env vars are actually set —
  // rendering empty content="" tags is worse than omitting them.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
    ? {
        verification: {
          ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
            ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
            : {}),
          ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
            ? { other: { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : {}),
  icons: {
    icon: [
      { url: '/icon-md.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-md.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-md.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/icon-md.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  // Cover the notch/safe areas when saved to an iPad/iPhone home screen (PWA)
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} bg-background`}
    >
      <head>
        {/* Google Tag Manager — fires immediately before page renders for early event capture */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />

        {/* Google Analytics 4 (gtag.js) — direct GA4 tag so data collection is active */}
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        />
        <Script
          id="ga4-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Service Worker for PWA offline support */}
        <ServiceWorkerInit />

        {/* Google Tag Manager (noscript) — fallback for users with JS disabled */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Microsoft Clarity — Bing heatmapping and session recording */}
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`,
          }}
        />

        {/* JSON-LD — Organization + WebSite structured data for Google/Bing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Motorsport Data',
                url: BASE_URL,
                logo: `${BASE_URL}/images/md-logo.png`,
                description:
                  'The operating system for a racing career. AI-powered platform tracking bike, setup, body, and mind from youth to factory level.',
                sameAs: [],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Motorsport Data',
                url: BASE_URL,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
            ]),
          }}
        />
        <CartProvider>
          {/* Launch countdown — renders above the fixed nav, dismissible */}
          <LaunchCountdownBanner />
          {/* Fixed navigation — inside CartProvider so CartButton can access cart context */}
          <MdNav />
          <div className="pt-14">
            {children}
          </div>
          <CartDrawer />
        </CartProvider>
        <Toaster richColors position="top-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
