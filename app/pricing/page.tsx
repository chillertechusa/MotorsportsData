import type { Metadata } from 'next'
import Link from 'next/link'
import MdFooter from '@/components/md-footer'
import MdPricing from '@/components/landing/md-pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Pricing — Plans from $9/mo',
  description:
    'Transparent pricing for every level of racing. Rookie $9/mo, Privateer $49/mo, Race Team $299/mo, Factory Rig $2,499/mo — contingency automation, sponsor P&L, season budget, and AI coaching included.',
  keywords: [
    'motocross software pricing', 'race team software cost', 'motocross platform plans',
    'contingency tracking pricing', 'racing program software price',
  ],
  alternates: { canonical: `${BASE_URL}/pricing` },
  openGraph: {
    title: 'Motorsports Data Pricing — Plans from $9/mo',
    description:
      'Rookie to Factory Rig. Contingency automation, sponsor money tracking, season P&L, and AI coaching on one platform.',
    url: `${BASE_URL}/pricing`,
    type: 'website',
    images: [`${BASE_URL}/assets/og-preview.png`],
  },
}

/* Kept in sync with the tier landing pages. Answers are also rendered on the
   page below, which is required for FAQPage rich-result eligibility. */
const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel at any time from your account settings. No penalties and no questions asked.',
  },
  {
    q: 'Is my data exported or sold?',
    a: 'Never. Your rider data is yours. We do not export, sell, or share your information with third parties.',
  },
  {
    q: 'Can I upgrade or downgrade between tiers?',
    a: 'Yes. You can change plans at any time and charges are prorated, so moving from Privateer to Race Team mid-season is straightforward.',
  },
  {
    q: 'Does the platform pay for itself?',
    a: 'Most privateers leave roughly $2,800 in contingency unclaimed every season. Privateer costs $588 a year, so recovering a single season of contingency more than covers it.',
  },
  {
    q: 'Which plan should a family with one young rider pick?',
    a: 'Rookie at $9/mo is built for ages 4 to 12. It covers season budget, schedule, injury and return-to-ride tracking, and the AI Doctor.',
  },
]

export default function PricingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="bg-[#0A0A0A]">
        {/* Page header — the tier grid itself is the shared MdPricing component,
            so prices here can never drift from the homepage again. */}
        <section className="border-b border-zinc-800 px-6 pb-16 pt-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-lime">
              Pricing
            </span>
            <h1 className="mt-5 max-w-4xl font-sans text-[clamp(2.5rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white text-balance">
              One platform.<br />
              Every <em className="not-italic text-lime">level</em>.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
              From a first PW50 season to a full factory rig. Every plan includes the AI
              Doctor, the bike file, and the money tools &mdash; the tiers add riders, roles,
              and season logistics.
            </p>
          </div>
        </section>

        <MdPricing />

        {/* Tier deep links — real crawlable internal links to each tier page */}
        <section className="border-t border-zinc-800 px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-sans text-[clamp(1.75rem,4vw,3rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
              Compare the tiers
            </h2>
            <div className="mt-10 grid gap-px bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: 'Rookie', price: '$9/mo', who: 'Ages 4–12', href: '/rookie' },
                { name: 'Privateer', price: '$49/mo', who: 'Semi-pro and club', href: '/privateer' },
                { name: 'Race Team', price: '$299/mo', who: 'Up to 8 riders', href: '/race_team' },
                { name: 'Factory Rig', price: '$2,499/mo', who: 'Full factory squad', href: '/factory_rig' },
              ].map((t) => (
                <Link
                  key={t.name}
                  href={t.href}
                  className="group flex flex-col gap-2 bg-[#0A0A0A] p-8 transition-colors hover:bg-[#111111]"
                >
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-lime">
                    {t.name}
                  </span>
                  <span className="font-sans text-3xl font-black tracking-tight text-white">
                    {t.price}
                  </span>
                  <span className="text-sm text-zinc-500">{t.who}</span>
                  <span className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500 transition-colors group-hover:text-lime">
                    View plan &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — visible copy backing the FAQPage structured data above */}
        <section className="border-t border-zinc-800 px-6 py-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-sans text-[clamp(1.75rem,4vw,3rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
              Common questions
            </h2>
            <dl className="mt-10 divide-y divide-zinc-800 border-y border-zinc-800">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="py-6">
                  <dt className="text-base font-black uppercase tracking-tight text-white">
                    {q}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-zinc-400">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <MdFooter />
    </>
  )
}
