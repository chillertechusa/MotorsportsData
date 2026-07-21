import { ArrowRight, Zap, Database, Code2, CheckCircle, Globe, Shield, Phone } from 'lucide-react'
import Link from 'next/link'
import { formatPricingDisplay } from '@/lib/md-plans'

export const metadata = {
  title: 'Factory Rig | Motorsport Data',
  description: 'Unlimited fleet operations, R&D analytics, custom integrations, and dedicated support for factory teams.',
  alternates: { canonical: 'https://motorsportsdata.io/factory_rig' },
}

export default function FactoryRigPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Hero */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Enterprise-Grade Operations. <span className="text-red-400">Unlimited Scale.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Unlimited fleet, unlimited riders, unlimited bikes. R&D analytics, custom integrations, API access, and dedicated support. Built for factory teams and manufacturer partners.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/factory_rig/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-bold rounded hover:bg-red-400 transition"
          >
            See Demo Now <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="tel:+18884698475"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
          >
            <Phone className="h-5 w-5" />
            (888) 469-8475
          </a>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-8 py-16 max-w-6xl mx-auto border-t border-zinc-800">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-8">Built for championships</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-3xl font-black text-red-400">∞</p>
            <p className="text-sm text-zinc-400">Fleet Size</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-orange-400">100%</p>
            <p className="text-sm text-zinc-400">API Access</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-amber-400">24/7</p>
            <p className="text-sm text-zinc-400">Support</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-yellow-400">Custom</p>
            <p className="text-sm text-zinc-400">Integration</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto space-y-12">
        <div>
          <h2 className="text-4xl font-black mb-4">Built for Factory Teams</h2>
          <p className="text-zinc-400 max-w-2xl">Unlimited scale, unlimited customization, unlimited support.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Unlimited Fleet */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-red-400" />
              <h3 className="text-xl font-bold">Unlimited Fleet</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              No limits on riders, bikes, or events. Manage a factory operation with 50+ riders across multiple classes, disciplines, and campaigns. One price covers everything.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                Unlimited riders across all programs
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                Unlimited bikes and multi-discipline support
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                Unlimited events and season management
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                Linear pricing regardless of scale
              </li>
            </ul>
          </div>

          {/* R&D Analytics */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold">R&D Analytics</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Deep analytics for development programs. Multi-dimensional data analysis, setup correlation studies, component testing comparison, and custom report generation.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Component performance analysis
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Setup correlation studies
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Multi-year trend analysis
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Custom report generation
              </li>
            </ul>
          </div>

          {/* Custom Integrations */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Code2 className="h-6 w-6 text-amber-400" />
              <h3 className="text-xl font-bold">Custom Integrations & API</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Full API access and custom integrations. Connect to your existing telemetry systems, CRM, analytics platforms, or build custom applications on top of your data.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                REST & GraphQL APIs
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Custom integrations with third-party systems
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Webhook support for real-time events
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Batch data export and sync
              </li>
            </ul>
          </div>

          {/* Dedicated Support */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-yellow-400" />
              <h3 className="text-xl font-bold">Dedicated Support & SLA</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Dedicated account manager, priority support, custom SLA agreements, and ongoing optimization. Your success is our priority.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                24/7 priority email & phone support
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Dedicated account manager
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Custom SLA and uptime guarantees
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Quarterly business reviews & optimization
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Scale without limits.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">$15,000/month. Custom pricing for larger operations. Unlimited riders, bikes, and events. Bill monthly or annually.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/checkout/tier?tier=factory_rig"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-500 text-white font-bold rounded hover:bg-red-400 transition"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="tel:+18884698475"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
            >
              <Phone className="h-5 w-5" />
              (888) 469-8475
            </a>
            <Link
              href="/factory_rig/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
            >
              See Full Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
