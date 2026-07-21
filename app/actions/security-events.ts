'use server'

import { headers } from 'next/headers'
import { logSecurityEvent } from '@/lib/external-access'

/**
 * SECURITY Sentinel (inline, pre-auth): record a failed sign-in attempt.
 * Called by the sign-in client when Better Auth rejects credentials. A single
 * failure is noise; the sweep engine clusters failures by identifier to flag
 * brute-force / credential-stuffing (credential_stuffing_suspected).
 *
 * We never store the attempted password. The email is the identifier under
 * attack and is only visible in the owner-only Sentinel console.
 */
export async function reportFailedLogin(email: string): Promise<void> {
  const identifier = (email || '').trim().toLowerCase().slice(0, 120)
  if (!identifier) return

  const hdrs = await headers()
  await logSecurityEvent({
    sentinel: 'security',
    eventType: 'failed_login',
    severity: 'info',
    targetRef: `email:${identifier}`,
    ipAddress: hdrs.get('x-forwarded-for'),
    userAgent: hdrs.get('user-agent'),
    detail: { identifier },
  })
}
