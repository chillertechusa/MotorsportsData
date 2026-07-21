'use client'

import Link from 'next/link'
import { ArrowLeft, TrendingUp, BarChart3, Target, Briefcase, CheckCircle } from 'lucide-react'

export default function AgentDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      <div className="px-8 py-6 max-w-6xl mx-auto">
        <Link href="/agent" className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300 transition text-sm font-bold">
          <ArrowLeft className="h-4 w-4" />
          Back to Agent
        </Link>
      </div>

      <section className="px-8 py-12 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Inside <span className="text-lime-400">Agent</span>
        </h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          Data-driven contract negotiation, salary benchmarking, prospect scouting, and competitive intelligence for motorsport agents.
        </p>
      </section>

      <section className="px-8 py-16 max-w-6xl mx-auto space-y-16">
        {/* Feature 1: Percentile Ranking */}
        <div className="border-l-4 border-lime-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-lime-400" />
            <div>
              <h2 className="text-2xl font-black">Percentile Ranking</h2>
              <p className="text-zinc-500 text-sm mt-1">Know exactly where your clients rank</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Instant percentile breakdowns for your clients. See how they rank vs peers by age, class, track, and discipline. Use objective data in contract negotiations.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-lime-400">Client Percentile Report</p>
            <div className="space-y-3 text-sm">
              {[
                { metric: 'Win Rate (vs peers)', value: '87th percentile', color: 'text-lime-400' },
                { metric: 'Lap Time Consistency', value: '92nd percentile', color: 'text-emerald-400' },
                { metric: 'Fastest Lap (250cc)', value: '79th percentile', color: 'text-teal-400' },
                { metric: 'Breakout Potential', value: '95th percentile', color: 'text-lime-400' },
              ].map((m) => (
                <div key={m.metric} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0">
                  <p className="text-zinc-400">{m.metric}</p>
                  <p className={`font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Real-time percentile rankings across all metrics',
              'Segment by age group, class, track, and discipline',
              'Year-over-year comparison and trends',
              'Export rankings for sponsorship presentations',
              'Breakout potential scoring',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 2: Salary Benchmarking */}
        <div className="border-l-4 border-emerald-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-emerald-400" />
            <div>
              <h2 className="text-2xl font-black">Salary Benchmarking</h2>
              <p className="text-zinc-500 text-sm mt-1">Market intelligence for contracts</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Access anonymized salary and contract data. Know market rates, understand competitive offers, and negotiate confidently with hard data.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-emerald-400">Market Salary Range</p>
            <div className="space-y-4 text-sm">
              {[
                { role: 'Privateer (250cc)', low: '$40k', mid: '$65k', high: '$95k' },
                { role: 'Team Rider (250cc)', low: '$80k', mid: '$120k', high: '$185k' },
                { role: 'Factory Rider (250cc)', low: '$250k', mid: '$450k', high: '$750k' },
              ].map((r) => (
                <div key={r.role} className="border border-zinc-800 bg-zinc-950 rounded p-3">
                  <p className="text-zinc-100 font-bold mb-2">{r.role}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Range:</span>
                    <span className="text-emerald-400 font-mono font-bold">{r.low} — {r.high}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-zinc-500">Market Avg:</span>
                    <span className="text-teal-400 font-bold">{r.mid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Anonymized salary and contract database',
              'Market rate analysis by role and skill level',
              'Historical salary trend data',
              'Competitive offer intelligence',
              'Custom compensation scenario modeling',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 3: Prospect Scouting */}
        <div className="border-l-4 border-teal-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-teal-400" />
            <div>
              <h2 className="text-2xl font-black">Prospect Scouting</h2>
              <p className="text-zinc-500 text-sm mt-1">Find emerging talent before competitors</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Discover rising riders with breakout potential. Search by performance, trending metrics, availability, and build prospect lists for your pipeline.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-teal-400">Prospect Pipeline</p>
            <div className="space-y-3 text-sm">
              {[
                { name: 'Jordan Chen', age: '18', trend: '↑ +8% YoY', potential: 'Elite', contract: 'Jul 2026' },
                { name: 'Maya Patel', age: '17', trend: '↑ +12% YoY', potential: 'Elite', contract: 'Dec 2026' },
                { name: 'Alex Kim', age: '19', trend: '↑ +5% YoY', potential: 'High', contract: 'Sep 2026' },
              ].map((p) => (
                <div key={p.name} className="border border-zinc-800 bg-zinc-950 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-zinc-100 font-bold">{p.name}</p>
                      <p className="text-zinc-500 text-xs">Age {p.age} · {p.trend}</p>
                    </div>
                    <span className="text-teal-400 text-xs font-bold">{p.potential}</span>
                  </div>
                  <p className="text-zinc-500 text-xs">Contract expires: {p.contract}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Advanced rider search and filtering',
              'Breakout potential scoring algorithm',
              'Contract expiration tracking',
              'Saved prospect lists with alerts',
              'Age cohort and class comparisons',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 4: Contract Intelligence */}
        <div className="border-l-4 border-green-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-green-400" />
            <div>
              <h2 className="text-2xl font-black">Contract Intelligence</h2>
              <p className="text-zinc-500 text-sm mt-1">Track deadlines and opportunities</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Monitor contract expirations, track team spending, identify upcoming opportunities, and manage your portfolio with confidence.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-green-400">Portfolio Summary</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              {[
                { label: 'Active Clients', value: '12' },
                { label: 'Total Contract Value', value: '$4.2M' },
                { label: 'Contracts Expiring (6mo)', value: '4' },
                { label: 'Avg Contract Value', value: '$350k' },
              ].map((s) => (
                <div key={s.label} className="border border-zinc-800 bg-zinc-950 rounded p-2">
                  <p className="text-zinc-500 text-xs uppercase mb-1">{s.label}</p>
                  <p className="text-green-400 font-black">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <p className="text-zinc-400 text-xs uppercase mb-2">Next Deadlines</p>
              {[
                { client: 'Jordan Chen', date: 'Jul 15, 2026', action: 'Renew' },
                { client: 'Alex Rodriguez', date: 'Aug 2, 2026', action: 'Negotiate' },
              ].map((d) => (
                <div key={d.client} className="flex items-center justify-between text-xs mb-1 pb-1 border-b border-zinc-800 last:border-0">
                  <span className="text-zinc-300">{d.client}</span>
                  <span className="text-green-400 font-bold">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Contract deadline tracking and alerts',
              'Team spending and budget analysis',
              'Competitor monitoring and intelligence',
              'Contract portfolio management and reporting',
              'Historical contract analytics',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
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
            <h2 className="text-3xl font-black mb-4">Close bigger deals with data.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">$999/month. Percentile ranking, salary benchmarking, prospect scouting, and contract intelligence.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/data/checkout?plan=agent" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition">
              Get Started Now
            </a>
            <Link href="/agent" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition">
              Back to Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
