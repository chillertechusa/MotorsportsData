import { NextRequest, NextResponse } from 'next/server'
import { runAllAgentsAcrossGroups, AGENT_GROUPS } from '@/app/actions/agents-orchestrator'
import { getMdOwner } from '@/lib/md-owner-auth'

/**
 * GET /api/agents-console
 * Returns all agent groups and their current status. Owner-only.
 */
export async function GET(request: NextRequest) {
  const owner = await getMdOwner()
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const result = await runAllAgentsAcrossGroups()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Agents console query failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agents-console
 * Manually trigger all agents or specific group. Owner-only.
 */
export async function POST(request: NextRequest) {
  const owner = await getMdOwner()
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json().catch(() => ({}))
    const { groupId } = body as { groupId?: string }

    if (groupId) {
      // Run only specific group
      const group = AGENT_GROUPS.find((g) => g.group_id === groupId)
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      const checks = await Promise.all(group.agents.map((agent) => agent.fn()))
      return NextResponse.json({
        group: { ...group, checks },
        executed_at: new Date().toISOString(),
      })
    }

    // Run all groups
    const result = await runAllAgentsAcrossGroups()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Agents console trigger failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
