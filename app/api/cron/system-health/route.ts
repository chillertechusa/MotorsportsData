import { NextRequest, NextResponse } from 'next/server'
import { runSystemHealthCheck } from '@/app/actions/health-agents/system-health-agent'
import { db } from '@/lib/db'
import { mdSystemHealthResults, mdIncidents } from '@/lib/db/schema'
import { createIncident } from '@/lib/incident-notifications'

const CRON_SECRET = process.env.CRON_SECRET || ''

/**
 * System Health Check Endpoint (Layer 3)
 * 
 * Runs every 10 minutes (staggered from layer 1 which runs every 5 min)
 * Monitors the health-check monitoring system itself
 * 
 * Cron schedule: every 10 minutes
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Run system health check
    const systemHealth = await runSystemHealthCheck()

    // Store result in database
    await db.insert(mdSystemHealthResults).values({
      checkType: 'system_health',
      status: systemHealth.status,
      message: systemHealth.message,
      responseTimeMs: systemHealth.response_time_ms,
      cronExecutionHealthy: systemHealth.checks.cron_execution,
      cronLastRunAgeMinutes: systemHealth.checks.cron_last_run_age_minutes,
      incidentCreationHealthy: systemHealth.checks.incident_creation,
      alertRulesAccessible: systemHealth.checks.alert_rules_accessible,
      alertDeliveryHealthy: systemHealth.checks.alert_delivery_healthy,
      databaseResponsive: systemHealth.checks.database_responsive,
      errorDetails: systemHealth.error_details,
      createdAt: new Date(systemHealth.created_at),
    })

    // If system health is failing, create a critical incident
    if (systemHealth.status === 'fail') {
      await createIncident({
        checkType: 'system_health',
        severity: 'critical',
        title: 'System Monitoring Failure',
        description: systemHealth.message,
        errorMessage: JSON.stringify(systemHealth.error_details || {}),
      })
    } else if (systemHealth.status === 'warning') {
      // Create warning incident for visibility
      await createIncident({
        checkType: 'system_health',
        severity: 'warning',
        title: 'System Health Warning',
        description: systemHealth.message,
        errorMessage: JSON.stringify(systemHealth.error_details || {}),
      })
    }

    return NextResponse.json({
      success: true,
      system_health: systemHealth,
      stored_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] System health check failed:', error)

    return NextResponse.json(
      {
        error: 'System health check failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Also support POST for manual triggering via dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const systemHealth = await runSystemHealthCheck()

    await db.insert(mdSystemHealthResults).values({
      checkType: 'system_health',
      status: systemHealth.status,
      message: systemHealth.message,
      responseTimeMs: systemHealth.response_time_ms,
      cronExecutionHealthy: systemHealth.checks.cron_execution,
      cronLastRunAgeMinutes: systemHealth.checks.cron_last_run_age_minutes,
      incidentCreationHealthy: systemHealth.checks.incident_creation,
      alertRulesAccessible: systemHealth.checks.alert_rules_accessible,
      alertDeliveryHealthy: systemHealth.checks.alert_delivery_healthy,
      databaseResponsive: systemHealth.checks.database_responsive,
      errorDetails: systemHealth.error_details,
      createdAt: new Date(systemHealth.created_at),
    })

    return NextResponse.json({
      success: true,
      system_health: systemHealth,
    })
  } catch (error) {
    console.error('[v0] Manual system health check failed:', error)

    return NextResponse.json(
      {
        error: 'System health check failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
