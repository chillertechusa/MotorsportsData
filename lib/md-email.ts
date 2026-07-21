import 'server-only'

/**
 * Motorsports Dirt transactional email — Resend REST (no SDK dependency).
 *
 * Fully self-gating: every function is a SILENT NO-OP unless both
 * RESEND_API_KEY and RESEND_FROM_EMAIL are set. It NEVER throws — email is a
 * side effect of checkout and must never break a successful charge. Failures
 * are logged and swallowed.
 */

const BRAND = 'Motorsports Dirt'
const BRAND_URL = 'https://motorsportsdata.io'

function resendConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return null
  return { apiKey, from }
}

/** True when Resend is configured (used by callers that want to log intent). */
export function isEmailConfigured(): boolean {
  return resendConfig() !== null
}

type SendArgs = {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Low-level send. Returns true on a 2xx from Resend, false otherwise (incl.
 * not-configured). Never throws.
 */
async function send({ to, subject, html, text }: SendArgs): Promise<boolean> {
  const cfg = resendConfig()
  if (!cfg) return false
  if (!to || !to.includes('@')) return false

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: cfg.from.includes('<') ? cfg.from : `${BRAND} <${cfg.from}>`,
        to: [to],
        subject,
        html,
        text,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[md-email] Resend send failed:', res.status, body.slice(0, 300))
      return false
    }
    return true
  } catch (err) {
    console.error('[md-email] Resend send error:', err instanceof Error ? err.message : err)
    return false
  }
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export type ReceiptArgs = {
  to: string
  riderOrTeamName?: string | null
  planLabel: string
  amountCents: number
  periodStart: Date
  periodEnd: Date
  transactionId: string
}

/**
 * Branded subscription receipt. Fired after a successful charge + activation.
 * Safe no-op when Resend isn't configured.
 */
export async function sendMdReceiptEmail(args: ReceiptArgs): Promise<boolean> {
  const { to, riderOrTeamName, planLabel, amountCents, periodStart, periodEnd, transactionId } = args
  const greetingName = riderOrTeamName?.trim() ? escapeHtml(riderOrTeamName.trim()) : 'Racer'
  const amount = formatUsd(amountCents)
  const start = formatDate(periodStart)
  const end = formatDate(periodEnd)
  const subject = `Your ${BRAND} receipt — ${planLabel}`

  const text = [
    `${BRAND} — Payment Receipt`,
    ``,
    `Thanks, ${riderOrTeamName?.trim() || 'Racer'}! Your subscription is active.`,
    ``,
    `Plan: ${planLabel}`,
    `Amount: ${amount}`,
    `Billing period: ${start} – ${end}`,
    `Transaction ID: ${transactionId}`,
    ``,
    `Manage your account: ${BRAND_URL}/data`,
    ``,
    `Ride hard. — ${BRAND}`,
  ].join('\n')

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #27272a;">
          <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#a3e635;font-weight:700;">${BRAND}</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#fafafa;font-weight:800;">Payment received</h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#d4d4d8;">
            Thanks, ${greetingName} — your subscription is active. Here&#39;s your receipt.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;border:1px solid #27272a;border-radius:12px;">
            <tr><td style="padding:16px 20px;border-bottom:1px solid #27272a;">
              <span style="font-size:13px;color:#71717a;">Plan</span>
              <span style="float:right;font-size:14px;color:#fafafa;font-weight:600;">${escapeHtml(planLabel)}</span>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid #27272a;">
              <span style="font-size:13px;color:#71717a;">Amount</span>
              <span style="float:right;font-size:14px;color:#a3e635;font-weight:700;">${amount}</span>
            </td></tr>
            <tr><td style="padding:16px 20px;border-bottom:1px solid #27272a;">
              <span style="font-size:13px;color:#71717a;">Billing period</span>
              <span style="float:right;font-size:14px;color:#fafafa;font-weight:600;">${start} &ndash; ${end}</span>
            </td></tr>
            <tr><td style="padding:16px 20px;">
              <span style="font-size:13px;color:#71717a;">Transaction ID</span>
              <span style="float:right;font-size:12px;color:#a1a1aa;font-family:monospace;">${escapeHtml(transactionId)}</span>
            </td></tr>
          </table>
          <div style="text-align:center;margin:28px 0 8px;">
            <a href="${BRAND_URL}/data" style="display:inline-block;background:#a3e635;color:#09090b;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px;">Open your garage</a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #27272a;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#71717a;">
            You&#39;re receiving this because you subscribed at ${BRAND}. This is a one-time transactional receipt.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const ok = await send({ to, subject, html, text })
  if (ok) console.log('[md-email] receipt sent to', to, 'for', planLabel)
  return ok
}

// ── Plan expiry alert ─────────────────────────────────────────────────────────

export type ExpiryAlertArgs = {
  to: string
  name: string
  teamName: string
  tierLabel: string
  expiresAt: string
  daysLeft: number
}

