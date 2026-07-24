-- Migration 007: founding_rigs
-- Tracks each enrolled founding team/factory rig, the plan they locked,
-- the amount charged, and their onboarding completion status.
CREATE TABLE IF NOT EXISTS founding_rigs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       text NOT NULL REFERENCES "mdTeams"(id) ON DELETE CASCADE,
  plan_id       text NOT NULL,                          -- 'race_team' | 'factory_rig'
  locked_cents  integer NOT NULL,                       -- price locked at enrollment time
  frequency     text NOT NULL DEFAULT 'monthly',        -- 'annual' | 'monthly'
  enrolled_at   timestamptz NOT NULL DEFAULT now(),
  -- Onboarding fields
  onboarding_complete boolean NOT NULL DEFAULT false,
  onboarding_data     jsonb,                            -- full rig profile JSON
  slot_number   integer NOT NULL,                       -- 1..50
  UNIQUE(team_id)                                       -- one founding slot per team
);

-- Simple global counter view
CREATE UNIQUE INDEX IF NOT EXISTS founding_rigs_team_id_idx ON founding_rigs(team_id);
