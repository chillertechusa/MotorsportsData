import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdAccessLog } from '@/lib/db/schema'
import { v4 as uuid } from 'uuid'

/**
 * Webhook receiver for Clutch DMS work order creation
 * When a rider sends a diagnosis from Bike Doctor → Shop,
 * this endpoint receives the pre-filled work order data.
 *
 * Clutch DMS POST /api/webhooks/clutch-dms/work-order with:
 * {
 *   event: 'work_order.created',
 *   teamId: 'xxx',
 *   workOrderId: 'RO-2026-00123',
 *   riderEmail: 'rider@example.com',
 *   bikeNumber: '722',
 *   symptom: 'bike pulls left on decel',
 *   diagnosis: 'Lean pilot jet, needle may be high',
 *   estimatedHours: 1.5,
 *   timestamp: ISO8601
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, teamId, workOrderId, riderEmail, diagnosis, timestamp } = body

    // Verify webhook signature (TODO: implement HMAC verification)
    // For now, just log the event

    // Record in access log for audit trail
    await db.insert(mdAccessLog).values({
      id: uuid(),
      userEmail: riderEmail,
      action: `work_order.${event}`,
      details: `WO: ${workOrderId} | Diagnosis: ${diagnosis?.slice(0, 100)}`,
      teamId: teamId || '',
      sourceIp: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
    })

    return NextResponse.json(
      {
        success: true,
        message: `Work order ${workOrderId} received`,
        acknowledgedAt: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Clutch DMS webhook failed:', error)
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 })
  }
}
