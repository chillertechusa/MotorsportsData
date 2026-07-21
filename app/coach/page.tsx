import { ArrowRight, Lock, TrendingUp, Users, Zap, CheckCircle, Shield } from 'lucide-react'
import Link from 'next/link'
import { formatPricingDisplay } from '@/lib/md-plans'

export const metadata = {
  title: 'Elite Trainer Platform | Motorsport Data',
  description: 'IP protection, readiness prediction, and real-time multi-rider telemetry for professional coaching teams.',
  alternates: { canonical: 'https://motorsportsdata.io/coach' },
}

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Hero */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Your Methods. <span className="text-lime-400">Protected.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Elite coaching platform that locks in your proprietary training methods, predicts peak performance with science-backed readiness scoring, and gives you real-time visibility into every rider's training load and recovery.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/data/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition"
          >
            See Demo Now <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="mailto:coaches@motorsportsdata.io"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
          >
            Schedule Call
          </a>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-8 py-16 max-w-6xl mx-auto border-t border-zinc-800">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-8">Built for championship teams</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-3xl font-black text-lime-400">100%</p>
            <p className="text-sm text-zinc-400">IP Protected</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-blue-400">24/7</p>
            <p className="text-sm text-zinc-400">Real-Time Data</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-amber-400">Sub-500ms</p>
            <p className="text-sm text-zinc-400">Query Speed</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-orange-400">5+</p>
            <p className="text-sm text-zinc-400">Device Types</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto space-y-12">
        <div>
          <h2 className="text-4xl font-black mb-4">What Makes Us Different</h2>
          <p className="text-zinc-400 max-w-2xl">Built by engineers who understand racing. For coaches who demand precision.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* IP Vault */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-lime-400" />
              <h3 className="text-xl font-bold">IP Vault</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Your periodization schedules, heart-rate zones, and recovery protocols stay locked in the vault. Riders see assignments but cannot export. When they leave the team, access revokes instantly with a timestamped audit log.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                AES-256 encryption at rest
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Proprietary watermark on every view
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Immutable access audit trail
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Instant rider offboarding
              </li>
            </ul>
          </div>

          {/* Readiness Prediction */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-bold">Readiness Prediction</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Guaranteed peak performance on race day. Algorithm fuses sleep data, heart-rate variability, and training load to predict readiness with 85%+ confidence. Automatic taper protocols dial riders in perfectly.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                Sleep + HRV + Volume fusion
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                Dynamic taper protocol
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                Real-time warnings & alerts
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                Wearable integration (Garmin, Polar, Apple Watch)
              </li>
            </ul>
          </div>

          {/* Multi-Rider Telemetry */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-amber-400" />
              <h3 className="text-xl font-bold">Multi-Rider Telemetry</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Overlay 5+ riders simultaneously on a 2D track map. Compare suspension, power, HR, and RPM lap-by-lap. Instantly identify who has the edge and why.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Real-time multi-rider animation
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Lap-by-lap delta comparison
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Export debriefs as PDF
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                Supports all device types
              </li>
            </ul>
          </div>

          {/* Accountability */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold">Accountability Audit</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Push an assignment and riders must tap "I acknowledge" before unlocking it. Post-ride telemetry auto-compares to the assignment. Non-compliance is flagged red immediately.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Digital assignment acknowledgment
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Automatic compliance verification
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                Immutable audit log with timestamps
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                One-click red-flag reporting
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* White-Glove Support */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-black">White-Glove Support</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">
              Elite coaching teams deserve elite support. We iterate at racing speed — need a new metric by Thursday? It's live Tuesday.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-lime-400 mt-1 flex-shrink-0" />
                <p className="text-sm"><strong>Dedicated coach coordinator.</strong> Weekly strategy calls, rapid feature iteration, custom metrics on demand.</p>
              </div>
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-lime-400 mt-1 flex-shrink-0" />
                <p className="text-sm"><strong>99.9% SLA during race season.</strong> Zero tolerance for downtime when it matters.</p>
              </div>
              <div className="flex gap-3">
                <Zap className="h-5 w-5 text-lime-400 mt-1 flex-shrink-0" />
                <p className="text-sm"><strong>Agile feature development.</strong> We ship improvements every sprint, not every quarter.</p>
              </div>
            </div>
          </div>
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-6">
            <h3 className="text-2xl font-bold">Typical Coach Outcome</h3>
            <div className="space-y-4 text-sm text-zinc-300">
              <p>
                <strong className="text-lime-300">Week 1:</strong> Upload first rider's telemetry. See readiness score, peak probability, and taper protocol.
              </p>
              <p>
                <strong className="text-lime-300">Week 2:</strong> Multi-rider comparison shows which riders are responding to training load. Adjust protocols.
              </p>
              <p>
                <strong className="text-lime-300">Week 3:</strong> First race weekend. Real-time multi-rider telemetry during competition. Post-race debrief with data.
              </p>
              <p>
                <strong className="text-lime-300">Ongoing:</strong> Every rider peaked on race day. Your proprietary methods are documented, locked, and duplicatable across a team of unlimited riders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800 text-center space-y-8">
        <div>
          <h2 className="text-4xl font-black mb-4">Ready to Peak Every Race?</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Elite trainers in multiple disciplines are already using Motorsport Data to guarantee peak performance and protect their intellectual property.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/data/demo"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-500 text-black font-bold rounded text-lg hover:bg-lime-400 transition"
          >
            See Demo <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="mailto:coaches@motorsportsdata.io"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-lime-500 text-lime-400 font-bold rounded text-lg hover:bg-lime-500 hover:text-black transition"
          >
            Schedule a Call
          </a>
        </div>

        <p className="text-sm text-zinc-500">
          Built for factory teams, discipline-agnostic. Works for Motocross, SX, Enduro, FMX, Flat Track, and any motorsport where peak performance matters.
        </p>
      </section>

      {/* Footer Note */}
      <section className="px-8 py-12 max-w-6xl mx-auto border-t border-zinc-800 text-center text-xs text-zinc-600">
        <p>Motorsport Data — The OS for Two Wheels.</p>
      </section>
    </div>
  )
}
