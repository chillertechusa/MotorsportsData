'use client'

import { useState, useCallback, useMemo } from 'react'
import { getFeatureStatus } from '@/lib/api-availability'
import { useRouter } from 'next/navigation'
import MdLogo from '@/components/md-logo'
import { MD_PLAN_CENTS, MD_PLAN_CENTS_MONTHLY } from '@/lib/md-plans'
import {
  Check,
  Bike,
  Users,
  ClipboardList,
  Boxes,
  Sparkles,
  Infinity as InfinityIcon,
  Radio,
  ShieldCheck,
  Warehouse,
  MapPin,
  Brain,
  HeartPulse,
  Trophy,
  DollarSign,
  Video,
  Activity,
  TrendingUp,
  Truck,
  Wrench,
  Briefcase,
} from 'lucide-react'
import { RookieDemo, PrivateerDemo, RaceTeamDemo, FactoryDemo } from '@/components/tier-feature-demos'

type Billing = 'monthly' | 'annually'


const freeRiderFeatures = [
  { icon: Bike, text: '1 Bike — Maintenance + Hour Tracking' },
  { icon: ClipboardList, text: 'Ride Log — every session, every track' },
  { icon: TrendingUp, text: 'Progression Timeline — every first, saved forever' },
  { icon: HeartPulse, text: 'Injury Log + Concussion / RTR Protocol' },
  { icon: MapPin, text: 'Practice Schedule + Track Weather' },
]

const wrenchFeatures = [
  { icon: Wrench, text: 'Multi-bike work order queue — open, in-progress, closed' },
  { icon: ClipboardList, text: 'Before/after suspension sheets per work order' },
  { icon: Boxes, text: 'Part Vault integration — parts pulled direct into work orders' },
  { icon: Sparkles, text: 'Mechanic Coach AI — setup delta analysis + crew-chief recommendations' },
  { icon: Briefcase, text: 'Career portfolio — your full work history moves with you' },
  { icon: TrendingUp, text: 'Rider outcome tracking — improvement under your care' },
]

const privateerFeatures = [
  { icon: Bike, text: '1 Active Vehicle' },
  { icon: ClipboardList, text: 'Unlimited Session Logs + Setup Sheets' },
  { icon: Boxes, text: 'Full Part Vault + Lifecycle Tracking' },
  { icon: Sparkles, text: 'MD Intel AI Assistant' },
  { icon: DollarSign, text: 'Expense Log + Season Budget' },
]

const raceTeamFeatures = [
  { icon: Bike, text: '5 Active Vehicles' },
  { icon: Users, text: 'Full Team Roster + Rider Seats' },
  { icon: MapPin, text: 'Race + Practice Schedule + Track Weather' },
  { icon: Activity, text: 'GPS + FIT File Upload + Lap Analysis' },
  { icon: HeartPulse, text: 'Fitness + Nutrition Dashboard' },
  { icon: Brain, text: 'Daily Mental Check-In + Trend Charts' },
  { icon: Trophy, text: 'Injury Log + Return to Ride Protocol' },
  { icon: DollarSign, text: 'Sponsor Tracking + Budget Dashboard' },
  { icon: Sparkles, text: 'Race Coach AI — all context sources' },
]

const getFactoryFeatures = (wearableBadge?: string) => [
  { icon: InfinityIcon, text: 'Unlimited Vehicles + Unlimited Seats' },
  { icon: Video, text: 'AI Video Analysis — timestamped coaching feedback on uploads' },
  { icon: HeartPulse, text: 'Wearable Integration (Garmin, Polar, Apple Watch)', badge: wearableBadge },
  { icon: Brain, text: 'Mental Health Tracking + Concussion Protocols' },
  { icon: Trophy, text: 'Full Concussion + Return-to-Ride Protocol' },
  { icon: DollarSign, text: 'Cost-per-Result Analytics + Sponsor ROI Reports' },
  { icon: ShieldCheck, text: 'Firewalled Data Silos — your data, your team only' },
  { icon: Sparkles, text: 'MD Intel AI — searchable team R&D archive' },
  { icon: Truck, text: 'Semi Rig Command — fleet maintenance + DOT compliance' },
]

