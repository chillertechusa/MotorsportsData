/**
 * GET /api/analytics/team-summary?teamId=X&start=YYYY-MM-DD&end=YYYY-MM-DD
 * 
 * Returns season summary, trending metrics, and rider stats
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get('teamId')
    const startStr = searchParams.get('start') || '2026-06-01'
    const endStr = searchParams.get('end') || '2026-12-31'
    const period = (searchParams.get('period') || '30d') as '7d' | '30d' | '90d'

    if (!teamId) {
      return NextResponse.json({ error: 'teamId required' }, { status: 400 })
    }

    const start = new Date(startStr)
    const end = new Date(endStr)

    // TODO: Import these functions once TimescaleDB is wired
    // import { getTeamSeasonSummary, getTrendingMetrics, getRiderSeasonStats } from '@/lib/analytics/team-analytics'

    // Mock response while DB is pending
    const response = {
      teamSummary: {
        teamId,
        teamName: 'Factory Rig Team',
        totalRiders: 3,
        totalSessions: 126,
        totalRaces: 24,
        avgTeamReadiness: 84,
        avgCompliance: 92,
        injuryRate: 0,
        periodStart: startStr,
        periodEnd: endStr,
      },
      trendingMetrics: [
        { metricName: 'Avg Readiness', value: 84, change: 3, direction: 'up', period },
        { metricName: 'Compliance Rate', value: 92, change: 2, direction: 'up', period },
        { metricName: 'Avg Power', value: 285, change: -5, direction: 'down', period },
        { metricName: 'Sessions/Week', value: 21, change: 0, direction: 'flat', period },
      ],
      riders: [
        {
          riderId: 'rider-1',
          riderName: 'Rider A',
          riderNumber: 7,
          sessionsLogged: 42,
          avgReadiness: 89,
          complianceRate: 98,
          avgHeartRate: 170,
          avgPower: 310,
          bestLapTime: 47.1,
          racesParticipated: 8,
          trend: 'improving',
        },
        {
          riderId: 'rider-2',
          riderName: 'Rider B',
          riderNumber: 23,
          sessionsLogged: 38,
          avgReadiness: 84,
          complianceRate: 94,
          avgHeartRate: 166,
          avgPower: 295,
          bestLapTime: 47.8,
          racesParticipated: 8,
          trend: 'stable',
        },
        {
          riderId: 'rider-3',
          riderName: 'Rider C',
          riderNumber: 84,
          sessionsLogged: 46,
          avgReadiness: 76,
          complianceRate: 88,
          avgHeartRate: 162,
          avgPower: 275,
          bestLapTime: 48.2,
          racesParticipated: 8,
          trend: 'declining',
        },
      ],
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
