-- Setup sheet columns on md_sessions
-- Applied 2026-07-10 via Neon MCP

ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS ambient_temp_f integer;
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS humidity_pct integer;
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS wind_mph integer;
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS track_surface varchar(80);
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS tire_front varchar(120);
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS tire_rear varchar(120);
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS tire_pressure_front double precision;
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS tire_pressure_rear double precision;
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS fuel_mix varchar(80);
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS jet_needle varchar(80);
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS air_filter_condition varchar(80);
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS engine_map varchar(80);
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS share_token varchar(32) UNIQUE;
ALTER TABLE md_sessions ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS md_sessions_share_token_idx ON md_sessions(share_token) WHERE share_token IS NOT NULL;

-- Abandoned checkout tracking
CREATE TABLE IF NOT EXISTS md_abandoned_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  email text NOT NULL,
  name text,
  plan varchar(50) NOT NULL,
  email_sent boolean DEFAULT false,
  converted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
