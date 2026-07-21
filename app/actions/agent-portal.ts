'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  mdExternalAccounts,
  mdExternalAccessGrants,
  mdTeams,
  mdVehicles,
  mdSessions,
} from '@/lib/db/schema'
import {
  requireExternalAccess,
  isEntitled,
  logSecurityEvent,
  type ExternalAccessResult,
} from '@/lib/external-access'

/** Resolve the Better Auth session user id, or throw. */
async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export type AgentAccount = typeof mdExternalAccounts.$inferSelect

/** Return the agent external account for the current user, or null if none exists. */
export async function getMyAgentAccount(): Promise<AgentAccount | null> {
  const userId = await getUserId()
  const [account] = await db
    .select()
    .from(mdExternalAccounts)
    .where(
      and(
        eq(mdExternalAccounts.userId, userId),
        eq(mdExternalAccounts.accountType, 'agent'),
      ),
    )
    .limit(1)
  return account ?? null
}

/** Create the agent external account during onboarding. Starts UNENTITLED (hard gate). */
export async function createAgentAccount(input: {
  orgName: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  bio?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await getUserId()

  const existing = await getMyAgentAccount()
  if (existing) return { ok: false, error: 'An agent account already exists for this login.' }

  if (!input.orgName?.trim() || !input.contactName?.trim() || !input.contactEmail?.trim()) {
    return { ok: false, error: 'Agency name, contact name, and email are required.' }
  }

  await db.insert(mdExternalAccounts).values({
    userId,
    accountType: 'agent',
    orgName: input.orgName.trim(),
    contactName: input.contactName.trim(),
    contactEmail: input.contactEmail.trim(),
    contactPhone: input.contactPhone?.trim() || null,
    website: input.website?.trim() || null,
    bio: input.bio?.trim() || null,
    billingStatus: 'none', // ACCESS IS THE PRODUCT — no data until subscribed
    verificationStatus: 'pending',
    seatIncludedRiders: 3,
  })

  revalidatePath('/data/agent')
  return { ok: true }
}

export type RosterEntry = {
  grantId: string
  teamId: string
  riderName: string
  riderClass: string | null
  discipline: string | null
  status: string
  requestedAt: Date | null
  grantedAt: Date | null
}

/**
 * The agent's roster. Returns the entitlement flag plus every grant (pending +
 * granted) so the UI can gate rider data behind an active subscription.
 */
export async function getAgentRoster(): Promise<{
  account: AgentAccount | null
  entitled: boolean
  entries: RosterEntry[]
}> {
  const account = await getMyAgentAccount()
  if (!account) return { account: null, entitled: false, entries: [] }

  const entitled = isEntitled(account)

  const grants = await db
    .select({
      grantId: mdExternalAccessGrants.id,
      teamId: mdExternalAccessGrants.teamId,
      status: mdExternalAccessGrants.status,
      requestedAt: mdExternalAccessGrants.requestedAt,
      grantedAt: mdExternalAccessGrants.grantedAt,
      riderName: mdTeams.riderName,
      teamName: mdTeams.name,
      riderClass: mdTeams.riderClass,
      discipline: mdTeams.discipline,
    })
    .from(mdExternalAccessGrants)
    .innerJoin(mdTeams, eq(mdExternalAccessGrants.teamId, mdTeams.id))
    .where(eq(mdExternalAccessGrants.externalAccountId, account.id))
    .orderBy(desc(mdExternalAccessGrants.requestedAt))

  const entries: RosterEntry[] = grants.map((g) => ({
    grantId: g.grantId,
    teamId: g.teamId,
    riderName: g.riderName || g.teamName || 'Unnamed Rider',
    riderClass: g.riderClass,
    discipline: g.discipline,
    status: g.status,
    requestedAt: g.requestedAt,
    grantedAt: g.grantedAt,
  }))

  return { account, entitled, entries }
}

export type RiderProfile = {
  teamId: string
  riderName: string
  riderClass: string | null
  riderBirthYear: number | null
  discipline: string | null
  vehicles: { id: string; name: string; type: string | null; discipline: string | null }[]
  stats: {
    totalSessions: number
    tracksRidden: number
    bestLapSeconds: number | null
    totalSessionHours: number
  }
  recentSessions: {
    id: string
    trackName: string | null
    sessionDate: string | null
    bestLapSeconds: number | null
    trackConditions: string | null
    trackSurface: string | null
  }[]
}

/**
 * Gated rider profile. Runs the hard entitlement + consent gate before returning
 * any data. Denials are logged to the Access Sentinel inside requireExternalAccess.
 */
export async function getRiderProfileForAgent(
  teamId: string,
  ctx?: { userId?: string; ipAddress?: string | null; userAgent?: string | null },
): Promise<{ ok: true; profile: RiderProfile } | { ok: false; reason: string }> {
  // Route handlers pass an explicit userId (resolved from the request's own headers),
  // because `headers()` from next/headers is unreliable inside route handlers.
  // Server-component callers omit ctx and fall back to the session + headers() here.
  let ipAddress = ctx?.ipAddress ?? null
  let userAgent = ctx?.userAgent ?? null
  let userId = ctx?.userId
  if (!userId) {
    userId = await getUserId()
    const hdrs = await headers()
    ipAddress = hdrs.get('x-forwarded-for')
    userAgent = hdrs.get('user-agent')
  }
  const gate: ExternalAccessResult = await requireExternalAccess(userId, teamId, {
    ipAddress,
    userAgent,
  })
  if (!gate.ok) return { ok: false, reason: gate.reason }

  const [team] = await db.select().from(mdTeams).where(eq(mdTeams.id, teamId)).limit(1)
  if (!team) return { ok: false, reason: 'no_account' }

  const vehicles = await db
    .select({
      id: mdVehicles.id,
      name: mdVehicles.name,
      type: mdVehicles.type,
      discipline: mdVehicles.discipline,
    })
    .from(mdVehicles)
    .where(eq(mdVehicles.teamId, teamId))

  const sessions = await db
    .select({
      id: mdSessions.id,
      trackName: mdSessions.trackName,
      sessionDate: mdSessions.sessionDate,
      bestLapSeconds: mdSessions.bestLapSeconds,
      sessionHours: mdSessions.sessionHours,
      trackConditions: mdSessions.trackConditions,
      trackSurface: mdSessions.trackSurface,
    })
    .from(mdSessions)
    .where(eq(mdSessions.teamId, teamId))
    .orderBy(desc(mdSessions.sessionDate))

  const laps = sessions.map((s) => s.bestLapSeconds).filter((v): v is number => typeof v === 'number' && v > 0)
  const tracks = new Set(sessions.map((s) => s.trackName).filter(Boolean))
  const totalHours = sessions.reduce((sum, s) => sum + (s.sessionHours ?? 0), 0)

  const profile: RiderProfile = {
    teamId,
    riderName: team.riderName || team.name || 'Unnamed Rider',
    riderClass: team.riderClass,
    riderBirthYear: team.riderBirthYear,
    discipline: team.discipline,
    vehicles,
    stats: {
      totalSessions: sessions.length,
      tracksRidden: tracks.size,
      bestLapSeconds: laps.length ? Math.min(...laps) : null,
      totalSessionHours: Math.round(totalHours * 10) / 10,
    },
    recentSessions: sessions.slice(0, 10).map((s) => ({
      id: s.id,
      trackName: s.trackName,
      sessionDate: s.sessionDate ? String(s.sessionDate) : null,
      bestLapSeconds: s.bestLapSeconds,
      trackConditions: s.trackConditions,
      trackSurface: s.trackSurface,
    })),
  }

  // IP Sentinel (inline): record every successful rider-data pull. A single pull is
  // benign; the sweep engine watches for one account pulling many distinct riders
  // fast (bulk_profile_pull = scraping the dataset).
  await logSecurityEvent({
    sentinel: 'ip',
    eventType: 'profile_accessed',
    severity: 'info',
    actorUserId: userId,
    externalAccountId: gate.account.id,
    teamId,
    targetRef: `team:${teamId}`,
    ipAddress,
    userAgent,
    detail: { accountType: gate.account.accountType },
  })

  return { ok: true, profile }
}

/**
 * Agent requests access to a rider (team). Creates a PENDING grant — the rider/team
 * owner must approve it before any data is visible (consent-based access model).
 */
export async function requestRiderAccess(
  teamId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await getUserId()
  const account = await getMyAgentAccount()
  if (!account) return { ok: false, error: 'No agent account found.' }

  const [team] = await db.select({ id: mdTeams.id }).from(mdTeams).where(eq(mdTeams.id, teamId)).limit(1)
  if (!team) return { ok: false, error: 'Rider not found.' }

  const [existing] = await db
    .select({ id: mdExternalAccessGrants.id, status: mdExternalAccessGrants.status })
    .from(mdExternalAccessGrants)
    .where(
      and(
        eq(mdExternalAccessGrants.externalAccountId, account.id),
        eq(mdExternalAccessGrants.teamId, teamId),
      ),
    )
    .limit(1)

  if (existing) {
    return { ok: false, error: `A request to this rider already exists (${existing.status}).` }
  }

  await db.insert(mdExternalAccessGrants).values({
    externalAccountId: account.id,
    teamId,
    status: 'pending',
    requestedBy: 'external',
    scope: { results: true, progression: true, setups: false },
  })

  await logSecurityEvent({
    sentinel: 'access',
    eventType: 'access_requested',
    severity: 'info',
    actorUserId: userId,
    externalAccountId: account.id,
    teamId,
    targetRef: `team:${teamId}`,
    detail: { accountType: 'agent' },
  })

  revalidatePath('/data/agent')
  return { ok: true }
}

/** Search riders (teams) by name for the "request access" flow. Metadata only, not gated data. */
export async function searchRiders(
  query: string,
): Promise<{ teamId: string; riderName: string; riderClass: string | null; discipline: string | null }[]> {
  const userId = await getUserId()
  const q = query.trim()
  if (q.length < 2) return []

  const rows = await db
    .select({
      teamId: mdTeams.id,
      riderName: mdTeams.riderName,
      teamName: mdTeams.name,
      riderClass: mdTeams.riderClass,
      discipline: mdTeams.discipline,
    })
    .from(mdTeams)
    .limit(200)

  const needle = q.toLowerCase()
  const results = rows
    .filter((r) => (r.riderName || r.teamName || '').toLowerCase().includes(needle))
    .slice(0, 20)

  // IP Sentinel (inline): each search is logged. The sweep flags high-volume
  // searching by one actor (roster_enumeration = mapping the rider base).
  await logSecurityEvent({
    sentinel: 'ip',
    eventType: 'roster_search',
    severity: 'info',
    actorUserId: userId,
    targetRef: `query:${q.slice(0, 40)}`,
    detail: { query: q.slice(0, 80), resultCount: results.length },
  })

  return results
    .map((r) => ({
      teamId: r.teamId,
      riderName: r.riderName || r.teamName || 'Unnamed Rider',
      riderClass: r.riderClass,
      discipline: r.discipline,
    }))
}
