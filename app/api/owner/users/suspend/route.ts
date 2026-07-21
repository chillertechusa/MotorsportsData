import { NextRequest, NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const owner = await requireMdOwner()
    if (!owner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Prevent owner from suspending themselves (compare by email since admin row has no id)
    const targetUser = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1)
    if (targetUser[0]?.email === owner.email) {
      return NextResponse.json({ error: 'Cannot suspend yourself' }, { status: 400 })
    }

    // Delete the user account (base user table has no banned column)
    await db.delete(user).where(eq(user.id, userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] User suspend error:', error)
    return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 })
  }
}
