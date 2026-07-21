-- TimescaleDB Setup: Telemetry Time-Series Tables
-- Run this migration to enable production telemetry streaming

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ─────────────────────────────────────────────────────────
-- Telemetry Metrics (High-Frequency Data)
-- Raw sensor data: HR, power, speed, cadence every 1-2 seconds
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS telemetry_metrics (
  time TIMESTAMPTZ NOT NULL,
  session_id UUID NOT NULL,
  rider_id UUID NOT NULL,
  team_id UUID NOT NULL,
  
  -- Wearable data
  heart_rate SMALLINT,
  hrv_ms SMALLINT,
  temperature NUMERIC(4,2),
  
  -- Power metrics
  power_watts SMALLINT,
  power_smoothed_3s SMALLINT,
  
  -- Movement
  speed_mph NUMERIC(5,2),
  cadence_rpm SMALLINT,
  
  -- GPS (optional)
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  altitude_ft SMALLINT,
  
  -- Track position
  lap_number SMALLINT,
  sector SMALLINT, -- 1-12 on track
  
  -- Metadata
  device_id VARCHAR(255),
  device_type VARCHAR(50), -- 'garmin', 'apple_watch', 'polar', etc.
  sync_latency_ms SMALLINT, -- How old is this data?
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Convert to hypertable (time-partitioned)
SELECT create_hypertable(
  'telemetry_metrics',
  'time',
  if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day'
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_telemetry_session_time
  ON telemetry_metrics (session_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_rider_time
  ON telemetry_metrics (rider_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_team_time
  ON telemetry_metrics (team_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_device
  ON telemetry_metrics (device_id, time DESC);

-- ─────────────────────────────────────────────────────────
-- Continuous Aggregates (Real-Time Analytics)
-- Pre-computed 1-minute and 5-minute buckets for fast dashboards
-- ─────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_1m AS
SELECT
  time_bucket('1 minute', time) AS minute,
  session_id,
  rider_id,
  team_id,
  
  -- Aggregates
  AVG(heart_rate) AS avg_hr,
  MAX(heart_rate) AS max_hr,
  MIN(heart_rate) AS min_hr,
  STDDEV(heart_rate) AS stddev_hr,
  
  AVG(power_watts) AS avg_power,
  MAX(power_watts) AS max_power,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY power_watts) AS p95_power,
  
  AVG(speed_mph) AS avg_speed,
  MAX(speed_mph) AS max_speed,
  
  AVG(cadence_rpm) AS avg_cadence,
  COUNT(*) AS sample_count
FROM telemetry_metrics
GROUP BY minute, session_id, rider_id, team_id
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_telemetry_1m_session
  ON telemetry_1m (session_id, minute DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_1m_rider
  ON telemetry_1m (rider_id, minute DESC);

-- Refresh policy (every 10 seconds, only last 1 hour)
SELECT add_continuous_aggregate_policy(
  'telemetry_1m',
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '10 seconds',
  schedule_interval => INTERVAL '10 seconds',
  if_not_exists => TRUE
);

-- ─────────────────────────────────────────────────────────
-- 5-Minute Aggregates
-- ─────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_5m AS
SELECT
  time_bucket('5 minutes', time) AS five_min,
  session_id,
  rider_id,
  team_id,
  
  AVG(heart_rate) AS avg_hr,
  MAX(heart_rate) AS max_hr,
  AVG(power_watts) AS avg_power,
  MAX(power_watts) AS max_power,
  AVG(speed_mph) AS avg_speed,
  COUNT(*) AS sample_count
FROM telemetry_metrics
GROUP BY five_min, session_id, rider_id, team_id
WITH NO DATA;

-- ─────────────────────────────────────────────────────────
-- Compression Policy (Auto-compress 7+ day old data)
-- Compresses cold data for 90% storage savings
-- ─────────────────────────────────────────────────────────

SELECT add_compression_policy(
  'telemetry_metrics',
  INTERVAL '7 days',
  if_not_exists => TRUE
);

-- ─────────────────────────────────────────────────────────
-- Retention Policy (Auto-delete 90+ day old data)
-- ─────────────────────────────────────────────────────────

SELECT add_retention_policy(
  'telemetry_metrics',
  INTERVAL '90 days',
  if_not_exists => TRUE
);

-- ─────────────────────────────────────────────────────────
-- Session Snapshots (End-of-session aggregates)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_snapshots (
  session_id UUID PRIMARY KEY,
  team_id UUID NOT NULL,
  rider_id UUID NOT NULL,
  
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_seconds INT,
  
  avg_heart_rate SMALLINT,
  max_heart_rate SMALLINT,
  avg_power SMALLINT,
  max_power SMALLINT,
  avg_speed NUMERIC(5,2),
  max_speed NUMERIC(5,2),
  
  lap_count SMALLINT,
  best_lap_seconds NUMERIC(6,2),
  
  readiness_score SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (rider_id) REFERENCES riders(id)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_rider_time
  ON session_snapshots (rider_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_snapshots_team_time
  ON session_snapshots (team_id, start_time DESC);

-- ─────────────────────────────────────────────────────────
-- Setup complete
-- ─────────────────────────────────────────────────────────

-- Verify TimescaleDB installation
SELECT version();
SELECT extname FROM pg_extension WHERE extname = 'timescaledb';

-- Show hypertable info
SELECT hypertable_schema, hypertable_name, num_chunks 
FROM timescaledb_information.hypertables;

