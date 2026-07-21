import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdWebhooks } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'

/**
 * GET /api/v1/webhooks
 * List all webhooks for the authenticated team
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const webhooks = await db.query.mdWebhooks.findMany({
      where: (t) => eq(t.teamId, auth.teamId as string),
      columns: {
        id: true,
        name: true,
        url: true,
        events: true,
        active: true,
        createdAt: true,
      },
    })

    // Parse events from JSON string
    const formattedWebhooks = webhooks.map((w) => ({
      ...w,
      events: typeof w.events === 'string' ? JSON.parse(w.events) : w.events,
    }))

    return NextResponse.json({ webhooks: formattedWebhooks })
  } catch (error) {
    console.error('[Webhooks] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/v1/webhooks
 * Create a new webhook for the authenticated team
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionTeamId()
    if (!auth.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, url, events } = await req.json()

    if (!name || !url || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'name, url, and events array are required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 })
    }

    // Generate webhook secret
    const secret = randomBytes(32).toString('hex')

    const result = await db
      .insert(mdWebhooks)
      .values({
        teamId: auth.teamId as string,
        name,
        url,
        events: JSON.stringify(events),
        secret,
      })
      .returning()

    return NextResponse.json(
      {
        webhook: result[0],
        secret: 'Save this secret securely. You won\'t be able to see it again.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Webhooks] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
