import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdPartVault } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getSessionTeamId, assertPartOwnership } from '@/lib/md-auth'

// Log maintenance on a part: the part was replaced/serviced, so its life resets to 0.
// If it was pulled from truck stock, optionally decrement the on-hand count.
export async function POST(req: Request, { params }: { params: Promise<{ partId: string }> }) {
  const { partId } = await params
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  const owned = await assertPartOwnership(partId, authResult.teamId)
  if (!owned) {
    return NextResponse.json({ success: false, error: 'Part does not belong to your team.' }, { status: 403 })
  }

  let usedFromStock = false
  try {
    const body = await req.json().catch(() => ({}))
    usedFromStock = Boolean(body?.usedFromStock)
  } catch {
    /* body optional */
  }

  try {
    const [part] = await db
      .update(mdPartVault)
      .set({
        currentHours: 0,
        // Only decrement stock when the replacement came off the truck, and never below 0.
        ...(usedFromStock
          ? { stockInTruck: sql`GREATEST(${mdPartVault.stockInTruck} - 1, 0)` }
          : {}),
      })
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
    return NextResponse.json({ success: false, error: 'Failed to log maintenance.' }, { status: 500 })
  }
}
