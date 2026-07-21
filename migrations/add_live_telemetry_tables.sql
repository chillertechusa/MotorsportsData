-- Live telemetry schema for real-time race-day coaching

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- md_live_sessions: Real-time race session tracking
CREATE TABLE IF NOT EXISTS md_live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES md_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  rider_email VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  session_token VARCHAR(512) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  stream_started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  current_lap INTEGER DEFAULT 0,
  total_laps INTEGER DEFAULT 0,
  best_lap_seconds DOUBLE PRECISION,
  lap_start_time TIMESTAMPTZ,
  session_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for live queries
CREATE INDEX idx_md_live_sessions_team_id ON md_live_sessions(team_id);
CREATE INDEX idx_md_live_sessions_session_id ON md_live_sessions(session_id);
CREATE INDEX idx_md_live_sessions_is_active ON md_live_sessions(is_active);
CREATE INDEX idx_md_live_sessions_created_at ON md_live_sessions(created_at DESC);

-- md_live_telemetry: High-frequency telemetry data points
CREATE TABLE IF NOT EXISTS md_live_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  live_session_id UUID NOT NULL REFERENCES md_live_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  lap_number INTEGER NOT NULL,
  lap_time_seconds DOUBLE PRECISION,
  speed DOUBLE PRECISION NOT NULL,
  throttle DOUBLE PRECISION NOT NULL,
  brake_pressure DOUBLE PRECISION,
  tire_press_front DOUBLE PRECISION,
  tire_press_rear DOUBLE PRECISION,
  engine_temp_c DOUBLE PRECISION,
  engine_rpm_k DOUBLE PRECISION,
  g_lateral DOUBLE PRECISION,
  g_longitudinal DOUBLE PRECISION,
  suspension_travel_front DOUBLE PRECISION,
  suspension_travel_rear DOUBLE PRECISION,
  gps_lat DOUBLE PRECISION,
  gps_lon DOUBLE PRECISION,
  device_timestamp BIGINT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for telemetry queries (optimized for time-series)
CREATE INDEX idx_md_live_telemetry_live_session_id ON md_live_telemetry(live_session_id);
CREATE INDEX idx_md_live_telemetry_timestamp ON md_live_telemetry(timestamp DESC);
CREATE INDEX idx_md_live_telemetry_lap ON md_live_telemetry(live_session_id, lap_number);
CREATE INDEX idx_md_live_telemetry_created_at ON md_live_telemetry(created_at DESC);

-- md_live_alerts: Real-time alerts during race
CREATE TABLE IF NOT EXISTS md_live_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  live_session_id UUID NOT NULL REFERENCES md_live_sessions(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  trigger_data JSONB,
  recommendation TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for alerts
CREATE INDEX idx_md_live_alerts_live_session_id ON md_live_alerts(live_session_id);
CREATE INDEX idx_md_live_alerts_severity ON md_live_alerts(severity);
CREATE INDEX idx_md_live_alerts_created_at ON md_live_alerts(created_at DESC);

-- Enable RLS for all tables
ALTER TABLE md_live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE md_live_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE md_live_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Team-scoped access
CREATE POLICY md_live_sessions_select ON md_live_sessions
  FOR SELECT USING (team_id IN (SELECT team_id FROM md_team_members WHERE user_id = auth.uid()));

CREATE POLICY md_live_sessions_insert ON md_live_sessions
  FOR INSERT WITH CHECK (team_id IN (SELECT team_id FROM md_team_members WHERE user_id = auth.uid()));

CREATE POLICY md_live_telemetry_select ON md_live_telemetry
  FOR SELECT USING (live_session_id IN (SELECT id FROM md_live_sessions WHERE team_id IN (SELECT team_id FROM md_team_members WHERE user_id = auth.uid())));

CREATE POLICY md_live_telemetry_insert ON md_live_telemetry
  FOR INSERT WITH CHECK (live_session_id IN (SELECT id FROM md_live_sessions WHERE team_id IN (SELECT team_id FROM md_team_members WHERE user_id = auth.uid())));

CREATE POLICY md_live_alerts_select ON md_live_alerts
  FOR SELECT USING (live_session_id IN (SELECT id FROM md_live_sessions WHERE team_id IN (SELECT team_id FROM md_team_members WHERE user_id = auth.uid())));

CREATE POLICY md_live_alerts_insert ON md_live_alerts
  FOR INSERT WITH CHECK (live_session_id IN (SELECT id FROM md_live_sessions WHERE team_id IN (SELECT team_id FROM md_team_members WHERE user_id = auth.uid())));
