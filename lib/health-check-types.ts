// Phase 3: Health Check Monitoring System
// Types for health checks, SEO audits, agents, and alerts

export type HealthCheckType = 
  | 'signup' 
  | 'signin' 
  | 'checkout' 
  | 'account_creation' 
  | 'data_isolation'
  // SEO agent check types (share the same health-check pipeline)
  | 'seo_404_detector'
  | 'seo_redirect_chain_audit'

// 'warning' = a soft failure (e.g. a page temporarily unreachable) that is not
// a hard pass/fail/error. Used by the SEO agents (404 detector, redirect audit).
export type HealthCheckStatus = 'pass' | 'fail' | 'error' | 'warning'
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AgentStatus = 'running' | 'completed' | 'failed'

export interface HealthCheck {
  id: string
  check_type: HealthCheckType
  status: HealthCheckStatus
  message?: string
  response_time_ms?: number
  error_details?: Record<string, any>
  created_at: string
  executed_at?: string
  team_id?: string
  user_email?: string
}

export interface SEOAudit {
  id: string
  audit_type: string // 'redirect_chain', '404_detector', etc.
  page_url: string
  status: 'pass' | 'fail' | 'warning'
  message?: string
  issues?: Array<{
    type: string
    severity: AlertSeverity
    details: string
  }>
  http_status?: number
  response_time_ms?: number
  created_at: string
  phase?: number
  approved: boolean
  approved_by?: string
  approved_at?: string
}

export interface AgentExecution {
  id: string
  agent_name: string
  status: AgentStatus
  input_params?: Record<string, any>
  output_result?: Record<string, any>
  error_log?: string
  started_at?: string
  completed_at?: string
  execution_time_ms?: number
  created_at: string
}

export interface HealthCheckAlert {
  id: string
  alert_type: string
  severity: AlertSeverity
  message: string
  related_check_id?: string
  related_audit_id?: string
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  created_at: string
}

export interface SignupTestPayload {
  email: string
  name: string
  password: string
}

export interface SigninTestPayload {
  email: string
  password: string
}

export interface CheckoutTestPayload {
  tier: 'race_team' | 'privateer' | 'factory_rig'
  frequency: 'annual' | 'monthly'
  test_card?: string
}

export interface DataIsolationTestPayload {
  team_id: string
  user1_id: string
  user2_id: string
}
