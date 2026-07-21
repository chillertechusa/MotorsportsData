'use server'

import { requireMdOwner } from '@/lib/md-owner-auth'
import { db } from '@/lib/db'
import { mdTeams, mdTeamMembers, user as userTable } from '@/lib/db/schema'
import { eq, desc, ilike, or, and } from 'drizzle-orm'
import { MD_PLAN_CENTS, type MdPlanId, MD_PLAN_LABELS, MD_PLAN_IDS, isMdPlanId } from '@/lib/md-plans'
import { sendMdPlanGrantedEmail } from '@/lib/md-email'
import { sendExpiryAlerts } from '@/app/actions/md-expiry-alerts'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubscriberRow = {
  id: string
  teamName: string
  ownerEmail: string | null
  tier: string
  tierLabel: string
  status: string
  mrr: number   // monthly recurring revenue in cents (annual plan price ÷ 12)
  // True only when the team has a real Square subscription id — i.e. a genuine
  // paying customer. Seeded/test teams have a tier but no Square subscription,
  // so they never count toward revenue. Reads $0 until the first real checkout.
  isPaying: boolean
  createdAt: Date | null
}

export type RevenueDay = {
  date: string   // 'MMM D'
  revenue: number // dollars (not cents) for Recharts
}

export type OwnerFinancials = {
  subscribers: SubscriberRow[]
  mrrCents: number
  arrCents: number
  activeCount: number
  churnedCount: number
  tierBreakdown: Record<string, { count: number; mrrCents: number }>
  aiCallsThisMonth: number
  aiCostCentsThisMonth: number
  monthlyExpenses: { label: string; cents: number }[]
  revenueTimeline: RevenueDay[]  // 30 days ending today
}

// ── Search teams ─────────────────────────────────────────────────────────────

export type TeamSearchResult = {
  teamId: string
  teamName: string
  ownerEmail: string | null
  currentTier: string
  currentTierLabel: string
  status: string
}

export async function searchTeams(query: string): Promise<TeamSearchResult[]> {
  await requireMdOwner()
  if (!query || query.trim().length < 2) return []

  const q = `%${query.trim()}%`

  const rows = await db
    .select({
      teamId:     mdTeams.id,
      teamName:   mdTeams.name,
      tier:       mdTeams.subscriptionTier,
      status:     mdTeams.subscriptionStatus,
      role:       mdTeamMembers.role,
      email:      userTable.email,
    })
    .from(mdTeams)
    .leftJoin(mdTeamMembers, eq(mdTeamMembers.teamId, mdTeams.id))
    .leftJoin(userTable, eq(userTable.id, mdTeamMembers.userId))
    .where(or(ilike(mdTeams.name, q), ilike(userTable.email, q)))
    .limit(20)

  const map = new Map<string, TeamSearchResult>()
  for (const r of rows) {
    if (!map.has(r.teamId)) {
      const tier = (r.tier ?? 'privateer') as MdPlanId
      map.set(r.teamId, {
        teamId:           r.teamId,
        teamName:         r.teamName,
        ownerEmail:       r.role === 'owner' ? (r.email ?? null) : null,
        currentTier:      tier,
        currentTierLabel: MD_PLAN_LABELS[tier] ?? tier,
        status:           r.status ?? 'inactive',
      })
    } else if (r.role === 'owner' && r.email) {
      map.get(r.teamId)!.ownerEmail = r.email
    }
  }
  return Array.from(map.values())
}

// ── Grant / override plan access ──────────────────────────────────────────────

export type GrantResult =
  | { ok: true;  teamName: string; tier: string; expiresAt: string | null }
  | { ok: false; error: string }

export async function grantPlanAccess(
  teamId: string,
  tier: string,
  /** ISO date string OR null = permanent */
  expiresAt: string | null,
): Promise<GrantResult> {
  await requireMdOwner()

  if (!teamId)          return { ok: false, error: 'No team selected.' }
  if (!isMdPlanId(tier)) return { ok: false, error: `Invalid tier: ${tier}` }

  const periodEnd = expiresAt ? new Date(expiresAt) : null
  if (periodEnd && isNaN(periodEnd.getTime()))
    return { ok: false, error: 'Invalid expiry date.' }

  await db
    .update(mdTeams)
    .set({
      subscriptionTier:   tier,
      subscriptionStatus: 'active',
      ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
    })
    .where(eq(mdTeams.id, teamId))

  // Fetch team name + owner email for the confirmation email
  const [teamRow] = await db
    .select({ name: mdTeams.name })
    .from(mdTeams)
    .where(eq(mdTeams.id, teamId))
    .limit(1)

  const [ownerRow] = await db
    .select({ email: userTable.email, name: userTable.name })
    .from(mdTeamMembers)
    .innerJoin(userTable, eq(userTable.id, mdTeamMembers.userId))
    .where(and(eq(mdTeamMembers.teamId, teamId), eq(mdTeamMembers.role, 'owner')))
    .limit(1)

  const expiresLabel = periodEnd
    ? periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  // Fire activation email — non-blocking, never breaks the grant
  if (ownerRow?.email) {
    sendMdPlanGrantedEmail({
      to:        ownerRow.email,
      name:      ownerRow.name ?? 'Rider',
      teamName:  teamRow?.name ?? teamId,
      tierLabel: MD_PLAN_LABELS[tier as MdPlanId],
      expiresAt: expiresLabel,
    }).catch(() => {})
  }

  return {
    ok:        true,
    teamName:  teamRow?.name ?? teamId,
    tier:      MD_PLAN_LABELS[tier as MdPlanId],
    expiresAt: expiresLabel,
  }
}

