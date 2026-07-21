'use client'

import Link from 'next/link'
import { ArrowLeft, Users, BarChart3, TrendingUp, Trophy, CheckCircle } from 'lucide-react'

export default function RaceTeamDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-50">
      <div className="px-8 py-6 max-w-6xl mx-auto">
        <Link href="/race_team" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm font-bold">
          <ArrowLeft className="h-4 w-4" />
          Back to Race Team
        </Link>
      </div>

      <section className="px-8 py-12 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          Inside Race <span className="text-purple-400">Team</span>
        </h1>
        <p className="text-zinc-400 max-w-3xl text-lg">
          Manage unlimited riders, assign coaches, track fleet performance, and make data-driven decisions. Everything a racing team needs.
        </p>
      </section>

      <section className="px-8 py-16 max-w-6xl mx-auto space-y-16">
        {/* Feature 1: Multi-Rider Management */}
        <div className="border-l-4 border-purple-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-black">Multi-Rider Management</h2>
              <p className="text-zinc-500 text-sm mt-1">One dashboard for your entire team</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Manage all your riders in one unified dashboard. Assign roles, set permissions, track each rider independently, and view fleet performance with a single glance.
          </p>

          <div className="bg-black border border-zinc-800 rounded overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-950 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Team Roster</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {[
                { name: 'Jordan Chen', class: '125cc', bike: '#17', role: 'Rider', status: 'Active' },
                { name: 'Alex Rodriguez', class: '250cc', bike: '#44', role: 'Rider', status: 'Active' },
                { name: 'Sarah Kim', class: '125cc', bike: '#8', role: 'Rider', status: 'Active' },
                { name: 'Mike Johnson', class: '250cc', bike: '#12', role: 'Coach', status: 'Active' },
              ].map((r) => (
                <div key={r.name} className="px-4 py-3 flex items-center justify-between font-mono text-xs">
                  <div className="flex-1">
                    <p className="text-zinc-100">{r.name}</p>
                    <p className="text-zinc-500">{r.class} · {r.bike}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-bold">{r.role}</p>
                    <p className="text-zinc-500 text-[10px]">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Unlimited riders across all classes',
              'Role-based permissions (admin, coach, rider)',
              'Individual rider performance pages',
              'Bulk operations and team settings',
              'Rider transfer tracking',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 2: Fleet Analytics */}
        <div className="border-l-4 border-blue-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-black">Fleet Analytics</h2>
              <p className="text-zinc-500 text-sm mt-1">See all rider data at once</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Compare lap times across your entire team. Identify your fastest riders, spot performance trends, and make lineup decisions with confidence.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-blue-400">Today's Fleet Performance</p>
            <div className="space-y-3 text-sm">
              {[
                { name: 'Jordan Chen', pb: '1:43.2', trend: 'up', delta: '+0.1s' },
                { name: 'Alex Rodriguez', pb: '1:41.8', trend: 'up', delta: '+0.3s' },
                { name: 'Sarah Kim', pb: '1:44.6', trend: 'down', delta: '-0.5s' },
              ].map((r) => (
                <div key={r.name} className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div>
                    <p className="text-zinc-100 font-mono">{r.name}</p>
                    <p className="text-zinc-500 text-xs">{r.pb}</p>
                  </div>
                  <p className={r.trend === 'up' ? 'text-red-400' : 'text-green-400'}>{r.delta}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Unified team dashboard showing all riders',
              'Real-time performance benchmarking',
              'Trend analysis across the season',
              'Form tracking and improvement curves',
              'Team reports for sponsors and management',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 3: Coach Assignments */}
        <div className="border-l-4 border-indigo-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-indigo-400" />
            <div>
              <h2 className="text-2xl font-black">Coach Assignments</h2>
              <p className="text-zinc-500 text-sm mt-1">Pair riders with coaches</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Assign coaches to individual riders or groups. Coaches get read-only access to their assigned riders' data and can generate session reports and coaching notes.
          </p>

          <div className="bg-black border border-zinc-800 rounded p-6 space-y-4">
            <p className="text-sm font-bold text-indigo-400">Coach Assignments</p>
            <div className="space-y-3 text-sm">
              {[
                { coach: 'Mike Johnson', riders: 'Jordan Chen, Sarah Kim', access: 'Read-only' },
                { coach: 'Lisa Park', riders: 'Alex Rodriguez', access: 'Read-only' },
              ].map((a) => (
                <div key={a.coach} className="border border-zinc-800 bg-zinc-950 rounded p-3">
                  <p className="text-zinc-100 font-bold mb-1">{a.coach}</p>
                  <p className="text-zinc-400 text-xs mb-2">Assigned to: {a.riders}</p>
                  <p className="text-indigo-400 text-xs font-mono">{a.access}</p>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'One-to-many coach-to-rider assignments',
              'Read-only access to assigned rider data',
              'Coaching notes and session debriefs',
              'Coach reporting and progress tracking',
              'Easy reassignment and schedule management',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Feature 4: Event Management */}
        <div className="border-l-4 border-violet-400 bg-zinc-900/40 border border-zinc-800 p-8 rounded space-y-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-violet-400" />
            <div>
              <h2 className="text-2xl font-black">Event & Season Management</h2>
              <p className="text-zinc-500 text-sm mt-1">Organize events and track championships</p>
            </div>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Organize your season across multiple events and tracks. Automatically generate championship standings based on real session data and manage rider lineups for each event.
          </p>

          <div className="bg-black border border-zinc-800 rounded overflow-hidden">
            <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-950 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-violet-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Season Championship</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {[
                { pos: '1st', rider: 'Alex Rodriguez', points: '285', events: '5/5' },
                { pos: '2nd', rider: 'Jordan Chen', points: '271', events: '5/5' },
                { pos: '3rd', rider: 'Sarah Kim', points: '248', events: '4/5' },
              ].map((s) => (
                <div key={s.rider} className="px-4 py-3 flex items-center justify-between font-mono text-xs">
                  <div className="flex-1">
                    <p className="text-violet-400 font-bold">{s.pos}</p>
                    <p className="text-zinc-300">{s.rider}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-100 font-bold">{s.points}</p>
                    <p className="text-zinc-500 text-[10px]">{s.events} events</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-2">
            {[
              'Multi-event season organization',
              'Automatic championship standings',
              'Event-specific rider lineups',
              'Season archives and record-keeping',
              'Integration with all rider session data',
            ].map((item) => (
              <li key={item} className="flex gap-2 text-zinc-300 text-sm">
                <CheckCircle className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
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
            <h2 className="text-3xl font-black mb-4">Ready to manage your team?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">$599/month. Unlimited riders, coaches, and events. All the features you need to win.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/data/checkout?plan=race_team" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-500 text-white font-bold rounded hover:bg-purple-400 transition">
              Get Started Now
            </a>
            <Link href="/race_team" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 font-bold rounded hover:border-zinc-500 transition">
              Back to Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
