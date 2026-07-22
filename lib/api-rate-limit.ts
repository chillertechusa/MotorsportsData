import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdApiKeys } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { checkRateLimit } from '@/lib/cache'

/**
 * Check API rate limit for a key and return 429 if exceeded
 */
export async function validateApiRateLimit(
  apiKeyId: string,
  rateLimit: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  // Use Redis sliding window rate limiter scoped to API key
  const identifier = `api-key:${apiKeyId}`
  const windowSeconds = 60 // 1 minute window

  const result = await checkRateLimit(identifier, rateLimit, windowSeconds)

  if (!result) {
    // Redis error — fail open (allow request)
    return { allowed: true, remaining: 0, resetIn: 0 }
  }

  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetIn: result.resetInSeconds,
  }
}

/**
 * Wrap an API route handler with rate limiting
 */
export function withApiRateLimit(
  handler: (req: NextRequest, context: any) => Promise<Response>,
  options?: { customLimit?: number }
) {
  return async (req: NextRequest, context: any) => {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = authHeader.replace('Bearer ', '')
    const keyPrefix = apiKey.substring(0, 20)

    // Look up API key in database
    const row = await db.query.mdApiKeys.findFirst({
      where: (t) => eq(t.keyPrefix, keyPrefix),
    })

    if (!row || !row.active) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Check rate limit
    const rateLimit = options?.customLimit ?? row.rateLimit
    const rateLimitCheck = await validateApiRateLimit(row.id, rateLimit)

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitCheck.resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitCheck.resetIn)),
            'X-RateLimit-Limit': String(rateLimit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + rateLimitCheck.resetIn),
          },
        }
      )
    }

    // Add rate limit headers to response
    const response = await handler(req, context)
    const headers = new Headers(response.headers)
    headers.set('X-RateLimit-Limit', String(rateLimit))
    headers.set('X-RateLimit-Remaining', String(rateLimitCheck.remaining))
    headers.set('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + 60))

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

/**
 * Validate API key from request
 */
export async function validateApiKey(authHeader: string | null) {
  if (!authHeader) return null

  const apiKey = authHeader.replace('Bearer ', '')
  const keyPrefix = apiKey.substring(0, 20)

  const row = await db.query.mdApiKeys.findFirst({
    where: (t) => eq(t.keyPrefix, keyPrefix),
  })

  if (!row || !row.active) return null

  return row
}
