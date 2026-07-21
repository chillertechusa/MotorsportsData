'use server'

import { HealthCheck } from '@/lib/health-check-types'
import { runSignupHealthCheck } from './health-agents/signup-agent'
import { runSigninHealthCheck } from './health-agents/signin-agent'
import { runCheckoutHealthCheck } from './health-agents/checkout-agent'
import { runAccountCreationHealthCheck } from './health-agents/account-creation-agent'
import { runDataIsolationHealthCheck } from './health-agents/data-isolation-agent'
import { createIncident } from '@/lib/incident-notifications'

/**
 * Health Check Orchestrator
 * Runs all 5 health checks in parallel and aggregates results
 */
export async function runAllHealthChecks(): Promise<{
  checks: HealthCheck[]
  summary: {
    total: number
    passed: number
    failed: number
    errors: number
    average_response_ms: number
  }
  executed_at: string
}> {
  const executedAt = new Date().toISOString()

  // Run all 5 health checks in parallel
  const [signup, signin, checkout, account, isolation] = await Promise.all([
    runSignupHealthCheck(),
    runSigninHealthCheck(),
    runCheckoutHealthCheck(),
    runAccountCreationHealthCheck(),
    runDataIsolationHealthCheck(),
  ])

  const checks = [signup, signin, checkout, account, isolation]

  // Calculate summary statistics
  const summary = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'pass').length,
    failed: checks.filter(c => c.status === 'fail').length,
    errors: checks.filter(c => c.status === 'error').length,
    average_response_ms: Math.round(
      checks.reduce((sum, c) => sum + (c.response_time_ms || 0), 0) / checks.length
    ),
  }

  // Trigger incidents for failed or error checks
  for (const check of checks) {
    if (check.status === 'fail' || check.status === 'error') {
      void createIncident({
        checkType: check.check_type,
        severity: check.status === 'error' ? 'critical' : 'warning',
        title: `${check.check_type} health check failed`,
        description: `Health check for ${check.check_type} returned ${check.status} status`,
        errorMessage: check.message,
        failureCount: 1,
        metadata: {
          response_time_ms: check.response_time_ms,
          error_details: check.error_details,
          check_type: check.check_type,
        },
      })
    }
  }

  return {
    checks,
    summary,
    executed_at: executedAt,
  }
}

/**
 * Run a single specific health check
 */
export async function runSingleHealthCheck(
  type: 'signup' | 'signin' | 'checkout' | 'account_creation' | 'data_isolation'
): Promise<HealthCheck> {
  switch (type) {
    case 'signup':
      return runSignupHealthCheck()
    case 'signin':
      return runSigninHealthCheck()
    case 'checkout':
      return runCheckoutHealthCheck()
    case 'account_creation':
      return runAccountCreationHealthCheck()
    case 'data_isolation':
      return runDataIsolationHealthCheck()
    default:
      return {
        id: `unknown_${Date.now()}`,
        check_type: 'signup',
        status: 'error',
        message: `Unknown health check type: ${type}`,
        created_at: new Date().toISOString(),
      }
  }
}
