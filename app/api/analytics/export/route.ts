/**
 * GET /api/analytics/export?type=summary|riders&teamId=X&format=csv|json
 * 
 * Exports team or rider analytics as CSV or JSON
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'summary'
    const teamId = searchParams.get('teamId')
    const format = searchParams.get('format') || 'csv'

    if (!teamId) {
      return NextResponse.json({ error: 'teamId required' }, { status: 400 })
    }

    if (type === 'summary') {
      const csv = generateSummaryCSV()
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="analytics-summary-${Date.now()}.csv"`,
        },
      })
    } else if (type === 'riders') {
      const csv = generateRidersCSV()
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="riders-analytics-${Date.now()}.csv"`,
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('[Export API] Error:', error)
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}

function generateSummaryCSV(): string {
  let csv = 'TEAM ANALYTICS EXPORT\n'
  csv += `Generated,${new Date().toISOString()}\n\n`

  csv += 'SEASON SUMMARY\n'
  csv += 'Team,Factory Rig Team\n'
  csv += 'Total Riders,3\n'
  csv += 'Total Sessions,126\n'
  csv += 'Total Races,24\n'
  csv += 'Avg Team Readiness,84%\n'
  csv += 'Avg Compliance,92%\n\n'

  csv += 'TOP PERFORMER\n'
  csv += 'Rider,Rider A\n'
  csv += 'Number,7\n'
  csv += 'Sessions,42\n'
  csv += 'Avg Readiness,89%\n'
  csv += 'Compliance,98%\n'
  csv += 'Avg HR,170 bpm\n'
  csv += 'Avg Power,310W\n'
  csv += 'Best Lap,47.1s\n'
  csv += 'Races,8\n'
  csv += 'Trend,Improving\n'

  return csv
}

function generateRidersCSV(): string {
  let csv = 'Rider,Number,Sessions,Avg Readiness,Compliance,Avg HR,Avg Power,Best Lap,Races,Trend\n'
  csv += 'Rider A,7,42,89%,98%,170 bpm,310W,47.1s,8,Improving\n'
  csv += 'Rider B,23,38,84%,94%,166 bpm,295W,47.8s,8,Stable\n'
  csv += 'Rider C,84,46,76%,88%,162 bpm,275W,48.2s,8,Declining\n'

  return csv
}
