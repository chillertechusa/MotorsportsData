import { NextRequest, NextResponse } from 'next/server'
import { runSentinelSweeps } from '@/lib/sentinel'

/**
 * Scheduled SENTINEL SQUAD sweep runner.
 * Vercel Cron (recommended: every 15 min). Trigger: GET /api/cron/sentinel-sweep
 * Protected by CRON_SECRET. Rule-based only — no LLM, ~zero cost.
 *
 * Detect + LOG + ALERT. Sweeps never block; they only write security events that
 * surface in the owner Sentinel console.
 */
export const dynamic = 'force-dynamic'

async function run(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[v0] Unauthorized cron request to sentinel-sweep')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const start = Date.now()
    const { results, totalCreated } = await runSentinelSweeps()
    const duration = Date.now() - start
    console.log(`[v0] Sentinel sweep complete in ${duration}ms — ${totalCreated} new event(s)`, results)
    return NextResponse.json({
      ok: true,
      totalCreated,
      results,
      duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Sentinel sweep failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Sentinel sweep failed', message: String(error) },
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
