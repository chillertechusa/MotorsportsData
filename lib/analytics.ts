'use server'

import { db } from '@/lib/db'
import { mdAnalyticsEvents, mdAnalyticsDailyMetrics, mdTeams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type AnalyticsEventType = 'signup' | 'checkout' | 'tier_upgrade' | 'team_invite' | 'member_added'

export interface TrackEventParams {
  eventType: AnalyticsEventType
  userId?: string
  teamId?: string
  tier?: string
  billingFrequency?: string
  amountCents?: number
  metadata?: Record<string, any>
}

/**
 * Track platform events for analytics and dashboards
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    await db.insert(mdAnalyticsEvents).values({
      eventType: params.eventType,
      userId: params.userId,
      teamId: params.teamId,
      tier: params.tier,
      billingFrequency: params.billingFrequency,
      amountCents: params.amountCents,
      metadata: params.metadata || {},
    })
  } catch (error) {
    console.error('[v0] Analytics tracking error:', error)
    // Don't throw - analytics tracking should not break main flow
  }
}

/**
 * Track signup event
 */
export async function trackSignup(userId: string, tier: string = 'rookie') {
  await trackEvent({
    eventType: 'signup',
    userId,
    tier,
  })
}

/**
 * Track checkout event
 */
export async function trackCheckout(
  userId: string,
  teamId: string,
  tier: string,
  billingFrequency: 'annual' | 'monthly',
  amountCents: number
) {
  await trackEvent({
    eventType: 'checkout',
    userId,
    teamId,
    tier,
    billingFrequency,
    amountCents,
    metadata: { checkoutTimestamp: new Date().toISOString() },
  })
}

/**
 * Track tier upgrade
 */
export async function trackTierUpgrade(
  userId: string,
  teamId: string,
  fromTier: string,
  toTier: string,
  amountCents: number
) {
  await trackEvent({
    eventType: 'tier_upgrade',
    userId,
    teamId,
    tier: toTier,
    amountCents,
    metadata: { fromTier, toTier },
  })
}

/**
 * Track team member invitation
 */
export async function trackTeamInvite(userId: string, teamId: string, invitedEmail: string) {
  await trackEvent({
    eventType: 'team_invite',
    userId,
    teamId,
    metadata: { invitedEmail },
  })
}

/**
 * Track member added to team
 */
export async function trackMemberAdded(userId: string, teamId: string, memberEmail: string) {
  await trackEvent({
    eventType: 'member_added',
    userId,
    teamId,
    metadata: { memberEmail },
  })
}

/**
 * Get analytics summary for a date range
 */
export async function getAnalyticsSummary(startDate: Date, endDate: Date) {
  try {
    const events = await db
      .select()
      .from(mdAnalyticsEvents)

    const filteredEvents = events.filter((e) => {
      if (!e.createdAt) return false
      const eventTime = new Date(e.createdAt).getTime()
      return eventTime >= startDate.getTime() && eventTime <= endDate.getTime()
    })

    const summary = {
      totalSignups: filteredEvents.filter((e) => e.eventType === 'signup').length,
      totalCheckouts: filteredEvents.filter((e) => e.eventType === 'checkout').length,
      totalRevenueCents: filteredEvents
        .filter((e) => e.amountCents)
        .reduce((sum, e) => sum + (e.amountCents || 0), 0),
      tierDistribution: {} as Record<string, number>,
      billingFrequencyDistribution: { annual: 0, monthly: 0 },
      eventsByType: {
        signup: 0,
        checkout: 0,
        tier_upgrade: 0,
        team_invite: 0,
        member_added: 0,
      },
    }

    for (const event of filteredEvents) {
      summary.eventsByType[event.eventType as keyof typeof summary.eventsByType]++
      if (event.tier) {
        summary.tierDistribution[event.tier] = (summary.tierDistribution[event.tier] || 0) + 1
      }
      if (event.billingFrequency) {
        summary.billingFrequencyDistribution[event.billingFrequency as 'annual' | 'monthly']++
      }
    }

    return summary
  } catch (error) {
    console.error('[v0] Analytics summary error:', error)
    return {
      totalSignups: 0,
      totalCheckouts: 0,
      totalRevenueCents: 0,
      tierDistribution: {},
      billingFrequencyDistribution: { annual: 0, monthly: 0 },
      eventsByType: { signup: 0, checkout: 0, tier_upgrade: 0, team_invite: 0, member_added: 0 },
    }
  }
}

/**
 * Get daily trend data for charts
 */
export async function getDailyTrends(startDate: Date, endDate: Date) {
  try {
    const events = await db.select().from(mdAnalyticsEvents)

    const dailyData: Record<string, any> = {}

    for (const event of events) {
      if (!event.createdAt) continue
      const eventTime = new Date(event.createdAt).getTime()
      if (eventTime < startDate.getTime() || eventTime > endDate.getTime()) continue

      const dateKey = new Date(event.createdAt).toISOString().split('T')[0]

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          signups: 0,
          checkouts: 0,
          revenue: 0,
        }
      }

      if (event.eventType === 'signup') dailyData[dateKey].signups++
      if (event.eventType === 'checkout') {
        dailyData[dateKey].checkouts++
        dailyData[dateKey].revenue += event.amountCents || 0
      }
    }

    return Object.values(dailyData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error('[v0] Daily trends error:', error)
    return []
  }
}
