'use client'

import Link from 'next/link'
import { ArrowLeft, BarChart3, TrendingUp, Brain, Trophy, CheckCircle } from 'lucide-react'

export default function PrivateerDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Back button */}
      <div className="px-8 py-6 max-w-6xl mx-auto">
        <Link
          href="/privateer"
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition text-sm font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Privateer
        </Link>
      </div>

      {/* Hero */}
      <section className="px-8 py-12 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Inside The <span className="text-orange-400">Privateer Platform</span>
        </h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          A deep dive into every feature that makes serious solo riders faster. From telemetry capture to AI coaching to building your racing resume.
        </p>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-6xl mx-auto space-y-16">
        {/* Feature 1: Full Telemetry */}
        <div className="border-l-4 border-orange-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-orange-400" />
            <div>
              <h2 className="text-2xl font-black">Full Telemetry Capture</h2>
              <p className="text-zinc-500 text-sm mt-1">20+ channels at 1ms resolution</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Every ride is logged with complete telemetry: throttle %, brake pressure, lean angle, G-force, RPM, speed, suspension travel, tire temperature, and more. Video synced frame-by-frame with data overlay.
          </p>

          {/* Example data table */}
          <div className="bg-black border border-zinc-800 rounded overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-950 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Live Session Data</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {[
                { label: 'Throttle', value: '87%', color: 'text-orange-400' },
                { label: 'Brake Force', value: '1,240 N', color: 'text-red-400' },
                { label: 'Lean Angle', value: '62.4°', color: 'text-blue-400' },
                { label: 'Lateral G', value: '1.92g', color: 'text-yellow-400' },
                { label: 'Speed', value: '156 mph', color: 'text-lime-400' },
                { label: 'Engine Temp', value: '92°C', color: 'text-amber-400' },
              ].map((item) => (
                <div key={item.label} className="px-4 py-2.5 flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className={item.color}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Lap-by-lap comparison with delta analysis',
              'Sector-level performance breakdown',
              'Video overlay with real-time telemetry',
              'Export CSV for external analysis',
              'Share clips with coaches or friends',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 2: AI Coaching */}
        <div className="border-l-4 border-amber-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-amber-400" />
            <div>
              <h2 className="text-2xl font-black">AI Coaching Insights</h2>
              <p className="text-zinc-500 text-sm mt-1">Personalized analysis within 5 minutes</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            After every session, AI analyzes your riding and generates a personalized coaching report highlighting your strengths, improvement areas, and specific lap-by-lap feedback.
          </p>

          {/* Example insight card */}
          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-amber-400">Session Analysis: Utah Motorsports Campus</p>
            <div className="space-y-3 text-sm text-zinc-300">
              <div>
                <p className="font-bold text-zinc-100 mb-1">Strength: Throttle Control</p>
                <p className="text-zinc-400">Your exit throttle modulation through Turns 6-8 is reference quality. Consistent progressive application gained 0.3s vs average.</p>
              </div>
              <div>
                <p className="font-bold text-zinc-100 mb-1">Focus Area: Braking Zone</p>
                <p className="text-zinc-400">Brake pressure spikes early on Turn 2. Try earlier entry point (-15ft) to allow smoother pressure application.</p>
              </div>
              <div>
                <p className="font-bold text-zinc-100 mb-1">Opportunity: Trail Braking</p>
                <p className="text-zinc-400">Experiment with 30% brake still on entry to Turn 10. Reference lap from Lap 7 shows -0.2s potential.</p>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Automatic insights after every session',
              'Benchmark vs your personal best and competitors',
              'Multi-session trend detection and progress tracking',
              'Video highlights with telemetry overlay',
              'Downloadable coaching reports',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 3: Setup Optimization */}
        <div className="border-l-4 border-yellow-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-black">Setup Optimization</h2>
              <p className="text-zinc-500 text-sm mt-1">A/B test setups with data-backed results</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Log every setup change and immediately see the telemetry impact. Build a searchable setup library organized by track, season, and conditions. Compare lap times across setup variations.
          </p>

          {/* Example setup comparison */}
          <div className="bg-black border border-zinc-800 rounded overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-950 flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Setup A/B Comparison</span>
            </div>
            <div className="divide-y divide-zinc-800">
              <div className="px-4 py-3 grid grid-cols-3 gap-4 font-mono text-xs bg-zinc-950">
                <span className="text-zinc-500">Parameter</span>
                <span className="text-orange-400">Setup A</span>
                <span className="text-amber-400">Setup B (−0.24s)</span>
              </div>
              {[
                { param: 'Front Spring', a: '48N/mm', b: '51N/mm' },
                { param: 'Rear Spring', a: '52N/mm', b: '54N/mm' },
                { param: 'Tire Pressure (F)', a: '28 psi', b: '27 psi' },
                { param: 'Brake Bias', a: '56%', b: '54%' },
              ].map((row) => (
                <div key={row.param} className="px-4 py-2.5 grid grid-cols-3 gap-4 font-mono text-xs">
                  <span className="text-zinc-400">{row.param}</span>
                  <span className="text-zinc-300">{row.a}</span>
                  <span className="text-zinc-300">{row.b}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Track-specific setup templates',
              'Session-by-session setup logging',
              'Historical setup library searchable by conditions',
              'Temperature & grip notes per session',
              'Portable across multiple bikes',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 4: Racing Resume */}
        <div className="border-l-4 border-lime-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-lime-400" />
            <div>
              <h2 className="text-2xl font-black">Racing Resume Builder</h2>
              <p className="text-zinc-500 text-sm mt-1">Share your achievements with one link</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Automatically generate a professional public racing profile showing your results, fastest laps, win records, progression, and video highlights. Share with sponsors, teams, or coaches.
          </p>

          {/* Example profile preview */}
          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <div className="space-y-2">
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Public Profile URL</p>
              <p className="font-mono text-sm text-lime-400 break-all">motorsportsdata.io/rider/jordan-chen</p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
              <div className="text-center">
                <p className="text-2xl font-black text-lime-400">12</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-amber-400">38</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase">Podiums</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-blue-400">1:42.3</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase">Track Record</p>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Auto-generated stats from your sessions',
              'Public shareable profile with custom URL',
              'Video highlights and lap records',
              'Season summaries and progression charts',
              'Downloadable PDF professional resume',
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
            <h2 className="text-3xl font-black mb-4">Ready to start tracking?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">$79/month. Full telemetry, AI coaching, setup tracking, and racing resume. Cancel anytime.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/data/checkout?plan=privateer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-black font-bold rounded hover:bg-orange-400 transition"
            >
              Get Started Now
            </a>
            <Link
              href="/privateer"
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
