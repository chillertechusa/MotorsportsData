import { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, CheckCircle2, Zap, TrendingUp, Heart, DollarSign, Users, Trophy, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Wrench Tier — Build Your Career | Motorsports Data',
  description: 'The Wrench Tier ($29/mo) — Your portable mechanic portfolio. Track every setup change, build your resume with real lap-time deltas, and carry your reputation between teams.',
  alternates: { canonical: 'https://motorsportsdata.io/data/mechanic' },
}

export default function MechanicPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="py-20 md:py-32 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/40">
            <Wrench className="h-4 w-4 text-amber-400" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Wrench Tier</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-zinc-100 mb-6 text-balance leading-tight">
            Build Your {' '}
            <span className="text-amber-400">Mechanic Career</span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Your mechanical expertise deserves recognition. Track every setup change, measure your impact on lap times, and build a portable portfolio that follows you between teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/data/pricing" className="px-6 py-3 bg-amber-400 text-zinc-950 font-bold rounded hover:bg-amber-300 transition-colors flex items-center justify-center gap-2">
              Start at $29/mo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="px-6 py-3 border border-zinc-700 text-zinc-100 font-semibold rounded hover:border-zinc-600 transition-colors">
              Back to Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-zinc-900/50 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-100 mb-12 text-center">What's Included</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="p-6 border border-zinc-800 bg-zinc-900/40 rounded-lg hover:border-amber-400/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-400/10 border border-amber-400/20 rounded">
                      <Icon className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                      <p className="text-sm text-zinc-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-4">Track Every Setup Change</h3>
                <p className="text-zinc-400 mb-6">
                  Log every suspension tweak, tire change, and engine adjustment with before/after metrics. See your impact: lap time improvements, corner speed gains, stability changes.
                </p>
                <ul className="space-y-2">
                  {['Before/after metrics', 'Lap time delta tracking', 'Parameter history'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-4">
                <p className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-3">What your dashboard tracks</p>
                <div className="space-y-3">
                  {[
                    'Optimizations applied',
                    'Total lap time saved',
                    'Rider satisfaction score',
                  ].map((label) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">{label}</span>
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 h-48 flex items-center justify-center order-2 md:order-1">
                <div className="text-center">
                  <Users className="h-12 w-12 text-amber-400 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-zinc-500">Portfolio dashboard preview</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold text-zinc-100 mb-4">Your Portable Portfolio</h3>
                <p className="text-zinc-400 mb-6">
                  Your mechanic profile is your career asset. Verification badges, lap-time improvements attributed to your work, rider testimonials. Move between teams with your reputation intact.
                </p>
                <ul className="space-y-2">
                  {['Verified mechanic badge', 'Work history & results', 'Team recommendations'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-4">Analytics & Proof</h3>
                <p className="text-zinc-400 mb-6">
                  Show your value with data. Total lap-time improvements across all riders, success rate of your recommendations, cost savings from efficiency gains.
                </p>
                <ul className="space-y-2">
                  {['Success metrics', 'ROI calculator', 'Performance stats'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                  <div className="h-10 w-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-400">JK</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-100">Jordan King — Head Mechanic</p>
                    <p className="text-xs text-amber-400">✓ Verified • Elite Tier</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-zinc-950/50 p-2 rounded">
                    <p className="text-amber-400 font-bold text-sm">47</p>
                    <p className="text-zinc-600">Riders Helped</p>
                  </div>
                  <div className="bg-zinc-950/50 p-2 rounded">
                    <p className="text-amber-400 font-bold text-sm">+3.2s</p>
                    <p className="text-zinc-600">Avg Lap Gain</p>
                  </div>
                  <div className="bg-zinc-950/50 p-2 rounded">
                    <p className="text-amber-400 font-bold text-sm">94%</p>
                    <p className="text-zinc-600">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-zinc-100 mb-4">Ready to Build Your Portfolio?</h2>
          <p className="text-lg text-zinc-400 mb-8">
            Start tracking your work, prove your value, and carry your reputation with you.
          </p>
          <Link href="/data/pricing" className="inline-flex items-center gap-2 px-8 py-3 bg-amber-400 text-zinc-950 font-bold rounded hover:bg-amber-300 transition-colors">
            Get Started — $29/mo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}

const features = [
  {
    title: 'Optimization Tracking',
    description: 'Log every setup change with lap-time impact. Build a documented record of your expertise.',
    icon: Zap,
  },
  {
    title: 'Performance Attribution',
    description: 'See exactly how much lap time and speed you gained for each rider. Prove your impact.',
    icon: TrendingUp,
  },
  {
    title: 'Portable Profile',
    description: 'Your mechanic card follows you between teams. Verified badge + work history = job security.',
    icon: Trophy,
  },
  {
    title: 'Career Analytics',
    description: 'Total improvements, success rate, ROI. Numbers that talk to sponsors and team owners.',
    icon: Heart,
  },
  {
    title: 'Team Collaboration',
    description: 'View rider feedback, share setups with coaches, sync across multiple teams.',
    icon: Users,
  },
  {
    title: 'Earnings Tracking',
    description: 'Optional: Tie your income to performance. Bonus calculations based on measured improvements.',
    icon: DollarSign,
  },
]
