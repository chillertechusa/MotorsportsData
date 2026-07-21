import { ArrowRight, TrendingUp, BarChart3, Zap, CheckCircle, Trophy, Brain, Target } from 'lucide-react'
import Link from 'next/link'
import { formatPricingDisplay } from '@/lib/md-plans'

export const metadata = {
  title: 'Solo Rider Platform | Motorsport Data',
  description: 'Track every lap, own your data. Full telemetry, AI coaching, and performance analytics for serious solo riders.',
  alternates: { canonical: 'https://motorsportsdata.io/privateer' },
}

export default function PrivateerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Hero */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Track Every Lap. <span className="text-orange-400">Own Your Data.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Complete telemetry capture, AI-powered coaching insights, setup optimization tracking, and a racing resume that travels with you. Everything solo riders need to go from good to championship-level.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/privateer/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-black font-bold rounded hover:bg-orange-400 transition"
          >
            See Demo Now <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="mailto:riders@motorsportsdata.io"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
          >
            Schedule Call
          </a>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="px-8 py-16 max-w-6xl mx-auto border-t border-zinc-800">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-8">Built for the independent rider</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-3xl font-black text-lime-400">Unlimited</p>
            <p className="text-sm text-zinc-400">Sessions &amp; setup logs</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-zinc-100">Lap Data</p>
            <p className="text-sm text-zinc-400">Track every session</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-emerald-400">AI Co-Pilot</p>
            <p className="text-sm text-zinc-400">Setup &amp; race-day guidance</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-zinc-100">100%</p>
            <p className="text-sm text-zinc-400">You own your data</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto space-y-12">
        <div>
          <h2 className="text-4xl font-black mb-4">Everything You Need to Win</h2>
          <p className="text-zinc-400 max-w-2xl">Built by riders, for riders who take their performance seriously.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Full Telemetry */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold">Full Telemetry Capture</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Every throttle input, brake pressure, lean angle, and G-force from every lap. Visualize your performance with lap-by-lap comparison, sector analysis, and delta maps showing exactly where you&apos;re losing time.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                20+ telemetry channels per session
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                1ms resolution data logging
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Real-time visualization on track
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Export CSV/video for analysis
              </li>
            </ul>
          </div>

          {/* AI Coaching */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-amber-400" />
              <h3 className="text-xl font-bold">AI Coaching Insights</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              AI analyzes every session and generates actionable recommendations. Identify braking points, cornering technique, throttle control patterns, and recovery priorities—personalized to your riding style.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Automatic session insights within 5min
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Benchmark vs personal bests and peers
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Multi-session trend detection
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Video overlay with telemetry sync
              </li>
            </ul>
          </div>

          {/* Setup Tracking */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-400" />
              <h3 className="text-xl font-bold">Setup Optimization</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Log every setup change—suspension, gearing, tire pressure—and see the impact on lap time and handling immediately. Build a setup library organized by track and conditions.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Setup templates for every track
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                A/B comparison on suspension changes
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Temperature & grip condition logging
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                Portable setup notes across bikes
              </li>
            </ul>
          </div>

          {/* Racing Resume */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-lime-400" />
              <h3 className="text-xl font-bold">Racing Resume Builder</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Automatically generate a professional racing resume showing results, fastest laps, win records, and progression across seasons. Share with sponsors, teams, or coaches with one link.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Auto-generated stats & highlights
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Shareable public profile URL
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Video clips & lap records
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Downloadable PDF resume
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Ready to go pro?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Start tracking like a championship-level rider today. {formatPricingDisplay('privateer')} Cancel anytime.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/checkout/tier?tier=privateer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-black font-bold rounded hover:bg-orange-400 transition"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/privateer/demo"
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
