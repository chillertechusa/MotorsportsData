'use client'

import { useState, useEffect, useMemo } from 'react'
import { getFeatureStatus } from '@/lib/api-availability'
import Link from 'next/link'
import {
  Bike, Wrench, Trophy, Video, Sparkles, Users, DollarSign,
  Heart, Brain, AlertTriangle, Zap, MapPin, Truck, Calendar,
  Clock, Shield, Radio, Dumbbell, Package, Settings, Share2,
  CheckCircle2, BarChart3, Code, Map
} from 'lucide-react'

const FEATURES = [
  {
    id: 1,
    title: 'Training Progression',
    description: 'Track every ride with telemetry, lap times, and fitness metrics across weeks.',
    icon: Bike,
    color: 'from-sky-500/20 to-sky-500/5',
    accent: 'sky',
  },
  {
    id: 2,
    title: 'Readiness Score + HRV',
    description: 'AI-powered daily readiness prediction from sleep, heart rate, and volume.',
    icon: Heart,
    color: 'from-red-500/20 to-red-500/5',
    accent: 'red',
  },
  {
    id: 3,
    title: 'Live Race Telemetry',
    description: 'Real-time GPS lap timing, speed traces, and live pit callouts during races.',
    icon: Radio,
    color: 'from-lime-500/20 to-lime-500/5',
    accent: 'lime',
  },
  {
    id: 4,
    title: 'Multi-Rider Overlay',
    description: 'Compare side-by-side lap data across your entire team.',
    icon: Users,
    color: 'from-amber-500/20 to-amber-500/5',
    accent: 'amber',
  },
  {
    id: 5,
    title: 'Mechanic Work Orders',
    description: 'Assign bike work, track completion, and build mechanic portfolios.',
    icon: Wrench,
    color: 'from-orange-500/20 to-orange-500/5',
    accent: 'orange',
  },
  {
    id: 6,
    title: 'Coach IP Vault',
    description: 'Encrypted setup templates with immutable audit trails.',
    icon: Shield,
    color: 'from-violet-500/20 to-violet-500/5',
    accent: 'violet',
  },
  {
    id: 7,
    title: 'Live Leaderboard',
    description: 'Real-time multiplayer racing with strategy callout chips.',
    icon: Trophy,
    color: 'from-yellow-500/20 to-yellow-500/5',
    accent: 'yellow',
  },
  {
    id: 8,
    title: 'Factory Rig AI',
    description: 'Class 8 diesel maintenance, DOT compliance, PM scheduling.',
    icon: Truck,
    color: 'from-cyan-500/20 to-cyan-500/5',
    accent: 'cyan',
  },
  {
    id: 9,
    title: 'MD Intel Search',
    description: 'Ask your AI crew chief any setup question from your R&D archive.',
    icon: Sparkles,
    color: 'from-lime-500/20 to-lime-500/5',
    accent: 'lime',
  },
  {
    id: 10,
    title: 'Video Analysis',
    description: 'Upload session footage and get timestamped coaching feedback.',
    icon: Video,
    color: 'from-pink-500/20 to-pink-500/5',
    accent: 'pink',
  },
  {
    id: 11,
    title: 'Session Comparison',
    description: 'Side-by-side lap analysis with suspension delta metrics.',
    icon: Map,
    color: 'from-blue-500/20 to-blue-500/5',
    accent: 'blue',
  },
  {
    id: 12,
    title: 'Setup AI Recommender',
    description: 'Get specific suspension clicks based on conditions and riding style.',
    icon: Settings,
    color: 'from-indigo-500/20 to-indigo-500/5',
    accent: 'indigo',
  },
  {
    id: 13,
    title: 'Part Vault',
    description: 'Track hours per part, maintenance intervals, and overdue badges.',
    icon: Package,
    color: 'from-purple-500/20 to-purple-500/5',
    accent: 'purple',
  },
  {
    id: 14,
    title: 'Mental Log',
    description: 'Track confidence, focus, and anxiety with AI pattern insights.',
    icon: Brain,
    color: 'from-teal-500/20 to-teal-500/5',
    accent: 'teal',
  },
  {
    id: 15,
    title: 'Injury Log',
    description: 'Severity tracking and return-to-ride timeline management.',
    icon: AlertTriangle,
    color: 'from-red-500/20 to-red-500/5',
    accent: 'red',
  },
  {
    id: 16,
    title: 'Championship Standings',
    description: 'Full points table with gap math and race-by-race breakdown.',
    icon: Trophy,
    color: 'from-amber-500/20 to-amber-500/5',
    accent: 'amber',
  },
  {
    id: 17,
    title: 'Race Schedule',
    description: 'Calendar integration with results, gate times, and travel details.',
    icon: Calendar,
    color: 'from-sky-500/20 to-sky-500/5',
    accent: 'sky',
  },
  {
    id: 18,
    title: 'Accountability Audits',
    description: 'Track assignments: suggested → acknowledged → completed → missed.',
    icon: CheckCircle2,
    color: 'from-green-500/20 to-green-500/5',
    accent: 'green',
  },
  {
    id: 19,
    title: 'Spec Book',
    description: 'Full bike specification tracker with saved setup snapshots.',
    icon: Code,
    color: 'from-slate-500/20 to-slate-500/5',
    accent: 'slate',
  },
  {
    id: 20,
    title: 'Device Integration',
    description: '11+ devices supported: AiM, Garmin, Polar, Apple Watch, RaceBox, etc.',
    icon: Zap,
    color: 'from-yellow-500/20 to-yellow-500/5',
    accent: 'yellow',
  },
  {
    id: 21,
    title: 'Offline/PWA',
    description: 'Access setup sheets in the pits with zero signal.',
    icon: Radio,
    color: 'from-lime-500/20 to-lime-500/5',
    accent: 'lime',
  },
  {
    id: 22,
    title: 'Owner Analytics',
    description: 'Full team compliance dashboard with at-risk rider alerts.',
    icon: BarChart3,
    color: 'from-purple-500/20 to-purple-500/5',
    accent: 'purple',
  },
  {
    id: 23,
    title: 'Disciplines',
    description: 'MX/SX, Enduro, FMX, Flat Track, Rally, Karting, and custom sports.',
    icon: Bike,
    color: 'from-orange-500/20 to-orange-500/5',
    accent: 'orange',
  },
  {
    id: 24,
    title: 'Gear Locker',
    description: 'Safety gear inventory with replacement date reminders.',
    icon: Package,
    color: 'from-rose-500/20 to-rose-500/5',
    accent: 'rose',
  },
  {
    id: 25,
    title: 'Cost Analytics',
    description: 'Track every expense and calculate true cost-per-result.',
    icon: DollarSign,
    color: 'from-green-500/20 to-green-500/5',
    accent: 'green',
  },
]

