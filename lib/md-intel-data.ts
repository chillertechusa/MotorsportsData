// RAG retrieval source for MD Intel. Reads live session history from Neon and
// falls back to seeded mock data only if the database returns nothing.
import { desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs, mdVehicles } from '@/lib/db/schema'

export interface SessionSetup {
  fork_compression_clicks_out?: number
  fork_rebound_clicks_out?: number
  shock_sag_mm?: number
  tire_pressure_front_psi?: number
  tire_pressure_rear_psi?: number
  ecu_map?: string
}

export interface SessionRecord {
  session_id: string
  vehicle_id: string
  track: string
  conditions: string
  date: string
  setup: SessionSetup
  rider_feedback: string
}

// Map a flat list of setup-log key/value rows onto the typed SessionSetup shape.
function mapSetup(rows: { parameterKey: string; parameterValue: string }[]): SessionSetup {
  const setup: SessionSetup = {}
  for (const { parameterKey: k, parameterValue: v } of rows) {
    const key = k.toLowerCase()
    if (key.includes('fork') && key.includes('comp')) setup.fork_compression_clicks_out = parseFloat(v)
    else if (key.includes('fork') && key.includes('reb')) setup.fork_rebound_clicks_out = parseFloat(v)
    else if (key.includes('sag')) setup.shock_sag_mm = parseFloat(v)
    else if (key.includes('front')) setup.tire_pressure_front_psi = parseFloat(v)
    else if (key.includes('rear')) setup.tire_pressure_rear_psi = parseFloat(v)
    else if (key.includes('map') || key.includes('ecu')) setup.ecu_map = v
  }
  return setup
}

/**
 * Retrieval step for the RAG pipeline. Pulls live sessions + setup logs from
 * Neon scoped to the caller's team. Falls back to seeded mock history if the
 * query throws or the database is empty.
 */
export async function fetchHistoricalData(
  _query: string,
  vehicleId?: string,
  teamId?: string,
): Promise<SessionRecord[]> {
  try {
    // First resolve the vehicle IDs that belong to this team.
    let teamVehicleIds: string[] = []
    if (teamId) {
      const vehicles = await db
        .select({ id: mdVehicles.id })
        .from(mdVehicles)
        .where(eq(mdVehicles.teamId, teamId))
      teamVehicleIds = vehicles.map((v) => v.id)
      if (teamVehicleIds.length === 0) return []
    }

    // Build the WHERE clause — team scope + optional vehicle filter.
    const whereClause =
      vehicleId && teamVehicleIds.includes(vehicleId)
        ? eq(mdSessions.vehicleId, vehicleId)
        : teamVehicleIds.length > 0
          ? inArray(mdSessions.vehicleId, teamVehicleIds)
          : undefined

    const rows = await db
      .select()
      .from(mdSessions)
      .where(whereClause)
      .orderBy(desc(mdSessions.sessionDate))
      .limit(25)

    // No sessions logged yet — return empty. The model will respond accordingly.
    if (rows.length === 0) return []

    const records = await Promise.all(
      rows.map(async (s) => {
        const logs = await db
          .select({ parameterKey: mdSetupLogs.parameterKey, parameterValue: mdSetupLogs.parameterValue })
          .from(mdSetupLogs)
          .where(eq(mdSetupLogs.sessionId, s.id))
        return {
          session_id: s.id,
          vehicle_id: s.vehicleId ?? '',
          track: s.trackName,
          conditions: s.trackConditions ?? 'Unknown',
          date: s.sessionDate ?? '',
          setup: mapSetup(logs),
          rider_feedback: s.riderFeedback ?? '',
        } satisfies SessionRecord
      }),
    )
    return records
  } catch (err) {
    // Log server-side only. Never leak DB structure or table names to the client.
    console.error('[md-intel] fetchHistoricalData error:', err instanceof Error ? err.message : err)
    return []
  }
}

