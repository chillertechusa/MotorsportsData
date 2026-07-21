/**
 * SENTINEL SQUAD — client-safe types and constants.
 *
 * This module has NO database imports so it can be imported by both server code
 * (lib/sentinel.ts) and client components (the owner console) without pulling the
 * Postgres driver into the browser bundle.
 */

export type SentinelLens = 'access' | 'consent' | 'ip' | 'security'
export type Severity = 'info' | 'warning' | 'critical'

export const SENTINEL_LENSES: {
  key: SentinelLens
  label: string
  description: string
}[] = [
  { key: 'access', label: 'Access Sentinel', description: 'Entitlement-gate abuse — reads without an active paid entitlement or live grant.' },
  { key: 'consent', label: 'Consent Sentinel', description: 'Missing, expired, or stale consent; minors without verified guardian consent.' },
  { key: 'ip', label: 'IP Sentinel', description: 'Scraping, bulk aggregate pulls, roster enumeration, Coach IP Vault probing.' },
  { key: 'security', label: 'Security Sentinel', description: 'Brute-force / credential stuffing and cross-team data access.' },
]

export type SentinelEventRow = {
  id: string
  sentinel: SentinelLens
  eventType: string
  severity: Severity
  actorUserId: string | null
  externalAccountId: string | null
  externalAccountName: string | null
  teamId: string | null
  teamName: string | null
  targetRef: string | null
  ipAddress: string | null
  detail: Record<string, unknown>
  detectedBy: string
  acknowledged: boolean
  createdAt: Date | null
}

export type SentinelStats = {
  byLens: Record<SentinelLens, { total: number; unacknowledged: number; critical: number; warning: number }>
  totalUnacknowledged: number
  totalCritical: number
}
