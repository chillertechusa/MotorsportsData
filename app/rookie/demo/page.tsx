'use client'

import Link from 'next/link'
import { ArrowLeft, Database, Lock, Zap, Cloud, CheckCircle } from 'lucide-react'

export default function RookieDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Back button */}
      <div className="px-8 py-6 max-w-6xl mx-auto">
        <Link
          href="/rookie"
          className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-300 transition text-sm font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Free Rider
        </Link>
      </div>

      {/* Hero */}
      <section className="px-8 py-12 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Inside Free <span className="text-lime-400">Rider</span>
        </h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          Everything you need to start logging your riding career. Unlimited logging, complete data ownership, cloud sync across devices.
        </p>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-6xl mx-auto space-y-16">
        {/* Feature 1: Unlimited Logging */}
        <div className="border-l-4 border-lime-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-lime-400" />
            <div>
              <h2 className="text-2xl font-black">Unlimited Logging</h2>
              <p className="text-zinc-500 text-sm mt-1">Never run out of space or sessions</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Log as many sessions as you want, whenever you want. Track practice laps, race days, track days, street sessions. Everything is stored permanently in the cloud with zero cost and zero limits.
          </p>

          {/* Example session list */}
          <div className="bg-black border border-zinc-800 rounded overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-950 flex items-center gap-2">
              <Database className="h-4 w-4 text-lime-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Your Sessions</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {[
                { date: 'Today', track: 'Utah Motorsports Campus', laps: 47, time: '2h 14m' },
                { date: 'Yesterday', track: 'Miller Motorsports Park', laps: 52, time: '3h 08m' },
                { date: 'Jul 10', track: 'Thunderhill Raceway', laps: 38, time: '1h 52m' },
                { date: 'Jul 8', track: 'Laguna Seca', laps: 61, time: '2h 47m' },
                { date: 'Jul 6', track: 'Sonoma Raceway', laps: 44, time: '2h 21m' },
              ].map((s) => (
                <div key={`${s.date}-${s.track}`} className="px-4 py-3 flex items-center justify-between text-sm font-mono">
                  <div className="flex-1">
                    <p className="text-zinc-300">{s.track}</p>
                    <p className="text-zinc-500 text-xs">{s.date}</p>
                  </div>
                  <div className="text-right text-zinc-400">
                    <p className="text-lime-400 font-bold">{s.laps} laps</p>
                    <p className="text-xs">{s.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Unlimited sessions across all tracks',
              'Unlimited cloud storage (no throttling)',
              'Auto-backup and recovery',
              'Never lose a lap to storage limits',
              'All data persists even if you upgrade or downgrade',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-lime-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 2: Data Ownership */}
        <div className="border-l-4 border-green-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-green-400" />
            <div>
              <h2 className="text-2xl font-black">100% Data Ownership</h2>
              <p className="text-zinc-500 text-sm mt-1">Your data is yours and only yours</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            We believe in data privacy. Your sessions, notes, and stats are encrypted and belong to you completely. Export anytime. Delete and it's gone. No tracking, no profiling, no selling.
          </p>

          {/* Privacy features */}
          <div className="space-y-4">
            {[
              {
                title: 'Export Anytime',
                desc: 'Download your entire riding history as CSV. No restrictions, no DRM.',
              },
              {
                title: 'No Tracking',
                desc: 'We don&apos;t track you, profile you, or sell your data to third parties.',
              },
              {
                title: 'Encrypted at Rest',
                desc: 'Your data is encrypted with AES-256 and stored securely.',
              },
              {
                title: 'Delete Everything',
                desc: 'Delete your account and all your data is permanently removed within 24 hours.',
              },
            ].map((f) => (
              <div key={f.title} className="border border-zinc-800 bg-black rounded p-4">
                <p className="text-green-400 font-bold text-sm mb-1">{f.title}</p>
                <p className="text-zinc-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-2">
            {[
              'AES-256 encryption in transit and at rest',
              'No third-party data sharing',
              'No ads, no algorithms, no targeting',
              'GDPR & CCPA compliant',
              'Transparent privacy policy',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 3: Session Tracking */}
        <div className="border-l-4 border-emerald-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-emerald-400" />
            <div>
              <h2 className="text-2xl font-black">Session Tracking Tools</h2>
              <p className="text-zinc-500 text-sm mt-1">Simple powerful logging</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Log manually or sync from devices. Record lap times, personal bests, track conditions, bike setup, and notes. View trends, organize by track, and see your progress over time.
          </p>

          {/* Example form */}
          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-emerald-400">New Session</p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-zinc-500 text-xs uppercase mb-1">Track</p>
                <p className="text-zinc-300 font-mono">Utah Motorsports Campus</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase mb-1">Date</p>
                <p className="text-zinc-300 font-mono">July 13, 2026</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase mb-1">Laps</p>
                <p className="text-zinc-300 font-mono">47</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase mb-1">Best Lap</p>
                <p className="text-emerald-400 font-mono font-bold">1:43.2</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase mb-1">Notes</p>
                <p className="text-zinc-400 text-xs">Great grip today. Brake zone felt confident. Trying new line through turn 3.</p>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Manual lap time entry with stopwatch',
              'Personal best tracking per track',
              'Session notes and conditions logging',
              'Track database with 100+ circuits',
              'Organize and filter by date, track, or bike',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 4: Cloud Sync */}
        <div className="border-l-4 border-teal-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Cloud className="h-8 w-8 text-teal-400" />
            <div>
              <h2 className="text-2xl font-black">Cloud Sync Across Devices</h2>
              <p className="text-zinc-500 text-sm mt-1">Log on your phone, review on your laptop</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Log sessions on your phone at the track, review detailed stats on your laptop at home, share with your crew on the web. Everything syncs automatically in real-time.
          </p>

          {/* Device sync diagram */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'iPhone', icon: '📱', status: 'Synced now' },
              { name: 'Laptop', icon: '💻', status: 'Synced 2m ago' },
              { name: 'Web', icon: '🌐', status: 'Synced now' },
            ].map((d) => (
              <div key={d.name} className="border border-zinc-800 bg-black rounded p-4 text-center space-y-2">
                <p className="text-2xl">{d.icon}</p>
                <p className="text-sm font-bold text-zinc-100">{d.name}</p>
                <p className="text-xs text-teal-400 font-mono">{d.status}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-2">
            {[
              'iOS, Android, and web apps all included',
              'Real-time cloud sync between devices',
              'Offline mode for logging without internet',
              'No seat licenses or device limits',
              'Works on as many devices as you own',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Upgrade CTA */}
      <section className="px-8 py-16 max-w-6xl mx-auto border-t border-zinc-800 space-y-8">
        <div>
          <h2 className="text-2xl font-black mb-3">Want more power?</h2>
          <p className="text-zinc-400">Everything in Free Rider stays free. Upgrade to Privateer ($79/mo) for AI coaching, full telemetry, and setup tracking.</p>
        </div>
        <a
          href="/data/checkout?plan=privateer"
          className="inline-block px-6 py-3 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition"
        >
          Explore Privateer
        </a>
      </section>

      {/* CTA Footer */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Ready to start?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Create your free account now. Unlimited logging, unlimited storage. Forever free.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/data/sign-in?mode=sign-up&redirect=/data"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition"
            >
              Start Free Today
            </Link>
            <Link
              href="/rookie"
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
