// NOTE: no 'use server' — this file mixes server actions with plain helpers.
// The async server actions are individually marked with the directive below.

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { MD_PLAN_CENTS, MD_PLAN_LABELS, MD_PLAN_IDS, type MdPlanId, isMdPlanId } from '@/lib/md-plans'
export type SubscriptionStatus = {
  teamId:            string
  teamName:          string
  tier:              MdPlanId
  tierLabel:         string
  priceCents:        number
  status:            string
  periodStart:       Date | null
  periodEnd:         Date | null
  daysRemaining:     number | null
  isActive:          boolean
  isExpiringSoon:    boolean  // within 7 days
  frequency:         'annual' | 'monthly'
  hasSubscription:   boolean  // a real Square recurring subscription exists
  cardOnFile:        boolean
  cancelAtPeriodEnd: boolean
  canceledAt:        Date | null
  paymentStatus:     string
}

export async function getSessionUserId(): Promise<string | null> {
  'use server'
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id ?? null
  }

export async function getMySubscription(): Promise<SubscriptionStatus | null> {
  'use server'
  const userId = await getSessionUserId()
  if (!userId) return null

  const [membership] = await db
    .select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers)
    .where(and(eq(mdTeamMembers.userId, userId), eq(mdTeamMembers.role, 'owner')))
    .limit(1)

  if (!membership) return null

  const [team] = await db
    .select()
    .from(mdTeams)
    .where(eq(mdTeams.id, membership.teamId))
    .limit(1)

  if (!team) return null

  const tier      = (team.subscriptionTier ?? 'privateer') as MdPlanId
  const status    = team.subscriptionStatus ?? 'inactive'
  const periodEnd = team.currentPeriodEnd ?? null
  const now       = new Date()

  const daysRemaining = periodEnd
    ? Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null

  const frequency = (team.billingFrequency ?? 'annual') as 'annual' | 'monthly'

  return {
    teamId:            team.id,
    teamName:          team.name,
    tier,
    tierLabel:         MD_PLAN_LABELS[tier] ?? tier,
    priceCents:        MD_PLAN_CENTS[tier] ?? 0,
    status,
    periodStart:       team.currentPeriodStart ?? null,
    periodEnd,
    daysRemaining,
    isActive:          status === 'active',
    isExpiringSoon:    daysRemaining !== null && daysRemaining <= 7 && status === 'active',
    frequency,
    hasSubscription:   Boolean(team.squareSubscriptionId),
    cardOnFile:        Boolean(team.squareCardId),
    cancelAtPeriodEnd: Boolean(team.cancelAtPeriodEnd),
    canceledAt:        team.subscriptionCanceledAt ?? null,
    paymentStatus:     team.paymentStatus ?? 'active',
  }
}

export type PlanOption = {
  id:         MdPlanId
  label:      string
  priceCents: number
  current:    boolean
}

export function getPlanOptions(currentTier: MdPlanId): PlanOption[] {
  return MD_PLAN_IDS.map((id) => ({
    id,
    label:      MD_PLAN_LABELS[id],
    priceCents: MD_PLAN_CENTS[id],
    current:    id === currentTier,
  }))
}

// Upgrade / downgrade — redirects to checkout with the chosen plan pre-selected.
// The checkout page handles the Square card form + billing, which requires a
// live browser session and can't be server-action-only.
export function getChangePlanUrl(newTier: MdPlanId): string {
  return `/data/checkout?plan=${newTier}`
}
