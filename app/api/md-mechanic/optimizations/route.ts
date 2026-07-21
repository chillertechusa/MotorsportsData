import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdMechanicOptimizations } from '@/lib/db/schema'
import { requireMechanicProTier } from '@/lib/md-mechanic-auth'
import { getSessionTeamId } from '@/lib/md-auth'

/**
 * POST /api/md-mechanic/optimizations
 * Create a new optimization record
 */
export async function POST(req: NextRequest) {
  try {
    // Check tier gating
    await requireMechanicProTier()

    // Get current user
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status })
    }

    const body = await req.json()
    const {
      vehicleId,
      workOrderId,
      sessionId,
      parameter,
      valueBefore,
      valueAfter,
      rationale,
      estimatedLapTimeDelta,
    } = body

    if (!vehicleId || !parameter || !valueBefore || !valueAfter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create optimization record
    const optimization = await db
      .insert(mdMechanicOptimizations)
      .values({
        mechanicUserId: auth.userId,
        vehicleId,
        workOrderId: workOrderId || null,
        sessionId: sessionId || null,
        title: `${parameter}: ${valueBefore} → ${valueAfter}`,
        parameter,
        valueBefore,
        valueAfter,
        rationale: rationale || null,
        estimatedLapTimeDelta: estimatedLapTimeDelta || null,
        status: 'suggested',
      })
      .returning()

    return NextResponse.json({
      ok: true,
      optimization: optimization[0],
    })
  } catch (error: any) {
    console.error('[Mechanic Optimizations] Error:', error)

    if (error.message.includes('Mechanic Pro')) {
      return NextResponse.json({ error: error.message }, { status: 402 })
    }

    return NextResponse.json(
      { error: 'Failed to create optimization' },
      { status: 500 }
    )
  }
}
