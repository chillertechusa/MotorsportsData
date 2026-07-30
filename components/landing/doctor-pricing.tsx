'use client'

import Link from 'next/link'
import DemoButton from '@/components/demo-button'

export default function DoctorPricing() {
  return (
    <section id="pricing" className="border-t border-zinc-800 bg-zinc-950 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
          04 // Pricing
        </span>
        <h2 className="mt-4 max-w-2xl text-balance text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
          Riders never pay. The people who profit from riders do.
        </h2>

        <div className="mt-12 grid gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {/* Rider — free */}
          <div className="flex flex-col gap-6 bg-zinc-950 p-8">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-green-500">Rider</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-black text-white">$0</span>
                <span className="text-sm text-zinc-500">forever</span>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>AI Doctor diagnosis, unlimited</li>
              <li>Bike file — hours, service alerts, setup notebook</li>
              <li>Body file — injuries, readiness, return-to-ride</li>
              <li>Ride log with lap times and progress</li>
              <li>Program money tools + QuickBooks export</li>
              <li>Send to Shop, pre-filled</li>
              <li>Guardian accounts for riders under 18</li>
            </ul>
            <DemoButton label="Try the live demo" size="md" role="coach" />
          </div>

          {/* Coach Connect */}
          <div className="flex flex-col gap-6 bg-zinc-950 p-8">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-zinc-400">Coach Connect</div>
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
              className="inline-flex items-center justify-center border border-zinc-700 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-green-500 hover:text-green-500"
            >
              Get started
            </Link>
          </div>

          {/* Shop / Team — coming */}
          <div className="flex flex-col gap-6 bg-zinc-950 p-8">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-zinc-400">Shops &amp; Teams</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-white">MD-approved</span>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>Shops: receive pre-filled work orders (via Clutch DMS)</li>
              <li>Teams &amp; scouts: development trajectory data on opted-in riders</li>
              <li>No export. No API. No scraping. Audit-logged.</li>
              <li>Every account manually approved</li>
            </ul>
            <span className="inline-flex items-center justify-center border border-zinc-800 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-zinc-600">
              Waitlist opening soon
            </span>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-zinc-500">
          The rule: the rider owns their file. Discovery is opt-in, off by default, and
          guardian-controlled for minors. When a rider turns pro, their file locks automatically
          &mdash; teams pay riders, so teams don&apos;t get their data for free either.
        </p>
      </div>
    </section>
  )
}
