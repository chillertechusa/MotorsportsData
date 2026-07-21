-- Migration 2: create feature-backing tables that were declared in schema.ts
-- but never applied to the live Neon database. All statements use
-- CREATE TABLE IF NOT EXISTS so this is safe to run against the shared DB
-- (existing tables are skipped, nothing is dropped or altered).
-- Column names/types match lib/db/schema.ts exactly so the Drizzle ORM works.

-- ── Telemetry devices & imports ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS md_telemetry_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  device_type VARCHAR(100) NOT NULL,
  friendly_name VARCHAR(255),
  credentials JSONB,
  supported_formats JSONB,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_telemetry_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  device_id UUID REFERENCES md_telemetry_devices(id) ON DELETE SET NULL,
  source_blob_pathname TEXT,
  file_format VARCHAR(20) NOT NULL,
  parsed_data JSONB,
  linked_session_ids JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ── Session metrics & analytics aggregation ─────────────────────────────────
CREATE TABLE IF NOT EXISTS md_session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES md_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  rider_email VARCHAR(255),
  best_lap_seconds DOUBLE PRECISION,
  avg_lap_seconds DOUBLE PRECISION,
  improvement_trend INTEGER,
  setup_changed BOOLEAN DEFAULT FALSE,
  delta_vs_previous DOUBLE PRECISION,
  readiness_score INTEGER,
  difficulty VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_team_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  week_start TIMESTAMPTZ NOT NULL,
  session_count INTEGER DEFAULT 0,
  avg_best_lap DOUBLE PRECISION,
  fastest_rider VARCHAR(255),
  fastest_lap_overall DOUBLE PRECISION,
  most_improving VARCHAR(255),
  avg_readiness DOUBLE PRECISION,
  setup_changes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_coach_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  coach_email VARCHAR(255) NOT NULL,
  sessions_coached INTEGER DEFAULT 0,
  readiness_accuracy DOUBLE PRECISION,
  riders_improved INTEGER DEFAULT 0,
  avg_lap_improvement DOUBLE PRECISION,
  setup_recommendations INTEGER DEFAULT 0,
  successful_setup_changes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_assignment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES md_coach_assignments(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  event_data JSONB,
  action_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Live telemetry streaming ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS md_live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES md_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  rider_email VARCHAR(255) NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  session_token VARCHAR(512) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  stream_started_at TIMESTAMPTZ DEFAULT NOW(),
  current_lap INTEGER DEFAULT 0,
  total_laps INTEGER DEFAULT 0,
  best_lap_seconds DOUBLE PRECISION,
  lap_start_time TIMESTAMPTZ,
  session_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_live_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  device_timestamp NUMERIC(20, 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_live_session_timestamp ON md_live_telemetry(live_session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_live_session_lap ON md_live_telemetry(live_session_id, lap_number);

CREATE TABLE IF NOT EXISTS md_alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  tire_temp_high_warn INTEGER DEFAULT 100,
  tire_temp_high_critical INTEGER DEFAULT 110,
  engine_temp_high_warn INTEGER DEFAULT 105,
  engine_temp_high_critical INTEGER DEFAULT 120,
  pace_drop_warn_seconds DOUBLE PRECISION DEFAULT 2.0,
  pace_drop_critical_seconds DOUBLE PRECISION DEFAULT 4.0,
  brake_fade_warn_percent INTEGER DEFAULT 20,
  brake_fade_critical_percent INTEGER DEFAULT 35,
  fuel_low_warn_percent INTEGER DEFAULT 25,
  fuel_low_critical_percent INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_live_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_session_id UUID NOT NULL REFERENCES md_live_sessions(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  trigger_data JSONB,
  recommendation TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Mechanic portfolio & optimizations ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS md_mechanic_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  bio TEXT,
  total_riders_served INTEGER DEFAULT 0,
  total_lap_time_savings DOUBLE PRECISION DEFAULT 0,
  average_efficiency_score DOUBLE PRECISION DEFAULT 0,
  total_work_orders INTEGER DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'unverified',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_mechanic_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_user_id TEXT NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES md_vehicles(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES md_work_orders(id) ON DELETE SET NULL,
  session_id UUID REFERENCES md_sessions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  parameter VARCHAR(255) NOT NULL,
  value_before VARCHAR(255) NOT NULL,
  value_after VARCHAR(255) NOT NULL,
  rationale TEXT,
  estimated_lap_time_delta DOUBLE PRECISION,
  actual_lap_time_delta DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  status VARCHAR(50) DEFAULT 'suggested',
  applied_at TIMESTAMPTZ,
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Revenue & conversion tracking ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS md_conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  step VARCHAR(50) NOT NULL,
  source_page VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  from_tier VARCHAR(50),
  to_tier VARCHAR(50),
  amount_cents INTEGER,
  billing_period VARCHAR(20),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Feature gates ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS md_feature_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key VARCHAR(100) UNIQUE NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  description TEXT,
  min_tier VARCHAR(50) NOT NULL,
  upsell_tier VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_feature_gate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,
  access_granted BOOLEAN NOT NULL,
  triggered_modal BOOLEAN DEFAULT FALSE,
  clicked_upgrade BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── API marketplace ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS md_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  key_name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  scope TEXT NOT NULL DEFAULT 'api:read',
  rate_limit INTEGER NOT NULL DEFAULT 500,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  events TEXT NOT NULL,
  secret VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  retry_attempts INTEGER NOT NULL DEFAULT 3,
  retry_delay INTEGER NOT NULL DEFAULT 5000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES md_webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  error TEXT,
  attempt INTEGER NOT NULL DEFAULT 1,
  next_retry_at TIMESTAMPTZ,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES md_api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  request_size INTEGER,
  response_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Analytics event tracking ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS md_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  team_id UUID REFERENCES md_teams(id) ON DELETE SET NULL,
  tier VARCHAR(50),
  billing_frequency VARCHAR(20),
  amount_cents INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_analytics_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  signups INTEGER DEFAULT 0,
  checkouts INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  tier_distribution JSONB,
  billing_frequency_distribution JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Incident management & alerting ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS md_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  error_message TEXT,
  last_occurred_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  failure_count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_incident_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  check_type VARCHAR(50) NOT NULL,
  condition VARCHAR(50) NOT NULL,
  threshold INTEGER,
  enabled BOOLEAN DEFAULT TRUE,
  notify_slack BOOLEAN DEFAULT FALSE,
  notify_email BOOLEAN DEFAULT FALSE,
  slack_channel VARCHAR(255),
  slack_webhook_url TEXT,
  email_recipients JSONB,
  cooldown_minutes INTEGER DEFAULT 15,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_incident_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES md_incidents(id) ON DELETE CASCADE,
  alert_rule_id UUID REFERENCES md_incident_alert_rules(id) ON DELETE SET NULL,
  channel VARCHAR(50) NOT NULL,
  recipient VARCHAR(255),
  status VARCHAR(20) NOT NULL,
  message TEXT,
  response_code INTEGER,
  error_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS md_runbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  estimated_time_minutes INTEGER,
  automatable BOOLEAN DEFAULT FALSE,
  auto_remedy_script TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
