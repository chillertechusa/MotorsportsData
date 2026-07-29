import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdCoachClients } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Users, Plus, Tag, MapPin } from 'lucide-react'

export const metadata = { title: 'Member Roster — Motorsport Data' }

async function getTeamId(userId: string) {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

export default async function FacilityRosterPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const members = await db.select().from(mdCoachClients)
    .where(eq(mdCoachClients.coachTeamId, teamId))

  const active  = members.filter(m => m.status === 'active')
  const pending = members.filter(m => m.status === 'pending')

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
            Member Roster
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{active.length} active &middot; {pending.length} pending</p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-sky-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-sky-300 transition-colors"
          aria-label="Add member (demo — upgrade for full access)"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-16 text-center">
          <Users className="h-12 w-12 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
          <p className="text-zinc-400 text-base font-semibold mb-1">No members yet.</p>
          <p className="text-zinc-600 text-sm">Add riders to track their sessions, memberships, and progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map(m => (
            <article key={m.id} className={`bg-zinc-900 border p-5 flex flex-col gap-4 ${
              m.status === 'pending' ? 'border-zinc-700 opacity-70' : 'border-zinc-800 hover:border-sky-400/30 transition-colors'
            }`}>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-200 shrink-0">
                  {m.firstName[0]}{m.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-100 truncate">{m.firstName} {m.lastName}</p>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
                    {m.status === 'pending' ? 'Pending' : 'Active Member'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {m.discipline && (
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-sky-400 border border-sky-400/20 bg-sky-400/5 px-2 py-0.5">
                    <Tag className="h-2.5 w-2.5" aria-hidden="true" />
                    {m.discipline}
                  </span>
                )}
                {m.classCategory && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 border border-zinc-700 px-2 py-0.5">
                    {m.classCategory}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
