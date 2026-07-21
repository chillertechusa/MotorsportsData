-- Add Mechanic Pro tier to existing teams (if needed)
-- Note: Enum alteration requires recreating, so we handle in application layer

-- Create mdMechanicPortfolio table
CREATE TABLE IF NOT EXISTS md_mechanic_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  team_id UUID NOT NULL REFERENCES md_teams(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  bio TEXT,
  total_riders_served INTEGER DEFAULT 0,
  total_lap_time_savings DOUBLE PRECISION DEFAULT 0.0,
  average_efficiency_score DOUBLE PRECISION DEFAULT 0.0,
  total_work_orders INTEGER DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'unverified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mechanic_portfolio_user_id ON md_mechanic_portfolio(user_id);
CREATE INDEX idx_mechanic_portfolio_team_id ON md_mechanic_portfolio(team_id);

-- Enable RLS
ALTER TABLE md_mechanic_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Mechanic can read/write own portfolio
CREATE POLICY mechanic_portfolio_owner_select ON md_mechanic_portfolio
  FOR SELECT USING (user_id = auth.uid()::text OR EXISTS (
    SELECT 1 FROM md_teams t WHERE t.id = team_id AND t.id IN (
      SELECT team_id FROM md_team_members WHERE user_id = auth.uid()::text AND role = 'owner'
    )
  ));

CREATE POLICY mechanic_portfolio_owner_update ON md_mechanic_portfolio
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Team owner can read all mechanics' portfolios
CREATE POLICY mechanic_portfolio_team_owner_select ON md_mechanic_portfolio
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM md_teams t WHERE t.id = team_id AND t.id IN (
      SELECT team_id FROM md_team_members WHERE user_id = auth.uid()::text AND role = 'owner'
    )
  ));
