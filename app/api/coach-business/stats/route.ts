import { NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { db } from '@/lib/db'
import { mdCoachClients, mdCoachSessions, mdCoachInvoices, mdTrainingPlans } from '@/lib/db/schema'
import { and, count, eq, sum, gte, sql } from 'drizzle-orm'

export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [activeAthletes, upcomingSessions, outstandingInvoices, activePlans,
    recentRevenue, totalAthletes] = await Promise.all([
    db.select({ n: count() }).from(mdCoachClients)
      .where(and(eq(mdCoachClients.coachTeamId, auth.teamId), eq(mdCoachClients.status, 'active'))),
    db.select({ n: count() }).from(mdCoachSessions)
      .where(and(eq(mdCoachSessions.coachTeamId, auth.teamId), eq(mdCoachSessions.status, 'scheduled'))),
    db.select({ total: sum(mdCoachInvoices.amountCents) }).from(mdCoachInvoices)
      .where(and(eq(mdCoachInvoices.coachTeamId, auth.teamId), eq(mdCoachInvoices.status, 'sent'))),
    db.select({ n: count() }).from(mdTrainingPlans)
      .where(and(eq(mdTrainingPlans.coachTeamId, auth.teamId), eq(mdTrainingPlans.status, 'active'))),
    db.select({ total: sum(mdCoachInvoices.amountCents) }).from(mdCoachInvoices)
      .where(and(
        eq(mdCoachInvoices.coachTeamId, auth.teamId),
        eq(mdCoachInvoices.status, 'paid'),
        gte(mdCoachInvoices.paidAt, thirtyDaysAgo),
      )),
    db.select({ n: count() }).from(mdCoachClients)
      .where(eq(mdCoachClients.coachTeamId, auth.teamId)),
  ])

  return NextResponse.json({
    success: true,
    stats: {
      activeAthletes: activeAthletes[0]?.n ?? 0,
      totalAthletes: totalAthletes[0]?.n ?? 0,
      upcomingSessions: upcomingSessions[0]?.n ?? 0,
      outstandingCents: Number(outstandingInvoices[0]?.total ?? 0),
      activePlans: activePlans[0]?.n ?? 0,
      revenueThirtyDaysCents: Number(recentRevenue[0]?.total ?? 0),
    },
  })
}
