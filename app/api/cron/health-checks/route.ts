import { NextRequest, NextResponse } from 'next/server'

/**
 * Scheduled health check runner
 * Vercel Cron: runs every 5 minutes
 * Trigger URL: GET /api/cron/health-checks
 * Protected by CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[v0] Unauthorized cron request to health-checks')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[v0] Starting scheduled health check run via cron...')
    const startTime = Date.now()

    // Call the main health check endpoint
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/health-checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    const duration = Date.now() - startTime

    console.log(`[v0] Health check run completed in ${duration}ms:`, {
      passed: result.summary?.passed,
      failed: result.summary?.failed,
      errors: result.summary?.errors,
      avgResponseTime: result.summary?.average_response_ms,
    })

    // Log failed checks for monitoring
    if (result.checks) {
      const failedChecks = result.checks.filter((c: any) => c.status === 'fail' || c.status === 'error')
      if (failedChecks.length > 0) {
        console.error('[v0] Failed health checks detected:', failedChecks.map((c: any) => ({
          type: c.check_type,
          status: c.status,
          error: c.error_message,
        })))
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Health checks completed',
      duration,
      summary: result.summary,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Health check cron job failed:', error)
    return NextResponse.json({
      ok: false,
      error: 'Health check job failed',
      message: String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

/**
 * Manual trigger endpoint (for testing)
 * POST /api/cron/health-checks with Bearer token
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[v0] Manual health check triggered via POST')
    
    // Call the main health check endpoint
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/health-checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    return NextResponse.json({
      ok: true,
      message: 'Manual health check completed',
      summary: result.summary,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Manual health check failed:', error)
    return NextResponse.json({
      ok: false,
      error: 'Health check failed',
      message: String(error),
    }, { status: 500 })
  }
}
