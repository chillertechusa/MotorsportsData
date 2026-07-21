import { db } from '@/lib/db'
import { mdWebhooks, mdWebhookLogs } from '@/lib/db/schema'
import { signWebhookPayload } from '@/lib/api-keys'
import { eq } from 'drizzle-orm'

export type WebhookEvent = 
  | 'telemetry:received'
  | 'session:completed'
  | 'analysis:ready'
  | 'team:member:added'
  | 'api_key:created'
  | 'webhook:test'

/**
 * Dispatch a webhook event to all subscribed endpoints for a team
 */
export async function dispatchWebhookEvent(
  teamId: string,
  eventType: WebhookEvent,
  payload: Record<string, any>
) {
  try {
    // Find all active webhooks for this team that are subscribed to this event
    const webhooks = await db.query.mdWebhooks.findMany({
      where: (t) => eq(t.teamId, teamId),
    })

    const subscribedWebhooks = webhooks.filter((w) => {
      const events = JSON.parse(w.events)
      return w.active && (events.includes(eventType) || events.includes('*'))
    })

    if (subscribedWebhooks.length === 0) {
      return { dispatched: 0 }
    }

    // Dispatch to each webhook with retry queue
    for (const webhook of subscribedWebhooks) {
      await queueWebhookDelivery(webhook.id, eventType, payload, webhook.secret)
    }

    return { dispatched: subscribedWebhooks.length }
  } catch (error) {
    console.error('[Webhook Dispatcher] Error:', error)
    return { dispatched: 0, error: String(error) }
  }
}

/**
 * Queue a webhook delivery for retry with exponential backoff
 */
async function queueWebhookDelivery(
  webhookId: string,
  eventType: WebhookEvent,
  payload: Record<string, any>,
  secret: string,
  attempt: number = 1
) {
  try {
    const webhook = await db.query.mdWebhooks.findFirst({
      where: (t) => eq(t.id, webhookId),
    })

    if (!webhook) return

    const payloadString = JSON.stringify(payload)
    const signature = signWebhookPayload(payloadString, secret)

    // Attempt delivery
    const startTime = Date.now()
    let statusCode: number | undefined
    let error: string | undefined
    let success = false

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MD-Event': eventType,
          'X-MD-Signature': `sha256=${signature}`,
          'X-MD-Attempt': String(attempt),
        },
        body: payloadString,
        timeout: 10000,
      })

      statusCode = response.status
      success = response.ok
    } catch (err) {
      error = String(err)
    }

    const responseTime = Date.now() - startTime

    // Log delivery attempt
    await db.insert(mdWebhookLogs).values({
      webhookId,
      eventType,
      payload: payload as any,
      statusCode,
      responseTime,
      error,
      attempt,
      success,
      nextRetryAt: !success && attempt < webhook.retryAttempts
        ? new Date(Date.now() + webhook.retryDelay * Math.pow(2, attempt - 1))
        : null,
    })

    // Schedule retry if needed
    if (!success && attempt < webhook.retryAttempts) {
      const delay = webhook.retryDelay * Math.pow(2, attempt - 1)
      setTimeout(
        () => queueWebhookDelivery(webhookId, eventType, payload, secret, attempt + 1),
        delay
      )
    }
  } catch (error) {
    console.error('[Webhook Queue] Error:', error)
  }
}

/**
 * Send test webhook event
 */
export async function sendTestWebhook(webhookId: string) {
  const webhook = await db.query.mdWebhooks.findFirst({
    where: (t) => eq(t.id, webhookId),
  })

  if (!webhook) {
    throw new Error('Webhook not found')
  }

  const testPayload = {
    event: 'webhook:test',
    timestamp: new Date().toISOString(),
    team_id: webhook.teamId,
    message: 'This is a test webhook delivery',
  }

  await queueWebhookDelivery(webhookId, 'webhook:test', testPayload, webhook.secret)
}
