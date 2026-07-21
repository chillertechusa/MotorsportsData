import { ArrowRight, Lock, Database, Zap, CheckCircle, Share2, Cloud } from 'lucide-react'
import Link from 'next/link'
import { formatPricingDisplay } from '@/lib/md-plans'

export const metadata = {
  title: 'Free Rider | Motorsport Data',
  description: 'Track every lap for free. Unlimited logging, data ownership, and cloud storage. No paywall, no ads, forever free.',
  alternates: { canonical: 'https://motorsportsdata.io/rookie' },
}

export default function RookiePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Hero */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Log Every Ride. <span className="text-lime-400">Forever Free.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Unlimited lap logging, unlimited data storage, complete data ownership. No paywall. No ads. No catch. Everything you track belongs to you.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/rookie/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition"
          >
            See What You Get <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="mailto:support@motorsportsdata.io"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
          >
            Questions? Email Us
          </a>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-8 py-16 max-w-6xl mx-auto border-t border-zinc-800">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-8">Why riders choose free rider</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-3xl font-black text-lime-400">100%</p>
            <p className="text-sm text-zinc-400">Your Data</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-green-400">Unlimited</p>
            <p className="text-sm text-zinc-400">Logged Sessions</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-emerald-400">Unlimited</p>
            <p className="text-sm text-zinc-400">Cloud Storage</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-teal-400">$0</p>
            <p className="text-sm text-zinc-400">Forever</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto space-y-12">
        <div>
          <h2 className="text-4xl font-black mb-4">Everything a Rider Needs</h2>
          <p className="text-zinc-400 max-w-2xl">Start tracking your progress today. Upgrade later if you want more.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Unlimited Logging */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-lime-400" />
              <h3 className="text-xl font-bold">Unlimited Logging</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Log every single lap you ever ride. No limits, no throttling. Track practice sessions, race days, track days, street sessions—all stored permanently in the cloud with zero cost.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Unlimited sessions & unlimited storage
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Never lose a lap to storage limits
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Auto-backup to cloud (no setup needed)
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                Access from any device, anywhere
              </li>
            </ul>
          </div>

          {/* Complete Data Ownership */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-bold">Complete Data Ownership</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Your data is yours and yours alone. We don't sell it, profile you, or lock you in. Export everything anytime. Delete your account and your data goes with it.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                Export CSV anytime, no questions asked
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                No tracking, no ads, no algorithms
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                Encrypted at rest (AES-256)
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                Delete account = delete all data instantly
              </li>
            </ul>
          </div>

          {/* Basic Session Tools */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-emerald-400" />
              <h3 className="text-xl font-bold">Basic Session Tools</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Simple but powerful: log session details, track your personal bests, organize by date and track, view session summaries, and export for external analysis.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                Manual lap logging with time & notes
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                Personal best tracking per track
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                Session summaries & stats
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                Track database with 100+ major circuits
              </li>
            </ul>
          </div>

          {/* Cloud Sync */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Cloud className="h-6 w-6 text-teal-400" />
              <h3 className="text-xl font-bold">Cloud Sync Across Devices</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Log from your phone trackside, review on your laptop at home, share with your crew on the web. Everything syncs in real-time across all your devices.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                iOS, Android, and web apps included
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                Real-time sync across devices
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                Offline mode (sync when you reconnect)
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                No app limits or seat licenses
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Upgrade Path */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800 space-y-12">
        <div>
          <h2 className="text-3xl font-black mb-4">Start Free. Upgrade When You&apos;re Ready.</h2>
          <p className="text-zinc-400">Everything in Free Rider stays free. Upgrade to Privateer or higher tier for AI coaching, telemetry, and setup tracking whenever you want.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-sm">
          {[
            {
              title: 'Privateer',
              price: '$79/mo',
              features: ['Everything in Free Rider', 'Full telemetry capture', 'AI coaching insights', 'Setup tracking'],
              cta: 'Upgrade to Privateer',
            },
            {
              title: 'Coach',
              price: '$249/mo',
              features: ['Everything in Privateer', 'Cross-team access', 'Multi-rider coaching', 'IP Vault protection'],
              cta: 'Upgrade to Coach',
            },
            {
              title: 'Agent',
              price: '$999/mo',
              features: ['Everything in Coach', 'Contract negotiation', 'Prospect scouting', 'Percentile ranking'],
              cta: 'Upgrade to Agent',
            },
          ].map((tier) => (
            <div key={tier.title} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-zinc-500 text-xs uppercase font-bold mb-1">{tier.title}</p>
                <p className="text-2xl font-black text-zinc-100">{tier.price}</p>
              </div>
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2 text-zinc-400 text-xs">
                    <CheckCircle className="h-3 w-3 text-lime-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={`/checkout/tier?tier=${tier.title.toLowerCase()}`}
                className="block text-center px-4 py-2 border border-zinc-700 rounded text-xs font-bold hover:border-zinc-500 transition"
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Start logging for free today.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">No credit card required. No ads. No strings attached. Your data is yours.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/data/sign-in?mode=sign-up&redirect=/data"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition"
            >
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/rookie/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
            >
              See Full Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
