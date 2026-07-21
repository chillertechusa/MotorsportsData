import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdLiveSessions, mdLiveTelemetry } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

interface ExportRow {
  [key: string]: unknown
}

/** Export live session telemetry as CSV */
export async function GET(req: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const liveSessionId = searchParams.get('liveSessionId')
    const format = searchParams.get('format') || 'csv' // csv or json

    if (!liveSessionId) {
      return NextResponse.json({ error: 'Missing liveSessionId' }, { status: 400 })
    }

    // Verify session belongs to user's team
    const session = await db
      .select()
      .from(mdLiveSessions)
      .where(
        eq(mdLiveSessions.id, liveSessionId)
      )
      .then((r) => r[0])

    if (!session || session.teamId !== auth.teamId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Fetch all telemetry for this session
    const telemetry = await db
      .select()
      .from(mdLiveTelemetry)
      .where(eq(mdLiveTelemetry.liveSessionId, liveSessionId))

    if (format === 'json') {
      return NextResponse.json(
        {
          session: {
            id: session.id,
            riderEmail: session.riderEmail,
            deviceId: session.deviceId,
            bestLap: session.bestLapSeconds,
            totalLaps: session.totalLaps,
            duration: session.sessionDurationSeconds,
            streamedAt: session.streamStartedAt,
          },
          telemetry,
          pointCount: telemetry.length,
        },
        {
          headers: {
            'Content-Disposition': `attachment; filename="session-${liveSessionId}.json"`,
          },
        }
      )
    }

    // CSV export
    if (telemetry.length === 0) {
      return NextResponse.json({ error: 'No telemetry data to export' }, { status: 400 })
    }

    // Build CSV with headers
    const headers = Object.keys(telemetry[0]).filter((k) => k !== 'id' && k !== 'liveSessionId')
    const csvHeaders = headers.join(',')

    const csvRows = telemetry.map((row: ExportRow) =>
      headers
        .map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`
          return val
        })
        .join(',')
    )

    const csv = [csvHeaders, ...csvRows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="session-${liveSessionId}.csv"`,
      },
    })
  } catch (error) {
    console.error('[Live Export] Error:', error)
    return NextResponse.json(
      { error: 'Failed to export session data' },
      { status: 500 }
    )
  }
}
