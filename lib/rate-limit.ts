/**
 * In-memory sliding-window rate limiter.
 *
 * Each entry tracks the timestamps of recent requests for a given key.
 * On every call we prune timestamps older than the window, then count the
 * remaining ones. If the count >= limit the request is denied.
 *
 * IMPORTANT: This is per-instance state. In a serverless environment each cold
 * start gets a fresh window, so very low-frequency abuse across many cold starts
 * won't be caught. For cross-instance enforcement, replace this with an Upstash
 * Redis sliding-window counter (TODO when volume justifies it).
 */

const store = new Map<string, number[]>()

export interface RateLimitResult {
  allowed: boolean
  /** Milliseconds until the oldest request falls out of the window. */
  retryAfterMs: number
}

/**
 * Check whether the given key is within the rate limit.
 *
 * @param key        Unique identifier — typically `userId:routeName`
 * @param limit      Max allowed requests in the window
 * @param windowMs   Rolling window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const cutoff = now - windowMs

  // Retrieve and prune stale timestamps.
  const timestamps = (store.get(key) ?? []).filter((t) => t > cutoff)

  if (timestamps.length >= limit) {
    // Oldest timestamp still in the window determines when the next slot opens.
    const retryAfterMs = timestamps[0] + windowMs - now
    store.set(key, timestamps)
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) }
  }

  timestamps.push(now)
  store.set(key, timestamps)
  return { allowed: true, retryAfterMs: 0 }
}
