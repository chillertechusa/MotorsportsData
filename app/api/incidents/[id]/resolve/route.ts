import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdIncidents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

/**
 * POST /api/incidents/[id]/resolve - Mark an incident as resolved
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: incidentId } = await params
    const body = await request.json()
    const { acknowledgedBy } = body

    const updated = await db
      .update(mdIncidents)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        acknowledgedBy: acknowledgedBy || session.user.email,
        updatedAt: new Date(),
      })
      .where(eq(mdIncidents.id, incidentId))
      .returning()

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    console.log(`[v0] Incident ${incidentId} resolved by ${session.user.email}`)

    return NextResponse.json({ incident: updated[0] })
  } catch (error) {
    console.error('[v0] Error resolving incident:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
