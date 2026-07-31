'use client'

import Link from 'next/link'
import DemoButton from '@/components/demo-button'

export default function DoctorPricing() {
  return (
    <section id="pricing" className="border-t border-ink-line bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="md-label shrink-0 text-lime">04 // Pricing</span>
          <span aria-hidden="true" className="h-px flex-1 bg-ink-line" />
        </div>
        <h2 className="mt-5 max-w-2xl text-balance text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
          MD pays for itself or it&apos;s free.
        </h2>
        <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-zinc-400">
          The app is free forever. Pro exists for one reason: it collects the money we
          find you. If we find you less than $99 a season, don&apos;t buy it.
        </p>

        <div className="mt-12 grid gap-px border border-ink-line bg-ink-line md:grid-cols-2 lg:grid-cols-4">
          {/* Rider — free */}
          <div className="flex flex-col gap-6 bg-ink p-8">
            <div>
              <div className="md-label text-lime">Rider</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-black text-white">$0</span>
                <span className="text-sm text-zinc-500">forever</span>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>AI Doctor diagnosis, unlimited</li>
              <li>Bike file — hours, service alerts, setups</li>
              <li>Body file — injuries, readiness, wearable sync</li>
              <li>Ride log with lap times and progress</li>
              <li>Season budget + expense tracking</li>
              <li>Send to Shop, pre-filled</li>
              <li>Contingency money found — total shown</li>
              <li>Guardian accounts for riders under 18</li>
            </ul>
            <DemoButton label="Try the live demo" size="md" role="coach" />
          </div>

          {/* Rider Pro */}
          <div className="relative flex flex-col gap-6 bg-ink-raised p-8 outline outline-1 -outline-offset-1 outline-lime">
            <div className="absolute right-4 top-4 bg-lime px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
              Collects the money
            </div>
            <div>
              <div className="md-label text-lime">Rider Pro</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-black text-white">$99</span>
                <span className="text-sm text-zinc-500">/yr</span>
              </div>
              <div className="mt-1 font-mono text-xs text-zinc-600">or $12/mo</div>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>Everything in Rider, plus:</li>
              <li className="text-zinc-200">Contingency claims unlocked — deadlines + pre-filled filings</li>
              <li className="text-zinc-200">Sponsor invoicing — collect what you&apos;re owed</li>
              <li className="text-zinc-200">QuickBooks export, one tap</li>
              <li className="text-zinc-200">Season money report — what MD found you</li>
            </ul>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center bg-lime px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-lime-bright"
            >
              Get Pro
            </Link>
          </div>

          {/* Coach Connect */}
          <div className="flex flex-col gap-6 bg-ink p-8">
            <div>
              <div className="md-label text-zinc-400">Coach Connect</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-black text-white">$49</span>
                <span className="text-sm text-zinc-500">/mo</span>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>See your athletes&apos; bikes in real time</li>
              <li>Setup notes, session logs, maintenance history</li>
              <li>Private coach notes per athlete</li>
              <li>Riders invite you — they own their data</li>
              <li>Up to 10 connected athletes ($99 unlimited)</li>
            </ul>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center border border-zinc-700 px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-lime hover:text-lime"
            >
              Get started
            </Link>
          </div>

          {/* Shop / Team / Brand — gate */}
          <div className="flex flex-col gap-6 bg-ink p-8">
            <div>
              <div className="md-label text-zinc-400">Shops, Teams &amp; Brands</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-white">MD-approved</span>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>Shops: pre-filled work orders via Clutch DMS</li>
              <li>Teams &amp; scouts: trajectory data on opted-in riders</li>
              <li>Brands: sponsorship targeting + deal rails — fee paid by the brand, never the rider</li>
              <li>No export. No API. No scraping. Audit-logged.</li>
              <li>Every account manually approved</li>
            </ul>
            <span className="inline-flex items-center justify-center border border-ink-line px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-600">
              Waitlist opening soon
            </span>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-zinc-500">
          The rule: the rider owns their file. Discovery is opt-in, off by default, and
          guardian-controlled for minors. When a rider turns pro, their file locks automatically
          &mdash; teams pay riders, so teams don&apos;t get their data for free either. When a brand
          deal flows through MD, the platform fee comes from the brand&apos;s side. The rider sees
          the full number, always.
        </p>
      </div>
    </section>
  )
}
