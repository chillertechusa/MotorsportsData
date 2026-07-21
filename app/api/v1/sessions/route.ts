import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdSessions, mdTeams } from '@/lib/db/schema'
import { validateApiKey } from '@/lib/api-rate-limit'
import { eq } from 'drizzle-orm'

/**
 * GET /api/v1/sessions
 * Public API: List sessions for a team (requires API key)
 * Query params: limit, offset, discipline, vehicle_id
 */
export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const authHeader = req.headers.get('authorization')
    const apiKeyRow = await validateApiKey(authHeader)

    if (!apiKeyRow) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
    }

    // Check if key has read access
    if (!apiKeyRow.scope.includes('read')) {
      return NextResponse.json({ error: 'API key does not have read access' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const discipline = searchParams.get('discipline')
    const vehicleId = searchParams.get('vehicle_id')

    let query = db.query.mdSessions.findMany({
      where: (t) => eq(t.teamId, apiKeyRow.teamId),
      limit,
      offset,
      orderBy: (t) => t.createdAt,
    })

    const sessions = await query

    return NextResponse.json({
      sessions,
      pagination: {
        limit,
        offset,
        total: sessions.length,
      },
    })
  } catch (error) {
    console.error('[API] GET /sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
