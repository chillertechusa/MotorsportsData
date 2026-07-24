import { NextRequest, NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/owner/users/suspend
 * Non-destructive suspension — sets banned=true + banReason. Account is preserved.
 *
 * DELETE /api/owner/users/suspend
 * Lifts a suspension — sets banned=false, clears banReason.
 */
export async function POST(request: NextRequest) {
  try {
    const owner = await requireMdOwner()
    if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, reason } = await request.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const [target] = await db
      .select({ email: user.email, banned: user.banned })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (target.email === owner.email) return NextResponse.json({ error: 'Cannot suspend yourself' }, { status: 400 })
    if (target.banned) return NextResponse.json({ error: 'User is already suspended' }, { status: 400 })

    await db
      .update(user)
      .set({
        banned: true,
        banReason: reason ?? 'Suspended by platform owner',
        bannedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))

    return NextResponse.json({ success: true, action: 'suspended', userId })
  } catch (error) {
    console.error('[owner/users/suspend] Error:', error)
    return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const owner = await requireMdOwner()
    if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    await db
      .update(user)
      .set({ banned: false, banReason: null, bannedAt: null, updatedAt: new Date() })
      .where(eq(user.id, userId))

    return NextResponse.json({ success: true, action: 'unsuspended', userId })
  } catch (error) {
    console.error('[owner/users/suspend] Unban error:', error)
    return NextResponse.json({ error: 'Failed to unsuspend user' }, { status: 500 })
  }
}
