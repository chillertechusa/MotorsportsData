import { generateDemoTeamData } from '@/app/actions/seed-demo-team'
import { NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'

/**
 * POST /api/admin/seed-demo
 * Triggers the demo team data generation. Owner-only + ALLOW_SEED env guard.
 */
export async function POST() {
  const owner = await requireMdOwner()
  if (!owner) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  if (process.env.ALLOW_SEED !== 'true') {
    return NextResponse.json(
      { success: false, error: 'Seeding is disabled. Set ALLOW_SEED=true to enable.' },
      { status: 403 }
    )
  }

  try {
    const result = generateDemoTeamData()
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('[seed-demo] error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Seed failed' },
      { status: 500 }
    )
  }
}
