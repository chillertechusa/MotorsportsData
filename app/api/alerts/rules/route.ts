import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdIncidentAlertRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'

/**
 * GET /api/alerts/rules - List all alert rules
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only platform owner can view/manage alert rules
    const rules = await db.select().from(mdIncidentAlertRules).orderBy(mdIncidentAlertRules.createdAt)

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('[v0] Error fetching alert rules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/alerts/rules - Create a new alert rule
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      checkType,
      condition,
      threshold,
      notifySlack,
      notifyEmail,
      slackChannel,
      slackWebhookUrl,
      emailRecipients,
      cooldownMinutes = 15,
    } = body

    // Validate required fields
    if (!name || !checkType || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields: name, checkType, condition' },
        { status: 400 }
      )
    }

    // Validate at least one notification channel
    if (!notifySlack && !notifyEmail) {
      return NextResponse.json(
        { error: 'At least one notification channel (Slack or Email) must be enabled' },
        { status: 400 }
      )
    }

    // Validate Slack config if enabled
    if (notifySlack && (!slackChannel || !slackWebhookUrl)) {
      return NextResponse.json(
        { error: 'Slack channel and webhook URL required when Slack notifications enabled' },
        { status: 400 }
      )
    }

    // Validate Email config if enabled
    if (notifyEmail && (!emailRecipients || emailRecipients.length === 0)) {
      return NextResponse.json(
        { error: 'Email recipients required when Email notifications enabled' },
        { status: 400 }
      )
    }

    const newRule = await db
      .insert(mdIncidentAlertRules)
      .values({
        name,
        checkType,
        condition,
        threshold,
        notifySlack,
        notifyEmail,
        slackChannel,
        slackWebhookUrl,
        emailRecipients,
        cooldownMinutes,
      })
      .returning()

    return NextResponse.json({ rule: newRule[0] }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating alert rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
