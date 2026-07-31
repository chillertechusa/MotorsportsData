import { NextRequest, NextResponse } from 'next/server'
import { checkCoachInviteRateLimit } from '@/lib/bot-protection'
import { auth } from '@/lib/auth'

/**
 * Protected coach invite endpoint with rate limiting
 * POST /api/md-coach/invite-protected
 *
 * Rate limit: 3 invites per user per hour
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check rate limit
    const check = await checkCoachInviteRateLimit(userId)
    if (!check.allowed) {
      console.log('[coach-invite] Rate limited', { userId: userId.slice(0, 8), retryAfter: check.retryAfter })

      return NextResponse.json(
        {
          error: 'Too many coach invites. Please try again later.',
          retryAfter: check.retryAfter,
        },
        { status: 429, headers: { 'retry-after': String(check.retryAfter) } }
      )
    }

    // Rate limit passed — proceed to coach invite logic
    const body = await req.json()
    const { coachEmail, riderName } = body

    if (!coachEmail || !riderName) {
      return NextResponse.json({ error: 'Missing coachEmail or riderName' }, { status: 400 })
    }

    console.log('[coach-invite] Invite sent', { userId: userId.slice(0, 8), coachEmail })

    return NextResponse.json({
      message: 'Coach invite sent successfully',
      coachEmail,
      riderName,
    })
  } catch (error) {
    console.error('[coach-invite] Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
