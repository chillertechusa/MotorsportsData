import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-rate-limit'
import { getSessionTeamId } from '@/lib/md-auth'

/**
 * GET /api/telemetry/comparison
 * Compare telemetry between riders or sessions — requires API key or valid session.
 * Query params: sessionId, riderId1, riderId2 OR session1, session2, riderId
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const apiKeyRow = authHeader ? await validateApiKey(authHeader) : null
  const sessionTeamId = apiKeyRow ? null : await getSessionTeamId(request)
  if (!apiKeyRow && !sessionTeamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const riderId1 = searchParams.get('riderId1')
    const riderId2 = searchParams.get('riderId2')

    if (!sessionId || !riderId1 || !riderId2) {
      return NextResponse.json(
        { error: 'Missing required params' },
        { status: 400 }
      )
    }

    // TODO: Compare rider metrics
    return NextResponse.json({
      success: true,
      comparison: {
        rider1: {},
        rider2: {},
        delta: {},
      },
    })
  } catch (err) {
    console.error('[v0] Comparison error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
