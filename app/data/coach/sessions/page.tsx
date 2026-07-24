import { Suspense } from 'react'
import Link from 'next/link'
import { getCoachSessions } from '@/app/actions/coach-business'
import { CalendarDays, Plus, MapPin, Users, CheckCircle2, Clock } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  scheduled:  'text-lime-400 border-lime-400/30 bg-lime-400/5',
  completed:  'text-zinc-400 border-zinc-700 bg-zinc-800/50',
  cancelled:  'text-red-400 border-red-400/30 bg-red-400/5',
}

async function SessionsContent() {
  const sessions = await getCoachSessions()

  const upcoming = sessions.filter((s) => s.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  const past = sessions.filter((s) => s.status !== 'scheduled')
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 20)

  function SessionRow({ s }: { s: typeof sessions[0] }) {
    const d = new Date(s.scheduledAt)
    return (
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-5 px-5 py-4">
        <div className="text-center shrink-0 w-11 border-r border-zinc-800 pr-5">
          <p className="font-mono text-[9px] uppercase text-zinc-500">
            {d.toLocaleDateString('en-US', { month: 'short' })}
          </p>
          <p className="text-xl font-black text-zinc-100 leading-tight" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            {d.getDate()}
          </p>
          <p className="font-mono text-[9px] text-zinc-600">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-100 truncate">{s.title}</p>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1">
            {s.location && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" aria-hidden="true" />{s.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3" aria-hidden="true" />{s.durationMinutes}min
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Users className="h-3 w-3" aria-hidden="true" />{(s as { athleteCount?: number }).athleteCount ?? 0} athletes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`font-mono text-[9px] uppercase tracking-wider border px-2.5 py-0.5 ${STATUS_STYLE[s.status] ?? STATUS_STYLE.scheduled}`}>
            {s.sessionType}
          </span>
          {s.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-zinc-600" aria-hidden="true" />}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            Sessions
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{upcoming.length} upcoming &middot; {past.length} completed</p>
        </div>
        <Link href="/data/coach/sessions/new"
          className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-lime-300 transition-colors">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Schedule Session
        </Link>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-3">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-10 text-center">
            <CalendarDays className="h-10 w-10 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-zinc-500 text-sm">No sessions scheduled. Book time with your athletes.</p>
          </div>
        ) : (
          <div className="space-y-2">{upcoming.map((s) => <SessionRow key={s.id} s={s} />)}</div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-3">Past Sessions</h2>
          <div className="space-y-2">{past.map((s) => <SessionRow key={s.id} s={s} />)}</div>
        </section>
      )}
    </div>
  )
}

export default function SessionsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-3 animate-pulse">
        <div className="h-8 w-32 bg-zinc-800 rounded" />
        {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-zinc-900 border border-zinc-800" />)}
      </div>
    }>
      <SessionsContent />
    </Suspense>
  )
}