export default function PricingView() {
  const router = useRouter()
  const [billing, setBilling] = useState<Billing>('annually')
  const [showPaid, setShowPaid] = useState(false)

  // Dynamically set wearable badge based on API availability
  const wearableBadge = useMemo(() => {
    const status = getFeatureStatus('terra')
    return status === 'test-bench' ? 'Test Bench' : undefined
  }, [])

  const privateerPrice = billing === 'annually' ? 79 : 89
  const privateerNote =
    billing === 'annually' ? 'per month, billed annually' : 'per month, billed monthly'

  const handleCta = useCallback(
    (plan: 'rookie' | 'privateer' | 'wrench' | 'race_team' | 'factory_rig') => {
      // Rookie is free — skip checkout entirely, go straight to sign-up
      if (plan === 'rookie') {
        router.push('/data/sign-in?mode=sign-up&redirect=/data')
        return
      }
      router.push(`/data/checkout?plan=${plan}`)
    },
    [router],
  )

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="flex items-center gap-4 h-20 px-5 lg:px-8 border-b border-zinc-800">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <span className="text-zinc-700 font-mono text-xs uppercase tracking-widest">/</span>
        <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-mono">
          Pricing &amp; Plans
        </span>
      </header>

      <main className="mx-auto max-w-7xl px-5 lg:px-8 py-14 lg:py-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-lime-400">
            Every Rider Starts Here
          </p>
          <h1 className="mt-4 text-4xl lg:text-6xl font-black uppercase tracking-tight text-zinc-50 text-balance">
            Start Free. Grow When You&apos;re Ready.
          </h1>
          <p className="mt-5 text-lg text-zinc-400 text-pretty leading-relaxed">
            One free account for any rider — from the kid on a 50 to the weekend warrior to the
            retired vet who just loves ride days. Track your bike, your body, and your story. No
            credit card, no catch.
          </p>
        </div>

        {/* Free Rider — the universal free front door */}
        <section className="mt-12 rounded-3xl border-2 border-lime-400/50 bg-gradient-to-br from-lime-400/10 to-zinc-900 p-6 lg:p-10 shadow-[0_0_50px_-12px] shadow-lime-400/25">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="lg:w-2/5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-lime-400/15 border border-lime-400/40 flex items-center justify-center">
                  <Bike className="h-7 w-7 text-lime-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
                    Any Rider · Any Bike
                  </p>
                  <h2 className="mt-1 text-3xl lg:text-4xl font-black uppercase tracking-wide text-zinc-50">
                    Free Rider
                  </h2>
                </div>
              </div>

              <div className="mt-5 flex items-end gap-3">
                <span className="text-5xl font-black tracking-tight text-lime-400">FREE</span>
                <span className="mb-2 text-sm text-zinc-500 font-medium">forever · no credit card</span>
              </div>

              <p className="mt-5 text-zinc-300 leading-relaxed">
                Your account, for as long as you ride. Whether it&apos;s your kid&apos;s first 50,
                your Sunday trail bike, or the vet class you&apos;ll never quit — keep every bike,
                every ride, and every milestone in one place.
              </p>

              <button
                onClick={() => router.push('/data/sign-in?mode=sign-up&redirect=/data')}
                className="mt-6 w-full lg:w-auto lg:px-10 h-14 rounded-xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wider text-base transition-colors hover:bg-lime-300"
              >
                Start Free
              </button>

              <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
                Grows with you — when you want more bikes, AI coaching, or a full team command
                center, your data comes with you.
              </p>
            </div>

            <div className="lg:flex-1 lg:border-l lg:border-lime-400/15 lg:pl-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500 mb-4">
                What&apos;s included
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {freeRiderFeatures.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-lime-400/15 text-lime-400">
                      <f.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-zinc-300 text-sm leading-relaxed">{f.text}</span>
                  </li>
                ))}
              </ul>
              <RookieDemo />
            </div>
          </div>
        </section>

        {/* Reveal paid tiers */}
        {!showPaid && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              onClick={() => setShowPaid(true)}
              className="group inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-6 py-3 text-sm font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-lime-400/50 hover:text-lime-400"
            >
              When you&apos;re ready for more
              <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <p className="text-xs text-zinc-600">
              Racers, teams, mechanics, and factory rigs — see the upgrade paths.
            </p>
          </div>
        )}

        {showPaid && (
        <div className="mt-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-lime-400">
              Upgrade Paths
            </p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-50 text-balance">
              When Free Isn&apos;t Enough
            </h2>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              More bikes, AI coaching, full teams, and pro tools — pick the rig that matches where
              you&apos;re headed. Your free data carries straight over.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
            <div className="inline-flex items-center gap-4 p-1 bg-gradient-to-br from-zinc-800/50 to-zinc-900/80 rounded-2xl border border-zinc-700/60 backdrop-blur-sm">
              {/* Monthly button */}
              <button
                onClick={() => setBilling('monthly')}
                className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                  billing === 'monthly'
                    ? 'bg-white/10 text-zinc-50 shadow-lg'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                Monthly
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-zinc-700/40" />

              {/* Annually button + badge */}
              <div className="relative">
                <button
                  onClick={() => setBilling('annually')}
                  className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                    billing === 'annually'
                      ? 'bg-white/10 text-zinc-50 shadow-lg'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  Annually
                </button>
                
                {/* Animated save badge */}
                <div
                  className={`absolute -top-2 -right-3 transition-all duration-300 ${
                    billing === 'annually' ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'
                  }`}
                >
                  <span className="inline-block px-3 py-1.5 rounded-full bg-gradient-to-r from-lime-400/90 to-lime-500/90 text-zinc-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-lime-400/40 border border-lime-300/40">
                    💰 Save 20%
                  </span>
                </div>
              </div>
            </div>
          </div>

        {/* Wrench tier — standalone mechanic plan */}
        <section className="mt-6 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-500/8 to-zinc-900 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-start gap-4 lg:w-2/5">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">Professional Mechanics</p>
                <h2 className="mt-1 text-2xl font-black uppercase tracking-wide text-zinc-50">The Wrench</h2>
                <p className="mt-2 text-zinc-400 text-sm leading-relaxed max-w-md">
                  Not a rider tier. A career tool. Your work orders, setup deltas, and rider outcomes live in your account — and follow you from team to team. This is your professional portfolio.
                </p>
              </div>
            </div>

            <div className="lg:flex-1">
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {wrenchFeatures.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-500/15 text-blue-400">
                      <f.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-zinc-300 text-sm leading-relaxed">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:w-48 shrink-0 flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="flex items-end gap-1.5 justify-end">
                  <span className="text-3xl font-black tracking-tight text-zinc-50">$149</span>
                  <span className="mb-1 text-zinc-500 font-medium text-sm">/ mo</span>
                </div>
                <p className="text-xs text-zinc-600 mt-1">billed monthly</p>
              </div>
              <button
                onClick={() => handleCta('wrench')}
                className="w-full h-12 rounded-xl border-2 border-blue-400 text-blue-400 font-bold uppercase tracking-wider text-sm transition-colors hover:bg-blue-400 hover:text-zinc-950"
              >
                Build Your Career
              </button>
            </div>
          </div>
        </section>

        {/* 3-tier cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* CARD 1: Privateer */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">Solo Racer</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-wide text-zinc-50">
              The Privateer
            </h2>
            <p className="mt-3 text-zinc-400 leading-relaxed text-sm min-h-[60px]">
              For solo riders and privateer dads who need to track every part, every dollar, and
              every setup decision.
            </p>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-4xl font-black tracking-tight text-zinc-50">
                ${privateerPrice}
              </span>
              <span className="mb-1 text-zinc-500 font-medium text-sm">/ mo</span>
            </div>
            <p className="mt-1 text-xs text-zinc-600">{privateerNote}</p>
            <button
              onClick={() => handleCta('privateer')}
              className="mt-6 w-full h-12 rounded-xl border-2 border-zinc-400 text-zinc-400 font-bold uppercase tracking-wider text-sm transition-colors hover:bg-zinc-400 hover:text-zinc-950"
            >
              Start Racing
            </button>
            <ul className="mt-7 space-y-3.5">
              {privateerFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 text-zinc-400">
                    <f.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-zinc-400 text-sm leading-relaxed">{f.text}</span>
                </li>
              ))}
            </ul>
            <PrivateerDemo />
          </section>

          {/* CARD 2: Race Team — highlighted */}
          <section className="relative rounded-2xl border-2 border-amber-400 bg-zinc-900 p-8 shadow-[0_0_40px_-8px] shadow-amber-400/25">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-zinc-950 whitespace-nowrap">
                Most Popular
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Regional + Amateur
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-wide text-zinc-50">
              The Race Team
            </h2>
            <p className="mt-3 text-zinc-400 leading-relaxed text-sm min-h-[60px]">
              For clubs, regional semi-pro teams, and serious amateur programs with multiple bikes
              and a real budget to manage.
            </p>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-4xl font-black tracking-tight text-zinc-50">$399</span>
              <span className="mb-1 text-zinc-500 font-medium text-sm">/ mo</span>
            </div>
            <p className="mt-1 text-xs text-zinc-600">per month, billed monthly</p>
            <button
              onClick={() => handleCta('race_team')}
              className="mt-6 w-full h-12 rounded-xl bg-amber-400 text-zinc-950 font-bold uppercase tracking-wider text-sm transition-colors hover:bg-amber-300"
            >
              Join the Team
            </button>
            <ul className="mt-7 space-y-3.5">
              {raceTeamFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-400/15 text-amber-400">
                    <f.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-zinc-300 text-sm leading-relaxed">{f.text}</span>
                </li>
              ))}
            </ul>
            <RaceTeamDemo />
          </section>

          {/* CARD 3: Factory Rig */}
          <section className="relative rounded-2xl border-2 border-lime-400 bg-zinc-900 p-8 shadow-[0_0_40px_-8px] shadow-lime-400/30">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-lime-400 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-zinc-950 whitespace-nowrap">
                Pro Choice
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
              Factory + Elite
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-wide text-zinc-50">
              The Factory Rig
            </h2>
            <p className="mt-3 text-zinc-400 leading-relaxed text-sm">
              For factory operations, elite satellite teams, and programs demanding full telemetry,
              video AI, and sponsor ROI reporting.
            </p>
            {/* Semi truck driver spotlight */}
            <div className="mt-4 rounded-xl border border-lime-400/20 bg-lime-400/5 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-lime-400 mb-1">Built for the whole rig</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The semi driver hauls everything — bikes, parts, fuel, toolboxes — and runs the schedule while the team races. This platform tracks every vehicle, every part, every dollar, so the person holding it all together finally has a command center that matches the job.
              </p>
            </div>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-4xl font-black tracking-tight text-zinc-50">$3,999</span>
              <span className="mb-1 text-zinc-500 font-medium text-sm">/ mo</span>
            </div>
            <p className="mt-1 text-xs text-zinc-600">billed monthly</p>
            <button
              onClick={() => handleCta('factory_rig')}
              className="mt-6 w-full h-12 rounded-xl bg-lime-400 text-zinc-950 font-bold uppercase tracking-wider text-sm transition-colors hover:bg-lime-300"
            >
              Get Started
            </button>
            <ul className="mt-7 space-y-3.5">
              {getFactoryFeatures(wearableBadge).map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-lime-400/15 text-lime-400">
                    <f.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-100 text-sm leading-relaxed font-medium">{f.text}</span>
                    {f.badge && (
                      <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                        {f.badge}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <FactoryDemo />
          </section>
        </div>
        </div>
        )}

        {/* Trust footer */}
        <div className="mt-10 flex items-center justify-center gap-3 text-center">
          <ShieldCheck className="h-5 w-5 text-lime-400 shrink-0" />
          <p className="text-sm text-zinc-500">
            Enterprise-grade security provided by{' '}
            <span className="text-zinc-300 font-semibold">Chiller Tech Support LLC.</span>
          </p>
        </div>
      </main>
    </div>
  )
}
