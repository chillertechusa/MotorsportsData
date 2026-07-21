import { NextResponse } from 'next/server'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mdVehicles, mdPartVault, mdSessions, mdExpenses } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'

export async function GET() {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  const teamId = authResult.teamId

  try {
    const vehicles = await db.select().from(mdVehicles).where(eq(mdVehicles.teamId, teamId))

    if (vehicles.length === 0) {
      return NextResponse.json({
        vehicles: [],
        metrics: {
          totalVehicles: 0,
          totalSessions: 0,
          totalMaintenanceCostCents: 0,
          averageCostPerVehicleCents: 0,
          partsNeedingService: 0,
        },
      })
    }

    const vehicleIds = vehicles.map((v) => v.id)

    // Parts + sessions scoped to the team's vehicles. Expenses are team-scoped directly.
    const [allParts, allSessions, allExpenses] = await Promise.all([
      db.select().from(mdPartVault).where(inArray(mdPartVault.vehicleId, vehicleIds)),
      db.select().from(mdSessions).where(inArray(mdSessions.vehicleId, vehicleIds)),
      db.select().from(mdExpenses).where(eq(mdExpenses.teamId, teamId)),
    ])

    const pct = (part: { currentHours: number | null; maxHours: number }) =>
      part.maxHours > 0 ? ((part.currentHours ?? 0) / part.maxHours) * 100 : 0

    const vehicleAnalytics = vehicles.map((vehicle) => {
      const vehicleParts = allParts.filter((p) => p.vehicleId === vehicle.id)
      const vehicleSessions = allSessions.filter((s) => s.vehicleId === vehicle.id)
      // Real spend: sum of logged expenses linked to this vehicle.
      const maintenanceCostCents = allExpenses
        .filter((e) => e.vehicleId === vehicle.id)
        .reduce((sum, e) => sum + (e.amountCents ?? 0), 0)

      const maintenanceEvents = vehicleParts
        .map((part) => {
          const percentageUsed = pct(part)
          const status: 'good' | 'warning' | 'critical' =
            percentageUsed >= 90 ? 'critical' : percentageUsed >= 70 ? 'warning' : 'good'
          return {
            partName: part.partName,
            currentHours: part.currentHours ?? 0,
            maxHours: part.maxHours,
            percentageUsed,
            status,
          }
        })
        .sort((a, b) => b.percentageUsed - a.percentageUsed)

      return {
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.name} (${vehicle.type})`,
        engineHours: vehicle.engineHours ?? 0,
        totalSessions: vehicleSessions.length,
        maintenanceCostCents,
        partsAtRisk: vehicleParts.filter((p) => pct(p) >= 70).length,
        maintenanceEvents,
      }
    })

    const totalMaintenanceCostCents = vehicleAnalytics.reduce((s, v) => s + v.maintenanceCostCents, 0)
    const totalSessions = vehicleAnalytics.reduce((s, v) => s + v.totalSessions, 0)
    const totalPartsAtRisk = vehicleAnalytics.reduce((s, v) => s + v.partsAtRisk, 0)

    return NextResponse.json({
      vehicles: vehicleAnalytics,
      metrics: {
        totalVehicles: vehicles.length,
        totalSessions,
        totalMaintenanceCostCents,
        averageCostPerVehicleCents: Math.round(totalMaintenanceCostCents / vehicles.length),
        partsNeedingService: totalPartsAtRisk,
      },
    })
  } catch (e) {
    console.error('[md-fleet-analytics] error:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
