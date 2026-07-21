import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export default function robots(): MetadataRoute.Robots {
  return {
    // NOTE: the `host` directive is Yandex-only and is flagged as a warning by
    // Google Search Console ("Rule ignored by Googlebot"). It has been removed.
    sitemap: `${BASE_URL}/sitemap.xml`,
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block ONLY auth-gated / transactional / tooling paths.
        // IMPORTANT: do NOT block `/data/` wholesale — the public marketing
        // pages /data/pricing, /data/security and /data/mechanic live under
        // /data and are in the sitemap. Blocking the whole subtree would
        // de-index them ("Blocked by robots.txt"). List private subpaths only.
        disallow: [
          '/api/',
          '/checkout/',
          '/account/',
          '/admin/',
          '/tools/',
          '/screen-recorder',
          '/data/sign-in',
          '/data/forgot-password',
          '/data/reset-password',
          '/data/checkout',
          '/data/account',
          '/data/admin',
          '/data/owner',
          '/data/fleet',
          '/data/sessions',
          '/data/live',
          '/data/analytics',
          '/data/partner',
          '/data/plans/',   // all redirect to canonical tier pages
          '/data/demo',
        ],
      },
    ],
  }
}
