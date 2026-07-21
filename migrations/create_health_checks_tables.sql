-- Phase 3: Health Checks & Monitoring Schema
-- Creates 4 core tables for monitoring signup, signin, checkout, account, and data isolation

-- 1. Health Check Records
CREATE TABLE IF NOT EXISTS public.md_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type VARCHAR NOT NULL, -- 'signup', 'signin', 'checkout', 'account_creation', 'data_isolation'
  status VARCHAR NOT NULL, -- 'pass', 'fail', 'error'
  message TEXT,
  response_time_ms INTEGER,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  
  -- For tracking which team/user this check relates to
  team_id UUID,
  user_email TEXT
);

-- 2. SEO Audit Records
CREATE TABLE IF NOT EXISTS public.md_seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type VARCHAR NOT NULL, -- 'redirect_chain', '404_detector', 'sitemap_validator', 'schema_validator'
  page_url TEXT NOT NULL,
  status VARCHAR NOT NULL, -- 'pass', 'fail', 'warning'
  message TEXT,
  issues JSONB, -- Array of { type, severity, details }
  http_status INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- For phase gating
  phase INTEGER, -- 1, 2, 3, etc.
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Agent Execution Logs
CREATE TABLE IF NOT EXISTS public.md_agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR NOT NULL,
  status VARCHAR NOT NULL, -- 'running', 'completed', 'failed'
  input_params JSONB,
  output_result JSONB,
  error_log TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Health Check Alerts
CREATE TABLE IF NOT EXISTS public.md_health_check_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR NOT NULL, -- 'health_failure', 'seo_issue', 'checkout_error', 'auth_failure'
  severity VARCHAR NOT NULL, -- 'critical', 'high', 'medium', 'low'
  message TEXT,
  related_check_id UUID REFERENCES public.md_health_checks(id),
  related_audit_id UUID REFERENCES public.md_seo_audits(id),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_checks_check_type ON public.md_health_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_health_checks_created_at ON public.md_health_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON public.md_health_checks(status);
CREATE INDEX IF NOT EXISTS idx_seo_audits_audit_type ON public.md_seo_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_seo_audits_created_at ON public.md_seo_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_name ON public.md_agent_executions(agent_name);
CREATE INDEX IF NOT EXISTS idx_health_check_alerts_severity ON public.md_health_check_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_health_check_alerts_created_at ON public.md_health_check_alerts(created_at DESC);
