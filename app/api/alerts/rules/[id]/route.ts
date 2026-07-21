import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdIncidentAlertRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

/**
 * PATCH /api/alerts/rules/[id] - Update an alert rule
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id: ruleId } = await params

    const updated = await db
      .update(mdIncidentAlertRules)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(mdIncidentAlertRules.id, ruleId))
      .returning()

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    return NextResponse.json({ rule: updated[0] })
  } catch (error) {
    console.error('[v0] Error updating alert rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/alerts/rules/[id] - Delete an alert rule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: ruleId } = await params

    await db.delete(mdIncidentAlertRules).where(eq(mdIncidentAlertRules.id, ruleId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting alert rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
