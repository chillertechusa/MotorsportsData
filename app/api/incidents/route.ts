import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdIncidents, mdIncidentAlertHistory } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

/**
 * GET /api/incidents - List all incidents with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active' // 'active' | 'resolved' | 'all'
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const incidents = await db
      .select()
      .from(mdIncidents)
      .where(status !== 'all' ? eq(mdIncidents.status, status) : undefined)
      .orderBy(desc(mdIncidents.updatedAt))
      .limit(limit)

    // Get alert history for each incident
    const incidentsWithAlerts = await Promise.all(
      incidents.map(async (incident) => {
        const alerts = await db
          .select()
          .from(mdIncidentAlertHistory)
          .where(eq(mdIncidentAlertHistory.incidentId, incident.id))
          .orderBy(desc(mdIncidentAlertHistory.createdAt))
          .limit(5)

        return { ...incident, recentAlerts: alerts }
      })
    )

    return NextResponse.json({ incidents: incidentsWithAlerts })
  } catch (error) {
    console.error('[v0] Error fetching incidents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
