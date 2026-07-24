import { Suspense } from 'react'
import Link from 'next/link'
import { getCoachClients } from '@/app/actions/coach-business'
import { Users, Plus, MapPin, Tag } from 'lucide-react'

async function RosterContent() {
  const clients = await getCoachClients()
  const active = clients.filter((c) => c.status === 'active')
  const archived = clients.filter((c) => c.status === 'archived')

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            Athlete Roster
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{active.length} active &middot; {archived.length} archived</p>
        </div>
        <Link
          href="/data/coach/roster/new"
          className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-lime-300 transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Athlete
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-16 text-center">
          <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
          <p className="text-zinc-400 text-base font-semibold mb-1">Your roster is empty.</p>
          <p className="text-zinc-600 text-sm mb-4">Add your first athlete to start building training plans and scheduling sessions.</p>
          <Link href="/data/coach/roster/new"
            className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 text-sm font-bold px-5 py-2.5 hover:bg-lime-300 transition-colors">
            <Plus className="h-4 w-4" /> Add First Athlete
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {active.map((c) => (
            <Link key={c.id} href={`/data/coach/roster/${c.id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-lime-400/40 transition-colors p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-200 shrink-0">
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-100 truncate">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-zinc-500 truncate">{c.email ?? 'No email'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {c.discipline && (
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-lime-400 border border-lime-400/20 bg-lime-400/5 px-2 py-0.5">
                    <Tag className="h-2.5 w-2.5" aria-hidden="true" />
                    {c.discipline}
                  </span>
                )}
                {c.classCategory && (
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-zinc-400 border border-zinc-700 px-2 py-0.5">
                    {c.classCategory}
                  </span>
                )}
                {c.homeTrack && (
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500 px-2 py-0.5">
                    <MapPin className="h-2.5 w-2.5" aria-hidden="true" />
                    {c.homeTrack}
                  </span>
                )}
              </div>

              <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-600">
                  Enrolled {c.enrolledAt ? new Date(c.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-lime-400">View &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RosterPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-zinc-800 rounded" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-40 bg-zinc-900 border border-zinc-800 rounded" />)}
        </div>
      </div>
    }>
      <RosterContent />
    </Suspense>
  )
}
