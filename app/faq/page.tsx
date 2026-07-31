import type { Metadata } from 'next'
import Link from 'next/link'
import MdFooter from '@/components/md-footer'
import { FAQ_CATEGORIES, FAQ_ITEMS } from './faq-data'
import FaqClient from './faq-client'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'FAQ — Contingency, Pricing, Teams & Data Ownership',
  description:
    'Answers about contingency automation, sponsor tracking, season P&L, WMX support, team roles, the AI Doctor, pricing from $9/mo, and who owns your racing data.',
  alternates: { canonical: `${BASE_URL}/faq` },
  openGraph: {
    title: 'Motorsports Data FAQ',
    description:
      'How contingency claims, sponsor money, team roles, WMX support, and pricing work on Motorsports Data.',
    url: `${BASE_URL}/faq`,
    type: 'website',
  },
}

export default function FaqPage() {
  /* FAQPage structured data is built from the same source as the visible
     answers, so rich results can never drift from the rendered copy. */
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${BASE_URL}/faq` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-background">
        <section className="border-b border-border px-6 py-20 sm:px-10 md:py-24 lg:px-16">
          {/* max-w-3xl matches the accordion container below so the hero copy
              and the question list share the same left edge. */}
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <li>
                  <Link href="/" className="transition-colors hover:text-lime">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-foreground">FAQ</li>
              </ol>
            </nav>

            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-lime">
              Questions
            </p>
            <h1 className="mt-5 max-w-4xl font-sans text-[clamp(2.25rem,6vw,4.5rem)] font-black uppercase leading-[0.92] tracking-tight text-foreground">
              Everything you&apos;re<br />
              about to <em className="not-italic text-lime">ask</em>.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Contingency money, sponsor tracking, team roles, WMX, pricing, and who owns your
              data. If something is still unclear, we answer email in about a day.
            </p>
          </div>
        </section>

        <FaqClient categories={FAQ_CATEGORIES} />

        <section className="border-t border-border px-6 py-20 sm:px-10 md:py-24 lg:px-16">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
                Still have a question?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Email us and a human who actually races will answer &mdash; usually within one
                business day.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:support@motorsportsdata.io"
                className="inline-flex items-center justify-center bg-lime px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-black transition-opacity hover:opacity-90"
              >
                Email support
              </a>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center border border-border px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:border-lime hover:text-lime"
              >
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MdFooter />
    </>
  )
}
