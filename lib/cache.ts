import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export { redis }

// TTL constants (seconds)
export const TTL = {
  ANALYTICS_SHORT: 60 * 5,       // 5 min  — conversion funnel (changes frequently)
  ANALYTICS_LONG:  60 * 60 * 24, // 24h    — revenue metrics (daily rollup)
  RECOVERY_STATS:  60 * 60,      // 1h     — recovery dashboard
  RATE_LIMIT:      60,           // 1 min  — sliding window bucket
} as const

/**
 * Get a cached value, or compute + cache it.
 * Returns the cached value within TTL, otherwise calls compute().
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<{ data: T; cached: boolean }> {
  try {
    const hit = await redis.get<T>(key)
    if (hit !== null) {
      return { data: hit, cached: true }
    }
  } catch (err) {
    // Redis unavailable — fall through to compute
    console.error('[Cache] Redis get error, falling through:', err)
  }

  const data = await compute()

  try {
    await redis.set(key, data, { ex: ttlSeconds })
  } catch (err) {
    console.error('[Cache] Redis set error:', err)
  }

  return { data, cached: false }
}

/**
 * Invalidate one or more cache keys.
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys)
  } catch (err) {
    console.error('[Cache] Redis del error:', err)
  }
}

/**
 * Build a namespaced cache key.
 * e.g. cacheKey('analytics', 'revenue', teamId, '30')
 */
export function cacheKey(...parts: string[]): string {
  return parts.join(':')
}

/**
 * Sliding-window rate limiter.
 * Returns { allowed, remaining, resetInSeconds }.
 * Uses a Redis sorted set keyed by `rateLimit:{identifier}`.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetInSeconds: number }> {
  const key = `rateLimit:${identifier}`
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000

  try {
    const pipeline = redis.pipeline()
    // Remove timestamps older than the window
    pipeline.zremrangebyscore(key, 0, windowStart)
    // Add current request timestamp
    pipeline.zadd(key, { score: now, member: `${now}` })
    // Count requests in the current window
    pipeline.zcard(key)
    // Set expiry so the key auto-cleans
    pipeline.expire(key, windowSeconds + 1)
    const results = await pipeline.exec()

    const count = (results[2] as number) ?? 0
    const allowed = count <= limit
    const remaining = Math.max(0, limit - count)
    const resetInSeconds = windowSeconds

    return { allowed, remaining, resetInSeconds }
  } catch (err) {
    console.error('[RateLimit] Redis error, allowing request:', err)
    // Fail open — never block on Redis unavailability
    return { allowed: true, remaining: limit, resetInSeconds: windowSeconds }
  }
}
