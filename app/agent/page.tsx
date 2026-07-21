import { ArrowRight, TrendingUp, Briefcase, Target, CheckCircle, BarChart3, Trophy } from 'lucide-react'
import Link from 'next/link'
import { formatPricingDisplay } from '@/lib/md-plans'

export const metadata = {
  title: 'Agent Platform | Motorsport Data',
  description: 'Contract negotiation, salary benchmarking, prospect scouting, and percentile ranking for motorsport agents.',
  alternates: { canonical: 'https://motorsportsdata.io/agent' },
}

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Hero */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Negotiate Smarter. <span className="text-lime-400">Close Bigger Deals.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Percentile ranking, salary benchmarking, prospect scouting, and contract intelligence. The data-driven platform for motorsport agents and managers.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/agent/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition"
          >
            See Demo Now <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="mailto:agents@motorsportsdata.io"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
          >
            Schedule Call
          </a>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="px-8 py-16 max-w-6xl mx-auto border-t border-zinc-800">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-8">What you get</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-3xl font-black text-lime-400">Percentile</p>
            <p className="text-sm text-zinc-400">Rider ranking vs. the field</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-zinc-100">Benchmarks</p>
            <p className="text-sm text-zinc-400">Salary &amp; contract comparables</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-emerald-400">Scouting</p>
            <p className="text-sm text-zinc-400">Prospect discovery &amp; tracking</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-zinc-100">Contract AI</p>
            <p className="text-sm text-zinc-400">Deal intelligence &amp; prep</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto space-y-12">
        <div>
          <h2 className="text-4xl font-black mb-4">Negotiate With Data, Not Guesses</h2>
          <p className="text-zinc-400 max-w-2xl">Everything an agent needs to close bigger, better deals.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Percentile Ranking */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-lime-400" />
              <h3 className="text-xl font-bold">Percentile Ranking</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Know exactly where your clients rank. See percentile breakdown by age group, class, track, and discipline. Use objective data in negotiations.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Real-time percentile rankings across all metrics
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Segment by age, class, track, and discipline
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Export rankings for presentations
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Historical trend tracking
              </li>
            </ul>
          </div>

          {/* Salary Benchmarking */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-emerald-400" />
              <h3 className="text-xl font-bold">Salary Benchmarking</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Access anonymized contract data and salary benchmarks. Know market rates for your client&apos;s skill level and negotiate fair compensation confidently.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                Anonymized contract and salary database
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                Market rate analysis by role and skill
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                Trend analysis and salary growth projections
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                Competitive intelligence reports
              </li>
            </ul>
          </div>

          {/* Prospect Scouting */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-teal-400" />
              <h3 className="text-xl font-bold">Prospect Scouting</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Discover rising talent before competitors. Search riders by performance, trending metrics, breakout potential, and upcoming availability.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                Advanced rider search and filtering
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                Breakout potential scoring
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                Contract expiration tracking
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                Saved prospect lists and alerts
              </li>
            </ul>
          </div>

          {/* Contract Intelligence */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-bold">Contract Intelligence</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Track team spending, identify contract deadlines, monitor competitor signings, and build your own contract portfolio with confidence.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                Contract deadline tracking
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                Team spending analysis
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                Competitor monitoring
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                Contract portfolio management
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Close bigger deals.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">{formatPricingDisplay('agent')} Percentile ranking, salary benchmarking, prospect scouting, and contract intelligence.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/checkout/tier?tier=agent"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/agent/demo"
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
