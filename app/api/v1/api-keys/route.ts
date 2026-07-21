import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdApiKeys } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'
import { generateApiKey, verifyApiKey } from '@/lib/api-keys'
import { eq } from 'drizzle-orm'

/**
 * GET /api/v1/api-keys
 * List all API keys for the authenticated team
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keys = await db.query.mdApiKeys.findMany({
      where: (t) => eq(t.teamId, auth.teamId as string),
      columns: {
        id: true,
        keyName: true,
        keyPrefix: true,
        scope: true,
        rateLimit: true,
        lastUsedAt: true,
        expiresAt: true,
        active: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('[API Keys] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/v1/api-keys
 * Create a new API key for the authenticated team
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, scope = 'api:read', rateLimit = 500 } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Key name is required' }, { status: 400 })
    }

    const { raw, prefix, hash } = generateApiKey()

    const result = await db.insert(mdApiKeys).values({
      teamId: auth.teamId as string,
      keyName: name,
      keyHash: hash,
      keyPrefix: prefix,
      scope,
      rateLimit,
    }).returning()

    return NextResponse.json(
      {
        key: result[0],
        fullKey: `sk_md_${raw}`, // Return full key only once
        warning: 'Save this key securely. You won\'t be able to see it again.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API Keys] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
