'use client'

import { BookOpen, Wrench, Users, Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  const guides = [
    {
      icon: Wrench,
      title: 'Bike Troubleshooting',
      description: 'Common issues and how to diagnose them',
      topics: [
        'Won\'t start? Fuel, spark, compression checks',
        'Hard to turn? Handlebar position, grip diameter',
        'Pulls to one side? Brake drag, tire pressure',
        'Bogging on throttle? Jetting, fuel delivery',
        'Overheating? Coolant, thermostat, airflow',
      ],
    },
    {
      icon: BookOpen,
      title: 'Setup by Bike Model',
      description: 'Factory specs and tuning ranges',
      topics: [
        'Honda CRF450R — Clutch, jetting, suspension',
        'Yamaha YZ450F — Power valve, fuel maps, sag',
        'KTM 450SXF — Mapping, linkage, air temp',
        'Suzuki RMZ450 — Cooling, power curve, brakes',
        'Kawasaki KX450 — Shifting, low-end feel, mods',
      ],
    },
    {
      icon: Users,
      title: 'Coaching Tools',
      description: 'Managing athlete data and progress',
      topics: [
        'Inviting riders — Share read-only access',
        'Tracking readiness — Monitor injury status',
        'Setup analysis — Compare riders\' notes',
        'Progress trends — Lap times, event history',
        'Scheduling — Race calendar + training days',
      ],
    },
    {
      icon: Lightbulb,
      title: 'Pro Tips',
      description: 'Maximize your Bike Doctor experience',
      topics: [
        'Log every session — Even practice helps AI learn',
        'Update setup notes — AI improves with context',
        'Share photos — Frame kit mods, damage details',
        'Invite your mechanic — They can see your notes',
        'Use track conditions — Altitude, temp, moisture',
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">Help Center</h1>
          <p className="text-lg text-zinc-400">
            Learn how to get the most out of Bike Doctor
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {guides.map((guide, idx) => {
            const Icon = guide.icon
            return (
              <div
                key={idx}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hover:border-lime-400/50 transition-colors"
              >
                <Icon className="h-8 w-8 text-lime-400 mb-3" />
                <h3 className="font-bold text-zinc-100 mb-2">{guide.title}</h3>
                <p className="text-sm text-zinc-400 mb-4">{guide.description}</p>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {guide.topics.map((topic, topicIdx) => (
                    <li key={topicIdx} className="flex items-start gap-2">
                      <span className="text-lime-400 mt-1">→</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Maintenance Schedule */}
        <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-lime-400 mb-6">Maintenance Schedule by Hours</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-zinc-100 mb-3">Every 5 Hours</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ Check air filter (clean/replace if needed)</li>
                <li>✓ Inspect chain tension</li>
                <li>✓ Look for fuel leaks</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 mb-3">Every 20 Hours</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ Change air filter</li>
                <li>✓ Inspect brake pads</li>
                <li>✓ Check fork oil level</li>
                <li>✓ Inspect tire wear</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 mb-3">Every 50 Hours</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ Replace spark plug(s)</li>
                <li>✓ Check valve clearance (4-stroke)</li>
                <li>✓ Inspect suspension seals</li>
                <li>✓ Deep clean carb</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-zinc-400 mb-6">
            Still need help? Contact us or check the FAQ
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/faq"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 rounded-lg transition-colors"
            >
              View FAQ
            </Link>
            <a
              href="mailto:support@bikedoctor.io"
              className="px-6 py-3 bg-lime-500 hover:bg-lime-600 text-black font-bold rounded-lg transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
