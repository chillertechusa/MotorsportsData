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

/**
 * Google Search Console verification tokens.
 *
 * Search Console displays the full `<meta>` tag, so the copied value often
 * carries a `google-site-verification=` prefix (and sometimes surrounding
 * quotes). Google compares the `content` attribute to the bare token, so an
 * un-stripped prefix silently fails verification — normalize before rendering.
 */
const GOOGLE_VERIFICATION_TOKENS = Array.from(
  new Set(
    [
      '6K7QmQC0Z4g7snmlUcYu5GUfOLOhatqvKrIFtii5_2E',
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    ]
      .filter((token): token is string => Boolean(token && token.trim()))
      .map((token) =>
        token
          .trim()
          .replace(/^['"]|['"]$/g, '')
          .replace(/^google-site-verification\s*=\s*/i, '')
          .replace(/^['"]|['"]$/g, '')
          .trim(),
      )
      .filter(Boolean),
  ),
)

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Motorsports Data — Run Your Entire Racing Program',
    template: '%s | Motorsports Data',
  },
  description:
    'Contingency automation, sponsor money tracking, season P&L, rider readiness, setup history, and AI coaching on one platform. From the PW50 to the factory rig — with first-class WMX support. Plans from $9/mo.',
  keywords: [
    'motocross contingency tracking', 'racing sponsor management', 'motocross season budget',
    'race team management software', 'motocross program platform', 'WMX data platform',
    'women\u2019s motocross software', 'racing P&L', 'motocross team roster software',
    'dirt bike maintenance tracker', 'motocross setup log', 'part lifecycle tracking',
    'youth motocross', 'rider progression', 'motocross injury tracker', 'AI bike diagnosis',
  ],
  authors: [{ name: 'Motorsports Data', url: BASE_URL }],
  creator: 'Motorsports Data',
  publisher: 'Motorsports Data',
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
    title: 'Motorsports Data — Run Your Entire Racing Program',
    description:
      'Contingency money, sponsor P&L, season budget, team roles, rider readiness, and AI coaching. One platform, age 4 to Factory Rig. Plans from $9/mo.',
    type: 'website',
    url: BASE_URL,
    siteName: 'Motorsports Data',
    locale: 'en_US',
    images: [
      {
        url: `${BASE_URL}/assets/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'Motorsports Data — the racing program platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motorsports Data — Run Your Entire Racing Program',
    description:
      'Contingency automation, sponsor money, season P&L, rider readiness, and AI coaching on one platform. From the PW50 to the factory rig.',
    images: [`${BASE_URL}/assets/og-preview.png`],
  },
  // NOTE: intentionally NO `alternates.canonical` here. A canonical set in the
  // root layout is inherited by every child page that doesn't override it,
  // which told Google that every page was a duplicate of the homepage. Each
  // page now declares its own self-referencing canonical instead.
  // Search Console verification. Google allows several owners to verify the
  // same property, each with their own token, so we emit every known token
  // rather than letting one clobber another.
  //
  // The committed token guarantees the tag survives a deploy even if the env
  // var is ever unset (an unset var silently drops the tag and un-verifies the
  // property). GOOGLE_VERIFICATION_TOKENS strips any pasted
  // `google-site-verification=` prefix, because Search Console shows the whole
  // meta tag and it is easy to paste the attribute instead of just the value —
  // that prefix had made the previous tag invalid.
  //
  // Bing stays env-only since no token has been issued yet; rendering an empty
  // content="" tag is worse than omitting it.
  verification: {
    google: GOOGLE_VERIFICATION_TOKENS,
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
      : {}),
  },
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
                name: 'Motorsports Data',
                url: BASE_URL,
                logo: `${BASE_URL}/images/md-logo.png`,
                description:
                  'The racing program platform. Contingency automation, sponsor money tracking, season P&L, rider readiness, setup history, team roles, and AI coaching — from the PW50 to the factory rig.',
                sameAs: [],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Motorsports Data',
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
