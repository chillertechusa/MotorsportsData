import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdScheduleEvents } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { CalendarDays, MapPin, Trophy, DollarSign, Plus } from 'lucide-react'

export const metadata = { title: 'Race Calendar — Motorsport Data' }

async function getTeamId(userId: string) {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

const TYPE_STYLE: Record<string, { dot: string; badge: string }> = {
  race:     { dot: 'bg-red-400',    badge: 'text-red-400 border-red-400/20 bg-red-400/5' },
  practice: { dot: 'bg-zinc-500',   badge: 'text-zinc-400 border-zinc-700 bg-zinc-800' },
  default:  { dot: 'bg-sky-400',    badge: 'text-sky-400 border-sky-400/20 bg-sky-400/5' },
}

export default async function RaceCalendarPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const events = await db.select().from(mdScheduleEvents)
    .where(eq(mdScheduleEvents.teamId, teamId))
    .orderBy(desc(mdScheduleEvents.eventDate))

  const today = new Date().toISOString().split('T')[0]
  const upcoming = events.filter(e => e.eventDate >= today)
  const past     = events.filter(e => e.eventDate < today)

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
            Race Calendar
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{upcoming.length} upcoming &middot; {past.length} completed</p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-sky-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-sky-300 transition-colors"
          aria-label="Add event (demo — upgrade for full access)"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Event
        </button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">Upcoming</h2>
          <div className="flex flex-col gap-3">
            {upcoming.map((e) => {
              const style = TYPE_STYLE[e.eventType] ?? TYPE_STYLE.default
              return (
                <article key={e.id} className="bg-zinc-900 border border-zinc-800 p-5 flex gap-5">
                  {/* Date column */}
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-lg font-black text-zinc-100 leading-none">
                      {new Date(e.eventDate + 'T12:00:00').getDate()}
                    </p>
                    <p className="text-[10px] font-mono uppercase text-zinc-500">
                      {new Date(e.eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-zinc-100">{e.title}</h3>
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border shrink-0 ${style.badge}`}>
                        {e.eventType}
                      </span>
                    </div>
                    {e.series && (
                      <p className="text-xs text-zinc-500 mt-1">{e.series}</p>
                    )}
                    {e.notes && (
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-2">{e.notes}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      {e.entryFeeCents && e.entryFeeCents > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <DollarSign className="h-3 w-3" aria-hidden="true" />
                          Entry: ${(e.entryFeeCents / 100).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* Past results */}
      {past.length > 0 && (
        <section aria-labelledby="results-heading">
          <h2 id="results-heading" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">Results</h2>
          <div className="flex flex-col gap-3">
            {past.map((e) => {
              const style = TYPE_STYLE[e.eventType] ?? TYPE_STYLE.default
              return (
                <article key={e.id} className="bg-zinc-900 border border-zinc-800 p-5 flex gap-5 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-lg font-black text-zinc-300 leading-none">
                      {new Date(e.eventDate + 'T12:00:00').getDate()}
                    </p>
                    <p className="text-[10px] font-mono uppercase text-zinc-600">
                      {new Date(e.eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-zinc-200">{e.title}</h3>
                      {e.finishPosition !== null && e.finishPosition !== undefined && (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border shrink-0 ${
                          e.finishPosition === 1 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 'text-zinc-400 border-zinc-700'
                        }`}>
                          <Trophy className="h-2.5 w-2.5" aria-hidden="true" />
                          P{e.finishPosition}
                        </span>
                      )}
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border shrink-0 ${style.badge}`}>
                        {e.eventType}
                      </span>
                    </div>
                    {e.series && <p className="text-xs text-zinc-500 mt-1">{e.series}</p>}
                    {e.notes && <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">{e.notes}</p>}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <div className="border border-dashed border-zinc-800 p-16 text-center">
          <CalendarDays className="h-12 w-12 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
          <p className="text-zinc-400 text-base font-semibold mb-1">No events yet.</p>
          <p className="text-zinc-600 text-sm">Add your first race, practice day, or event.</p>
        </div>
      )}
    </div>
  )
}
