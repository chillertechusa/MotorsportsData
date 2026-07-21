import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsSummary, getDailyTrends } from '@/lib/analytics'
import { auth } from '@/lib/auth'

/**
 * GET /api/analytics/metrics - Get analytics summary and trends
 * Query params: startDate, endDate (ISO 8601 dates)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owner can view analytics
    const { searchParams } = new URL(request.url)
    const startDateStr = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDateStr = searchParams.get('endDate') || new Date().toISOString().split('T')[0]

    const startDate = new Date(`${startDateStr}T00:00:00Z`)
    const endDate = new Date(`${endDateStr}T23:59:59Z`)

    const [summary, trends] = await Promise.all([
      getAnalyticsSummary(startDate, endDate),
      getDailyTrends(startDate, endDate),
    ])

    return NextResponse.json({
      summary,
      trends,
      dateRange: { startDate: startDateStr, endDate: endDateStr },
    })
  } catch (error) {
    console.error('[v0] Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
