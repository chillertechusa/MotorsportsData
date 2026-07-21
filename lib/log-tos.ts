import { createServiceClient } from '@/lib/supabase/service'
import { headers } from 'next/headers'

export const CURRENT_TOS_VERSION = 'v1.0-2026-07-08'

/**
 * Writes an immutable TOS agreement record via the service-role client
 * (bypasses RLS — audit writes must always succeed regardless of user state).
 * Non-blocking: errors are logged but never propagate to the caller.
 */
export async function logTosAgreement(
  userId: string | null,
  userAgent: string | null,
): Promise<void> {
  try {
    const hdrs = await headers()
    const ip =
      hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      hdrs.get('x-real-ip') ??
      null

    const supabase = createServiceClient()
    const { error } = await supabase.from('tos_agreements').insert({
      user_id: userId,
      tos_version: CURRENT_TOS_VERSION,
      ip_address: ip,
      user_agent: userAgent,
    })

    if (error) {
      console.error('[tos] insert failed:', error.message)
    }
  } catch (err) {
    console.error('[tos] unexpected error:', err)
  }
}
