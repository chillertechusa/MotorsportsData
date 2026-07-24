import { Suspense } from 'react'
import Link from 'next/link'
import { getCoachDashboardKpis, getCoachSessions, getCoachClients } from '@/app/actions/coach-business'
import { Users, CalendarDays, DollarSign, ClipboardList, ArrowRight, Cpu } from 'lucide-react'

function fmt$(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

async function CoachCommandContent() {
  const [kpis, sessions, clients] = await Promise.all([
    getCoachDashboardKpis(),
    getCoachSessions(),
    getCoachClients(),
  ])

  const upcoming = sessions
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5)

  const activeClients = clients.filter((c) => c.status === 'active').slice(0, 6)

  const KPI_TILES = [
    { label: 'Active Athletes', value: String(kpis.activeAthletes), icon: Users, sub: 'on your roster' },
    { label: 'Upcoming Sessions', value: String(kpis.upcomingSessions), icon: CalendarDays, sub: 'scheduled' },
    { label: 'Outstanding', value: fmt$(kpis.outstandingCents), icon: DollarSign, sub: 'invoices sent' },
    { label: 'Active Plans', value: String(kpis.activePlans), icon: ClipboardList, sub: 'training plans' },
  ]

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            Coach Command
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Your business at a glance.</p>
        </div>
        <Link
          href="/data/coach/roster?action=add"
          className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-lime-300 transition-colors"
        >
          Add Athlete
        </Link>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_TILES.map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4 text-lime-400" aria-hidden="true" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{label}</span>
            </div>
            <p className="text-3xl font-black text-zinc-100" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
              {value}
            </p>
            <p className="text-zinc-600 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Upcoming Sessions</h2>
            <Link href="/data/coach/sessions" className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="border border-dashed border-zinc-800 p-8 text-center">
              <CalendarDays className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No sessions scheduled yet.</p>
              <Link href="/data/coach/sessions?action=add" className="text-lime-400 text-sm hover:text-lime-300 mt-1 inline-block">
                Schedule first session &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((s) => {
                const d = new Date(s.scheduledAt)
                return (
                  <div key={s.id} className="bg-zinc-900 border border-zinc-800 flex items-center gap-4 px-4 py-3">
                    <div className="text-center shrink-0 w-10">
                      <p className="font-mono text-[9px] uppercase text-zinc-500">
                        {d.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-lg font-black text-zinc-100 leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                        {d.getDate()}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">{s.title}</p>
                      <p className="text-xs text-zinc-500 truncate">
                        {s.location ?? 'Location TBD'} &middot; {s.durationMinutes}min &middot; {(s as { athleteCount?: number }).athleteCount ?? 0} athletes
                      </p>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-lime-400 border border-lime-400/30 bg-lime-400/5 px-2 py-0.5 shrink-0">
                      {s.sessionType}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Active roster */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Active Roster</h2>
            <Link href="/data/coach/roster" className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300">
              Full roster <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {activeClients.length === 0 ? (
            <div className="border border-dashed border-zinc-800 p-8 text-center">
              <Users className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No athletes on your roster yet.</p>
              <Link href="/data/coach/roster?action=add" className="text-lime-400 text-sm hover:text-lime-300 mt-1 inline-block">
                Add first athlete &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activeClients.map((c) => (
                <Link key={c.id} href={`/data/coach/roster/${c.id}`}
                  className="bg-zinc-900 border border-zinc-800 hover:border-lime-400/30 transition-colors p-4 flex items-center gap-3">
                  <div className="h-9 w-9 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-zinc-500 truncate">{c.classCategory ?? c.discipline ?? 'Athlete'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Rig Doctor AI strip */}
      <div className="border border-lime-400/20 bg-lime-400/5 p-4 flex items-start gap-3">
        <Cpu className="h-4 w-4 text-lime-400 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-lime-400 mb-1">Rig Doctor AI</p>
          <p className="text-sm text-zinc-400">
            {kpis.activeAthletes === 0
              ? 'Add your first athlete to unlock AI-powered training recommendations and performance insights.'
              : `You have ${kpis.activeAthletes} active athlete${kpis.activeAthletes !== 1 ? 's' : ''}. AI coaching insights and weekly plan generation are ready. Head to Plans to create your first AI-generated training week.`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CoachPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded" />
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded" />)}
        </div>
      </div>
    }>
      <CoachCommandContent />
    </Suspense>
  )
}
