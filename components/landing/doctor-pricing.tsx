'use client'

import Link from 'next/link'
import DemoButton from '@/components/demo-button'

export default function DoctorPricing() {
  return (
    <section id="pricing" className="bg-[#0A0A0A] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">

        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              MD pays for itself<br />
              <span className="text-[#A0C050]">or it&apos;s free.</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              The app is free forever. Pro exists for one reason: it collects the money we find
              you. If we find you less than $99 a season, don&apos;t buy it.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            04 / Pricing
          </span>
        </div>

        <div className="grid gap-px bg-zinc-800 md:grid-cols-2 lg:grid-cols-4">

          {/* Rider — free */}
          <div className="flex flex-col gap-6 bg-[#0A0A0A] p-8">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0C050]">Rider</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-black text-white">$0</span>
                <span className="text-sm text-zinc-500">forever</span>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2.5 text-sm leading-relaxed text-zinc-500">
              <li>AI Doctor diagnosis, unlimited</li>
              <li>Bike file — hours, service, setups</li>
              <li>Body file — injuries, readiness</li>
              <li>Ride log with lap times</li>
              <li>Season budget + expenses</li>
              <li>Send to Shop, pre-filled</li>
              <li>Guardian accounts for minors</li>
            </ul>
            <DemoButton label="Try the live demo" size="md" role="coach" />
          </div>

          {/* Rider Pro */}
          <div className="relative flex flex-col gap-6 bg-[#111111] p-8 outline outline-1 -outline-offset-1 outline-[#A0C050]">
            <div className="absolute right-0 top-0 bg-[#A0C050] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black">
              Collects the money
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0C050]">Rider Pro</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-black text-white">$99</span>
                <span className="text-sm text-zinc-500">/yr</span>
              </div>
              <p className="mt-1 font-mono text-xs text-zinc-600">or $12/mo</p>
            </div>
            <ul className="flex flex-1 flex-col gap-2.5 text-sm leading-relaxed text-zinc-400">
              <li>Everything in Rider, plus:</li>
              <li className="text-zinc-200">Contingency claims unlocked</li>
              <li className="text-zinc-200">Sponsor invoicing</li>
              <li className="text-zinc-200">QuickBooks export</li>
              <li className="text-zinc-200">Season money report</li>
            </ul>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center bg-[#A0C050] px-6 py-3.5 font-mono text-sm font-black uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-90"
            >
              Get Pro
            </Link>
          </div>

          {/* Coach Connect */}
          <div className="flex flex-col gap-6 bg-[#0A0A0A] p-8">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Coach Connect</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-5xl font-black text-white">$49</span>
                <span className="text-sm text-zinc-500">/mo</span>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2.5 text-sm leading-relaxed text-zinc-500">
              <li>See your athletes&apos; bikes in real time</li>
              <li>Setup notes, session logs, history</li>
              <li>Private coach notes per athlete</li>
              <li>Riders invite you — they own their data</li>
              <li>Up to 10 athletes ($99 unlimited)</li>
            </ul>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center border border-zinc-700 px-6 py-3.5 font-mono text-sm font-black uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-[#A0C050] hover:text-[#A0C050]"
            >
              Get started
            </Link>
          </div>

          {/* Shops / Teams / Brands */}
          <div className="flex flex-col gap-6 bg-[#0A0A0A] p-8">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Shops, Teams &amp; Brands</p>
              <div className="mt-3">
                <span className="font-mono text-2xl font-black text-white">MD-approved</span>
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2.5 text-sm leading-relaxed text-zinc-500">
              <li>Pre-filled work orders via Clutch DMS</li>
              <li>Teams: trajectory data on opted-in riders</li>
              <li>Brands: sponsorship targeting + deal rails</li>
              <li>No export. No API. Audit-logged.</li>
              <li>Every account manually approved</li>
            </ul>
            <span className="inline-flex items-center justify-center border border-zinc-800 px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-700">
              Waitlist opening soon
            </span>
          </div>

        </div>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-zinc-600">
          The rider owns their file. Discovery is opt-in, off by default, and guardian-controlled
          for minors. When a rider turns pro, their file locks automatically. When a brand deal
          flows through MD, the fee comes from the brand&apos;s side. The rider sees the full
          number, always.
        </p>

      </div>
    </section>
  )
}
