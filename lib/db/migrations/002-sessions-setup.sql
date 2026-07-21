-- Session Management Schema
-- Tracks race sessions, auto-uploads telemetry, links to assignments

-- ─────────────────────────────────────────────────────────
-- Race Sessions
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS md_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  assignment_id UUID, -- Link to coach assignment
  
  -- Session metadata
  name VARCHAR(255) NOT NULL, -- e.g., "SX Las Vegas Round 5"
  discipline VARCHAR(50), -- 'motocross' | 'sx' | 'enduro' | 'fmx' | 'flat_track'
  description TEXT,
  
  -- Timing
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_seconds INT,
  
  -- Riders in session
  rider_ids UUID[] DEFAULT '{}', -- Array of rider UUIDs
  rider_count INT DEFAULT 0,
  
  -- Session state
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'active' | 'completed' | 'archived'
  location VARCHAR(255), -- Track name
  weather VARCHAR(100), -- Conditions at start
  
  -- Telemetry stats
  total_telemetry_points BIGINT DEFAULT 0,
  avg_heart_rate SMALLINT,
  avg_power_watts SMALLINT,
  max_power_watts SMALLINT,
  
  -- Assignment link (for coach workflows)
  assignment_acknowledged BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (assignment_id) REFERENCES md_coach_assignments(id),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'completed', 'archived')),
  CONSTRAINT valid_discipline CHECK (discipline IN ('motocross', 'sx', 'enduro', 'fmx', 'flat_track'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_team_time
  ON md_sessions (team_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_status
  ON md_sessions (team_id, status);

CREATE INDEX IF NOT EXISTS idx_sessions_assignment
  ON md_sessions (assignment_id);

-- ─────────────────────────────────────────────────────────
-- Session Riders (Many-to-Many)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS md_session_riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  rider_id UUID NOT NULL,
  
  -- Per-rider session stats
  sessions_completed INT DEFAULT 1,
  avg_readiness_at_start SMALLINT, -- Readiness score when session started
  readiness_at_end SMALLINT, -- Readiness after session
  total_telemetry_points BIGINT DEFAULT 0,
  
  -- Performance
  avg_heart_rate SMALLINT,
  max_heart_rate SMALLINT,
  avg_power SMALLINT,
  max_power SMALLINT,
  best_lap_seconds NUMERIC(6,2),
  
  -- Status
  acknowledged BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  FOREIGN KEY (session_id) REFERENCES md_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (rider_id) REFERENCES riders(id),
  
  UNIQUE(session_id, rider_id)
);

CREATE INDEX IF NOT EXISTS idx_session_riders_session
  ON md_session_riders (session_id);

CREATE INDEX IF NOT EXISTS idx_session_riders_rider
  ON md_session_riders (rider_id, created_at DESC);

-- ─────────────────────────────────────────────────────────
-- Session Auto-Upload Log
-- Track when telemetry was uploaded for each session
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS md_session_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  rider_id UUID NOT NULL,
  device_id VARCHAR(255),
  
  -- Upload timing
  telemetry_start TIMESTAMPTZ,
  telemetry_end TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  
  -- Stats
  point_count BIGINT,
  duration_seconds INT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'success', -- 'success' | 'partial' | 'failed'
  error_message TEXT,
  
  FOREIGN KEY (session_id) REFERENCES md_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (rider_id) REFERENCES riders(id),
  
  CONSTRAINT valid_upload_status CHECK (status IN ('success', 'partial', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_uploads_session
  ON md_session_uploads (session_id, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_uploads_rider
  ON md_session_uploads (rider_id, uploaded_at DESC);

-- ─────────────────────────────────────────────────────────
-- Grant permissions to coaches
-- ─────────────────────────────────────────────────────────

ALTER TABLE md_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE md_session_riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE md_session_uploads ENABLE ROW LEVEL SECURITY;

-- Coaches can see/manage sessions for their team
CREATE POLICY "coaches_view_team_sessions" ON md_sessions
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "coaches_manage_team_sessions" ON md_sessions
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('manager', 'owner')
    )
  );

-- ─────────────────────────────────────────────────────────
-- Setup complete
-- ─────────────────────────────────────────────────────────

SELECT 'Session management schema initialized' AS status;
