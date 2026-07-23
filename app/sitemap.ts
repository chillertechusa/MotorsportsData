import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const legal = new Date('2026-07-01')

  return [
    // ── Core public pages ──────────────────────────────────────────────────
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/demo`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // ── Data / SaaS platform ───────────────────────────────────────────────
    // NOTE: /data/plans/[tier] all 307 → their canonical pages below, so we list
    // the canonical pages only. /data itself is auth-protected (not indexable).
    // NOTE: /data/pricing redirects to /#team-partner — not listed separately
    // to avoid crawl budget waste on a 301. The homepage (priority 1.0) is the
    // canonical pricing destination.
    {
      url: `${BASE_URL}/data/security`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // ── SMX 2027 Elite Program pages ──────────────────────────────────────
    // Replaces all retired individual tier pages (/rookie, /privateer, etc.)
    // which have been removed from the platform. The canonical buy-now anchor
    // is /#team-partner on the homepage; the thank-you page is indexable.
    {
      url: `${BASE_URL}/smx2027/thank-you`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    // ── Mechanic / professional services ──────────────────────────────────
    {
      url: `${BASE_URL}/data/mechanic`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    // ── Demo booking ───────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/demo-booking`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // ── SEO content pages ──────────────────────────────────────────────────
    {
      url: `${BASE_URL}/motocross-setup-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dirt-bike-maintenance-schedule`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/motocross-race-day-checklist`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // ── Legal pages ────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: legal,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: legal,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal/cookies`,
      lastModified: legal,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/legal/ip`,
      lastModified: legal,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/legal/data-consent`,
      lastModified: legal,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]
}
