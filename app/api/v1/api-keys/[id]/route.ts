import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdApiKeys } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'
import { eq, and } from 'drizzle-orm'

/**
 * DELETE /api/v1/api-keys/[id]
 * Delete an API key (only by the team that owns it)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const result = await db
      .delete(mdApiKeys)
      .where(
        and(
          eq(mdApiKeys.id, id),
          eq(mdApiKeys.teamId, auth.teamId as string)
        )
      )
      .returning()

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Keys] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