// ── Revoke plan access (reset to inactive) ────────────────────────────────────

export async function revokePlanAccess(teamId: string): Promise<{ ok: boolean; error?: string }> {
  await requireMdOwner()
  if (!teamId) return { ok: false, error: 'No team specified.' }

  await db
    .update(mdTeams)
    .set({ subscriptionStatus: 'inactive' })
    .where(eq(mdTeams.id, teamId))

  return { ok: true }
}

// ── Billing history ───────────────────────────────────────────────────────────
// Since MD has no transactions table yet, we derive history from the active
// teams data: each active team represents a recurring monthly charge.

export type BillingRow = {
  teamId:    string
  teamName:  string
  email:     string | null
  tier:      string
  tierLabel: string
  amountCents: number
  date:      Date | null
  status:    string
}

export async function getBillingHistory(): Promise<BillingRow[]> {
  await requireMdOwner()

  const rows = await db
    .select({
      teamId:     mdTeams.id,
      teamName:   mdTeams.name,
      tier:       mdTeams.subscriptionTier,
      status:     mdTeams.subscriptionStatus,
      periodStart: mdTeams.currentPeriodStart,
      role:       mdTeamMembers.role,
      email:      userTable.email,
    })
    .from(mdTeams)
    .leftJoin(mdTeamMembers, and(eq(mdTeamMembers.teamId, mdTeams.id), eq(mdTeamMembers.role, 'owner')))
    .leftJoin(userTable, eq(userTable.id, mdTeamMembers.userId))
    .orderBy(desc(mdTeams.currentPeriodStart))

  const seen = new Set<string>()
  const result: BillingRow[] = []
  for (const r of rows) {
    if (seen.has(r.teamId)) continue
    seen.add(r.teamId)
    const tier = (r.tier ?? 'privateer') as MdPlanId
    result.push({
      teamId:      r.teamId,
      teamName:    r.teamName,
      email:       r.email ?? null,
      tier,
      tierLabel:   MD_PLAN_LABELS[tier] ?? tier,
      amountCents: MD_PLAN_CENTS[tier] ?? 0,
      date:        r.periodStart ?? null,
      status:      r.status ?? 'inactive',
    })
  }
  return result
}

// ── Run expiry alerts (callable from owner console) ────────────────────────────

export async function runExpiryAlerts() {
  await requireMdOwner()
  return sendExpiryAlerts()
}

// ── AI cost model ─────────────────────────────────────────────────────���───────
// Gemini 2.5 Pro via Vercel AI Gateway (approx $1.25/Mtok in, $10/Mtok out).
// Average MD Intel call: ~2k input tokens + ~500 output tokens.
const AI_COST_CENTS_PER_CALL = Math.round(
  (2000 / 1_000_000) * 125 + (500 / 1_000_000) * 1000
)

// ── Fixed monthly expenses ────────────────────────────────────────────────────
const FIXED_EXPENSES = [
  { label: 'Neon Postgres',           cents: 1900 },
  { label: 'Vercel Pro',              cents: 2000 },
  { label: 'Domain (motorsportsdata.io)', cents: 167 },
]

// ── Main action ───────────────────────────────────────────────────────────────

