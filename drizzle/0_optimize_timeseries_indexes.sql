-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║                    TIME-SERIES QUERY OPTIMIZATION                            ║
-- ║  Optimizes Motorsports Data platform for sub-500ms queries on 10M+ rows      ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════════════════════════════════════════════
-- CRITICAL HOT-PATH INDEXES
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. mdSessions: Most frequent query pattern is "get recent sessions for a vehicle"
--    Used by: session list, dashboard, progression, setup AI, coaching routes
--    Query: WHERE vehicle_id = X ORDER BY session_date DESC LIMIT N
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_sessions_vehicle_date 
  ON md_sessions (vehicle_id, session_date DESC) 
  WHERE vehicle_id IS NOT NULL;

-- 2. mdSessions: Secondary pattern is "sessions in date range"
--    Used by: analytics, comparison, trending views
--    Query: WHERE session_date BETWEEN X AND Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_sessions_date_range 
  ON md_sessions (session_date DESC) 
  WHERE session_date IS NOT NULL;

-- 3. mdRiderReadiness: Primary pattern is "get readiness history for team"
--    Used by: dashboard, coach briefing, readiness assessment, trending
--    Query: WHERE team_id = X ORDER BY entry_date DESC LIMIT N
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_rider_readiness_team_date 
  ON md_rider_readiness (team_id, entry_date DESC) 
  WHERE team_id IS NOT NULL;

-- 4. mdTelemetryImports: Pattern is "get recent imports for team"
--    Used by: device sync, telemetry dashboard, import history
--    Query: WHERE team_id = X ORDER BY imported_at DESC LIMIT N
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_telemetry_imports_team_import 
  ON md_telemetry_imports (team_id, imported_at DESC) 
  WHERE team_id IS NOT NULL;

-- 5. mdCoachAssignments: Pattern is "get pending/open assignments for team"
--    Used by: accountability audit, compliance dashboard, assignment list
--    Query: WHERE team_id = X AND status IN (...) ORDER BY assigned_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_coach_assignments_team_status 
  ON md_coach_assignments (team_id, status, assigned_at DESC) 
  WHERE team_id IS NOT NULL;

-- 6. mdCoachAssignments: Secondary pattern is "find by rider email"
--    Used by: assignment acknowledgment, rider compliance view
--    Query: WHERE rider_email = X AND team_id = Y
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_coach_assignments_rider_email 
  ON md_coach_assignments (rider_email, team_id) 
  WHERE rider_email IS NOT NULL;

-- ════════════════════════════════════════════════════════════════════════════════
-- FOREIGN KEY OPTIMIZATION
-- ════════════════════════════════════════════════════════════════════════════════

-- mdSessions references mdVehicles — JOIN queries benefit from this
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_sessions_vehicle_fk 
  ON md_sessions (vehicle_id) 
  WHERE vehicle_id IS NOT NULL;

-- mdCoachAssignments references mdTeams — JOIN queries benefit from this
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_coach_assignments_team_fk 
  ON md_coach_assignments (team_id) 
  WHERE team_id IS NOT NULL;

-- mdRiderReadiness references mdTeams — JOIN queries benefit from this
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_md_rider_readiness_team_fk 
  ON md_rider_readiness (team_id) 
  WHERE team_id IS NOT NULL;

-- ════════════════════════════════════════════════════════════════════════════════
-- UNIQUE/CONSTRAINT INDEXES (detect duplicates, enforce uniqueness)
-- ════════════════════════════════════════════════════════════════════════════════

-- mdSessions: Enforce that share tokens are unique (if public sharing is used)
-- Note: Already defined in schema as .unique(), but explicit here for reference
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_md_sessions_share_token 
--   ON md_sessions (share_token) 
--   WHERE share_token IS NOT NULL;

-- ════════════════════════════════════════════════════════════════════════════════
-- QUERY ANALYSIS & CONFIGURATION
-- ════════════════════════════════════════════════════════════════════════════════

-- Enable query planner statistics on indexed columns for better execution plans
ANALYZE md_sessions;
ANALYZE md_rider_readiness;
ANALYZE md_telemetry_imports;
ANALYZE md_coach_assignments;

-- ════════════════════════════════════════════════════════════════════════════════
-- PARTITIONING STRATEGY (Future: implement if table grows beyond 10M rows)
-- ════════════════════════════════════════════════════════════════════════════════
-- 
-- When mdSessions exceeds 10M rows, partition by session_date (monthly or quarterly):
--   ALTER TABLE md_sessions SET (
--     autovacuum_vacuum_scale_factor = 0.001,
--     autovacuum_analyze_scale_factor = 0.0005
--   );
--   CREATE TABLE md_sessions_2024_q1 PARTITION OF md_sessions
--     FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
--   CREATE TABLE md_sessions_2024_q2 PARTITION OF md_sessions
--     FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
--
-- Benefits:
--   - Queries on recent data (2024 Q4) only scan relevant partitions
--   - Maintenance (VACUUM, ANALYZE) parallelizes per partition
--   - Archive old partitions to cold storage (2023 Q1-Q3)
--
-- When to trigger: Monitor table size with:
--   SELECT pg_size_pretty(pg_total_relation_size('md_sessions'));
--   If > 5GB, consider partitioning.

-- ════════════════════════════════════════════════════════════════════════════════
-- PERFORMANCE BASELINE (Run these queries to validate optimization)
-- ════════════════════════════════════════════════════════════════════════════════
--
-- Before indexes (slow):
--   EXPLAIN ANALYZE SELECT * FROM md_sessions 
--     WHERE vehicle_id = '...' ORDER BY session_date DESC LIMIT 20;
--   > Expected: Seq Scan (full table scan) — 1000s ms
--
-- After indexes (fast):
--   EXPLAIN ANALYZE SELECT * FROM md_sessions 
--     WHERE vehicle_id = '...' ORDER BY session_date DESC LIMIT 20;
--   > Expected: Index Scan (idx_md_sessions_vehicle_date) — < 50 ms
--
-- Similarly test:
--   SELECT * FROM md_rider_readiness WHERE team_id = '...' 
--     ORDER BY entry_date DESC LIMIT 30;
--   SELECT * FROM md_telemetry_imports WHERE team_id = '...' 
--     ORDER BY imported_at DESC;
--   SELECT * FROM md_coach_assignments WHERE team_id = '...' 
--     AND status = 'pending' ORDER BY assigned_at DESC;
