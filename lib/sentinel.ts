import { db } from '@/lib/db'
import {
  mdSecurityEvents,
  mdExternalAccounts,
  mdTeams,
  mdUserCompliance,
  mdConsentRecords,
  mdLegalDocuments,
} from '@/lib/db/schema'
import { and, desc, eq, gte, sql, inArray } from 'drizzle-orm'
import {
  SENTINEL_LENSES,
  type SentinelLens,
  type Severity,
  type SentinelEventRow,
  type SentinelStats,
} from '@/lib/sentinel-types'

/**
 * THE SENTINEL SQUAD — one engine, four lenses.
 *
 *   ACCESS   — entitlement-gate abuse (revenue + aggregate-data moat)
 *   CONSENT  — data touched without valid/current consent; minors w/o guardian
 *   IP       — scraping / bulk aggregate pulls / roster enumeration
 *   SECURITY — auth abuse (brute force / credential stuffing), cross-team access
 *
 * Detect + LOG + ALERT. No auto-blocking — the owner stays in control.
 * Detection is RULE-BASED over existing tables (no LLM, ~zero cost). Events arrive
 * two ways: INLINE hooks (logSecurityEvent at live chokepoints) and periodic SWEEPS
 * (runSentinelSweeps, below) that scan for patterns a single request can't see.
 *
 * Shared types + the lens registry live in lib/sentinel-types.ts (no db import) so
 * client components can use them without bundling the Postgres driver.
 */

export {
  SENTINEL_LENSES,
  type SentinelLens,
  type Severity,
  type SentinelEventRow,
  type SentinelStats,
}

// ── Read / aggregate layer (used by the owner console) ────────────────────────

/** Per-lens counts for the console header cards. */
export async function getSentinelStats(): Promise<SentinelStats> {
  const rows = await db
    .select({
      sentinel: mdSecurityEvents.sentinel,
      severity: mdSecurityEvents.severity,
      acknowledged: mdSecurityEvents.acknowledged,
      count: sql<number>`count(*)::int`,
    })
    .from(mdSecurityEvents)
    .groupBy(mdSecurityEvents.sentinel, mdSecurityEvents.severity, mdSecurityEvents.acknowledged)

  const empty = () => ({ total: 0, unacknowledged: 0, critical: 0, warning: 0 })
  const byLens: SentinelStats['byLens'] = {
    access: empty(),
    consent: empty(),
    ip: empty(),
    security: empty(),
  }
  let totalUnacknowledged = 0
  let totalCritical = 0

  for (const r of rows) {
    const lens = (r.sentinel as SentinelLens) in byLens ? (r.sentinel as SentinelLens) : null
    if (!lens) continue
    const n = Number(r.count)
    byLens[lens].total += n
    if (!r.acknowledged) {
      byLens[lens].unacknowledged += n
      totalUnacknowledged += n
    }
    if (r.severity === 'critical') {
      byLens[lens].critical += n
      totalCritical += n
    } else if (r.severity === 'warning') {
      byLens[lens].warning += n
    }
  }

  return { byLens, totalUnacknowledged, totalCritical }
}

