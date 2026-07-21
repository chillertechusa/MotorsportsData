import { SquareClient, SquareEnvironment } from 'square'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verifies a Square webhook signature.
 *
 * Square signs each webhook by computing:
 *   base64( HMAC-SHA256( signatureKey, notificationUrl + rawBody ) )
 * and sending it in the `x-square-hmacsha256-signature` header. We recompute
 * it and compare in constant time. If the signature key is not configured we
 * fail CLOSED (return false) so unverified events are never trusted.
 *
 * @param rawBody   The exact, unparsed request body string.
 * @param signature The value of the x-square-hmacsha256-signature header.
 * @param notificationUrl The exact URL configured in the Square dashboard.
 */
export function verifySquareWebhookSignature(
  rawBody: string,
  signature: string | null,
  notificationUrl: string,
): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!key || !signature) return false
  try {
    const hmac = createHmac('sha256', key)
    hmac.update(notificationUrl + rawBody)
    const expected = hmac.digest('base64')
    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/** The exact public URL Square posts webhooks to (must match dashboard config). */
export function squareWebhookUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://motorsportsdata.io'
  return `${base.replace(/\/$/, '')}/api/webhooks/square`
}

/**
 * Server-side Square client. Reads credentials from env vars that the shop
 * owner adds later. When unset, `isSquareConfigured()` returns false so the
 * checkout UI can show a graceful "payments not configured yet" state instead
 * of crashing.
 */
export function isSquareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID)
}

/** Square app IDs for the sandbox start with "sandbox-". Used to pick the env. */
export function squareEnvironment(): SquareEnvironment {
  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? ''
  return appId.startsWith('sandbox-')
    ? SquareEnvironment.Sandbox
    : SquareEnvironment.Production
}

let cached: SquareClient | null = null

export function getSquareClient(): SquareClient {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error('SQUARE_ACCESS_TOKEN is not set')
  }
  if (!cached) {
    cached = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: squareEnvironment(),
    })
  }
  return cached
}

export function squareLocationId(): string {
  return process.env.SQUARE_LOCATION_ID ?? ''
}

/**
 * Verifies that the configured location id exists in the same Square
 * environment as the access token / application id. This is the #1 cause of
 * "Could not load the card form" — a location id from one environment paired
 * with credentials from another.
 *
 * Returns { ok: true } when verified, or { ok: false, reason } on a definitive
 * rejection. On transient/network errors it returns { ok: true } (fail-open)
 * so a Square outage never blocks a legitimate checkout.
 */
export async function verifySquareLocation(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  const locationId = process.env.SQUARE_LOCATION_ID
  if (!process.env.SQUARE_ACCESS_TOKEN || !locationId) {
    return { ok: false, reason: 'missing_credentials' }
  }
  try {
    const client = getSquareClient()
    const res = await client.locations.get({ locationId })
    // The awaited response may be the body directly or wrapped in `.result`
    // depending on SDK internals — read defensively (matches md-billing.ts).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const location = (res as any).location ?? (res as any).result?.location
    // A valid location for these credentials confirms the environment matches.
    return location?.id ? { ok: true } : { ok: false, reason: 'location_not_found' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Definitive rejections mean a real config problem (wrong env / bad id).
    if (/not\s*found|unauthorized|forbidden|invalid|does not exist/i.test(msg)) {
      return { ok: false, reason: 'environment_mismatch' }
    }
    // Anything else (network blip, timeout) — don't block checkout.
    console.error('[square] location verify transient error:', msg)
    return { ok: true }
  }
}
