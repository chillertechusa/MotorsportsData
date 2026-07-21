import { generateDemoTeamData } from '@/app/actions/seed-demo-team'
import { NextResponse } from 'next/server'

/**
 * POST /api/admin/seed-demo
 * Triggers the demo team data generation. Gated by ALLOW_SEED=true env var.
 * For admin use only.
 */
export async function POST() {
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
