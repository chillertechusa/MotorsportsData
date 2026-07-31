import { NextRequest, NextResponse } from 'next/server'
import { generateFingerprint, getClientIp, checkSignUpRateLimit } from '@/lib/bot-protection'

/**
 * Protected sign-up endpoint with rate limiting
 * POST /api/auth/sign-up-protected
 *
 * Rate limits:
 * - 1 per IP per minute (prevents signup spam from single IP)
 * - 5 per fingerprint per hour (prevents distributed signup farming)
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const acceptLanguage = req.headers.get('accept-language')

    const fingerprint = generateFingerprint(userAgent, ip, acceptLanguage)

    // Check rate limits
    const check = await checkSignUpRateLimit(ip, fingerprint)
    if (!check.allowed) {
      console.log(
        '[auth-signup] Rate limited',
        JSON.stringify({
          ip,
          fingerprint: fingerprint.slice(0, 8),
          reason: check.reason,
          retryAfter: check.retryAfter,
        })
      )

      return NextResponse.json(
        {
          error: 'Too many sign-up attempts. Please try again later.',
          retryAfter: check.retryAfter,
        },
        { status: 429, headers: { 'retry-after': String(check.retryAfter) } }
      )
    }

    // Rate limit passed — proceed to actual sign-up logic
    // (This is a placeholder; the real sign-up handler would go here)
    return NextResponse.json({
      message: 'Rate limit check passed. Ready for sign-up.',
      fingerprint: fingerprint.slice(0, 8),
    })
  } catch (error) {
    console.error('[auth-signup] Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
