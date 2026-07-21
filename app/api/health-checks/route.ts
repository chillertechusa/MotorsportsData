import { NextRequest, NextResponse } from 'next/server'
import { runAllHealthChecks, runSingleHealthCheck } from '@/app/actions/health-check-orchestrator'

/**
 * GET /api/health-checks
 * Runs all 5 health checks and returns results
 * 
 * Query params:
 * - type: Optional. Run single check: 'signup', 'signin', 'checkout', 'account_creation', 'data_isolation'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type) {
      // Run single health check
      const result = await runSingleHealthCheck(
        type as 'signup' | 'signin' | 'checkout' | 'account_creation' | 'data_isolation'
      )
      return NextResponse.json(result)
    }

    // Run all health checks
    const result = await runAllHealthChecks()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Health check execution failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/health-checks
 * Manually trigger health checks (for UI buttons, scheduled tasks)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { type, manual } = body as { type?: string; manual?: boolean }

    if (type) {
      const result = await runSingleHealthCheck(
        type as 'signup' | 'signin' | 'checkout' | 'account_creation' | 'data_isolation'
      )
      return NextResponse.json({
        ...result,
        manual_trigger: manual || false,
      })
    }

    const result = await runAllHealthChecks()
    return NextResponse.json({
      ...result,
      manual_trigger: manual || false,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Health check trigger failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
