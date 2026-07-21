'use server'

import { runRedirectChainAudit } from './seo-agents/redirect-chain-auditor'
import { run404Detector } from './seo-agents/404-detector'

/**
 * SEO Audit Orchestrator
 * Runs all SEO checks in parallel and aggregates results
 */
export async function runSeoAuditOrchestrator() {
  const startTime = Date.now()

  try {
    const [redirectAudit, detectFourOhFour] = await Promise.all([
      runRedirectChainAudit(),
      run404Detector(),
    ])

    const allChecks = [redirectAudit, detectFourOhFour]
    const passedCount = allChecks.filter(c => c.status === 'pass').length
    const failedCount = allChecks.filter(c => c.status === 'error').length
    const warningCount = allChecks.filter(c => c.status === 'warning').length

    return {
      checks: allChecks,
      summary: {
        total: allChecks.length,
        passed: passedCount,
        failed: failedCount,
        warnings: warningCount,
        overall_status:
          failedCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'pass',
      },
      execution_time_ms: Date.now() - startTime,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    return {
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 1,
        warnings: 0,
        overall_status: 'error',
      },
      error: error instanceof Error ? error.message : String(error),
      execution_time_ms: Date.now() - startTime,
      created_at: new Date().toISOString(),
    }
  }
}
