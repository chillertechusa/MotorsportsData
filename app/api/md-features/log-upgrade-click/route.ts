import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdFeatureGateLogs } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'

/**
 * POST /api/md-features/log-upgrade-click?feature=fleet-management
 * Log when user clicks upgrade button on feature gate modal
 */
export async function POST(req: NextRequest) {
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

    // Log the upgrade click
    await db.insert(mdFeatureGateLogs).values({
      teamId: auth.teamId as any,
      featureKey: feature,
      accessGranted: false,
      triggeredModal: true,
      clickedUpgrade: true,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Feature Gate Log] Error:', error)
    return NextResponse.json({ error: 'Failed to log upgrade click' }, { status: 500 })
  }
}
