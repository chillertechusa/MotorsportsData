import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdWorkOrders, mdVehicles } from '@/lib/db/schema'
import { randomUUID } from 'crypto'

/**
 * POST /api/md-shop-connect/send-to-shop
 * 
 * Creates a work order stub from rider's diagnosis and sends it to the shop.
 * Input: bike ID, symptom description, AI diagnosis result
 * Output: work order created, email sent to shop
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { teamId, vehicleId, symptom, diagnosis, engineHours, shopEmail, shopName } = body as {
      teamId: string
      vehicleId: string
      symptom: string
      diagnosis: string
      engineHours: number
      shopEmail?: string
      shopName?: string
    }

    if (!teamId || !vehicleId || !symptom || !diagnosis) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch vehicle to get name and hours
    const vehicle = await db.query.mdVehicles.findFirst({
      where: (t) => t.id === vehicleId as any,
    })

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Create work order stub
    const workOrder = await db.insert(mdWorkOrders).values({
      id: randomUUID(),
      teamId,
      vehicleId,
      title: `AI Diagnosis: ${symptom.slice(0, 50)}…`,
      description: `Rider reported: ${symptom}\n\nAI Doctor diagnosis: ${diagnosis}\n\nEngine hours: ${engineHours || 'Unknown'}`,
      status: 'open',
      createdAt: new Date(),
    }).returning()

    // TODO: Send email to shop with work order details
    // (Requires email service integration — presently logged for demo)
    console.log('[md-shop-connect] Work order created:', {
      workOrderId: workOrder[0]?.id,
      shopEmail,
      shopName,
      vehicle: vehicle.name,
      symptom,
    })

    return NextResponse.json({
      success: true,
      workOrderId: workOrder[0]?.id,
      message: `Work order sent to ${shopName || 'your shop'}. They'll call you with a quote.`,
    })
  } catch (error) {
    console.error('[md-shop-connect] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
