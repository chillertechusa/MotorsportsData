// @ts-check
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */

const SECURITY_HEADERS = [
  // Cross-Origin-Opener-Policy — isolate browsing context for security + performance
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // Prevent clickjacking — only allow framing from same origin
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Stop MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Strict HSTS — 1 year, apex only (no includeSubDomains to avoid www redirect loop)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  // Referrer: full URL on same-origin, origin-only on cross-origin HTTPS
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable FLoC / Topics
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // XSS auditor hint (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // CSP — allows GTM, Google Ads/Analytics, Square Web Payments SDK, Vercel Analytics,
  //        Resend tracking pixel, and self-hosted assets.
  //        'unsafe-inline' kept for Next.js inline styles and the GTM snippet injected via dangerouslySetInnerHTML.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: self, GTM, Google (Ads/Analytics), Square SDK, Vercel Analytics, Microsoft Clarity, Cloudflare Turnstile
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://web.squarecdn.com https://sandbox.web.squarecdn.com https://va.vercel-scripts.com https://www.clarity.ms https://challenges.cloudflare.com",
      // Styles: self + inline (Next.js requires unsafe-inline)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self, data URIs, Square, Google CDNs, and Google Ads conversion pixels
      "img-src 'self' data: blob: https://*.googletagmanager.com https://www.google-analytics.com https://www.google.com https://ad.doubleclick.net https://*.googleapis.com https://squareup.com https://*.squareassets.com",
      // Connect: API calls, Square, Google Analytics, Google Ads conversion tracking, Microsoft Clarity, Neon, Sentry, Cloudflare Turnstile
      "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://ad.doubleclick.net https://stats.g.doubleclick.net https://connect.squareupsandbox.com https://connect.squareup.com https://va.vercel-scripts.com https://www.clarity.ms https://*.sentry.io https://sentry.io https://challenges.cloudflare.com",
      // Frames: Square payment iframes + Cloudflare Turnstile widget
      "frame-src https://web.squarecdn.com https://sandbox.web.squarecdn.com https://squareupsandbox.com https://squareup.com https://www.googletagmanager.com https://challenges.cloudflare.com",
      // Workers (Vercel edge)
      "worker-src 'self' blob:",
    ].join('; '),
  },
]

const nextConfig = {
  // pdfkit ships font-metric (.afm) data files that the bundler drops when it
  // bundles the package. Keeping it external makes it load from node_modules at
  // runtime with its data files intact (fixes ENOENT on Helvetica.afm).
  serverExternalPackages: ['pdfkit'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // NOTE: www → apex redirect is handled by Vercel project settings (Domains tab),
      // NOT in code. Doing it here AND in Vercel settings creates an infinite loop
      // (ERR_TOO_MANY_REDIRECTS). Remove from here; keep the Vercel domain redirect active.

      // /factory was referenced in old footer but no page exists — send to pricing
      { source: '/factory', destination: '/data/pricing', permanent: true },

      // /data/plans/[tier] pages all redirect — send old /data/* URLs straight to canonical tier pages
      { source: '/data/rookie',          destination: '/rookie',       permanent: true },
      { source: '/data/privateer',       destination: '/privateer',    permanent: true },
      { source: '/data/race-team',       destination: '/race_team',    permanent: true },
      { source: '/data/factory-rig',     destination: '/factory_rig',  permanent: true },
      // /data/plans/* also redirects internally — short-circuit to canonical for Googlebot
      { source: '/data/plans/rookie',    destination: '/rookie',       permanent: true },
      { source: '/data/plans/privateer', destination: '/privateer',    permanent: true },
      { source: '/data/plans/race_team', destination: '/race_team',    permanent: true },
      { source: '/data/plans/factory_rig', destination: '/factory_rig', permanent: true },
      { source: '/data/plans/wrench',    destination: '/wrench',       permanent: true },
      { source: '/data/plans/agent',     destination: '/agent',        permanent: true },
      { source: '/data/plans/coach',     destination: '/coach',        permanent: true },

      // /data/checkout 404 — send to pricing page
      { source: '/data/checkout',        destination: '/data/pricing', permanent: true },

      // /community was in sitemap but page doesn't exist yet
      { source: '/community',            destination: '/',             permanent: false },

      // Legacy /terms and /privacy redirect to canonical /legal/* equivalents
      { source: '/terms',                destination: '/legal/terms',  permanent: true },
      { source: '/privacy',              destination: '/legal/privacy', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Your Sentry org + project slugs (set SENTRY_ORG / SENTRY_PROJECT env vars
  // or fill them in here if you prefer hardcoded values).
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps when SENTRY_AUTH_TOKEN is set (CI / Vercel builds)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Silently skip upload when Sentry isn't configured rather than failing the build
  silent: true,

  // Disable the Sentry SDK size overhead in the browser bundle during local dev
  disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableServerWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
})
