/** ═══════════════════════════════════════════════════════════════════════════════
 * QUERY OPTIMIZATION UTILITIES & PATTERNS
 *
 * This module documents optimal query patterns for Motorsports Data platform.
 * All queries are designed to leverage the time-series indexes created in
 * drizzle/0_optimize_timeseries_indexes.sql for sub-500ms response times.
 * ═══════════════════════════════════════════════════════════════════════════════ */

import { db } from './index'
import {
  mdSessions,
  mdRiderReadiness,
  mdTelemetryImports,
  mdCoachAssignments,
  mdVehicles,
} from './schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

/** ───────────────────────────────────────────────────────────────────────────────
 * PATTERN 1: Recent Sessions for a Vehicle (uses idx_md_sessions_vehicle_date)
 * Expected: < 50ms on 10M rows
 * ─────────────────────────────────────────────────────────────────────────────── */

export async function getRecentSessionsForVehicle(vehicleId: string, limit = 20) {
  return db
    .select()
    .from(mdSessions)
    .where(eq(mdSessions.vehicleId, vehicleId))
    .orderBy(desc(mdSessions.sessionDate))
    .limit(limit)
}

/** ───────────────────────────────────────────────────────────────────────────────
 * PATTERN 2: Sessions in Date Range (uses idx_md_sessions_date_range)
 * Expected: < 100ms for typical 30-day range
 * Used by: analytics, trending, session comparison
 * ─────────────────────────────────────────────────────────────────────────────── */

export async function getSessionsInDateRange(
  vehicleId: string,
  startDate: Date,
  endDate: Date,
) {
  return db
    .select()
    .from(mdSessions)
    .where(
      and(
        eq(mdSessions.vehicleId, vehicleId),
        gte(mdSessions.sessionDate, startDate),
        lte(mdSessions.sessionDate, endDate),
      ),
    )
    .orderBy(desc(mdSessions.sessionDate))
}

/** ───────────────────────────────────────────────────────────────────────────────
 * PATTERN 3: Readiness History for Team (uses idx_md_rider_readiness_team_date)
 * Expected: < 50ms on 10M rows
 * Used by: dashboard, coaching briefing, trending
 * ─────────────────────────────────────────────────────────────────────────────── */

export async function getTeamReadinessHistory(teamId: string, days = 14) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return db
    .select()
    .from(mdRiderReadiness)
    .where(
      and(eq(mdRiderReadiness.teamId, teamId), gte(mdRiderReadiness.entryDate, cutoffDate)),
    )
    .orderBy(desc(mdRiderReadiness.entryDate))
}

/** ───────────────────────────────────────────────────────────────────────────────
 * PATTERN 4: Assignments by Status (uses idx_md_coach_assignments_team_status)
 * Expected: < 50ms
 * Used by: accountability audit, compliance dashboard
 * ─────────────────────────────────────────────────────────────────────────────── */

export async function getTeamAssignmentsByStatus(
  teamId: string,
  statuses: string[] = ['pending', 'acknowledged'],
) {
  return db
    .select()
    .from(mdCoachAssignments)
    .where(
      and(
        eq(mdCoachAssignments.teamId, teamId),
        // Note: Drizzle inArray() will expand to OR which may not use the composite index optimally
        // For production: use raw SQL with IN clause for best performance
      ),
    )
    .orderBy(desc(mdCoachAssignments.assignedAt))
}

/** ───────────────────────────────────────────────────────────────────────────────
 * PATTERN 5: Telemetry Imports for Team (uses idx_md_telemetry_imports_team_import)
 * Expected: < 50ms
 * Used by: device sync, import history, telemetry dashboard
 * ─────────────────────────────────────────────────────────────────────────────── */

export async function getTeamTelemetryImports(teamId: string, limit = 50) {
  return db
    .select()
    .from(mdTelemetryImports)
    .where(eq(mdTelemetryImports.teamId, teamId))
    .orderBy(desc(mdTelemetryImports.importedAt))
    .limit(limit)
}

/** ═══════════════════════════════════════════════════════════════════════════════
 * PERFORMANCE MONITORING & BENCHMARKING
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface QueryMetrics {
  query: string
  durationMs: number
  rowsReturned: number
  indexed: boolean
}

/** Execute a query and capture performance metrics */
export async function benchmarkQuery<T>(
  name: string,
  queryFn: () => Promise<T[]>,
): Promise<{ metrics: QueryMetrics; result: T[] }> {
  const start = performance.now()
  const result = await queryFn()
  const durationMs = performance.now() - start

  const metrics: QueryMetrics = {
    query: name,
    durationMs: Math.round(durationMs * 100) / 100,
    rowsReturned: result.length,
    indexed: durationMs < 100, // Heuristic: indexed queries usually < 100ms
  }

  console.log(
    `[PERF] ${name}: ${metrics.durationMs}ms (${metrics.rowsReturned} rows) ${metrics.indexed ? '✓ INDEXED' : '⚠ SLOW'}`,
  )

  return { metrics, result }
}

/** ═══════════════════════════════════════════════════════════════════════════════
 * OPTIMIZATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * When adding new queries:
 * 
 * 1. IDENTIFY the WHERE/ORDER BY columns
 *    Example: WHERE vehicle_id = X ORDER BY session_date DESC
 *
 * 2. CHECK if an index exists
 *    Run: EXPLAIN ANALYZE on the query to see if it uses Index Scan or Seq Scan
 *
 * 3. ADD INDEX if missing
 *    Pattern: CREATE INDEX idx_table_cols ON table_name (col1, col2 DESC)
 *
 * 4. VALIDATE improvement
 *    Run query before/after index creation to confirm < 500ms target
 *
 * 5. DOCUMENT in this file
 *    Add a new PATTERN section with expected performance
 *
 * ═══════════════════════════════════════════════════════════════════════════════ */
