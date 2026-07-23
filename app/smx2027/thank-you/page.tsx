import Link from 'next/link'
import type { Metadata } from 'next'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { SMX_ELITE_PLANS, SMX_ELITE_PLAN_IDS, type SmxElitePlanId } from '@/lib/md-plans'

export const metadata: Metadata = {
  title: 'Welcome to the Program — Motorsports Data SMX 2027',
  description: 'Your SMX 2027 season program is confirmed. Welcome to the command center.',
  robots: { index: false },
}

export default async function SmxThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan: planParam } = await searchParams
  const planId = SMX_ELITE_PLAN_IDS.find((id) => id === planParam)
  const plan = planId ? SMX_ELITE_PLANS[planId as SmxElitePlanId] : null

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-24">
      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,230,53,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.025) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative max-w-xl w-full text-center">
        {/* Check icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-lime-400/10 border border-lime-400/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-lime-400" aria-hidden="true" />
          </div>
        </div>

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-8 bg-lime-400" aria-hidden="true" />
          <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
            SMX 2027 — Program Confirmed
          </span>
          <div className="h-px w-8 bg-lime-400" aria-hidden="true" />
        </div>

        <h1
          className="text-zinc-100 uppercase leading-none mb-4 text-balance"
          style={{
            fontFamily: 'var(--font-barlow-condensed)',
            fontWeight: 900,
            fontSize: 'clamp(2.2rem, 7vw, 3.5rem)',
          }}
        >
          {plan ? (
            <>Welcome to{' '}<span className="text-lime-400">{plan.label}.</span></>
          ) : (
            <>You&apos;re in the{' '}<span className="text-lime-400">Command Center.</span></>
          )}
        </h1>

        <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-md mx-auto">
          {plan
            ? `Your ${plan.label} program for the SMX 2027 season is confirmed. Our team will contact you at motorsportsdata@gmail.com within 24 hours to begin onboarding.`
            : 'Your SMX 2027 season program is confirmed. Our team will contact you within 24 hours to begin onboarding.'}
        </p>

        {/* Season details box */}
        <div className="border border-zinc-800 bg-zinc-900/40 p-6 mb-8 text-left">
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-4">What happens next</p>
          <ul className="space-y-3">
            {[
              'Onboarding call scheduled within 24 hours',
              'Command Rig logistics confirmed before Round 1 — Anaheim, Jan 10 2027',
              'Platform credentials + data pipeline setup',
              'Analyst assignment (Command + Factory programs)',
            ].map((step) => (
              <li key={step} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-zinc-300 text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/smx2027"
            className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 font-semibold px-6 py-3 hover:bg-zinc-800 transition-colors text-sm"
          >
            Back to SMX 2027
          </Link>
          <a
            href="mailto:motorsportsdata@gmail.com?subject=SMX%202027%20Program%20Onboarding"
            className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-bold px-6 py-3 hover:bg-lime-300 transition-colors text-sm"
          >
            Email Our Team
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}
