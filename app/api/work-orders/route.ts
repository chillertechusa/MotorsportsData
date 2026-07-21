import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdWorkOrders, mdWorkOrderParts, mdTeamMembers } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

/**
 * POST /api/work-orders - Create a work order
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      vehicleId,
      title,
      description,
      workType,
      priority,
      estimatedHours,
      parts,
      notes,
    } = body

    // Get user's team
    const member = await db
      .select({ teamId: mdTeamMembers.teamId })
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.userId, session.user.id))
      .limit(1)

    if (!member || member.length === 0) {
      return NextResponse.json({ error: 'User not in a team' }, { status: 400 })
    }

    const teamId = member[0].teamId

    // Create work order
    const workOrder = await db
      .insert(mdWorkOrders)
      .values({
        teamId,
        vehicleId,
        title,
        description,
        status: 'open',
        laborHours: estimatedHours || 0,
      })
      .returning()

    // Add parts if provided
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        await db
          .insert(mdWorkOrderParts)
          .values({
            workOrderId: workOrder[0].id,
            partName: part.name,
            quantity: part.quantity || 1,
            unitCostCents: Math.round((part.cost || 0) * 100),
          })
          .catch((err) => console.warn('[v0] Failed to add part:', err))
      }
    }

    return NextResponse.json({ ok: true, workOrder: workOrder[0] }, { status: 201 })
  } catch (error) {
    console.error('[v0] Work order creation failed:', error)
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 })
  }
}

/**
 * GET /api/work-orders - List work orders for team
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Get user's team
    const member = await db
      .select({ teamId: mdTeamMembers.teamId })
      .from(mdTeamMembers)
      .where(eq(mdTeamMembers.userId, session.user.id))
      .limit(1)

    if (!member || member.length === 0) {
      return NextResponse.json({ error: 'User not in a team' }, { status: 400 })
    }

    const teamId = member[0].teamId

    // Build query
    const filters = [eq(mdWorkOrders.teamId, teamId)]
    if (status) filters.push(eq(mdWorkOrders.status, status))

    const workOrders = await db
      .select()
      .from(mdWorkOrders)
      .where(and(...filters))
      .orderBy(desc(mdWorkOrders.createdAt))

    return NextResponse.json({ ok: true, workOrders })
  } catch (error) {
    console.error('[v0] Work orders fetch failed:', error)
    return NextResponse.json({ error: 'Failed to fetch work orders' }, { status: 500 })
  }
}