/** Recent events for a lens (or all), newest first, with account/team names resolved. */
export async function getSentinelEvents(opts: {
  lens?: SentinelLens
  onlyUnacknowledged?: boolean
  limit?: number
} = {}): Promise<SentinelEventRow[]> {
  const limit = Math.min(opts.limit ?? 100, 500)
  const conditions = []
  if (opts.lens) conditions.push(eq(mdSecurityEvents.sentinel, opts.lens))
  if (opts.onlyUnacknowledged) conditions.push(eq(mdSecurityEvents.acknowledged, false))

  const rows = await db
    .select({
      id: mdSecurityEvents.id,
      sentinel: mdSecurityEvents.sentinel,
      eventType: mdSecurityEvents.eventType,
      severity: mdSecurityEvents.severity,
      actorUserId: mdSecurityEvents.actorUserId,
      externalAccountId: mdSecurityEvents.externalAccountId,
      externalAccountName: mdExternalAccounts.orgName,
      teamId: mdSecurityEvents.teamId,
      teamName: mdTeams.name,
      teamRider: mdTeams.riderName,
      targetRef: mdSecurityEvents.targetRef,
      ipAddress: mdSecurityEvents.ipAddress,
      detail: mdSecurityEvents.detail,
      detectedBy: mdSecurityEvents.detectedBy,
      acknowledged: mdSecurityEvents.acknowledged,
      createdAt: mdSecurityEvents.createdAt,
    })
    .from(mdSecurityEvents)
    .leftJoin(mdExternalAccounts, eq(mdSecurityEvents.externalAccountId, mdExternalAccounts.id))
    .leftJoin(mdTeams, eq(mdSecurityEvents.teamId, mdTeams.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(mdSecurityEvents.createdAt))
    .limit(limit)

  return rows.map((r) => ({
    id: r.id,
    sentinel: r.sentinel as SentinelLens,
    eventType: r.eventType,
    severity: r.severity as Severity,
    actorUserId: r.actorUserId,
    externalAccountId: r.externalAccountId,
    externalAccountName: r.externalAccountName,
    teamId: r.teamId,
    teamName: r.teamName || r.teamRider || null,
    targetRef: r.targetRef,
    ipAddress: r.ipAddress,
    detail: (r.detail as Record<string, unknown>) ?? {},
    detectedBy: r.detectedBy,
    acknowledged: r.acknowledged,
    createdAt: r.createdAt,
  }))
}

/** Acknowledge a single event (owner triage). */
export async function acknowledgeSentinelEvent(id: string, byEmail: string): Promise<void> {
  await db
    .update(mdSecurityEvents)
    .set({ acknowledged: true, acknowledgedBy: byEmail, acknowledgedAt: new Date() })
    .where(eq(mdSecurityEvents.id, id))
}

// ── Sweep engine ──────────────────────────────────────────────────────────────

export type SweepResult = { rule: string; created: number; note?: string }

/**
 * Insert a sweep-detected event, but only if an equivalent UNACKNOWLEDGED sweep event
 * for the same target doesn't already exist within `dedupeHours`. Keeps the feed from
 * flooding when the same condition is re-detected every run.
 */
async function insertSweepEventDeduped(input: {
  sentinel: SentinelLens
  eventType: string
  severity: Severity
  targetRef: string
  actorUserId?: string | null
  externalAccountId?: string | null
  teamId?: string | null
  detail?: Record<string, unknown>
  dedupeHours: number
}): Promise<boolean> {
  const since = new Date(Date.now() - input.dedupeHours * 3600_000)
  const [existing] = await db
    .select({ id: mdSecurityEvents.id })
    .from(mdSecurityEvents)
    .where(
      and(
        eq(mdSecurityEvents.sentinel, input.sentinel),
        eq(mdSecurityEvents.eventType, input.eventType),
        eq(mdSecurityEvents.targetRef, input.targetRef),
        eq(mdSecurityEvents.detectedBy, 'sweep'),
        eq(mdSecurityEvents.acknowledged, false),
        gte(mdSecurityEvents.createdAt, since),
      ),
    )
    .limit(1)
  if (existing) return false

  await db.insert(mdSecurityEvents).values({
    sentinel: input.sentinel,
    eventType: input.eventType,
    severity: input.severity,
    actorUserId: input.actorUserId ?? null,
    externalAccountId: input.externalAccountId ?? null,
    teamId: input.teamId ?? null,
    targetRef: input.targetRef,
    detail: input.detail ?? {},
    detectedBy: 'sweep',
  })
  return true
}

/**
 * Run every sweep rule. Safe to call repeatedly (deduped). Returns per-rule counts.
 * Called by the cron route (prod) and by the owner "Run sweep now" action (local).
 */
export async function runSentinelSweeps(): Promise<{ results: SweepResult[]; totalCreated: number }> {
  const results: SweepResult[] = []

  results.push(await sweepAccessDenialBursts())
  results.push(await sweepBulkProfilePulls())
  results.push(await sweepRosterEnumeration())
  results.push(await sweepMinorsWithoutVerifiedConsent())
  results.push(await sweepStaleConsentVersions())
  results.push(await sweepFailedLoginClusters())

  const totalCreated = results.reduce((s, r) => s + r.created, 0)
  return { results, totalCreated }
}

const WINDOW_HOURS = 24

/** ACCESS: an external account racking up denied reads = probing the gate. */
async function sweepAccessDenialBursts(): Promise<SweepResult> {
  const since = new Date(Date.now() - WINDOW_HOURS * 3600_000)
  const rows = await db
    .select({
      externalAccountId: mdSecurityEvents.externalAccountId,
      count: sql<number>`count(*)::int`,
    })
    .from(mdSecurityEvents)
    .where(
      and(
        eq(mdSecurityEvents.sentinel, 'access'),
        inArray(mdSecurityEvents.eventType, ['entitlement_denied', 'ungranted_access_attempt', 'stale_grant_access_attempt']),
        eq(mdSecurityEvents.detectedBy, 'inline'),
        gte(mdSecurityEvents.createdAt, since),
      ),
    )
    .groupBy(mdSecurityEvents.externalAccountId)

  let created = 0
  for (const r of rows) {
    const n = Number(r.count)
    if (!r.externalAccountId || n < 5) continue
    const ok = await insertSweepEventDeduped({
      sentinel: 'access',
      eventType: 'access_denial_burst',
      severity: n >= 15 ? 'critical' : 'warning',
      targetRef: `account:${r.externalAccountId}`,
      externalAccountId: r.externalAccountId,
      detail: { deniedAttempts: n, windowHours: WINDOW_HOURS },
      dedupeHours: WINDOW_HOURS,
    })
    if (ok) created++
  }
  return { rule: 'access_denial_burst', created }
}

/** IP: one account pulling many rider profiles fast = scraping the dataset. */
async function sweepBulkProfilePulls(): Promise<SweepResult> {
  const since = new Date(Date.now() - WINDOW_HOURS * 3600_000)
  const rows = await db
    .select({
      externalAccountId: mdSecurityEvents.externalAccountId,
      count: sql<number>`count(distinct ${mdSecurityEvents.teamId})::int`,
    })
    .from(mdSecurityEvents)
    .where(
      and(
        eq(mdSecurityEvents.sentinel, 'ip'),
        eq(mdSecurityEvents.eventType, 'profile_accessed'),
        gte(mdSecurityEvents.createdAt, since),
      ),
    )
    .groupBy(mdSecurityEvents.externalAccountId)

  let created = 0
  for (const r of rows) {
    const n = Number(r.count)
    if (!r.externalAccountId || n < 25) continue
    const ok = await insertSweepEventDeduped({
      sentinel: 'ip',
      eventType: 'bulk_profile_pull',
      severity: n >= 75 ? 'critical' : 'warning',
      targetRef: `account:${r.externalAccountId}`,
      externalAccountId: r.externalAccountId,
      detail: { distinctRidersPulled: n, windowHours: WINDOW_HOURS },
      dedupeHours: WINDOW_HOURS,
    })
    if (ok) created++
  }
  return { rule: 'bulk_profile_pull', created }
}

/** IP: high-volume roster searching = enumerating the rider base. */
async function sweepRosterEnumeration(): Promise<SweepResult> {
  const since = new Date(Date.now() - WINDOW_HOURS * 3600_000)
  const rows = await db
    .select({
      actorUserId: mdSecurityEvents.actorUserId,
      count: sql<number>`count(*)::int`,
    })
    .from(mdSecurityEvents)
    .where(
      and(
        eq(mdSecurityEvents.sentinel, 'ip'),
        eq(mdSecurityEvents.eventType, 'roster_search'),
        gte(mdSecurityEvents.createdAt, since),
      ),
    )
    .groupBy(mdSecurityEvents.actorUserId)

  let created = 0
  for (const r of rows) {
    const n = Number(r.count)
    if (!r.actorUserId || n < 40) continue
    const ok = await insertSweepEventDeduped({
      sentinel: 'ip',
      eventType: 'roster_enumeration',
      severity: n >= 120 ? 'critical' : 'warning',
      targetRef: `user:${r.actorUserId}`,
      actorUserId: r.actorUserId,
      detail: { searches: n, windowHours: WINDOW_HOURS },
      dedupeHours: WINDOW_HOURS,
    })
    if (ok) created++
  }
  return { rule: 'roster_enumeration', created }
}

/** CONSENT: minors flagged as needing a guardian but not yet verified. */
async function sweepMinorsWithoutVerifiedConsent(): Promise<SweepResult> {
  const rows = await db
    .select({ userId: mdUserCompliance.userId, coppaStatus: mdUserCompliance.coppaStatus })
    .from(mdUserCompliance)
    .where(
      and(
        eq(mdUserCompliance.requiresGuardian, true),
        sql`${mdUserCompliance.coppaStatus} <> 'guardian_consent_verified'`,
      ),
    )

  let created = 0
  for (const r of rows) {
    const ok = await insertSweepEventDeduped({
      sentinel: 'consent',
      eventType: 'minor_without_verified_consent',
      severity: 'critical',
      targetRef: `user:${r.userId}`,
      actorUserId: r.userId,
      detail: { coppaStatus: r.coppaStatus },
      dedupeHours: 72,
    })
    if (ok) created++
  }
  return { rule: 'minor_without_verified_consent', created }
}

/** CONSENT: users whose latest acceptance is against a superseded doc version. */
async function sweepStaleConsentVersions(): Promise<SweepResult> {
  const current = await db
    .select({ docKey: mdLegalDocuments.docKey, version: mdLegalDocuments.version })
    .from(mdLegalDocuments)
    .where(eq(mdLegalDocuments.isCurrent, true))
  if (current.length === 0) return { rule: 'stale_consent_version', created: 0, note: 'no current docs' }

  const currentByKey = new Map(current.map((c) => [c.docKey, c.version]))

  // Latest acceptance per (user, doc).
  const rows = await db
    .select({
      userId: mdConsentRecords.userId,
      docKey: mdConsentRecords.docKey,
      docVersion: sql<string>`(array_agg(${mdConsentRecords.docVersion} order by ${mdConsentRecords.createdAt} desc))[1]`,
    })
    .from(mdConsentRecords)
    .groupBy(mdConsentRecords.userId, mdConsentRecords.docKey)

  let created = 0
  for (const r of rows) {
    const currentVersion = currentByKey.get(r.docKey)
    if (!currentVersion || r.docVersion === currentVersion) continue
    const ok = await insertSweepEventDeduped({
      sentinel: 'consent',
      eventType: 'stale_consent_version',
      severity: 'warning',
      targetRef: `user:${r.userId}:${r.docKey}`,
      actorUserId: r.userId,
      detail: { docKey: r.docKey, acceptedVersion: r.docVersion, currentVersion },
      dedupeHours: 72,
    })
    if (ok) created++
  }
  return { rule: 'stale_consent_version', created }
}

/** SECURITY: clusters of failed logins for the same identifier = brute force / stuffing. */
async function sweepFailedLoginClusters(): Promise<SweepResult> {
  const since = new Date(Date.now() - 6 * 3600_000)
  const rows = await db
    .select({
      targetRef: mdSecurityEvents.targetRef,
      count: sql<number>`count(*)::int`,
    })
    .from(mdSecurityEvents)
    .where(
      and(
        eq(mdSecurityEvents.sentinel, 'security'),
        eq(mdSecurityEvents.eventType, 'failed_login'),
        gte(mdSecurityEvents.createdAt, since),
      ),
    )
    .groupBy(mdSecurityEvents.targetRef)

  let created = 0
  for (const r of rows) {
    const n = Number(r.count)
    if (!r.targetRef || n < 5) continue
    const ok = await insertSweepEventDeduped({
      sentinel: 'security',
      eventType: 'credential_stuffing_suspected',
      severity: n >= 12 ? 'critical' : 'warning',
      targetRef: r.targetRef,
      detail: { failedAttempts: n, windowHours: 6 },
      dedupeHours: 6,
    })
    if (ok) created++
  }
  return { rule: 'credential_stuffing_suspected', created }
}
