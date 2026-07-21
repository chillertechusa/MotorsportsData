/**
 * Terra API client helpers
 * Docs: https://docs.tryterra.co/reference/
 *
 * Terra is the health data aggregation layer — it connects to 500+ wearables
 * (Garmin, Polar, Apple Watch, Whoop, Oura, Fitbit, etc.) and pushes live HR
 * data to our webhook in real-time.
 *
 * Setup required:
 *   TERRA_API_KEY      — from Terra dashboard
 *   TERRA_DEV_ID       — your Terra developer ID
 *   TERRA_WEBHOOK_SECRET — for webhook signature verification
 */

const TERRA_BASE = 'https://ws.tryterra.co'
const TERRA_API_KEY = process.env.TERRA_API_KEY ?? ''
const TERRA_DEV_ID = process.env.TERRA_DEV_ID ?? ''

function terraHeaders() {
  return {
    'x-api-key': TERRA_API_KEY,
    'dev-id': TERRA_DEV_ID,
    'Content-Type': 'application/json',
  }
}

export function isTerraConfigured(): boolean {
  return Boolean(TERRA_API_KEY && TERRA_DEV_ID)
}

/**
 * Generate a Terra widget session URL for a rider to connect their device.
 * The rider opens this URL, picks their provider (Garmin/Polar/Apple/etc.),
 * and authorizes. Terra calls our webhook once connected.
 *
 * reference_id is our internal identifier we use to match the callback to a team member.
 */
export async function generateWidgetSession(referenceId: string): Promise<{
  url: string
  session_id: string
} | null> {
  if (!isTerraConfigured()) return null

  try {
    const res = await fetch(`${TERRA_BASE}/auth/generateWidgetSession`, {
      method: 'POST',
      headers: terraHeaders(),
      body: JSON.stringify({
        reference_id: referenceId,
        providers: 'GARMIN,POLAR,APPLE,FITBIT,WHOOP,OURA,AMAZFIT,WITHINGS,SAMSUNG,GOOGLE,SUUNTO',
        language: 'en',
      }),
    })

    if (!res.ok) {
      console.error('[terra] generateWidgetSession failed', res.status, await res.text())
      return null
    }

    const data = await res.json()
    return { url: data.url, session_id: data.session_id }
  } catch (err) {
    console.error('[terra] generateWidgetSession error', err)
    return null
  }
}

/**
 * Deauthenticate a Terra user (called when rider disconnects their device).
 */
export async function deauthTerraUser(terraUserId: string): Promise<boolean> {
  if (!isTerraConfigured()) return false

  try {
    const res = await fetch(`${TERRA_BASE}/auth/deauthenticateUser?user_id=${terraUserId}`, {
      method: 'DELETE',
      headers: terraHeaders(),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Verify a Terra webhook signature.
 * Terra signs each webhook with HMAC-SHA256 using TERRA_WEBHOOK_SECRET.
 */
export async function verifyTerraSignature(
  body: string,
  signature: string | null,
): Promise<boolean> {
  const secret = process.env.TERRA_WEBHOOK_SECRET
  if (!secret || !signature) return false

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
    const expected = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return expected === signature
  } catch {
    return false
  }
}

/** HR zone label + color based on BPM */
export function hrZone(bpm: number): { label: string; color: string; bg: string } {
  if (bpm < 100) return { label: 'Rest', color: 'text-zinc-400', bg: 'bg-zinc-800' }
  if (bpm < 130) return { label: 'Warm-up', color: 'text-sky-400', bg: 'bg-sky-500/20' }
  if (bpm < 150) return { label: 'Aerobic', color: 'text-lime-400', bg: 'bg-lime-500/20' }
  if (bpm < 170) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/20' }
  if (bpm < 185) return { label: 'Hard', color: 'text-orange-400', bg: 'bg-orange-500/20' }
  return { label: 'Max', color: 'text-red-400', bg: 'bg-red-500/20' }
}
