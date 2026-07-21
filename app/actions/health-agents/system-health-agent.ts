'use server'

import { db } from '@/lib/db'
import { mdIncidents, mdIncidentAlertRules, mdIncidentAlertHistory, mdSystemHealthResults } from '@/lib/db/schema'
import { eq, and, gt, desc } from 'drizzle-orm'

export interface SystemHealthCheck {
  id: string
  check_type: 'system_health'
  status: 'pass' | 'fail' | 'warning'
  message: string
  response_time_ms: number
  created_at: string
  checks: {
    cron_execution: boolean
    cron_last_run_age_minutes: number
    incident_creation: boolean
    alert_rules_accessible: boolean
    alert_delivery_healthy: boolean
    database_responsive: boolean
  }
  error_details?: Record<string, any>
}

/**
 * System Health Agent (Layer 3)
 * Monitors the health-check monitoring system itself
 * 
 * Checks:
 * 1. Cron job execution (verify /api/cron/health-checks runs every 5 min)
 * 2. Incident creation (verify failed checks create incidents)
 * 3. Alert rules accessibility (verify alert rules table is queryable)
 * 4. Alert delivery health (verify recent alerts were sent)
 * 5. Database responsiveness (verify DB connection is healthy)
 */
export async function runSystemHealthCheck(): Promise<SystemHealthCheck> {
  const startTime = Date.now()
  const checks = {
    cron_execution: false,
    cron_last_run_age_minutes: -1,
    incident_creation: false,
    alert_rules_accessible: false,
    alert_delivery_healthy: false,
    database_responsive: false,
  }
  let status: 'pass' | 'fail' | 'warning' = 'pass'
  const errors: Record<string, any> = {}

  try {
    // Check 1: Database responsiveness (simple ping)
    try {
      await db.select().from(mdSystemHealthResults).limit(1)
      checks.database_responsive = true
    } catch (e) {
      checks.database_responsive = false
      errors.database = e instanceof Error ? e.message : String(e)
      status = 'fail'
    }

    if (!checks.database_responsive) {
      return {
        id: `system_health_${Date.now()}`,
        check_type: 'system_health',
        status: 'fail',
        message: 'Database is not responsive - system health check cannot proceed',
        response_time_ms: Date.now() - startTime,
        checks,
        error_details: errors,
        created_at: new Date().toISOString(),
      }
    }

    // Check 2: Alert rules accessibility
    try {
      const rulesCount = await db
        .select()
        .from(mdIncidentAlertRules)
        .limit(1)
      checks.alert_rules_accessible = rulesCount.length >= 0 // Always true if DB is responsive
    } catch (e) {
      checks.alert_rules_accessible = false
      errors.alert_rules = e instanceof Error ? e.message : String(e)
      status = 'warning'
    }

    // Check 3: Cron job execution (check if health checks ran recently)
    try {
      const recentChecks = await db
        .select()
        .from(mdSystemHealthResults)
        .orderBy(desc(mdSystemHealthResults.createdAt))
        .limit(1)

      if (recentChecks.length > 0) {
        const lastRunTime = new Date(recentChecks[0].createdAt ?? Date.now())
        const ageMinutes = Math.floor((Date.now() - lastRunTime.getTime()) / (1000 * 60))
        checks.cron_last_run_age_minutes = ageMinutes

        // Flag if cron hasn't run in more than 6 minutes (should be every 5)
        if (ageMinutes > 6) {
          checks.cron_execution = false
          errors.cron_execution = `Last health check ran ${ageMinutes} minutes ago (expected every 5 min)`
          status = 'warning'
        } else {
          checks.cron_execution = true
        }
      } else {
        checks.cron_execution = false
        errors.cron_execution = 'No recent health checks found in database'
        status = 'warning'
      }
    } catch (e) {
      checks.cron_execution = false
      errors.cron_check = e instanceof Error ? e.message : String(e)
      status = 'warning'
    }

    // Check 4: Incident creation (verify incidents exist for recent failures)
    try {
      const recentIncidents = await db
        .select()
        .from(mdIncidents)
        .orderBy(desc(mdIncidents.createdAt))
        .limit(1)

      checks.incident_creation = recentIncidents.length > 0
      if (!checks.incident_creation) {
        errors.incident_creation = 'No incidents found in database (check if failures are being created)'
      }
    } catch (e) {
      checks.incident_creation = false
      errors.incident_creation = e instanceof Error ? e.message : String(e)
      status = 'warning'
    }

    // Check 5: Alert delivery health (verify alerts were sent recently)
    try {
      const recentAlerts = await db
        .select()
        .from(mdIncidentAlertHistory)
        .orderBy(desc(mdIncidentAlertHistory.createdAt))
        .limit(5)

      const successfulAlerts = recentAlerts.filter(a => a.status === 'delivered')
      checks.alert_delivery_healthy = successfulAlerts.length > 0

      if (!checks.alert_delivery_healthy && recentAlerts.length > 0) {
        const failedAlert = recentAlerts[0]
        errors.alert_delivery = `Last alert failed: ${failedAlert.errorReason}`
        status = 'warning'
      }
    } catch (e) {
      checks.alert_delivery_healthy = false
      errors.alert_delivery = e instanceof Error ? e.message : String(e)
      status = 'warning'
    }

    // Determine final status
    const allChecksPassed = Object.values(checks).every(
      (v) => v === true || (typeof v === 'number' && v >= 0)
    )
    if (!allChecksPassed) {
      status = status === 'pass' ? 'warning' : status
    }

    return {
      id: `system_health_${Date.now()}`,
      check_type: 'system_health',
      status,
      message: status === 'pass' 
        ? 'System health monitoring is operating normally'
        : status === 'warning'
          ? 'System health check detected potential issues'
          : 'System health monitoring is not operational',
      response_time_ms: Date.now() - startTime,
      checks,
      error_details: Object.keys(errors).length > 0 ? errors : undefined,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    return {
      id: `system_health_error_${Date.now()}`,
      check_type: 'system_health',
      status: 'fail',
      message: 'System health check failed',
      response_time_ms: Date.now() - startTime,
      checks,
      error_details: {
        error: error instanceof Error ? error.message : String(error),
      },
      created_at: new Date().toISOString(),
    }
  }
}
