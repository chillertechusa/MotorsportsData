import { NextRequest, NextResponse } from 'next/server'
import { runAllAdvisors } from '@/lib/advisors'

/**
 * Scheduled ADVISOR AGENTS runner.
 * Vercel Cron (recommended: once daily). Trigger: GET /api/cron/advisor-run
 * Protected by CRON_SECRET. Metrics are deterministic DB queries; each advisor
 * makes at most one cheap LLM call to synthesize its narrative (pennies/day).
 */
export const dynamic = 'force-dynamic'
// Allow time for four sequential advisor runs (DB + one LLM call each).
export const maxDuration = 120

async function run(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[v0] Unauthorized cron request to advisor-run')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const start = Date.now()
    const results = await runAllAdvisors()
    const duration = Date.now() - start
    console.log(`[v0] Advisor run complete in ${duration}ms`, results)
    return NextResponse.json({
      ok: true,
      results,
      duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Advisor run failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Advisor run failed', message: String(error) },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return run(request)
}

export async function POST(request: NextRequest) {
  return run(request)
}
