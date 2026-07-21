import { ArrowRight, Wrench as WrenchIcon, TrendingUp, BarChart3, Award, CheckCircle, Zap } from 'lucide-react'
import Link from 'next/link'
import { formatPricingDisplay } from '@/lib/md-plans'

export const metadata = {
  title: 'Professional Mechanic Portfolio | Motorsport Data',
  description: 'Build your career reputation with data-backed setup optimization. Track every delta, own your moat.',
  alternates: { canonical: 'https://motorsportsdata.io/wrench' },
}

export default function WrenchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Hero */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Your Career. <span className="text-orange-400">Your Data.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Professional mechanics build legacies through setup optimization. Track every delta, document your innovations, and build an exportable portfolio that travels with you team to team. That's your moat.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <a
            href="/checkout/tier?tier=wrench"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded hover:bg-orange-400 transition"
          >
            Get Started Now <ArrowRight className="h-5 w-5" />
          </a>
          <Link
            href="/wrench/demo"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
          >
            See Full Demo
          </Link>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="px-8 py-16 max-w-6xl mx-auto border-t border-zinc-800">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-8">Built for professional mechanics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-3xl font-black text-lime-400">100%</p>
            <p className="text-sm text-zinc-400">Yours to export</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-zinc-100">Setup Deltas</p>
            <p className="text-sm text-zinc-400">Track every change</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-emerald-400">Portable</p>
            <p className="text-sm text-zinc-400">Career history follows you</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-zinc-100">Verified</p>
            <p className="text-sm text-zinc-400">Build a proven track record</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto space-y-12">
        <div>
          <h2 className="text-4xl font-black mb-4">What Makes a Great Mechanic</h2>
          <p className="text-zinc-400 max-w-2xl">Data-backed setup optimization. Documented results. Portable portfolio.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Delta Tracking */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold">Delta Tracking</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Every setup change is logged with before/after telemetry. Suspension geometry, tire pressures, gearing—track what matters. Build a data-backed portfolio that proves your impact on lap time.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Automatic delta calculation
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Side-by-side telemetry comparison
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Notes + photos per setup iteration
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Time-series delta analytics
              </li>
            </ul>
          </div>

          {/* Career Portfolio */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-amber-400" />
              <h3 className="text-xl font-bold">Career Portfolio</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Your Motorsport Data profile is your professional resume. Export PDFs of your best work. Prove your setup expertise with real telemetry. Move teams without losing your data—your moat follows you.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Exportable work samples
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                5-year career timeline
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Public profile + private archive
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Share with team owners
              </li>
            </ul>
          </div>

          {/* Multi-Bike Analytics */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-yellow-400" />
              <h3 className="text-xl font-bold">Multi-Bike Analytics</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Compare suspension and setup changes across multiple bikes and riders. Identify patterns in what works. Build a knowledge base that makes you invaluable to any team.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Cross-bike setup comparison
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Suspension effectiveness scoring
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Custom reports per rider
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Setup playbook builder
              </li>
            </ul>
          </div>

          {/* Professional Tools */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-orange-300" />
              <h3 className="text-xl font-bold">Professional Tools</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Real-time telemetry during test sessions. Instant setup optimization recommendations. API access for custom integrations with your workshop tools.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-300 mt-0.5 flex-shrink-0" />
                Live setup delta scoring
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-300 mt-0.5 flex-shrink-0" />
                AI setup recommendations
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-300 mt-0.5 flex-shrink-0" />
                API access & webhooks
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-300 mt-0.5 flex-shrink-0" />
                Unlimited team collaboration
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing + CTA Footer */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Ready to own your data?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">{formatPricingDisplay('wrench')} Professional mechanic portfolio. Move teams. Own your moat.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/checkout/tier?tier=wrench"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold rounded hover:bg-orange-400 transition"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/wrench/demo"
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
