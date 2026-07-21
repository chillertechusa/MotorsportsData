-- Live session tracking
CREATE TABLE md_live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES md_sessions(id) ON DELETE CASCADE,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  is_live BOOLEAN DEFAULT TRUE,
  current_lap INT DEFAULT 1,
  current_lap_start_time TIMESTAMP
);

-- Live telemetry data (time-series optimized)
CREATE TABLE md_live_telemetry (
  id BIGSERIAL PRIMARY KEY,
  live_session_id UUID NOT NULL REFERENCES md_live_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP NOT NULL,
  lap_number INT,
  lap_time_seconds DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  throttle INT,
  brake_pressure INT,
  tire_press_front DOUBLE PRECISION,
  tire_press_rear DOUBLE PRECISION,
  engine_temp_c INT,
  engine_rpm_k DOUBLE PRECISION,
  g_lateral DOUBLE PRECISION,
  g_longitudinal DOUBLE PRECISION,
  suspension_travel_front INT,
  suspension_travel_rear INT,
  device_timestamp BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_live_session_timestamp ON md_live_telemetry(live_session_id, timestamp DESC);
CREATE INDEX idx_live_session_lap ON md_live_telemetry(live_session_id, lap_number);

-- Alerts table
CREATE TABLE md_live_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id UUID NOT NULL REFERENCES md_live_sessions(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  fired_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  data JSONB
);

CREATE INDEX idx_live_alerts_session ON md_live_alerts(live_session_id, fired_at DESC);
