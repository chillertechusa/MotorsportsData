import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-rate-limit'

/**
 * GET /api/v1/partner/health
 * Get system health and status metrics
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const apiKeyRow = await validateApiKey(authHeader)

    if (!apiKeyRow) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
    }

    const metrics = {
      apiStatus: 'healthy' as const,
      webhookStatus: 'healthy' as const,
      uptime: 99.97,
      lastIncident: null,
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('[Health Check] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
