'use client'

import Link from 'next/link'
import { ArrowLeft, BarChart3, FileText, Zap, Users, CheckCircle, Phone } from 'lucide-react'

export default function WrenchDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Back button */}
      <div className="px-8 py-6 max-w-6xl mx-auto">
        <Link
          href="/wrench"
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition text-sm font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Wrench
        </Link>
      </div>

      {/* Hero */}
      <section className="px-8 py-12 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Inside The <span className="text-orange-400">Wrench Platform</span>
        </h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          Built for professional mechanics. Track setup changes, build your career portfolio, and own your data. Everything you need to grow your reputation and skills.
        </p>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-6xl mx-auto space-y-16">
        {/* Feature 1: Delta Tracking */}
        <div className="border-l-4 border-orange-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-orange-400" />
            <div>
              <h2 className="text-2xl font-black">Delta Tracking & Setup Analysis</h2>
              <p className="text-zinc-500 text-sm mt-1">See exactly how each adjustment impacts performance</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Log every setup change you make and immediately see the telemetry impact. Compare lap times across different setups, conditions, and riders. Build a searchable library of what works.
          </p>

          {/* Example data table */}
          <div className="bg-black border border-zinc-800 rounded overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-950 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Setup Impact Analysis</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {[
                { change: 'Front Spring +2N/mm', impact: '+0.32s', circuit: 'Unadilla', confidence: '95%' },
                { change: 'Rear Sway Bar -0.5mm', impact: '-0.18s', circuit: 'Southwick', confidence: '87%' },
                { change: 'Tire Pressure +1psi', impact: '+0.12s', circuit: 'Budds Creek', confidence: '72%' },
                { change: 'Brake Bias -2%', impact: '-0.24s', circuit: 'Hangtown', confidence: '91%' },
              ].map((item) => (
                <div key={item.change} className="px-4 py-2.5 flex items-center justify-between font-mono text-xs">
                  <div className="flex-1">
                    <span className="text-zinc-500">{item.change}</span>
                    <span className="text-zinc-600 ml-2">{item.circuit}</span>
                  </div>
                  <span className={item.impact.startsWith('-') ? 'text-lime-400' : 'text-red-400'}>{item.impact}</span>
                  <span className="text-zinc-500 ml-4">{item.confidence}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'A/B comparison of any setup variations',
              'Correlation analysis: setup vs lap time',
              'Track and weather-specific recommendations',
              'Historical setup library by circuit',
              'Share learnings with team riders',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 2: Career Portfolio */}
        <div className="border-l-4 border-amber-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-amber-400" />
            <div>
              <h2 className="text-2xl font-black">Professional Career Portfolio</h2>
              <p className="text-zinc-500 text-sm mt-1">Showcase your expertise to teams and riders</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Build an auto-generated public portfolio showing your track record, improvements delivered, bikes worked on, and testimonials. Let riders and teams discover you.
          </p>

          {/* Example profile preview */}
          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <div className="space-y-2">
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Public Wrench Profile</p>
              <p className="font-mono text-sm text-amber-400 break-all">motorsportsdata.io/wrench/alex-rodriguez</p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
              <div className="text-center">
                <p className="text-2xl font-black text-amber-400">47</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase">Bikes Optimized</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-400">8</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase">Avg Gain</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-lime-400">4.9</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase">Rating</p>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Auto-generated stats from your track record',
              'Public shareable profile with custom URL',
              'Rider testimonials and reviews section',
              'Specialization badges (suspension, electronics, etc)',
              'Downloadable professional PDF resume',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 3: Multi-Bike Analytics */}
        <div className="border-l-4 border-yellow-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-black">Multi-Bike Performance Analytics</h2>
              <p className="text-zinc-500 text-sm mt-1">Manage dozens of bikes and track all improvements</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Organize all your clients' bikes in one dashboard. Track performance gains over time, see which setups work best, and identify patterns across different riders and conditions.
          </p>

          {/* Example bike comparison */}
          <div className="bg-black border border-zinc-800 rounded overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-950 flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Your Fleet - Performance Overview</span>
            </div>
            <div className="divide-y divide-zinc-800">
              <div className="px-4 py-3 grid grid-cols-4 gap-4 font-mono text-xs bg-zinc-950">
                <span className="text-zinc-500">Bike</span>
                <span className="text-yellow-400">Sessions</span>
                <span className="text-orange-400">Avg Gain</span>
                <span className="text-lime-400">Last Work</span>
              </div>
              {[
                { bike: 'Factory KX450-F #2', sessions: '23', gain: '-0.47s', last: '2 days' },
                { bike: 'Privateer YZ250 #1', sessions: '18', gain: '-0.23s', last: '5 days' },
                { bike: 'Team CRF450R #4', sessions: '31', gain: '-0.61s', last: 'today' },
                { bike: 'Development RM-Z450', sessions: '12', gain: '-0.18s', last: '1 week' },
              ].map((row) => (
                <div key={row.bike} className="px-4 py-2.5 grid grid-cols-4 gap-4 font-mono text-xs">
                  <span className="text-zinc-300">{row.bike}</span>
                  <span className="text-zinc-400">{row.sessions}</span>
                  <span className="text-orange-400">{row.gain}</span>
                  <span className="text-zinc-400">{row.last}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Dashboard for unlimited bikes',
              'Organize by team, program, or client',
              'Track setup changes across fleet',
              'Identify reusable setup patterns',
              'Export performance reports per bike',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 4: Professional Tools */}
        <div className="border-l-4 border-lime-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-lime-400" />
            <div>
              <h2 className="text-2xl font-black">Team Collaboration & Data Ownership</h2>
              <p className="text-zinc-500 text-sm mt-1">Control your data, collaborate with confidence</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Your data is yours. Manage permissions for riders, coaches, and team members. Export setup libraries, performance reports, and analysis. Never locked in.
          </p>

          {/* Example collaboration card */}
          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-lime-400">Your Data & Permissions</p>
            <div className="space-y-3 text-sm text-zinc-300">
              <div>
                <p className="font-bold text-zinc-100 mb-1">Full Export Access</p>
                <p className="text-zinc-400">Download all setup notes, telemetry, and performance data in CSV, PDF, or JSON formats anytime.</p>
              </div>
              <div>
                <p className="font-bold text-zinc-100 mb-1">Role-Based Permissions</p>
                <p className="text-zinc-400">Invite riders and coaches with view-only or edit access to specific bikes or circuits.</p>
              </div>
              <div>
                <p className="font-bold text-zinc-100 mb-1">No Vendor Lock-In</p>
                <p className="text-zinc-400">All your data is portable. Close your account anytime and take everything with you.</p>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Unlimited data exports in multiple formats',
              'Granular permission controls',
              'API access for custom integrations',
              'Zero lock-in policy',
              ' 24/7 dedicated support for mechanics',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
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
            <h2 className="text-3xl font-black mb-4">Ready to build your career?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">$29/year. Career portfolio, delta tracking, multi-bike analytics, and your data forever. Cancel anytime.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/data/checkout?plan=wrench&frequency=annual"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-black font-bold rounded hover:bg-orange-400 transition"
            >
              Get Started Now
            </a>
            <a
              href="tel:+18884698475"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
            >
              <Phone className="h-5 w-5" />
              (888) 469-8475
            </a>
            <Link
              href="/wrench"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
