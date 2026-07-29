import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdCoachPackages, mdCoachSessions, mdCoachSessionAthletes, mdCoachClients } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { Tent, Plus, Users } from 'lucide-react'

export const metadata = { title: 'Camps — Motorsport Data' }

async function getTeamId(userId: string) {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

export default async function CampsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const [packages, sessions] = await Promise.all([
    db.select().from(mdCoachPackages).where(eq(mdCoachPackages.coachTeamId, teamId)),
    db.select().from(mdCoachSessions)
      .where(and(eq(mdCoachSessions.coachTeamId, teamId), eq(mdCoachSessions.sessionType, 'track'))),
  ])

  // Camp-type packages (multi-session, one-time fee)
  const camps = packages.filter(p => p.sessionCount !== null && p.priceCents > 20000)

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
            Camps
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{camps.length} camp program{camps.length !== 1 ? 's' : ''} &middot; {sessions.length} track session{sessions.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-[var(--color-yamaha)] text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-[var(--color-yamaha-light)] transition-colors"
          aria-label="Create camp (demo — upgrade for full access)"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Camp
        </button>
      </div>

      {/* Camp packages */}
      <section aria-labelledby="camp-programs">
        <h2 id="camp-programs" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">Camp Programs</h2>
        {camps.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-12 text-center">
            <Tent className="h-10 w-10 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-zinc-400 text-sm">No camp programs configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {camps.map(pkg => (
              <article key={pkg.id} className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-black text-zinc-100">{pkg.name}</h3>
                  {pkg.description && <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{pkg.description}</p>}
                </div>
                <div className="flex items-center gap-3 flex-wrap mt-auto">
                  <span className="text-lg font-black text-[var(--color-yamaha)]">${(pkg.priceCents / 100).toLocaleString()}</span>
                  {pkg.sessionCount && (
                    <span className="text-[9px] font-mono uppercase tracking-wider border border-zinc-700 text-zinc-400 px-1.5 py-0.5">
                      {pkg.sessionCount} sessions
                    </span>
                  )}
                  {pkg.durationWeeks && pkg.durationWeeks > 0 && (
                    <span className="text-[9px] font-mono uppercase tracking-wider border border-zinc-700 text-zinc-400 px-1.5 py-0.5">
                      {pkg.durationWeeks} week{pkg.durationWeeks !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Track sessions */}
      <section aria-labelledby="track-sessions">
        <h2 id="track-sessions" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">Track Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-zinc-600 text-sm py-6 border border-dashed border-zinc-800 text-center">No track sessions scheduled.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map(s => (
              <article key={s.id} className="bg-zinc-900 border border-zinc-800 p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-zinc-100">{s.title}</h3>
                  {s.location && <p className="text-xs text-zinc-500 mt-0.5">{s.location}</p>}
                  {s.notes && <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-2">{s.notes}</p>}
                  {s.aiDebrief && (
                    <div className="mt-3 bg-zinc-950 border border-[var(--color-yamaha-border)] p-3">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-yamaha)] mb-1.5">AI Debrief</p>
                      <p className="text-xs text-zinc-400 leading-relaxed">{s.aiDebrief}</p>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {s.scheduledAt && (
                    <p className="text-xs font-mono text-[var(--color-yamaha)]">
                      {new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                  <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border mt-1 inline-block ${
                    s.status === 'completed' ? 'text-lime-400 border-lime-400/20' : 'text-zinc-400 border-zinc-700'
                  }`}>{s.status}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
