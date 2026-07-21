-- Add expiry_alert_sent_at column to md_teams table
-- Tracks when a 7-day expiry warning was last sent to avoid duplicate emails

ALTER TABLE md_teams
ADD COLUMN expiry_alert_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient querying of teams that haven't been alerted yet
CREATE INDEX IF NOT EXISTS idx_md_teams_expiry_alert_sent_at
ON md_teams(expiry_alert_sent_at)
WHERE expiry_alert_sent_at IS NULL;
