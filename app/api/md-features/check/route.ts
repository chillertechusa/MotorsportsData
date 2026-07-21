import { NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'
import { hasFeatureAccess, logFeatureGateAccess } from '@/lib/feature-gates'
import { withCache, cacheKey, checkRateLimit } from '@/lib/cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/md-features/check?feature=fleet-management
 * Check if team has access to a feature.
 * Rate limited: 60 req/min per team. Cached: 5 min per team+feature.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const feature = searchParams.get('feature')

    if (!feature) {
      return NextResponse.json({ error: 'Missing feature parameter' }, { status: 400 })
    }

    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 60 feature-gate checks per minute per team
    const { allowed, remaining } = await checkRateLimit(
      `feature-check:${auth.teamId}`,
      60,
      60
    )
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limited' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      )
    }

    // Cache result for 5 min — tier rarely changes mid-session
    const key = cacheKey('feature', 'check', auth.teamId as string, feature)
    const { data, cached } = await withCache(key, 300, async () => {
      const result = await hasFeatureAccess(auth.teamId as string, feature)
      // Only log on cache miss (actual new check)
      await logFeatureGateAccess(auth.teamId as string, feature, result.granted)
      return { ok: true, feature, granted: result.granted, upsellTier: result.upsellTier }
    })

    return NextResponse.json({ ...data, cached, rateLimitRemaining: remaining })
  } catch (error) {
    console.error('[Feature Gate Check] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check feature access' },
      { status: 500 }
    )
  }
}
