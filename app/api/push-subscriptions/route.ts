import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdPushSubscriptions } from '@/lib/db/schema'
import { getSessionTeamId } from '@/lib/md-auth'
import { and, eq } from 'drizzle-orm'

type SubscriptionBody = {
  endpoint?: string
  keys?: { p256dh: string; auth: string }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await getSessionTeamId()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = (await req.json()) as SubscriptionBody
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 })
    }

    // Upsert: if this endpoint already exists, refresh its keys/owner; else insert.
    await db
      .insert(mdPushSubscriptions)
      .values({
        userId: authResult.userId,
        teamId: authResult.teamId,
        endpoint: body.endpoint,
        keys: body.keys,
      })
      .onConflictDoUpdate({
        target: mdPushSubscriptions.endpoint,
        set: {
          userId: authResult.userId,
          teamId: authResult.teamId,
          keys: body.keys,
        },
      })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[push-subscriptions] POST error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await getSessionTeamId()
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const body = (await req.json()) as SubscriptionBody
    if (!body.endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    // Only delete the caller's own subscription for that endpoint.
    await db
      .delete(mdPushSubscriptions)
      .where(
        and(
          eq(mdPushSubscriptions.endpoint, body.endpoint),
          eq(mdPushSubscriptions.userId, authResult.userId),
        ),
      )

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[push-subscriptions] DELETE error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
