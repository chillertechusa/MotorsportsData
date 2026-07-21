'use client'

import { Users, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

const PILOT_COACHES = [
  {
    name: 'Coach A',
    email: 'coach.a@example.com',
    company: 'Pro Motocross',
    status: 'active',
    riders: 8,
    nps: 9,
    joinedAt: '2026-07-10',
    lastActive: 'Today',
    willPay: true,
  },
  {
    name: 'Coach B',
    email: 'coach.b@example.com',
    company: 'Elite Racing',
    status: 'active',
    riders: 5,
    nps: 7,
    joinedAt: '2026-07-10',
    lastActive: '2 days ago',
    willPay: true,
  },
  {
    name: 'Coach C',
    email: 'coach.c@example.com',
    company: 'Youth Development',
    status: 'onboarding',
    riders: 0,
    nps: null,
    joinedAt: '2026-07-11',
    lastActive: 'Today',
    willPay: null,
  },
]

export default function CohortDashboard() {
  const activeCount = PILOT_COACHES.filter((c) => c.status === 'active').length
  const avgNPS = (
    PILOT_COACHES.filter((c) => c.nps)
      .reduce((sum, c) => sum + (c.nps || 0), 0) / PILOT_COACHES.filter((c) => c.nps).length
  ).toFixed(1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wide text-zinc-50">Pilot Cohort</h1>
        <p className="text-sm text-zinc-400 mt-2">Track coaches through onboarding, usage, feedback</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Coaches', value: PILOT_COACHES.length, icon: Users },
          { label: 'Active', value: activeCount, icon: CheckCircle2 },
          { label: 'Avg NPS', value: avgNPS, icon: TrendingUp },
          { label: 'Will Pay', value: PILOT_COACHES.filter((c) => c.willPay).length, icon: AlertCircle },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="border border-zinc-800 bg-zinc-900 p-6 rounded-lg">
              <Icon className="h-5 w-5 text-lime-500 mb-3" />
              <p className="text-sm text-zinc-400">{stat.label}</p>
              <p className="text-3xl font-black text-zinc-50 mt-2">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Coach Table */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="font-bold text-zinc-50">Coaches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-zinc-400 font-bold">Coach</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-bold">Status</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-bold">Riders</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-bold">NPS</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-bold">Will Pay</th>
                <th className="px-6 py-3 text-left text-zinc-400 font-bold">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {PILOT_COACHES.map((coach) => (
                <tr key={coach.email} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-zinc-50">{coach.name}</p>
                      <p className="text-xs text-zinc-500">{coach.company}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        coach.status === 'active'
                          ? 'bg-lime-500/20 text-lime-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {coach.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{coach.riders}</td>
                  <td className="px-6 py-4">
                    {coach.nps ? (
                      <span className={coach.nps >= 9 ? 'text-lime-400 font-bold' : 'text-zinc-300'}>
                        {coach.nps}
                      </span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {coach.willPay === true ? (
                      <span className="text-lime-400 font-bold">Yes</span>
                    ) : coach.willPay === false ? (
                      <span className="text-orange-400">No</span>
                    ) : (
                      <span className="text-zinc-500">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{coach.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Report */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
        <h2 className="font-bold text-zinc-50 mb-4">Weekly Actions</h2>
        <div className="space-y-3">
          {[
            { title: 'Schedule 1-on-1 calls', coaches: 'Coach A, Coach B (high NPS)', color: 'text-lime-400' },
            { title: 'Debug onboarding blockers', coaches: 'Coach C (stuck at step 2)', color: 'text-amber-400' },
            { title: 'Collect pricing feedback', coaches: 'All active coaches', color: 'text-blue-400' },
          ].map((action, idx) => (
            <div key={idx} className="flex gap-3 p-3 border border-zinc-800 rounded">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">{idx + 1}</span>
              </div>
              <div>
                <p className={`font-bold ${action.color}`}>{action.title}</p>
                <p className="text-xs text-zinc-400">{action.coaches}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
