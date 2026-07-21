import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdPartVault } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSessionTeamId, assertPartOwnership } from '@/lib/md-auth'

// Update a part's name, max life, and stock. Fixes typos (e.g. 40h logged as 400h).
export async function PATCH(req: Request, { params }: { params: Promise<{ partId: string }> }) {
  const { partId } = await params
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const owned = await assertPartOwnership(partId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ success: false, error: 'Part does not belong to your team.' }, { status: 403 })
  }

  let body: { partName?: string; maxHours?: number; stockInTruck?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof body.partName === 'string' && body.partName.trim()) {
    updates.partName = body.partName.trim()
  }
  if (Number.isFinite(body.maxHours) && (body.maxHours as number) > 0) {
    updates.maxHours = body.maxHours
  }
  if (Number.isFinite(body.stockInTruck)) {
    updates.stockInTruck = Math.max(0, Math.trunc(body.stockInTruck as number))
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: 'No valid fields to update.' }, { status: 400 })
  }

  try {
    const [part] = await db
      .update(mdPartVault)
      .set(updates)
      .where(eq(mdPartVault.id, partId))
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
    return NextResponse.json({ success: false, error: 'Failed to update part.' }, { status: 500 })
  }
}

// Permanently remove a retired part.
export async function DELETE(_req: Request, { params }: { params: Promise<{ partId: string }> }) {
  const { partId } = await params
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const owned = await assertPartOwnership(partId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ success: false, error: 'Part does not belong to your team.' }, { status: 403 })
  }

  try {
    await db.delete(mdPartVault).where(eq(mdPartVault.id, partId))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete part.' }, { status: 500 })
  }
}
