import { NextRequest, NextResponse } from 'next/server'
import { runSeoAuditOrchestrator } from '@/app/actions/seo-audit-orchestrator'
import { getMdOwner } from '@/lib/md-owner-auth'

// Store latest audit result in memory (for demo purposes)
let cachedAuditResult: any = null
let lastAuditTime = 0

/**
 * GET /api/seo-audits — Owner-only
 */
export async function GET(request: NextRequest) {
  const owner = await getMdOwner()
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    // Return cached result if available
    if (cachedAuditResult && Date.now() - lastAuditTime < 60000) {
      return NextResponse.json(cachedAuditResult)
    }

    // Otherwise return empty state
    return NextResponse.json({
      checks: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, overall_status: 'pending' },
      message: 'No audit run yet. Click "Run Audit" to start.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit results' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/seo-audits — Owner-only
 */
export async function POST(request: NextRequest) {
  const owner = await getMdOwner()
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    // Run the audit
    const results = await runSeoAuditOrchestrator()

    // Cache the result
    cachedAuditResult = results
    lastAuditTime = Date.now()

    return NextResponse.json(results)
  } catch (error) {
    console.error('SEO audit error:', error)
    return NextResponse.json(
      {
        error: 'Failed to run SEO audit',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