export async function sendMdExpiryAlertEmail(args: ExpiryAlertArgs): Promise<boolean> {
  const { to, name, teamName, tierLabel, expiresAt, daysLeft } = args
  const safeName     = escapeHtml(name)
  const safeTeam     = escapeHtml(teamName)
  const safeTier     = escapeHtml(tierLabel)
  const urgency      = daysLeft <= 2 ? 'URGENT: ' : ''
  const subject      = `${urgency}Your ${BRAND} plan expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`

  const text = [
    `${BRAND} — Subscription Expiry Notice`,
    ``,
    `Hi ${name},`,
    `Your "${teamName}" ${tierLabel} plan expires on ${expiresAt} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} away).`,
    ``,
    `Renew now to keep your data, telemetry history, and AI Intel uninterrupted.`,
    ``,
    `Renew: ${BRAND_URL}/account/subscription`,
  ].join('\n')

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #27272a;">
          <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#f59e0b;font-weight:700;">${BRAND}</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#fafafa;font-weight:800;">Your plan expires ${daysLeft <= 2 ? 'very soon' : `in ${daysLeft} days`}</h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#d4d4d8;">
            Hi ${safeName}, your <strong style="color:#fafafa;">${safeTier}</strong> plan for <strong style="color:#fafafa;">${safeTeam}</strong> expires on <strong style="color:#f59e0b;">${escapeHtml(expiresAt)}</strong>. Renew now to keep your data, telemetry, and AI Intel uninterrupted.
          </p>
          <div style="text-align:center;margin:28px 0 8px;">
            <a href="${BRAND_URL}/account/subscription" style="display:inline-block;background:#a3e635;color:#09090b;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px;">Renew My Plan</a>
          </div>
          <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#71717a;text-align:center;">
            After expiry your data is safe — but platform access is paused until renewal.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #27272a;">
          <p style="margin:0;font-size:12px;color:#71717a;">You&apos;re receiving this because your ${BRAND} plan is expiring soon.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const ok = await send({ to, subject, html, text })
  if (ok) console.log('[md-email] expiry alert sent to', to, '-', daysLeft, 'days left')
  return ok
}

// ── Plan granted (owner manually activated) ────────────────────────────────────

export type PlanGrantedArgs = {
  to: string
  name: string
  teamName: string
  tierLabel: string
  expiresAt: string | null  // null = permanent
}

export async function sendMdPlanGrantedEmail(args: PlanGrantedArgs): Promise<boolean> {
  const { to, name, teamName, tierLabel, expiresAt } = args
  const safeName = escapeHtml(name)
  const safeTeam = escapeHtml(teamName)
  const safeTier = escapeHtml(tierLabel)
  const subject  = `Your ${BRAND} plan has been activated — ${tierLabel}`

  const expiryLine = expiresAt
    ? `This access expires on <strong style="color:#f59e0b;">${escapeHtml(expiresAt)}</strong>.`
    : `This access is <strong style="color:#a3e635;">permanent</strong> — no expiry.`

  const text = [
    `${BRAND} — Plan Activated`,
    ``,
    `Hi ${name},`,
    `Good news! Your "${teamName}" account has been upgraded to ${tierLabel}.`,
    expiresAt ? `Access expires: ${expiresAt}` : 'Access: Permanent',
    ``,
    `Open your garage: ${BRAND_URL}/data`,
  ].join('\n')

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #27272a;">
          <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#a3e635;font-weight:700;">${BRAND}</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#fafafa;font-weight:800;">Your plan is active</h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d4d4d8;">
            Hi ${safeName}, your <strong style="color:#fafafa;">${safeTeam}</strong> account has been upgraded to <strong style="color:#a3e635;">${safeTier}</strong>. ${expiryLine}
          </p>
          <div style="text-align:center;margin:28px 0 8px;">
            <a href="${BRAND_URL}/data" style="display:inline-block;background:#a3e635;color:#09090b;font-weight:700;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:10px;">Open your garage</a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #27272a;">
          <p style="margin:0;font-size:12px;color:#71717a;">Activated by the ${BRAND} team. Questions? Reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const ok = await send({ to, subject, html, text })
  if (ok) console.log('[md-email] plan-granted email sent to', to, '-', tierLabel)
  return ok
}

// ── Abandoned checkout recovery ────────────────────────────────────────────────

import type { MdPlanId } from '@/lib/md-plans'

export type AbandonedCheckoutArgs = {
  to: string
  name: string
  plan: MdPlanId
  planLabel: string
}

export async function sendMdAbandonedCheckoutEmail(args: AbandonedCheckoutArgs): Promise<boolean> {
  const { to, name, plan, planLabel } = args
  const safeName  = escapeHtml(name)
  const safePlan  = escapeHtml(planLabel)
  const checkoutUrl = `${BRAND_URL}/data/checkout?plan=${encodeURIComponent(plan)}`
  const subject   = `You left ${planLabel} behind — finish your setup`

  const text = [
    `${BRAND} — Your garage is waiting`,
    ``,
    `Hey ${name},`,
    ``,
    `You were a few clicks away from activating ${planLabel}. Your spot is still open.`,
    ``,
    `Complete your setup: ${checkoutUrl}`,
    ``,
    `Ride hard. — ${BRAND}`,
  ].join('\n')

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #27272a;">
          <p style="margin:0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#a3e635;font-weight:700;">${BRAND}</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#fafafa;font-weight:800;">Your garage is waiting</h1>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d4d4d8;">
            Hey ${safeName}, you were a few clicks away from activating <strong style="color:#a3e635;">${safePlan}</strong>. Your spot is still open — pick up right where you left off.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;border:1px solid #27272a;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <span style="font-size:13px;color:#71717a;">Plan selected</span>
              <span style="float:right;font-size:14px;color:#a3e635;font-weight:700;">${safePlan}</span>
            </td></tr>
          </table>
          <div style="text-align:center;margin:0 0 16px;">
            <a href="${checkoutUrl}" style="display:inline-block;background:#a3e635;color:#09090b;font-weight:700;font-size:14px;text-decoration:none;padding:13px 32px;border-radius:10px;">Complete My Setup</a>
          </div>
          <p style="margin:0;font-size:13px;line-height:1.5;color:#71717a;text-align:center;">
            Takes less than 2 minutes. Data is waiting.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #27272a;">
          <p style="margin:0;font-size:12px;color:#71717a;">
            You started checkout at ${BRAND}. If you changed your mind, no action needed.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const ok = await send({ to, subject, html, text })
  if (ok) console.log('[md-email] abandoned-checkout email sent to', to, 'for', planLabel)
  return ok
}
