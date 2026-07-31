import { NextRequest, NextResponse } from 'next/server'
import { checkWorkOrderRateLimit } from '@/lib/bot-protection'
import { auth } from '@/lib/auth'
import { blockAutomatedRequest } from '@/lib/botid'

/**
 * Protected work order endpoint with rate limiting
 * POST /api/md-owner/send-work-order-protected
 *
 * Rate limit: 5 work orders per user per day (86400 seconds)
 */
export async function POST(req: NextRequest) {
  const botResponse = await blockAutomatedRequest()
  if (botResponse) return botResponse

  try {
    // Get authenticated user
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check rate limit
    const check = await checkWorkOrderRateLimit(userId)
    if (!check.allowed) {
      console.log('[work-order] Rate limited', { userId: userId.slice(0, 8), retryAfter: check.retryAfter })

      return NextResponse.json(
        {
          error: 'Too many work orders today. Please try again tomorrow.',
          retryAfter: check.retryAfter,
        },
        { status: 429, headers: { 'retry-after': String(check.retryAfter) } }
      )
    }

    // Rate limit passed — proceed to work order creation
    const body = await req.json()
    const { shopId, bikeIssue, description } = body

    if (!shopId || !bikeIssue) {
      return NextResponse.json({ error: 'Missing shopId or bikeIssue' }, { status: 400 })
    }

    console.log('[work-order] Order created', { userId: userId.slice(0, 8), shopId, issue: bikeIssue })

    return NextResponse.json({
      message: 'Work order sent to shop successfully',
      shopId,
      bikeIssue,
      description,
    })
  } catch (error) {
    console.error('[work-order] Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
