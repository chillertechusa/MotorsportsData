import { randomBytes, scryptSync, createHmac } from 'crypto'

/**
 * Generate a new API key for a team
 * Returns: { raw: full key for display once, prefix: first 20 chars, hash: for storage }
 */
export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  // Generate 32 bytes of random data, encode as base64url
  const bytes = randomBytes(32)
  const raw = bytes.toString('base64url')

  // Prefix: first 20 characters for display
  const prefix = raw.substring(0, 20)

  // Hash with bcrypt-like approach using scrypt
  const hash = hashApiKey(raw)

  return { raw, prefix, hash }
}

/**
 * Hash an API key for secure storage
 */
export function hashApiKey(key: string): string {
  return scryptSync(key, 'md-api-salt', 64).toString('hex')
}

/**
 * Verify an API key against its hash
 */
export function verifyApiKey(key: string, hash: string): boolean {
  const computedHash = hashApiKey(key)
  return computedHash === hash
}

/**
 * Sign a webhook payload with HMAC-SHA256
 */
export function signWebhookPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

/**
 * Verify a webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expected = signWebhookPayload(payload, secret)
  return expected === signature
}

/**
 * Extract API key from Authorization header
 * Expected format: "Bearer sk_md_XXXXX..."
 */
export function extractApiKey(authHeader: string | null): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}
