-- Adds lap-time + session-hours tracking to md_sessions and a web-push
-- subscriptions table for the "faster lap" teammate notifications.

ALTER TABLE md_sessions
  ADD COLUMN IF NOT EXISTS best_lap_seconds double precision,
  ADD COLUMN IF NOT EXISTS session_hours double precision DEFAULT 0;

CREATE TABLE IF NOT EXISTS md_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  team_id uuid REFERENCES md_teams(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  keys jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS md_push_subscriptions_team_id_idx
  ON md_push_subscriptions(team_id);
