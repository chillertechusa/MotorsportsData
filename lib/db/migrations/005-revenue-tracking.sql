-- Conversion funnel tracking
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversion_events_user_id ON md_conversion_events(user_id);
CREATE INDEX idx_conversion_events_team_id ON md_conversion_events(team_id);
CREATE INDEX idx_conversion_events_created_at ON md_conversion_events(created_at);
CREATE INDEX idx_conversion_events_step ON md_conversion_events(step);

-- Subscription events (tier changes, upgrades, downgrades, cancellations)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_team_id ON md_subscription_events(team_id);
CREATE INDEX idx_subscription_events_created_at ON md_subscription_events(created_at);
CREATE INDEX idx_subscription_events_event_type ON md_subscription_events(event_type);

-- Abandoned checkout tracking
CREATE TABLE IF NOT EXISTS md_abandoned_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  tier_attempted VARCHAR(50) NOT NULL,
  amount_cents INTEGER NOT NULL,
  recovery_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_email_opened_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_abandoned_checkouts_team_id ON md_abandoned_checkouts(team_id);
CREATE INDEX idx_abandoned_checkouts_created_at ON md_abandoned_checkouts(created_at);
CREATE INDEX idx_abandoned_checkouts_recovery_email_sent_at ON md_abandoned_checkouts(recovery_email_sent_at);

-- Feature gate rules
CREATE TABLE IF NOT EXISTS md_feature_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key VARCHAR(100) NOT NULL UNIQUE,
  feature_name VARCHAR(255) NOT NULL,
  description TEXT,
  min_tier VARCHAR(50) NOT NULL,
  upsell_tier VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feature_gates_feature_key ON md_feature_gates(feature_key);
CREATE INDEX idx_feature_gates_enabled ON md_feature_gates(enabled);

-- Feature gate access logs
CREATE TABLE IF NOT EXISTS md_feature_gate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,
  access_granted BOOLEAN NOT NULL,
  triggered_modal BOOLEAN DEFAULT FALSE,
  clicked_upgrade BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feature_gate_logs_team_id ON md_feature_gate_logs(team_id);
CREATE INDEX idx_feature_gate_logs_created_at ON md_feature_gate_logs(created_at);
CREATE INDEX idx_feature_gate_logs_feature_key ON md_feature_gate_logs(feature_key);
