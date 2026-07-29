import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdScheduleEvents, mdExpenses, mdSponsors, mdWorkOrders } from '@/lib/db/schema'
import { eq, desc, gte, lte, and, sql } from 'drizzle-orm'
import { CalendarDays, DollarSign, Award, Wrench, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Team Overview — Motorsport Data' }

async function getTeamId(userId: string): Promise<string | null> {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

export default async function TeamOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const today = new Date().toISOString().split('T')[0]

  // Parallel fetches
  const [nextRaces, recentExpenses, sponsors, openWorkOrders] = await Promise.all([
    db.select().from(mdScheduleEvents)
      .where(and(eq(mdScheduleEvents.teamId, teamId), gte(mdScheduleEvents.eventDate, today)))
      .orderBy(mdScheduleEvents.eventDate).limit(3),
    db.select().from(mdExpenses)
      .where(eq(mdExpenses.teamId, teamId))
      .orderBy(desc(mdExpenses.expenseDate)).limit(5),
    db.select().from(mdSponsors)
      .where(and(eq(mdSponsors.teamId, teamId), eq(mdSponsors.status, 'active'))),
    db.select().from(mdWorkOrders)
      .where(and(eq(mdWorkOrders.teamId, teamId), eq(mdWorkOrders.status, 'open'))),
  ])

  // YTD spend
  const [ytdRow] = await db.select({ total: sql<number>`coalesce(sum(amount_cents),0)` })
    .from(mdExpenses).where(eq(mdExpenses.teamId, teamId))
  const ytdSpend = Number(ytdRow?.total ?? 0)

  // Total sponsor value
  const sponsorTotal = sponsors.reduce((s, sp) => s + sp.valueCents, 0)

  const KPI = [
    { label: 'YTD Spend',       value: `$${(ytdSpend / 100).toLocaleString()}`,    icon: DollarSign, href: '/data/team/budget',   accent: 'text-[var(--color-yamaha)]' },
    { label: 'Next Race',       value: nextRaces[0]?.eventDate ?? 'None scheduled', icon: CalendarDays, href: '/data/team/calendar', accent: 'text-lime-400' },
    { label: 'Sponsor Value',   value: `$${(sponsorTotal / 100).toLocaleString()}`, icon: Award,       href: '/data/team/sponsors',  accent: 'text-[var(--color-yamaha)]' },
    { label: 'Open Work Orders',value: String(openWorkOrders.length),               icon: Wrench,      href: '/data/team/mechanic',  accent: 'text-red-400' },
  ]

  return (
    <div className="p-6 max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
          style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
          Team Overview
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Your race program at a glance.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI.map(({ label, value, icon: Icon, href, accent }) => (
          <Link key={label} href={href}
            className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 flex flex-col gap-3 transition-colors">
            <Icon className={`h-4 w-4 ${accent}`} aria-hidden="true" />
            <div>
              <p className="text-2xl font-black text-zinc-100 truncate">{value}</p>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column: upcoming races + recent expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming races */}
        <section aria-labelledby="upcoming-races">
          <div className="flex items-center justify-between mb-3">
            <h2 id="upcoming-races" className="text-sm font-bold uppercase tracking-wider text-zinc-400">Upcoming Races</h2>
            <Link href="/data/team/calendar" className="text-xs text-zinc-600 hover:text-[var(--color-yamaha)] transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {nextRaces.length === 0 ? (
              <p className="text-zinc-600 text-sm py-6 border border-dashed border-zinc-800 text-center">No upcoming races scheduled.</p>
            ) : nextRaces.map((e) => (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-100 truncate">{e.title}</p>
                  {e.series && <p className="text-xs text-zinc-500 mt-0.5">{e.series}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono text-[var(--color-yamaha)]">{new Date(e.eventDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 mt-1 inline-block border ${
                    e.eventType === 'race' ? 'text-red-400 border-red-400/20 bg-red-400/5' : 'text-zinc-500 border-zinc-700'
                  }`}>{e.eventType}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent expenses */}
        <section aria-labelledby="recent-expenses">
          <div className="flex items-center justify-between mb-3">
            <h2 id="recent-expenses" className="text-sm font-bold uppercase tracking-wider text-zinc-400">Recent Expenses</h2>
            <Link href="/data/team/budget" className="text-xs text-zinc-600 hover:text-[var(--color-yamaha)] transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentExpenses.length === 0 ? (
              <p className="text-zinc-600 text-sm py-6 border border-dashed border-zinc-800 text-center">No expenses recorded.</p>
            ) : recentExpenses.map((e) => (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{e.description ?? e.category}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">{e.category}</p>
                </div>
                <p className="text-sm font-bold text-[var(--color-yamaha)] shrink-0">${(e.amountCents / 100).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sponsor summary */}
      {sponsors.length > 0 && (
        <section aria-labelledby="sponsor-summary">
          <div className="flex items-center justify-between mb-3">
            <h2 id="sponsor-summary" className="text-sm font-bold uppercase tracking-wider text-zinc-400">Active Sponsors</h2>
            <Link href="/data/team/sponsors" className="text-xs text-zinc-600 hover:text-[var(--color-yamaha)] transition-colors flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {sponsors.map((s) => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 px-4 py-3 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[var(--color-yamaha)] shrink-0" aria-hidden="true" />
                <span className="text-sm font-semibold text-zinc-200">{s.sponsorName}</span>
                <span className="text-xs text-zinc-500">${(s.valueCents / 100).toLocaleString()}</span>
                <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${
                  s.sponsorType === 'cash' ? 'text-lime-400 border-lime-400/20' : 'text-[var(--color-yamaha)] border-[var(--color-yamaha-border)]'
                }`}>{s.sponsorType}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Open work orders */}
      {openWorkOrders.length > 0 && (
        <section aria-labelledby="open-wo">
          <div className="flex items-center justify-between mb-3">
            <h2 id="open-wo" className="text-sm font-bold uppercase tracking-wider text-zinc-400">Open Work Orders</h2>
            <Link href="/data/team/mechanic" className="text-xs text-zinc-600 hover:text-[var(--color-yamaha)] transition-colors flex items-center gap-1">
              View <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {openWorkOrders.map((wo) => (
              <div key={wo.id} className="bg-zinc-900 border border-red-900/30 p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-100 truncate">{wo.title}</p>
                  {wo.description && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{wo.description}</p>}
                </div>
                <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border border-red-400/20 text-red-400 shrink-0">Open</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
