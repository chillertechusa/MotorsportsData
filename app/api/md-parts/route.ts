import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdPartVault } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { getSessionTeamId, assertVehicleOwnership } from '@/lib/md-auth'

// List parts for a vehicle owned by the caller's team.
export async function GET(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const { searchParams } = new URL(req.url)
  const vehicleId = searchParams.get('vehicleId')
  if (!vehicleId) {
    return NextResponse.json({ success: false, error: 'vehicleId is required.' }, { status: 400 })
  }

  const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ success: false, error: 'Vehicle does not belong to your team.' }, { status: 403 })
  }

  try {
    const parts = await db
      .select({
        id: mdPartVault.id,
        vehicleId: mdPartVault.vehicleId,
        partName: mdPartVault.partName,
        currentHours: mdPartVault.currentHours,
        maxHours: mdPartVault.maxHours,
        stockInTruck: mdPartVault.stockInTruck,
      })
      .from(mdPartVault)
      .where(eq(mdPartVault.vehicleId, vehicleId))
      .orderBy(asc(mdPartVault.partName))

    return NextResponse.json({ success: true, parts })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to load parts.' }, { status: 500 })
  }
}

// Add a part to a vehicle.
export async function POST(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  let body: { vehicleId?: string; partName?: string; maxHours?: number; currentHours?: number; stockInTruck?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const vehicleId = body.vehicleId
  const partName = body.partName?.trim()
  const maxHours = Number(body.maxHours)
  const currentHours = Number.isFinite(body.currentHours) ? Math.max(0, body.currentHours!) : 0
  const stockInTruck = Number.isFinite(body.stockInTruck) ? Math.max(0, Math.trunc(body.stockInTruck!)) : 0

  if (!vehicleId || !partName || !Number.isFinite(maxHours) || maxHours <= 0) {
    return NextResponse.json(
      { success: false, error: 'vehicleId, partName, and a positive maxHours are required.' },
      { status: 400 },
    )
  }

  const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ success: false, error: 'Vehicle does not belong to your team.' }, { status: 403 })
  }

  try {
    const [part] = await db
      .insert(mdPartVault)
      .values({ vehicleId, partName, maxHours, currentHours, stockInTruck })
      .returning({
        id: mdPartVault.id,
        vehicleId: mdPartVault.vehicleId,
        partName: mdPartVault.partName,
        currentHours: mdPartVault.currentHours,
        maxHours: mdPartVault.maxHours,
        stockInTruck: mdPartVault.stockInTruck,
      })

    return NextResponse.json({ success: true, part })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to add part.' }, { status: 500 })
  }
}
