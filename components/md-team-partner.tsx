'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck, Zap, Users, Lock } from 'lucide-react'
import { RMS_PLANS, RMS_PLAN_IDS, type RmsPlanId } from '@/lib/md-plans'

const TRUST_BADGES = [
  { icon: Zap, label: 'Founding season — 30% off forever' },
  { icon: Users, label: 'Zero per-user fees' },
  { icon: ShieldCheck, label: 'Your data never shared, never sold' },
  { icon: Lock, label: 'Secured by Square' },
]

export default function MdTeamPartner() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loadingId, setLoadingId] = useState<RmsPlanId | null>(null)
  const [errorId, setErrorId] = useState<RmsPlanId | null>(null)

  async function handleBuyNow(planId: RmsPlanId) {
    setLoadingId(planId)
    setErrorId(null)
    try {
      const res = await fetch('/api/smx/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Checkout failed.')
      window.location.href = data.url
    } catch {
      setErrorId(planId)
      setLoadingId(null)
    }
  }

  return (
    <section
      id="pricing"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="Pricing tiers"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
            <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
              Pricing — Every Tier, One Platform
            </span>
            <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
          </div>
          <h2
            className="text-zinc-100 uppercase leading-none mb-4 text-balance"
            style={{
              fontFamily: 'var(--font-barlow-condensed)',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 6vw, 3.75rem)',
            }}
          >
            From the family pit.{' '}
            <span className="text-lime-400">To the factory rig.</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            One platform. Scale your access as your program grows. Zero per-user fees. Cancel anytime on the first three tiers.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center border border-zinc-700 bg-zinc-900/60 p-1 gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                billing === 'monthly'
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2 ${
                billing === 'annual'
                  ? 'bg-lime-400 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Annual
              <span className={`text-[9px] font-bold ${billing === 'annual' ? 'text-zinc-700' : 'text-lime-400'}`}>
                SAVE 17%
              </span>
            </button>
          </div>
        </div>

        {/* Tier cards — 4 col desktop, stacked mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {RMS_PLAN_IDS.map((planId) => {
            const plan = RMS_PLANS[planId]
            const price = billing === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice
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

                <div className="p-5 sm:p-6 flex flex-col flex-1">

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

                  {/* Price */}
                  <div className="mb-1">
                    {plan.buyNow ? (
                      <div className="flex items-end gap-1.5">
                        <span
                          className={`font-black leading-none text-4xl ${plan.accentText}`}
                          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                        >
                          ${price.toLocaleString()}
                        </span>
                        <span className="text-zinc-500 text-sm mb-1">/mo</span>
                      </div>
                    ) : (
                      <div className="flex items-end gap-1.5">
                        <span
                          className={`font-black leading-none text-3xl ${plan.accentText}`}
                          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                        >
                          ${price.toLocaleString()}
                        </span>
                        <span className="text-zinc-500 text-sm mb-1">/mo</span>
                      </div>
                    )}
                    {billing === 'annual' && plan.buyNow && (
                      <p className={`font-mono text-[10px] mt-1 ${plan.accentText}`}>
                        ${(plan.annualMonthlyPrice * 12).toLocaleString()}/yr — 2 months free
                      </p>
                    )}
                    {billing === 'monthly' && plan.buyNow && (
                      <p className="font-mono text-[10px] text-zinc-600 mt-1">
                        or ${plan.annualMonthlyPrice}/mo billed annually
                      </p>
                    )}
                  </div>

                  {/* Founding badge */}
                  <div className="flex items-center gap-1.5 mt-2 mb-3">
                    <span className="inline-block w-1 h-1 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
                    <span className="font-mono text-[9px] text-lime-400 uppercase tracking-widest">
                      Founding pricing — locked forever
                    </span>
                  </div>

                  {/* Name + who */}
                  <h3
                    className={`text-xl font-black uppercase mb-1 ${plan.accentText}`}
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    {plan.label}
                  </h3>
                  <p className="text-zinc-500 text-xs mb-4 leading-snug border-b border-zinc-800/60 pb-4">
                    {plan.who}
                  </p>

                  {/* Modules / features */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.modules.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${plan.accentText}`}
                          aria-hidden="true"
                        />
                        <span className="text-zinc-300 text-xs leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex flex-col gap-1.5">
                    {plan.buyNow ? (
                      <button
                        onClick={() => handleBuyNow(planId)}
                        disabled={isLoading || loadingId !== null}
                        className={[
                          'inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
                          plan.popular
                            ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
                            : `border ${plan.accent} ${plan.accentText} hover:bg-zinc-800/50`,
                        ].join(' ')}
                        aria-label={`Get ${plan.label} — $${price}/mo`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Opening...
                          </>
                        ) : (
                          <>Get {plan.label} &rarr;</>
                        )}
                      </button>
                    ) : (
                      <a
                        href="mailto:motorsportsdata@gmail.com?subject=Factory%20Command%20Program%20Inquiry"
                        className={`inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3 border ${plan.accent} ${plan.accentText} hover:bg-zinc-800/50 transition-colors`}
                      >
                        Contact for Deployment &rarr;
                      </a>
                    )}
                    {hasError && (
                      <p className="font-mono text-[9px] text-red-400 uppercase tracking-wide text-center">
                        Failed.{' '}
                        <a href="mailto:motorsportsdata@gmail.com" className="underline">
                          Email us
                        </a>
                      </p>
                    )}
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

        <p className="text-center font-mono text-[10px] text-zinc-700 uppercase tracking-widest mt-6">
          Monthly subscriptions · Cancel anytime on Grassroots, Privateer, Race Team · Factory Command is annual contract
        </p>
      </div>
    </section>
  )
}
