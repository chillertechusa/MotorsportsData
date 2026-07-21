-- Enable TimescaleDB extension (run as superuser)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create telemetry_metrics hypertable
CREATE TABLE IF NOT EXISTS telemetry_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  rider_id UUID NOT NULL,
  device_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  heart_rate INTEGER,
  power INTEGER,
  speed REAL,
  cadence INTEGER,
  altitude INTEGER,
  temperature REAL,
  humidity INTEGER,
  vo2 INTEGER,
  lactate_level REAL,
  latitude REAL,
  longitude REAL,
  raw_data TEXT
);

-- Convert to hypertable (time partitioning by day)
SELECT create_hypertable('telemetry_metrics', 'timestamp', if_not_exists => TRUE);

-- Create continuous aggregate for 1-minute buckets
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_1m AS
SELECT 
  time_bucket('1 minute', timestamp) AS time_window,
  session_id,
  rider_id,
  AVG(heart_rate) AS heart_rate_avg,
  MIN(heart_rate) AS heart_rate_min,
  MAX(heart_rate) AS heart_rate_max,
  AVG(power) AS power_avg,
  MIN(power) AS power_min,
  MAX(power) AS power_max,
  AVG(speed) AS speed_avg,
  MAX(speed) AS speed_max,
  AVG(cadence) AS cadence_avg,
  COUNT(*) AS sample_count
FROM telemetry_metrics
GROUP BY time_window, session_id, rider_id
WITH DATA;

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_telemetry_session_rider ON telemetry_metrics (session_id, rider_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_device ON telemetry_metrics (device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_rider ON telemetry_metrics (rider_id, timestamp DESC);

-- Enable compression for older data (30+ days)
ALTER TABLE telemetry_metrics SET (timescaledb.compress, timescaledb.compress_orderby = 'timestamp DESC');
SELECT add_compression_policy('telemetry_metrics', INTERVAL '30 days', if_not_exists => TRUE);

-- Enable continuous aggregation refresh
SELECT add_continuous_aggregate_policy('telemetry_1m', 
  start_offset => INTERVAL '1 hour',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '5 minutes',
  if_not_exists => TRUE);

-- Create lap_data table
CREATE TABLE IF NOT EXISTS lap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  rider_id UUID NOT NULL,
  lap_number INTEGER NOT NULL,
  lap_start_time TIMESTAMPTZ NOT NULL,
  lap_end_time TIMESTAMPTZ NOT NULL,
  lap_time_ms INTEGER NOT NULL,
  heart_rate_avg REAL,
  heart_rate_max INTEGER,
  power_avg REAL,
  power_peak INTEGER,
  speed_max REAL,
  temperature REAL,
  humidity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lap_session_rider ON lap_data (session_id, rider_id, lap_number);
