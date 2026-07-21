-- ─────────────────────────────────────────────────────────────────────────────
-- ADD TEAM_ID TO ALL TABLES FOR DATA ISOLATION
-- Mariska Doll Architecture: Every record must know its team
-- ─────────────────────────────────────────────────────────────────────────────

-- Sessions (already updated in schema, run for DB)
ALTER TABLE md_sessions 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Setup Logs (already updated in schema, run for DB)
ALTER TABLE md_setup_logs 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Work Orders
ALTER TABLE md_work_orders 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Work Order Parts
ALTER TABLE md_work_order_parts 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Part Vault
ALTER TABLE md_part_vault 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Mental Logs
ALTER TABLE md_mental_logs 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Hydration Logs
ALTER TABLE md_hydration_logs 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Nutrition Logs
ALTER TABLE md_nutrition_logs 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Injuries
ALTER TABLE md_injuries 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Rider Readiness
ALTER TABLE md_rider_readiness 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Schedule Events
ALTER TABLE md_schedule_events 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Coach Templates
ALTER TABLE md_coach_templates 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Coach Assignments
ALTER TABLE md_coach_assignments 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Video Analyses
ALTER TABLE md_video_analyses 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Session Metrics
ALTER TABLE md_session_metrics 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Telemetry Imports
ALTER TABLE md_telemetry_imports 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Live Telemetry
ALTER TABLE md_live_telemetry 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Live Sessions
ALTER TABLE md_live_sessions 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- Telemetry Devices
ALTER TABLE md_telemetry_devices 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES md_teams(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- CREATE INDEXES ON team_id FOR PERFORMANCE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_sessions_team_id ON md_sessions(team_id);
CREATE INDEX idx_setup_logs_team_id ON md_setup_logs(team_id);
CREATE INDEX idx_work_orders_team_id ON md_work_orders(team_id);
CREATE INDEX idx_part_vault_team_id ON md_part_vault(team_id);
CREATE INDEX idx_mental_logs_team_id ON md_mental_logs(team_id);
CREATE INDEX idx_hydration_logs_team_id ON md_hydration_logs(team_id);
CREATE INDEX idx_nutrition_logs_team_id ON md_nutrition_logs(team_id);
CREATE INDEX idx_injuries_team_id ON md_injuries(team_id);
CREATE INDEX idx_schedule_events_team_id ON md_schedule_events(team_id);
CREATE INDEX idx_coach_templates_team_id ON md_coach_templates(team_id);
CREATE INDEX idx_video_analyses_team_id ON md_video_analyses(team_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES: Every query filtered by team_id
-- ─────────────────────────────────────────────────────────────────────────────

-- Sessions: User can only see sessions for their team
ALTER TABLE md_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_team_isolation ON md_sessions
  USING (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1))
  WITH CHECK (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1));

-- Setup Logs
ALTER TABLE md_setup_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY setup_logs_team_isolation ON md_setup_logs
  USING (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1))
  WITH CHECK (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1));

-- Work Orders
ALTER TABLE md_work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_orders_team_isolation ON md_work_orders
  USING (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1))
  WITH CHECK (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1));

-- Part Vault
ALTER TABLE md_part_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY part_vault_team_isolation ON md_part_vault
  USING (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1))
  WITH CHECK (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1));

-- Schedule Events
ALTER TABLE md_schedule_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY schedule_events_team_isolation ON md_schedule_events
  USING (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1))
  WITH CHECK (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1));

-- Coach Templates
ALTER TABLE md_coach_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY coach_templates_team_isolation ON md_coach_templates
  USING (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1))
  WITH CHECK (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1));

-- Video Analyses
ALTER TABLE md_video_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY video_analyses_team_isolation ON md_video_analyses
  USING (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1))
  WITH CHECK (team_id = (SELECT team_id FROM md_team_members WHERE user_id = auth.uid() LIMIT 1));

-- ─────────────────────────────────────────────────────────────────────────────

COMMIT;
