-- Create mdMechanicOptimizations table
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
  applied_at TIMESTAMP WITH TIME ZONE,
  evaluated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_mechanic_optimizations_user_id ON md_mechanic_optimizations(mechanic_user_id);
CREATE INDEX idx_mechanic_optimizations_vehicle_id ON md_mechanic_optimizations(vehicle_id);
CREATE INDEX idx_mechanic_optimizations_status ON md_mechanic_optimizations(status);
CREATE INDEX idx_mechanic_optimizations_parameter ON md_mechanic_optimizations(parameter);
CREATE INDEX idx_mechanic_optimizations_created_at ON md_mechanic_optimizations(created_at DESC);

-- Enable RLS
ALTER TABLE md_mechanic_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Mechanic can read/write own optimizations
CREATE POLICY mechanic_optimizations_owner_select ON md_mechanic_optimizations
  FOR SELECT USING (mechanic_user_id = auth.uid()::text);

CREATE POLICY mechanic_optimizations_owner_insert ON md_mechanic_optimizations
  FOR INSERT WITH CHECK (mechanic_user_id = auth.uid()::text);

CREATE POLICY mechanic_optimizations_owner_update ON md_mechanic_optimizations
  FOR UPDATE USING (mechanic_user_id = auth.uid()::text);

-- Team owner can read all mechanics' optimizations for their vehicles
CREATE POLICY mechanic_optimizations_team_owner_select ON md_mechanic_optimizations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM md_vehicles v WHERE v.id = vehicle_id AND v.team_id IN (
      SELECT team_id FROM md_team_members WHERE user_id = auth.uid()::text AND role = 'owner'
    )
  ));
