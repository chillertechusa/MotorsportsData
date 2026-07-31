import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for riders, coaches, and shops.',
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4 text-white">Simple Pricing</h1>
          <p className="text-xl text-zinc-400 mb-2">
            Free for riders. Pay only if you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Rider — Free */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-lime-500/50 transition">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">Bike Doctor</h2>
              <p className="text-sm text-zinc-400">For riders</p>
            </div>
            <div className="mb-8">
              <div className="text-4xl font-black text-lime-400">Free</div>
              <p className="text-sm text-zinc-500 mt-1">Forever</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'AI bike diagnostics',
                'Maintenance tracking',
                'Ride log + analytics',
                'Setup notebook',
                'Body readiness tracker',
                'Invite coaches (read-only)',
                'Send work orders to shops',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-lime-400" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold">
              Start Free <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Coach — $49-99/mo */}
          <div className="bg-zinc-900 border border-lime-500/30 rounded-xl p-8 ring-2 ring-lime-500/20 transform scale-105">
            <div className="mb-6">
              <div className="inline-block bg-lime-500/20 text-lime-400 text-xs font-black px-3 py-1 rounded mb-3">
                POPULAR
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Coach Connect</h2>
              <p className="text-sm text-zinc-400">For coaches</p>
            </div>
            <div className="mb-8">
              <div className="text-4xl font-black text-lime-400">$49<span className="text-xl">/mo</span></div>
              <p className="text-sm text-zinc-500 mt-1">Billed monthly</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Everything in Bike Doctor',
                'Read-only access to riders',
                'View 5 athlete bikes/data',
                'Ride log analytics',
                'Setup recommendations',
                'No data export (platform only)',
                'Audit log of all views',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-lime-400" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold">
              Start 14-Day Trial <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Shop — $99/mo */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">Shop Connect</h2>
              <p className="text-sm text-zinc-400">For shops + mechanics</p>
            </div>
            <div className="mb-8">
              <div className="text-4xl font-black text-lime-400">$99<span className="text-xl">/mo</span></div>
              <p className="text-sm text-zinc-500 mt-1">Billed monthly</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Receive rider work orders',
                'Pre-filled customer info',
                'Parts inventory integration',
                'API access (beta)',
                'Team member accounts',
                'Service history sync',
                'Priority support',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-lime-400" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold" disabled>
              Contact Sales
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-24 pt-16 border-t border-zinc-800">
          <h2 className="text-3xl font-black text-white mb-8">Common questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel at any time from your account settings. No penalties, no questions asked.',
              },
              {
                q: 'Is my data exported or sold?',
                a: 'Never. Your data is yours. We never export, sell, or share your information. Period.',
              },
              {
                q: 'How long is the coach trial?',
                a: '14 days, full access. Card required but we won\'t charge until the trial ends.',
              },
              {
                q: 'Can I upgrade or downgrade?',
                a: 'Yes. Change plans anytime. Prorated charges apply.',
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-bold text-white mb-2">{q}</h3>
                <p className="text-zinc-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
