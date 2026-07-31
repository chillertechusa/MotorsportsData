import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdCoachClients, mdCoachSessions, mdCoachInvoices } from '@/lib/db/schema'
import { eq, gte, sql, and } from 'drizzle-orm'
import { Users, CalendarDays, DollarSign, Tent, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Facility Overview — Motorsport Data' }

async function getTeamId(userId: string) {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

export default async function FacilityOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [members, upcomingSessions, invoices] = await Promise.all([
    db.select().from(mdCoachClients).where(eq(mdCoachClients.coachTeamId, teamId)),
    db.select().from(mdCoachSessions)
      .where(and(eq(mdCoachSessions.coachTeamId, teamId), eq(mdCoachSessions.status, 'scheduled')))
      .limit(4),
    db.select().from(mdCoachInvoices).where(eq(mdCoachInvoices.coachTeamId, teamId)),
  ])

  const active   = members.filter(m => m.status === 'active')
  const totalRev = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amountCents, 0)
  const pending  = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.amountCents, 0)

  const KPI = [
    { label: 'Active Members',    value: String(active.length),              icon: Users,       href: '/data/facility/roster',      accent: 'text-[var(--color-yamaha)]' },
    { label: 'Upcoming Sessions', value: String(upcomingSessions.length),     icon: CalendarDays,href: '/data/facility/schedule',    accent: 'text-green-500' },
    { label: 'Revenue Collected', value: `$${(totalRev / 100).toLocaleString()}`, icon: DollarSign, href: '/data/facility/memberships', accent: 'text-green-400' },
    { label: 'Invoices Pending',  value: `$${(pending / 100).toLocaleString()}`,  icon: Tent,       href: '/data/facility/memberships', accent: 'text-yellow-400' },
  ]

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
          style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
          Facility Overview
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Your training facility at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI.map(({ label, value, icon: Icon, href, accent }) => (
          <Link key={label} href={href}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 flex flex-col gap-3 transition-colors">
            <Icon className={`h-4 w-4 ${accent}`} aria-hidden="true" />
            <div>
              <p className="text-2xl font-black text-zinc-100">{value}</p>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming sessions */}
      <section aria-labelledby="upcoming-sessions">
        <div className="flex items-center justify-between mb-3">
          <h2 id="upcoming-sessions" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Upcoming Sessions</h2>
          <Link href="/data/facility/schedule" className="text-xs text-zinc-600 hover:text-[var(--color-yamaha)] transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <p className="text-zinc-600 text-sm py-6 border border-dashed border-zinc-800 text-center">No sessions scheduled.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingSessions.map(s => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-100 truncate">{s.title}</p>
                  {s.location && <p className="text-xs text-zinc-500 mt-0.5">{s.location}</p>}
                  {s.notes && <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{s.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  {s.scheduledAt && (
                    <p className="text-xs font-mono text-[var(--color-yamaha)]">
                      {new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{s.durationMinutes}min</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Member roster quick view */}
      <section aria-labelledby="member-list">
        <div className="flex items-center justify-between mb-3">
          <h2 id="member-list" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Members</h2>
          <Link href="/data/facility/roster" className="text-xs text-zinc-600 hover:text-[var(--color-yamaha)] transition-colors flex items-center gap-1">
            Manage <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {active.slice(0, 8).map(m => (
            <div key={m.id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2">
              <div className="h-6 w-6 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-200 shrink-0">
                {m.firstName[0]}{m.lastName[0]}
              </div>
              <span className="text-xs font-semibold text-zinc-300">{m.firstName} {m.lastName}</span>
              {m.classCategory && (
                <span className="text-[9px] font-mono text-[var(--color-yamaha)] border border-[var(--color-yamaha-border)] px-1.5 py-0.5">{m.classCategory}</span>
              )}
            </div>
          ))}
          {active.length > 8 && (
            <div className="flex items-center px-3 py-2 border border-dashed border-zinc-700">
              <span className="text-xs text-zinc-500">+{active.length - 8} more</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
