import { Redis } from '@upstash/redis'
import { createHash } from 'crypto'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const RATE_LIMITS = {
  // Auth: 1 per IP per minute, 5 per fingerprint per hour
  signUp: { perIp: { requests: 1, window: 60 }, perFingerprint: { requests: 5, window: 3600 } },
  // Coach invites: 3 per user per hour
  coachInvite: { perUser: { requests: 3, window: 3600 } },
  // Work orders: 5 per user per day
  workOrder: { perUser: { requests: 5, window: 86400 } },
}

/**
 * Generate a request fingerprint from user-agent, IP, and accept-language
 */
export function generateFingerprint(userAgent: string, ip: string, acceptLanguage?: string): string {
  const components = [userAgent, ip, acceptLanguage || 'unknown'].join('|')
  return createHash('sha256').update(components).digest('hex').slice(0, 16)
}

/**
 * Extract client IP from request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Check rate limit and return { allowed, retryAfter, remaining }
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter: number; remaining: number }> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowSeconds

  try {
    // Get current count for this key
    const current = await redis.get<number>(key)
    const count = (current ?? 0) + 1

    if (count > limit) {
      // Rate limited — get TTL for retry-after
      const ttl = await redis.ttl(key)
      return { allowed: false, retryAfter: Math.max(1, ttl || windowSeconds), remaining: 0 }
    }

    // Under limit — increment and set expiry
    await redis.incr(key)
    await redis.expire(key, windowSeconds)

    return { allowed: true, retryAfter: 0, remaining: limit - count }
  } catch (err) {
    console.error('[bot-protection] Redis error:', err)
    // On Redis error, allow the request (fail open)
    return { allowed: true, retryAfter: 0, remaining: limit }
  }
}

/**
 * Check sign-up rate limits (per-IP + per-fingerprint)
 */
export async function checkSignUpRateLimit(
  ip: string,
  fingerprint: string
): Promise<{ allowed: boolean; retryAfter: number; reason?: string }> {
  const ipLimit = RATE_LIMITS.signUp.perIp
  const fpLimit = RATE_LIMITS.signUp.perFingerprint

  // Check IP rate limit (strict: 1/min)
  const ipCheck = await checkRateLimit(`signup:ip:${ip}`, ipLimit.requests, ipLimit.window)
  if (!ipCheck.allowed) {
    return { allowed: false, retryAfter: ipCheck.retryAfter, reason: 'Too many sign-ups from this IP' }
  }

  // Check fingerprint rate limit (moderate: 5/hour)
  const fpCheck = await checkRateLimit(
    `signup:fp:${fingerprint}`,
    fpLimit.requests,
    fpLimit.window
  )
  if (!fpCheck.allowed) {
    return { allowed: false, retryAfter: fpCheck.retryAfter, reason: 'Too many sign-ups detected' }
  }

  return { allowed: true, retryAfter: 0 }
}

/**
 * Check coach invite rate limit (per-user)
 */
export async function checkCoachInviteRateLimit(userId: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const limit = RATE_LIMITS.coachInvite.perUser
  return checkRateLimit(`coach:invite:${userId}`, limit.requests, limit.window)
}

/**
 * Check work order rate limit (per-user)
 */
export async function checkWorkOrderRateLimit(userId: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const limit = RATE_LIMITS.workOrder.perUser
  return checkRateLimit(`workorder:${userId}`, limit.requests, limit.window)
}
