import { db } from '@/lib/db'
import {
  mdExternalAccounts,
  mdExternalAccessGrants,
  mdSecurityEvents,
} from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

/**
 * EXTERNAL ACCESS — the hard entitlement gate.
 *
 * GUIDING PRINCIPLE: ACCESS IS THE PRODUCT.
 * No external account (agent | sponsor | promoter | brand_partner) may read a single
 * rider's data without BOTH:
 *   1) an ACTIVE paid entitlement (billing_status='active', or is_comped), AND
 *   2) a GRANTED, non-expired consent grant from that rider's team.
 *
 * Every denied attempt is logged to the Access Sentinel (md_security_events).
 * This module is the ONLY sanctioned path to external-account rider data — call
 * requireExternalAccess() at the top of every external data route/action.
 */

export type ExternalAccountType = 'agent' | 'sponsor' | 'promoter' | 'brand_partner'

export const EXTERNAL_ACCOUNT_TYPES: ExternalAccountType[] = [
  'agent',
  'sponsor',
  'promoter',
  'brand_partner',
]

/** True when the account's billing entitlement currently allows access. */
export function isEntitled(account: {
  billingStatus: string | null
  isComped: boolean | null
}): boolean {
  if (account.isComped) return true
  return account.billingStatus === 'active' || account.billingStatus === 'trialing'
}

/** A grant is live only when granted and not revoked/expired. */
export function isGrantLive(grant: {
  status: string | null
  expiresAt: Date | null
}): boolean {
  if (grant.status !== 'granted') return false
  if (grant.expiresAt && grant.expiresAt.getTime() < Date.now()) return false
  return true
}

type SentinelEvent = {
  sentinel: 'access' | 'consent' | 'ip' | 'security'
  eventType: string
  severity?: 'info' | 'warning' | 'critical'
  actorUserId?: string | null
  externalAccountId?: string | null
  teamId?: string | null
  targetRef?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  detail?: Record<string, unknown>
  detectedBy?: 'inline' | 'sweep'
}

/**
 * Write a Sentinel event. Never throws — logging must not break the request path.
 * This is the shared inline hook used by all four lenses.
 */
export async function logSecurityEvent(event: SentinelEvent): Promise<void> {
  try {
    await db.insert(mdSecurityEvents).values({
      sentinel: event.sentinel,
      eventType: event.eventType,
      severity: event.severity ?? 'info',
      actorUserId: event.actorUserId ?? null,
      externalAccountId: event.externalAccountId ?? null,
      teamId: event.teamId ?? null,
      targetRef: event.targetRef ?? null,
      ipAddress: event.ipAddress ?? null,
      userAgent: event.userAgent ?? null,
      detail: event.detail ?? {},
      detectedBy: event.detectedBy ?? 'inline',
    })
  } catch (err) {
    console.log('[v0] logSecurityEvent failed:', (err as Error).message)
  }
}

export type AccessDenialReason =
  | 'no_account'
  | 'not_entitled'
  | 'no_grant'
  | 'grant_not_live'

export type ExternalAccessResult =
  | {
      ok: true
      account: typeof mdExternalAccounts.$inferSelect
      grant: typeof mdExternalAccessGrants.$inferSelect
    }
  | { ok: false; reason: AccessDenialReason }

type RequestMeta = { ipAddress?: string | null; userAgent?: string | null }

/**
 * THE GATE. Resolve the external account for `userId`, verify its paid entitlement,
 * and verify a live consent grant to `teamId`. Logs an Access Sentinel event on every
 * denial. Returns the account + grant on success so callers can scope what they expose.
 */
export async function requireExternalAccess(
  userId: string,
  teamId: string,
  meta: RequestMeta = {},
): Promise<ExternalAccessResult> {
  const [account] = await db
    .select()
    .from(mdExternalAccounts)
    .where(eq(mdExternalAccounts.userId, userId))
    .limit(1)

  if (!account) {
    return { ok: false, reason: 'no_account' }
  }

  // 1) Hard billing gate — access is the product.
  if (!isEntitled(account)) {
    await logSecurityEvent({
      sentinel: 'access',
      eventType: 'entitlement_denied',
      severity: 'warning',
      actorUserId: userId,
      externalAccountId: account.id,
      teamId,
      targetRef: `team:${teamId}`,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      detail: {
        accountType: account.accountType,
        billingStatus: account.billingStatus,
        reason: 'not_entitled',
      },
    })
    return { ok: false, reason: 'not_entitled' }
  }

  // 2) Consent gate — rider must have granted access to this team's data.
  const [grant] = await db
    .select()
    .from(mdExternalAccessGrants)
    .where(
      and(
        eq(mdExternalAccessGrants.externalAccountId, account.id),
        eq(mdExternalAccessGrants.teamId, teamId),
      ),
    )
    .limit(1)

  if (!grant) {
    await logSecurityEvent({
      sentinel: 'access',
      eventType: 'ungranted_access_attempt',
      severity: 'critical',
      actorUserId: userId,
      externalAccountId: account.id,
      teamId,
      targetRef: `team:${teamId}`,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      detail: { accountType: account.accountType, reason: 'no_grant' },
    })
    return { ok: false, reason: 'no_grant' }
  }

  if (!isGrantLive(grant)) {
    await logSecurityEvent({
      sentinel: 'access',
      eventType: 'stale_grant_access_attempt',
      severity: 'warning',
      actorUserId: userId,
      externalAccountId: account.id,
      teamId,
      targetRef: `grant:${grant.id}`,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      detail: {
        accountType: account.accountType,
        grantStatus: grant.status,
        expiresAt: grant.expiresAt,
        reason: 'grant_not_live',
      },
    })
    return { ok: false, reason: 'grant_not_live' }
  }

  return { ok: true, account, grant }
}

/** Human-readable message for a denial reason (safe to surface to the external user). */
export function denialMessage(reason: AccessDenialReason): string {
  switch (reason) {
    case 'no_account':
      return 'No external account is associated with this login.'
    case 'not_entitled':
      return 'An active subscription is required to access rider data.'
    case 'no_grant':
      return 'This rider has not granted you access to their data.'
    case 'grant_not_live':
      return 'Access to this rider has expired or been revoked.'
  }
}