export async function getOwnerFinancials(): Promise<OwnerFinancials> {
  await requireMdOwner()

  // Fetch all teams + the owner member's user email in one join
  const rows = await db
    .select({
      teamId:             mdTeams.id,
      teamName:           mdTeams.name,
      tier:               mdTeams.subscriptionTier,
      status:             mdTeams.subscriptionStatus,
      squareSubscriptionId: mdTeams.squareSubscriptionId,
      createdAt:          mdTeams.createdAt,
      memberRole:         mdTeamMembers.role,
      ownerEmail:         userTable.email,
    })
    .from(mdTeams)
    .leftJoin(
      mdTeamMembers,
      eq(mdTeamMembers.teamId, mdTeams.id),
    )
    .leftJoin(userTable, eq(userTable.id, mdTeamMembers.userId))
    .orderBy(desc(mdTeams.createdAt))

  // Collapse rows per team, picking the first 'owner' role email
  const teamMap = new Map<string, SubscriberRow>()
  for (const row of rows) {
    if (!teamMap.has(row.teamId)) {
      const tier = (row.tier ?? 'privateer') as MdPlanId
      teamMap.set(row.teamId, {
        id:         row.teamId,
        teamName:   row.teamName,
        ownerEmail: row.memberRole === 'owner' ? (row.ownerEmail ?? null) : null,
        tier,
        tierLabel:  MD_PLAN_LABELS[tier] ?? tier,
        status:     row.status ?? 'inactive',
        // MD_PLAN_CENTS is the ANNUAL price. MRR = ARR / 12 so every downstream
        // figure (mrrCents, arrCents = mrrCents×12, monthly Square fees, the
        // daily revenue timeline) reconciles to a real monthly basis.
        mrr:        Math.round((MD_PLAN_CENTS[tier] ?? 0) / 12),
        isPaying:   Boolean(row.squareSubscriptionId),
        createdAt:  row.createdAt,
      })
    } else if (row.memberRole === 'owner' && row.ownerEmail) {
      teamMap.get(row.teamId)!.ownerEmail = row.ownerEmail
    }
  }

  const subscribers = Array.from(teamMap.values())
  // Revenue is counted ONLY for real paying customers (teams with a Square
  // subscription id). Seeded/test teams carry a tier but no Square subscription,
  // so the console starts at a true $0 and climbs on the first real checkout —
  // no reset needed when the seed accounts are eventually deleted.
  const active  = subscribers.filter((s) => s.isPaying && s.status === 'active')
  const churned = subscribers.filter((s) => s.isPaying && s.status !== 'active' && s.status !== 'trialing')

  const mrrCents = active.reduce((sum, s) => sum + s.mrr, 0)

  // Tier breakdown
  const tierBreakdown: Record<string, { count: number; mrrCents: number }> = {}
  for (const s of active) {
    if (!tierBreakdown[s.tier]) tierBreakdown[s.tier] = { count: 0, mrrCents: 0 }
    tierBreakdown[s.tier].count++
    tierBreakdown[s.tier].mrrCents += s.mrr
  }

  // Square processing fee estimate: 2.9% + $0.30 per active team per month
  const squareFeesCents = active.reduce((sum, s) => sum + Math.round(s.mrr * 0.029) + 30, 0)

  // AI cost estimate: 5 calls/day per Factory Rig team × 30 days
  const factoryCount = tierBreakdown['factory_rig']?.count ?? 0
  const aiCallsThisMonth = factoryCount * 5 * 30
  const aiCostCentsThisMonth = aiCallsThisMonth * AI_COST_CENTS_PER_CALL

  const monthlyExpenses = [
    ...FIXED_EXPENSES,
    { label: 'Square processing (est 2.9% + $0.30/txn)', cents: squareFeesCents },
    { label: 'Gemini 2.5 Pro — MD Intel',                cents: aiCostCentsThisMonth },
  ]

  // 30-day revenue timeline — distribute each active team's MRR across the
  // days since they joined (or the last 30 days if older). This gives a
  // realistic cumulative-style area chart without needing a transactions table.
  const today = new Date()
  const revenueTimeline: RevenueDay[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: 0,
    }
  })

  // Each active team contributes their daily rate (MRR / 30) from the later of
  // their join date or 30 days ago.
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 29)

  for (const sub of active) {
    const dailyRate = sub.mrr / 100 / 30 // dollars per day
    const joinDate  = sub.createdAt ? new Date(sub.createdAt) : thirtyDaysAgo
    const startDate = joinDate > thirtyDaysAgo ? joinDate : thirtyDaysAgo

    revenueTimeline.forEach((day, idx) => {
      const dayDate = new Date(today)
      dayDate.setDate(today.getDate() - (29 - idx))
      if (dayDate >= startDate) {
        day.revenue = parseFloat((day.revenue + dailyRate).toFixed(2))
      }
    })
  }

  return {
    subscribers,
    mrrCents,
    arrCents:            mrrCents * 12,
    activeCount:         active.length,
    churnedCount:        churned.length,
    tierBreakdown,
    aiCallsThisMonth,
    aiCostCentsThisMonth,
    monthlyExpenses,
    revenueTimeline,
  }
}
