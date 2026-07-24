import { NextRequest, NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const VALID_ROLES = ['user', 'coach', 'admin', 'owner'] as const
type Role = typeof VALID_ROLES[number]

/**
 * POST /api/owner/users/role
 * Updates a user's platform role. Requires owner auth.
 * Prevents the owner from demoting themselves.
 */
export async function POST(request: NextRequest) {
  try {
    const owner = await requireMdOwner()
    if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, role } = await request.json()
    if (!userId || !role) return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 })

    if (!VALID_ROLES.includes(role as Role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    const [target] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Prevent owner from demoting their own account
    if (target.email === owner.email && role !== 'owner') {
      return NextResponse.json({ error: 'Cannot demote yourself from owner role' }, { status: 400 })
    }

    await db
      .update(user)
      .set({ role: role as Role, updatedAt: new Date() })
      .where(eq(user.id, userId))

    return NextResponse.json({ success: true, role, userId })
  } catch (error) {
    console.error('[owner/users/role] Error:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}