export default function MdFeatureShowcase() {
  const [selectedId, setSelectedId] = useState<number>(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Dynamically set device integration badge
  const deviceBadge = useMemo(() => {
    const status = getFeatureStatus('terra')
    return status === 'test-bench' ? 'Test Bench' : undefined
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !autoPlay) return
    const timer = setInterval(() => {
      setSelectedId(prev => {
        const next = prev + 1
        return next >= FEATURES.length ? 0 : next
      })
    }, 4000)
    return () => clearInterval(timer)
  }, [autoPlay, mounted])

  const selected = FEATURES[selectedId]
  const SelectedIcon = selected.icon

  return (
    <section id="features" className="bg-zinc-950 py-24 md:py-32 relative overflow-hidden">
      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,230,53,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            &#47;&#47; platform-features
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-6"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            25+ Features. One Unified Platform.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            From session logging to factory fleet management. Every tool built for peak performance.
          </p>
        </div>

        {/* Feature grid + showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Feature list */}
          <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {FEATURES.map((feature, idx) => (
              <button
                key={feature.id}
                onClick={() => {
                  setSelectedId(idx)
                  setAutoPlay(false)
                }}
                className={`w-full text-left px-4 py-3 border transition-all duration-200 ${
                  selectedId === idx
                    ? 'border-lime-400 bg-lime-400/10'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <span className={`font-mono text-xs uppercase tracking-widest ${
                  selectedId === idx ? 'text-lime-400' : 'text-zinc-500'
                }`}>
                  {String(feature.id).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`block text-sm font-semibold ${
                    selectedId === idx ? 'text-zinc-100' : 'text-zinc-400'
                  }`}>
                    {feature.title}
                  </span>
                  {(feature.badge || (feature.id === 20 && deviceBadge)) && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/40 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                      {feature.badge || (feature.id === 20 ? deviceBadge : '')}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Right: Feature showcase */}
          <div className="lg:col-span-2 flex flex-col">
            <div className={`flex-1 rounded-xl border border-zinc-800 bg-gradient-to-br ${selected.color} p-8 flex flex-col justify-between min-h-[600px] overflow-hidden`}>
              {/* Top */}
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                      <SelectedIcon className="h-6 w-6 text-lime-400" />
                    </div>
                    <div>
                      <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Feature</p>
                      <div className="flex items-center gap-2 mt-1">
                        <h3 className="text-2xl font-bold text-zinc-100">{selected.title}</h3>
                  {(selected.badge || (selected.id === 20 && deviceBadge)) && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                      {selected.badge || (selected.id === 20 ? deviceBadge : '')}
                    </span>
                  )}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-2xl font-black text-lime-400/60">{String(selected.id).padStart(2, '0')}</span>
                </div>
                <p className="text-zinc-300 text-lg leading-relaxed max-w-md">{selected.description}</p>
              </div>

              {/* Bottom: Info + CTA */}
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">Available on</p>
                  <div className="flex gap-2">
                    {['Privateer', 'Race Team', 'Factory Rig'].map(tier => (
                      <span key={tier} className="font-mono text-xs text-lime-400 px-2 py-1 border border-lime-400/30 bg-lime-400/5 rounded">
                        {tier}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/data/demo"
                  className="px-5 py-2.5 bg-lime-400 text-zinc-950 font-mono text-xs font-bold uppercase tracking-widest hover:bg-lime-300 transition-colors"
                >
                  See in Action
                </Link>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-zinc-900 rounded overflow-hidden">
              <div
                className="h-full bg-lime-400 transition-all duration-300"
                style={{ width: `${((selectedId ?? 0) + 1) / FEATURES.length * 100}%` }}
              />
            </div>

            {/* Auto-play toggle */}
            <div className="mt-4 flex items-center justify-between">
              <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
                {(selectedId ?? 0) + 1} of {FEATURES.length}
              </p>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                  autoPlay
                    ? 'border-lime-400 text-lime-400'
                    : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                {autoPlay ? '⏸ Auto' : '▶ Auto'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(113, 113, 122, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(113, 113, 122, 0.8);
        }
      `}</style>
    </section>
  )
}
