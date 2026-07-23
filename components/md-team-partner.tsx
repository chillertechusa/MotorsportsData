'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Radio, ShieldCheck, Truck, Users, Zap } from 'lucide-react'
import { SMX_ELITE_PLANS, SMX_ELITE_PLAN_IDS, type SmxElitePlanId } from '@/lib/md-plans'

const TIER_FEATURES: Record<SmxElitePlanId, string[]> = {
  smx_team_partner: [
    'Full lap telemetry + setup logs every round',
    'Crew chief AI — live setup recommendations each session',
    'Multi-rider command dashboard — all riders, one view',
    'Race weekend AI chat: query the season dataset live',
    'Post-moto debrief auto-generated after every session',
    'Command Rig access — connect trackside at every venue',
    'Season standings tracker + points scenario calculator',
    'Full season data export — your numbers, your property',
  ],
  smx_command_partner: [
    'Everything in Team Partner',
    'Dedicated Motorsports Data analyst assigned to your program',
    'Analyst on-call at the Command Rig all race weekend',
    'Dedicated desk inside the rig — your team owns the space',
    'Cross-rider lap comparison + multi-session trend analysis',
    'R&D data layer — development build tracking all season',
    'Custom setup report templates for your crew chief\'s workflow',
    'Direct engineering line for in-season platform customizations',
  ],
  smx_factory_command: [
    'Everything in Command Partner',
    'Embedded analyst in your pit — not ours — every round',
    'Unlimited riders + unlimited staff seats',
    'Custom integration with your existing data pipeline',
    'Fleet telemetry across all programs simultaneously',
    'Manufacturer R&D analytics and development data layer',
    'Private data infrastructure — air-gapped from all other teams',
    'White-glove onboarding with your engineering team',
  ],
}

const TRUST_BADGES = [
  { icon: Truck, label: 'Command rig at every venue' },
  { icon: Radio, label: 'Live analyst all race weekend' },
  { icon: Zap, label: 'Founding season pricing — locked all 2027' },
  { icon: Users, label: 'Only 5 Command + Factory spots remaining' },
  { icon: ShieldCheck, label: 'Your data never shared, never sold' },
]

// Sponsor ROI justification per tier
const SPONSOR_ROI: Record<SmxElitePlanId, string> = {
  smx_team_partner:
    'Less than hiring one part-time analyst. Your sponsor approves this in one email.',
  smx_command_partner:
    'Replaces your entire current data stack (~$110K/yr fragmented). One line item.',
  smx_factory_command:
    '3.8% of an $8M factory budget. Monster Energy writes $200M/yr in moto sponsorships.',
}

export default function MdTeamPartner() {
  const [loadingId, setLoadingId] = useState<SmxElitePlanId | null>(null)
  const [errorId, setErrorId] = useState<SmxElitePlanId | null>(null)

  async function handleBuyNow(planId: SmxElitePlanId) {
    setLoadingId(planId)
    setErrorId(null)
    try {
      const res = await fetch('/api/smx/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Checkout failed.')
      }
      window.location.href = data.url
    } catch {
      setErrorId(planId)
      setLoadingId(null)
    }
  }

  return (
    <section
      id="team-partner"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="SMX 2027 Elite Season Programs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
            <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
              SMX 2027 — Elite Season Programs
            </span>
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
          </div>
          <h2
            className="text-zinc-100 uppercase leading-none mb-5 text-balance"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 6vw, 3.75rem)',
            }}
          >
            Three Programs.{' '}
            <span className="text-lime-400">One Season.</span>
            <br />
            No Individual Riders.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Season-length commitments. Command Rig at every venue. Buy now — Square secure checkout, full season total charged once.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {SMX_ELITE_PLAN_IDS.map((planId) => {
            const plan = SMX_ELITE_PLANS[planId]
            const features = TIER_FEATURES[planId]
            const isLoading = loadingId === planId
            const hasError = errorId === planId

            return (
              <div
                key={planId}
                className={[
                  'relative flex flex-col border overflow-hidden transition-colors',
                  plan.accent,
                  plan.accentBg,
                  plan.popular ? 'ring-1 ring-lime-400/30' : '',
                ].join(' ')}
              >
                {/* Top accent bar */}
                <div className={`h-0.5 w-full ${plan.topBar}`} aria-hidden="true" />

                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  {/* Tag */}
                  {plan.popular ? (
                    <span className="inline-flex self-start bg-lime-400 text-zinc-950 font-bold font-mono text-[10px] uppercase tracking-widest px-3 py-0.5 mb-3">
                      {plan.tag}
                    </span>
                  ) : (
                    <span className={`font-mono text-[10px] uppercase tracking-widest mb-3 ${plan.accentText}`}>
                      {plan.tag}
                    </span>
                  )}

                  {/* Monthly price + season total */}
                  <div className="mb-1">
                    <div className="flex items-end gap-1.5">
                      <span
                        className={`font-black leading-none text-5xl ${plan.accentText}`}
                        style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                      >
                        ${plan.monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-zinc-500 text-sm mb-1">/mo</span>
                    </div>
                    <p className={`font-mono text-xs mt-1 font-bold ${plan.accentText}`}>
                      ${plan.seasonTotal.toLocaleString()} season total
                    </p>
                  </div>

                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1 mb-1">
                    Full season — Jan to May 2027 · 17 rounds
                  </p>

                  {/* Name + who */}
                  <h3
                    className={`text-xl font-black uppercase mt-4 mb-1 ${plan.accentText}`}
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    {plan.label}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-2 leading-snug">
                    {plan.who}
                  </p>

                  {/* Sponsor ROI */}
                  <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-wide mb-5 border-b border-zinc-800 pb-4 leading-relaxed">
                    {SPONSOR_ROI[planId]}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 mt-0.5 ${plan.accentText}`}
                          aria-hidden="true"
                        />
                        <span className="text-zinc-300 text-sm leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Buy Now CTA */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleBuyNow(planId)}
                      disabled={isLoading || loadingId !== null}
                      className={[
                        'inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
                        plan.popular
                          ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
                          : `border ${plan.accent} ${plan.accentText} hover:bg-zinc-800/60`,
                      ].join(' ')}
                      aria-label={`Buy ${plan.label} — $${plan.seasonTotal.toLocaleString()} season total`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Opening Checkout...
                        </>
                      ) : (
                        <>Buy Now &mdash; ${plan.seasonTotal.toLocaleString()} &rarr;</>
                      )}
                    </button>
                    {hasError && (
                      <p className="font-mono text-[10px] text-red-400 uppercase tracking-wide text-center">
                        Checkout failed.{' '}
                        <a
                          href="mailto:motorsportsdata@gmail.com"
                          className="underline hover:text-red-300"
                        >
                          Email us directly
                        </a>
                      </p>
                    )}
                    <p className={`font-mono text-[9px] uppercase tracking-widest text-center ${plan.accentText} opacity-60`}>
                      Secured by Square
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 border-t border-zinc-800">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 text-lime-400 shrink-0" aria-hidden="true" />
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center font-mono text-[10px] text-zinc-700 uppercase tracking-widest mt-8">
          Season-length commitments only · Jan to May 2027 · Full season total charged at checkout
        </p>
      </div>
    </section>
  )
}
