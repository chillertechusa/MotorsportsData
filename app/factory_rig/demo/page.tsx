'use client'

import Link from 'next/link'
import { ArrowLeft, Zap, Database, Code2, Shield, CheckCircle, Phone } from 'lucide-react'

export default function FactoryRigDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      <div className="px-8 py-6 max-w-6xl mx-auto">
        <Link href="/factory_rig" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition text-sm font-bold">
          <ArrowLeft className="h-4 w-4" />
          Back to Factory Rig
        </Link>
      </div>

      <section className="px-8 py-12 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Inside Factory <span className="text-red-400">Rig</span>
        </h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          Unlimited fleet operations, R&D analytics, API integration, and dedicated support for factory teams.
        </p>
      </section>

      <section className="px-8 py-16 max-w-6xl mx-auto space-y-16">
        {/* Feature 1: Unlimited Fleet */}
        <div className="border-l-4 border-red-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-red-400" />
            <div>
              <h2 className="text-2xl font-black">Unlimited Fleet Operations</h2>
              <p className="text-zinc-500 text-sm mt-1">Scale without limits</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Manage factory-scale operations: 50+ riders, unlimited bikes, multiple classes, multiple disciplines. Everything tracked in one platform with linear pricing.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-red-400">Fleet Overview</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Total Riders', value: '47' },
                { label: 'Total Bikes', value: '62' },
                { label: 'Active Programs', value: '8' },
                { label: 'Active Events', value: '12' },
              ].map((s) => (
                <div key={s.label} className="border border-zinc-800 bg-zinc-950 rounded p-3">
                  <p className="text-zinc-500 text-xs uppercase mb-1">{s.label}</p>
                  <p className="text-red-400 font-black text-lg">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'No limits on riders, bikes, or events',
              'Multi-program and multi-discipline support',
              'Unlimited storage and data retention',
              'Linear pricing regardless of fleet size',
              'Unified dashboard across all operations',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 2: R&D Analytics */}
        <div className="border-l-4 border-orange-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-orange-400" />
            <div>
              <h2 className="text-2xl font-black">R&D Analytics</h2>
              <p className="text-zinc-500 text-sm mt-1">Deep data analysis for development</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Advanced analytics designed for factory R&D: component testing, setup correlation studies, multi-rider trend analysis, and custom report generation.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-orange-400">Component Testing Report</p>
            <div className="space-y-3 text-sm">
              {[
                { component: 'Suspension Geometry', tests: 12, improvement: '+2.3%' },
                { component: 'Brake Compound', tests: 8, improvement: '+1.8%' },
                { component: 'Tire Compound', tests: 15, improvement: '+3.1%' },
              ].map((r) => (
                <div key={r.component} className="border border-zinc-800 bg-zinc-950 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-zinc-100 font-bold">{r.component}</p>
                    <p className="text-orange-400 font-bold">{r.improvement}</p>
                  </div>
                  <p className="text-zinc-500 text-xs">{r.tests} test sessions analyzed</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Component performance correlation analysis',
              'Setup variation impact assessment',
              'Multi-year trend analysis and forecasting',
              'Custom report generation and export',
              'Benchmark vs competitors and historical data',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 3: Custom Integrations */}
        <div className="border-l-4 border-amber-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Code2 className="h-8 w-8 text-amber-400" />
            <div>
              <h2 className="text-2xl font-black">Custom Integrations & API</h2>
              <p className="text-zinc-500 text-sm mt-1">Build on top of your data</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Full API access and custom integration support. Connect your existing telemetry systems, CRM, analytics platforms, or build custom applications.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-amber-400">Available APIs</p>
            <div className="space-y-2 text-sm font-mono">
              {[
                { endpoint: 'GET /api/riders', desc: 'List all riders and teams' },
                { endpoint: 'GET /api/sessions', desc: 'Query sessions with filters' },
                { endpoint: 'POST /webhooks', desc: 'Real-time event notifications' },
                { endpoint: 'GET /api/analytics', desc: 'Custom analytics queries' },
              ].map((a) => (
                <div key={a.endpoint} className="border border-zinc-800 bg-zinc-950 rounded p-2">
                  <p className="text-amber-400 text-xs font-bold">{a.endpoint}</p>
                  <p className="text-zinc-500 text-xs">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'REST and GraphQL APIs with full documentation',
              'Webhook support for real-time events',
              'Custom integrations with telemetry systems',
              'Batch data export and sync capabilities',
              'OAuth 2.0 and API key authentication',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 4: Dedicated Support */}
        <div className="border-l-4 border-yellow-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-black">Dedicated Support & SLA</h2>
              <p className="text-zinc-500 text-sm mt-1">Enterprise-grade service</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Dedicated account manager, 24/7 priority support, custom SLA agreements, and quarterly business reviews.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-yellow-400">Support Tier: Premium</p>
            <div className="space-y-2 text-sm">
              {[
                { feature: 'Email Support', value: 'Priority (2h)' },
                { feature: 'Phone Support', value: '24/7 Available' },
                { feature: 'Account Manager', value: 'Dedicated' },
                { feature: 'SLA Uptime', value: '99.95%' },
              ].map((s) => (
                <div key={s.feature} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0">
                  <p className="text-zinc-400">{s.feature}</p>
                  <p className="text-yellow-400 font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              '24/7 priority email and phone support',
              'Dedicated account manager',
              'Custom SLA and uptime guarantees',
              'Quarterly business reviews and optimization',
              'Direct access to engineering team',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Ready to scale?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">$15,000/month. Unlimited fleet operations with custom integrations and dedicated support.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/data/checkout?plan=factory_rig&frequency=annual" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-500 text-white font-bold rounded hover:bg-red-400 transition">
              Get Started Now
            </a>
            <a href="tel:+18884698475" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition">
              <Phone className="h-5 w-5" />
              (888) 469-8475
            </a>
            <Link href="/factory_rig" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition">
              Back to Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
