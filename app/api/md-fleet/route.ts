import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdVehicles, mdTeams } from '@/lib/db/schema'
import { eq, asc, count } from 'drizzle-orm'
import { getSessionTeamId, assertVehicleOwnership, getTeamTier } from '@/lib/md-auth'
import { TIER_VEHICLE_LIMIT, type MdTier } from '@/lib/md-tiers'

export async function GET() {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  try {
    const vehicles = await db
      .select({ id: mdVehicles.id, name: mdVehicles.name, type: mdVehicles.type, engineHours: mdVehicles.engineHours, specKey: mdVehicles.specKey, discipline: mdVehicles.discipline })
      .from(mdVehicles)
      .where(eq(mdVehicles.teamId, authResult.teamId))
      .orderBy(asc(mdVehicles.createdAt))

    return NextResponse.json({ success: true, vehicles })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to load fleet.' }, { status: 500 })
  }
}

// Create a new vehicle scoped to the caller's team.
export async function POST(req: Request) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  let body: { name?: string; type?: string; engineHours?: number; specKey?: string | null; discipline?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const name = body.name?.trim()
  const type = body.type?.trim()
  const engineHours = Number.isFinite(body.engineHours) ? Math.max(0, body.engineHours!) : 0
  const specKey = typeof body.specKey === 'string' && body.specKey ? body.specKey : null
  const discipline = typeof body.discipline === 'string' && body.discipline ? body.discipline : null

  if (!name || !type) {
    return NextResponse.json({ success: false, error: 'Name and type are required.' }, { status: 400 })
  }

  try {
    // Enforce per-tier vehicle cap.
    const tier = await getTeamTier(authResult.teamId)
    const limit = TIER_VEHICLE_LIMIT[tier as MdTier] ?? 1
    if (isFinite(limit)) {
      const [{ value: vehicleCount }] = await db
        .select({ value: count() })
        .from(mdVehicles)
        .where(eq(mdVehicles.teamId, authResult.teamId))
      if (vehicleCount >= limit) {
        return NextResponse.json(
          { success: false, error: `Your plan allows a maximum of ${limit} vehicle${limit === 1 ? '' : 's'}. Upgrade to add more.` },
          { status: 403 }
        )
      }
    }

    // team_id is taken from the SESSION, never from the client body.
    const [vehicle] = await db
      .insert(mdVehicles)
      .values({ teamId: authResult.teamId, name, type, engineHours, specKey, discipline })
      .returning({ id: mdVehicles.id, name: mdVehicles.name, type: mdVehicles.type, engineHours: mdVehicles.engineHours, specKey: mdVehicles.specKey, discipline: mdVehicles.discipline })

    return NextResponse.json({ success: true, vehicle })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to add vehicle.' }, { status: 500 })
  }
}

// Delete a vehicle (cascades to its sessions + parts via FK onDelete).
export async function DELETE(req: Request) {
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
    await db.delete(mdVehicles).where(eq(mdVehicles.id, vehicleId))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete vehicle.' }, { status: 500 })
  }
}
