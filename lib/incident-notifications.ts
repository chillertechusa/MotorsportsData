import { db } from '@/lib/db'
import { mdIncidentAlertRules, mdIncidentAlertHistory, mdIncidents } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { Resend } from 'resend'

interface IncidentAlert {
  // Set by createIncident() after the incident row exists; callers of
  // createIncident() do not (and cannot) provide it up front.
  incidentId?: string
  checkType: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description?: string
  errorMessage?: string
  failureCount?: number
}

/**
 * Send alert for an incident based on configured alert rules
 */
export async function sendIncidentAlerts(alert: IncidentAlert) {
  try {
    // Get all enabled alert rules for this check type
    const rules = await db
      .select()
      .from(mdIncidentAlertRules)
      .where(and(
        eq(mdIncidentAlertRules.checkType, alert.checkType),
        eq(mdIncidentAlertRules.enabled, true)
      ))

    console.log(`[v0] Found ${rules.length} alert rules for ${alert.checkType}`)

    for (const rule of rules) {
      // Check if we're in cooldown period
      if (rule.lastTriggeredAt) {
        const lastTriggeredMs = new Date(rule.lastTriggeredAt).getTime()
        const cooldownMs = (rule.cooldownMinutes || 15) * 60 * 1000
        if (Date.now() - lastTriggeredMs < cooldownMs) {
          console.log(`[v0] Alert rule ${rule.id} in cooldown, skipping`)
          continue
        }
      }

      // Send Slack if configured
      if (rule.notifySlack && rule.slackWebhookUrl) {
        await sendSlackAlert(rule, alert)
      }

      // Send Email if configured
      if (rule.notifyEmail && rule.emailRecipients) {
        await sendEmailAlert(rule, alert)
      }

      // Update rule's last triggered time
      await db
        .update(mdIncidentAlertRules)
        .set({ lastTriggeredAt: new Date() })
        .where(eq(mdIncidentAlertRules.id, rule.id))
    }
  } catch (error) {
    console.error('[v0] Error sending incident alerts:', error)
  }
}

/**
 * Send Slack notification
 */
async function sendSlackAlert(
  rule: typeof mdIncidentAlertRules.$inferSelect,
  alert: IncidentAlert
) {
  try {
    const color = alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'good'
    
    const payload = {
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.description || 'No description provided',
          fields: [
            {
              title: 'Check Type',
              value: alert.checkType,
              short: true,
            },
            {
              title: 'Severity',
              value: alert.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Failure Count',
              value: String(alert.failureCount),
              short: true,
            },
            ...(alert.errorMessage
              ? [
                  {
                    title: 'Error',
                    value: alert.errorMessage.substring(0, 500),
                    short: false,
                  },
                ]
              : []),
          ],
          footer: 'Motorsports Data Platform',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }

    const response = await fetch(rule.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Log to alert history. incidentId is always populated here because
    // sendIncidentAlerts is only ever called from createIncident after the
    // incident row exists (see createIncident spreading incidentId in).
    await db.insert(mdIncidentAlertHistory).values({
      incidentId: alert.incidentId!,
      alertRuleId: rule.id,
      channel: 'slack',
      recipient: rule.slackChannel,
      status: response.ok ? 'sent' : 'failed',
      responseCode: response.status,
      errorReason: response.ok ? undefined : `HTTP ${response.status}`,
    })

    console.log(`[v0] Slack alert sent to ${rule.slackChannel}`)
  } catch (error) {
    console.error('[v0] Error sending Slack alert:', error)
    await db.insert(mdIncidentAlertHistory).values({
      incidentId: alert.incidentId!,
      alertRuleId: rule.id,
      channel: 'slack',
      recipient: rule.slackChannel,
      status: 'failed',
      errorReason: String(error),
    })
  }
}

/**
 * Send Email notification via Resend
 */
async function sendEmailAlert(
  rule: typeof mdIncidentAlertRules.$inferSelect,
  alert: IncidentAlert
) {
  try {
    const recipients = Array.isArray(rule.emailRecipients)
      ? (rule.emailRecipients as string[])
      : []

    if (recipients.length === 0) return

    const html = `
      <h2>🚨 System Alert: ${alert.title}</h2>
      <p>${alert.description || 'No description provided'}</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Check Type</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${alert.checkType}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Severity</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>${alert.severity.toUpperCase()}</strong></td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Failure Count</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${alert.failureCount}</td>
        </tr>
        ${alert.errorMessage ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; vertical-align: top;"><strong>Error</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;"><code>${alert.errorMessage.substring(0, 500)}</code></td>
        </tr>
        ` : ''}
      </table>

      <p style="margin-top: 20px;">
        <a href="https://motorsportsdata.io/data/owner/incidents" style="background: #ccff00; color: black; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Incident Details
        </a>
      </p>

      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Motorsports Data Platform - Incident Response System
      </p>
    `

    // Instantiate Resend inside the function to ensure env vars are loaded
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const result = await resend.emails.send({
      from: 'alerts@motorsportsdata.io',
      to: recipients,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html,
    })

    // Log to alert history
    for (const recipient of recipients) {
      await db.insert(mdIncidentAlertHistory).values({
        incidentId: alert.incidentId!,
        alertRuleId: rule.id,
        channel: 'email',
        recipient,
        status: result.error ? 'failed' : 'sent',
        errorReason: result.error?.message,
      })
    }

    console.log(`[v0] Email alert sent to ${recipients.join(', ')}`)
  } catch (error) {
    console.error('[v0] Error sending email alert:', error)
  }
}

/**
 * Create an incident record and trigger alerts
 */
export async function createIncident(alert: IncidentAlert & { metadata?: any }) {
  try {
    // Check if incident already exists and is active
    const existing = await db
      .select()
      .from(mdIncidents)
      .where(and(
        eq(mdIncidents.checkType, alert.checkType),
        eq(mdIncidents.status, 'active')
      ))
      .limit(1)

    let incident
    if (existing.length > 0) {
      // Update existing incident
      incident = existing[0]
      await db
        .update(mdIncidents)
        .set({
          failureCount: (incident.failureCount || 0) + 1,
          lastOccurredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(mdIncidents.id, incident.id))
    } else {
      // Create new incident
      const result = await db
        .insert(mdIncidents)
        .values({
          checkType: alert.checkType,
          severity: alert.severity,
          status: 'active',
          title: alert.title,
          description: alert.description,
          errorMessage: alert.errorMessage,
          lastOccurredAt: new Date(),
          failureCount: 1,
          metadata: alert.metadata,
        })
        .returning()
      incident = result[0]
    }

    // Send alerts
    await sendIncidentAlerts({
      ...alert,
      incidentId: incident.id,
    })

    return incident
  } catch (error) {
    console.error('[v0] Error creating incident:', error)
    throw error
  }
}

/**
 * Resolve an incident
 */
export async function resolveIncident(incidentId: string, resolvedBy?: string) {
  try {
    await db
      .update(mdIncidents)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mdIncidents.id, incidentId))

    console.log(`[v0] Incident ${incidentId} resolved`)
  } catch (error) {
    console.error('[v0] Error resolving incident:', error)
  }
}
