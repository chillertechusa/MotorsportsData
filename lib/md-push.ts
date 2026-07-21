/**
 * Web Push helper for the MD platform.
 *
 * Sends notifications to a team's subscribed devices via the `web-push`
 * library. Requires three env vars to be configured:
 *   - NEXT_PUBLIC_VAPID_PUBLIC_KEY  (also read client-side to subscribe)
 *   - VAPID_PRIVATE_KEY
 *   - VAPID_SUBJECT                 (a mailto: or https: URL, e.g. mailto:ops@motorsportsdata.io)
 *
 * If the keys are not set, sendTeamPush() is a safe no-op that returns
 * { sent: 0, configured: false } — it never throws, so callers stay simple.
 */
import webpush from 'web-push'
import { db } from '@/lib/db'
import { mdPushSubscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

let vapidConfigured = false

function ensureVapid(): boolean {
  if (vapidConfigured) return true
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:motorsportdata@gmail.com'
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
  return true
}

export type PushPayload = {
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Send a push notification to every subscribed device on a team.
 * Stale subscriptions (410/404 from the push service) are pruned automatically.
 */
export async function sendTeamPush(
  teamId: string,
  payload: PushPayload,
): Promise<{ sent: number; configured: boolean }> {
  if (!ensureVapid()) {
    console.log('[md-push] VAPID keys not configured — skipping push')
    return { sent: 0, configured: false }
  }

  const subs = await db
    .select()
    .from(mdPushSubscriptions)
    .where(eq(mdPushSubscriptions.teamId, teamId))

  if (subs.length === 0) return { sent: 0, configured: true }

  const body = JSON.stringify(payload)
  let sent = 0

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          body,
        )
        sent += 1
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        // 404/410 mean the subscription is dead — prune it.
        if (statusCode === 404 || statusCode === 410) {
          await db
            .delete(mdPushSubscriptions)
            .where(eq(mdPushSubscriptions.endpoint, sub.endpoint))
        } else {
          console.error('[md-push] send error:', err)
        }
      }
    }),
  )

  return { sent, configured: true }
}
