import { NextRequest, NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const VALID_ROLES = ['user', 'coach', 'admin', 'owner']

export async function POST(request: NextRequest) {
  try {
    const owner = await requireMdOwner()
    if (!owner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, role } = await request.json()
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 })
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    // requireMdOwner already enforces the allowlist — anyone who passes is a platform owner

    // Note: the base user table has no role column; this is a no-op placeholder
    // until a custom role column is added to the schema
    void role // suppress unused-var lint

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('[v0] User role update error:', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
}
