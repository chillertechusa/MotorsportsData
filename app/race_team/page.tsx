import { ArrowRight, Users, BarChart3, Trophy, CheckCircle, TrendingUp, Shield } from 'lucide-react'
import Link from 'next/link'
import { formatPricingDisplay } from '@/lib/md-plans'

export const metadata = {
  title: 'Race Team Platform | Motorsport Data',
  description: 'Multi-rider management, team analytics, coach assignments, and fleet telemetry for regional racing teams.',
  alternates: { canonical: 'https://motorsportsdata.io/race_team' },
}

export default function RaceTeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      {/* Hero */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Manage Your Entire Fleet. <span className="text-purple-400">Win as a Team.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed">
            Track all your riders in one dashboard. Assign coaches, compare lap data, manage team resources, and analyze fleet performance in real-time. Built for racing teams that compete at regional and national levels.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/race_team/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-bold rounded hover:bg-purple-400 transition"
          >
            See Demo Now <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="mailto:teams@motorsportsdata.io"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition"
          >
            Schedule Call
          </a>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="px-8 py-16 max-w-6xl mx-auto border-t border-zinc-800">
        <p className="text-sm text-zinc-500 uppercase tracking-widest mb-8">Built for the whole team</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-3xl font-black text-lime-400">Unlimited</p>
            <p className="text-sm text-zinc-400">Riders on one roster</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-zinc-100">11 Roles</p>
            <p className="text-sm text-zinc-400">Real team seat structure</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-emerald-400">Multi-Event</p>
            <p className="text-sm text-zinc-400">Season &amp; event management</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-zinc-100">$599/mo</p>
            <p className="text-sm text-zinc-400">Flat team pricing</p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto space-y-12">
        <div>
          <h2 className="text-4xl font-black mb-4">Everything Your Team Needs to Win</h2>
          <p className="text-zinc-400 max-w-2xl">Centralized team management, real-time analytics, and competitive intelligence.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Multi-Rider Management */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-bold">Multi-Rider Management</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Manage unlimited riders across multiple bikes, classes, and events. Assign coaches to individual riders, set role permissions, and track each rider&apos;s progress independently or as a fleet.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                Unlimited rider slots (one price)
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                Role-based permissions (admin, coach, rider)
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                Rider transfers between classes/bikes
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                Bulk operations and team-wide settings
              </li>
            </ul>
          </div>

          {/* Team Analytics */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-bold">Fleet Analytics</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              View all your riders&apos; data at once. Compare lap times across the fleet, identify your fastest riders, spot performance trends, and make data-driven lineup decisions for race day.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                Unified team dashboard with all riders
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                Performance benchmarking across fleet
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                Trend analysis and form tracking
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                Export team reports and season summaries
              </li>
            </ul>
          </div>

          {/* Coach Assignments */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-indigo-400" />
              <h3 className="text-xl font-bold">Coach Assignments</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Assign experienced coaches to riders who need them. Coaches get read-only access to assigned riders&apos; data and can generate session reports and coaching notes directly in the platform.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                Assign coaches to individual riders
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                Coach read-only access to rider data
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                Coaching notes and session debriefs
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                One-to-many coaching workflows
              </li>
            </ul>
          </div>

          {/* Event Management */}
          <div className="border border-zinc-800 bg-zinc-900 bg-opacity-50 p-8 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-violet-400" />
              <h3 className="text-xl font-bold">Event & Season Management</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Organize riders by event, track season-long progress, manage schedule changes, and automatically compile championship standings. Everything tied to real session data.
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                Multi-event season management
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                Automatic championship standings
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                Event-specific rider lineups
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                Season summaries and archival
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Manage your entire team.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">{formatPricingDisplay('race_team')} Unlimited riders, coaches, and events. All the data, all the power.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/checkout/tier?tier=race_team"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-500 text-white font-bold rounded hover:bg-purple-400 transition"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/race_team/demo"
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
