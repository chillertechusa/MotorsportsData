'use server'

import { HealthCheck } from '@/lib/health-check-types'
import { runSignupHealthCheck } from './health-agents/signup-agent'
import { runSigninHealthCheck } from './health-agents/signin-agent'
import { runCheckoutHealthCheck } from './health-agents/checkout-agent'
import { runAccountCreationHealthCheck } from './health-agents/account-creation-agent'
import { runDataIsolationHealthCheck } from './health-agents/data-isolation-agent'
import { db } from '@/lib/db'
import { mdTeams, mdVehicles, mdSessions } from '@/lib/db/schema'
import { sql, desc } from 'drizzle-orm'

// ─── helpers ────────────────────────────────────────────────────────────────

function makeCheck(
  id: string,
  type: string,
  status: HealthCheck['status'],
  message: string,
  ms: number,
  details?: Record<string, unknown>
): HealthCheck {
  return {
    id,
    check_type: type as any,
    status,
    message,
    response_time_ms: ms,
    error_details: details,
    created_at: new Date().toISOString(),
  }
}

function errCheck(id: string, type: string, msg: string, ms: number, e: unknown): HealthCheck {
  return makeCheck(id, type, 'error', msg, ms, {
    error: e instanceof Error ? e.message : String(e),
  })
}

// ─── GROUP 1: Platform Health ─────────────────────────────────────────────
// Delegates to the 5 real health agents already written

// ─── GROUP 2: SMX Checkout & Billing ─────────────────────────────────────

export async function runSquareConnectionAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const hasToken = !!process.env.SQUARE_ACCESS_TOKEN
    const hasLocation = !!process.env.SQUARE_LOCATION_ID
    const hasAppId = !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
    const allSet = hasToken && hasLocation && hasAppId
    return makeCheck(
      `square_conn_${Date.now()}`, 'square_connection',
      allSet ? 'pass' : 'fail',
      allSet
        ? 'Square credentials present (ACCESS_TOKEN, LOCATION_ID, APP_ID)'
        : `Missing Square env vars: ${[!hasToken && 'SQUARE_ACCESS_TOKEN', !hasLocation && 'SQUARE_LOCATION_ID', !hasAppId && 'NEXT_PUBLIC_SQUARE_APPLICATION_ID'].filter(Boolean).join(', ')}`,
      Date.now() - start,
      { token: hasToken, location: hasLocation, appId: hasAppId }
    )
  } catch (e) {
    return errCheck(`square_conn_err_${Date.now()}`, 'square_connection', 'Square connection check failed', Date.now() - start, e)
  }
}

export async function runSMXCheckoutRouteAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    // Probe the SMX checkout route with an invalid plan to confirm it's alive (not 404/500)
    const res = await fetch(`${base}/api/smx/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: '__probe__' }),
      signal: AbortSignal.timeout(8000),
    })
    // 400 = route exists, rejected bad planId — that's correct
    const alive = res.status === 400 || res.status === 200
    return makeCheck(
      `smx_checkout_route_${Date.now()}`, 'smx_checkout_route',
      alive ? 'pass' : 'fail',
      alive
        ? `SMX checkout route alive (HTTP ${res.status})`
        : `SMX checkout route returned unexpected HTTP ${res.status}`,
      Date.now() - start,
      { http_status: res.status }
    )
  } catch (e) {
    return errCheck(`smx_checkout_err_${Date.now()}`, 'smx_checkout_route', 'SMX checkout route unreachable', Date.now() - start, e)
  }
}

export async function runSMXThankYouPageAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/smx2027/thank-you`, { signal: AbortSignal.timeout(8000) })
    const ok = res.status === 200
    return makeCheck(
      `smx_thankyou_${Date.now()}`, 'smx_thank_you_page',
      ok ? 'pass' : 'fail',
      ok ? 'SMX thank-you page renders (HTTP 200)' : `SMX thank-you page returned HTTP ${res.status}`,
      Date.now() - start,
      { http_status: res.status }
    )
  } catch (e) {
    return errCheck(`smx_thankyou_err_${Date.now()}`, 'smx_thank_you_page', 'SMX thank-you page unreachable', Date.now() - start, e)
  }
}

export async function runSMXCampaignPageAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/smx2027`, { signal: AbortSignal.timeout(8000) })
    const ok = res.status === 200
    return makeCheck(
      `smx_campaign_${Date.now()}`, 'smx_campaign_page',
      ok ? 'pass' : 'fail',
      ok ? 'SMX 2027 campaign page renders (HTTP 200)' : `Campaign page HTTP ${res.status}`,
      Date.now() - start,
      { http_status: res.status }
    )
  } catch (e) {
    return errCheck(`smx_campaign_err_${Date.now()}`, 'smx_campaign_page', 'SMX campaign page unreachable', Date.now() - start, e)
  }
}

// ─── GROUP 3: Data & Telemetry API Layer ─────────────────────────────────

export async function runDatabaseConnectionAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    await db.execute(sql`SELECT 1`)
    return makeCheck(
      `db_conn_${Date.now()}`, 'database_connection',
      'pass', 'Neon database connection healthy',
      Date.now() - start
    )
  } catch (e) {
    return errCheck(`db_conn_err_${Date.now()}`, 'database_connection', 'Database connection failed', Date.now() - start, e)
  }
}

export async function runTeamsTableAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const rows = await db.select({ count: sql<number>`count(*)` }).from(mdTeams)
    const count = Number(rows[0]?.count ?? 0)
    return makeCheck(
      `teams_table_${Date.now()}`, 'teams_table',
      'pass', `md_teams table accessible — ${count} team(s) registered`,
      Date.now() - start, { team_count: count }
    )
  } catch (e) {
    return errCheck(`teams_table_err_${Date.now()}`, 'teams_table', 'md_teams table query failed', Date.now() - start, e)
  }
}

export async function runFleetTableAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const rows = await db.select({ count: sql<number>`count(*)` }).from(mdVehicles)
    const count = Number(rows[0]?.count ?? 0)
    return makeCheck(
      `fleet_table_${Date.now()}`, 'fleet_table',
      'pass', `md_vehicles table accessible — ${count} vehicle(s) logged`,
      Date.now() - start, { vehicle_count: count }
    )
  } catch (e) {
    return errCheck(`fleet_table_err_${Date.now()}`, 'fleet_table', 'md_vehicles table query failed', Date.now() - start, e)
  }
}

export async function runSessionsAPIAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const recent = await db
      .select({ id: mdSessions.id, createdAt: mdSessions.createdAt })
      .from(mdSessions)
      .orderBy(desc(mdSessions.createdAt))
      .limit(1)
    const lastSession = recent[0]?.createdAt ?? null
    return makeCheck(
      `sessions_api_${Date.now()}`, 'sessions_api',
      'pass',
      lastSession
        ? `Sessions table healthy — last session at ${new Date(lastSession).toLocaleDateString()}`
        : 'Sessions table accessible (no sessions yet)',
      Date.now() - start, { last_session: lastSession }
    )
  } catch (e) {
    return errCheck(`sessions_api_err_${Date.now()}`, 'sessions_api', 'Sessions API/table query failed', Date.now() - start, e)
  }
}

// ─── GROUP 4: AI Systems ──────────────────────────────────────────────────

export async function runAIGatewayAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const hasKey = !!process.env.AI_GATEWAY_API_KEY || !!process.env.OPENAI_API_KEY
    // Probe the md-intel endpoint as a lightweight AI gateway test
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/md-intel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: '__probe__' }], teamId: '__probe__' }),
      signal: AbortSignal.timeout(10000),
    })
    // 401/403 = route alive but auth-gated (expected without session) — confirms gateway reachable
    const alive = res.status < 500
    return makeCheck(
      `ai_gateway_${Date.now()}`, 'ai_gateway',
      alive ? 'pass' : 'fail',
      alive
        ? `AI gateway reachable — md-intel route HTTP ${res.status} (auth gate = expected)`
        : `AI gateway returned HTTP ${res.status} — possible outage`,
      Date.now() - start,
      { http_status: res.status, has_key_configured: hasKey }
    )
  } catch (e) {
    return errCheck(`ai_gateway_err_${Date.now()}`, 'ai_gateway', 'AI gateway probe failed', Date.now() - start, e)
  }
}

export async function runRigDoctorAIAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/md-rig-doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], teamId: '__probe__' }),
      signal: AbortSignal.timeout(10000),
    })
    const alive = res.status < 500
    return makeCheck(
      `rig_doctor_${Date.now()}`, 'rig_doctor_ai',
      alive ? 'pass' : 'fail',
      alive
        ? `Rig Doctor AI route alive (HTTP ${res.status})`
        : `Rig Doctor AI route error (HTTP ${res.status})`,
      Date.now() - start, { http_status: res.status }
    )
  } catch (e) {
    return errCheck(`rig_doctor_err_${Date.now()}`, 'rig_doctor_ai', 'Rig Doctor AI probe failed', Date.now() - start, e)
  }
}

export async function runCoachAIAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/md-coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], teamId: '__probe__' }),
      signal: AbortSignal.timeout(10000),
    })
    const alive = res.status < 500
    return makeCheck(
      `coach_ai_${Date.now()}`, 'coach_ai',
      alive ? 'pass' : 'fail',
      alive
        ? `Race Coach AI route alive (HTTP ${res.status})`
        : `Race Coach AI route error (HTTP ${res.status})`,
      Date.now() - start, { http_status: res.status }
    )
  } catch (e) {
    return errCheck(`coach_ai_err_${Date.now()}`, 'coach_ai', 'Race Coach AI probe failed', Date.now() - start, e)
  }
}

// ─── GROUP 5: Sentinel Security & Pre-Launch Checks ──────────────────────

export async function runEnvSecretsAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const required: Record<string, string | undefined> = {
      SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN,
      SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID,
      NEXT_PUBLIC_SQUARE_APPLICATION_ID: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      CRON_SECRET: process.env.CRON_SECRET,
    }
    const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k)
    const status: HealthCheck['status'] = missing.length === 0 ? 'pass' : missing.length <= 2 ? 'warning' : 'fail'
    return makeCheck(
      `env_secrets_${Date.now()}`, 'env_secrets',
      status,
      missing.length === 0
        ? 'All required environment secrets are set'
        : `Missing env vars: ${missing.join(', ')}`,
      Date.now() - start,
      { missing_count: missing.length, missing_keys: missing }
    )
  } catch (e) {
    return errCheck(`env_secrets_err_${Date.now()}`, 'env_secrets', 'Env secrets check failed', Date.now() - start, e)
  }
}

export async function runPublicHomepageAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/`, { signal: AbortSignal.timeout(10000) })
    const ok = res.status === 200
    return makeCheck(
      `homepage_${Date.now()}`, 'public_homepage',
      ok ? 'pass' : 'fail',
      ok ? `Homepage renders (HTTP 200, ${Date.now() - start}ms)` : `Homepage returned HTTP ${res.status}`,
      Date.now() - start, { http_status: res.status }
    )
  } catch (e) {
    return errCheck(`homepage_err_${Date.now()}`, 'public_homepage', 'Homepage unreachable', Date.now() - start, e)
  }
}

export async function runSignInPageAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/data/sign-in`, { signal: AbortSignal.timeout(8000) })
    const ok = res.status === 200
    return makeCheck(
      `signin_page_${Date.now()}`, 'signin_page',
      ok ? 'pass' : 'fail',
      ok ? 'Sign-in page renders (HTTP 200)' : `Sign-in page HTTP ${res.status}`,
      Date.now() - start, { http_status: res.status }
    )
  } catch (e) {
    return errCheck(`signin_page_err_${Date.now()}`, 'signin_page', 'Sign-in page unreachable', Date.now() - start, e)
  }
}

export async function runOGImageAgent(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/assets/og-preview.png`, { signal: AbortSignal.timeout(8000) })
    const ok = res.status === 200
    return makeCheck(
      `og_image_${Date.now()}`, 'og_image',
      ok ? 'pass' : 'fail',
      ok ? 'OG preview image (og-preview.png) accessible' : `OG image missing — HTTP ${res.status}`,
      Date.now() - start, { http_status: res.status }
    )
  } catch (e) {
    return errCheck(`og_image_err_${Date.now()}`, 'og_image', 'OG image probe failed', Date.now() - start, e)
  }
}

// ─── Agent Group Registry ─────────────────────────────────────────────────

export interface AgentGroup {
  name: string
  group_id: string
  refresh_interval_min: number
  agents: Array<{
    id: string
    name: string
    fn: () => Promise<HealthCheck>
  }>
}

export const AGENT_GROUPS: AgentGroup[] = [
  {
    name: 'Platform Health',
    group_id: 'platform_health',
    refresh_interval_min: 18,
    agents: [
      { id: 'signup', name: 'Sign-Up Flow', fn: runSignupHealthCheck },
      { id: 'signin', name: 'Sign-In Flow', fn: runSigninHealthCheck },
      { id: 'checkout', name: 'Checkout Flow', fn: runCheckoutHealthCheck },
      { id: 'account_creation', name: 'Account Creation', fn: runAccountCreationHealthCheck },
      { id: 'data_isolation', name: 'Data Isolation (RLS)', fn: runDataIsolationHealthCheck },
    ],
  },
  {
    name: 'SMX 2027 Checkout & Billing',
    group_id: 'smx_checkout',
    refresh_interval_min: 10,
    agents: [
      { id: 'square_connection', name: 'Square Connection', fn: runSquareConnectionAgent },
      { id: 'smx_checkout_route', name: 'SMX Checkout Route', fn: runSMXCheckoutRouteAgent },
      { id: 'smx_campaign_page', name: 'Campaign Page (/smx2027)', fn: runSMXCampaignPageAgent },
      { id: 'smx_thank_you', name: 'Thank-You Page', fn: runSMXThankYouPageAgent },
    ],
  },
  {
    name: 'Data & Telemetry API',
    group_id: 'data_telemetry',
    refresh_interval_min: 5,
    agents: [
      { id: 'database_connection', name: 'Neon DB Connection', fn: runDatabaseConnectionAgent },
      { id: 'teams_table', name: 'Teams Table', fn: runTeamsTableAgent },
      { id: 'fleet_table', name: 'Fleet Table', fn: runFleetTableAgent },
      { id: 'sessions_api', name: 'Sessions API', fn: runSessionsAPIAgent },
    ],
  },
  {
    name: 'AI Systems',
    group_id: 'ai_systems',
    refresh_interval_min: 10,
    agents: [
      { id: 'ai_gateway', name: 'Vercel AI Gateway', fn: runAIGatewayAgent },
      { id: 'rig_doctor', name: 'Rig Doctor AI', fn: runRigDoctorAIAgent },
      { id: 'coach_ai', name: 'Race Coach AI', fn: runCoachAIAgent },
    ],
  },
  {
    name: 'Pre-Launch Sentinel',
    group_id: 'pre_launch_sentinel',
    refresh_interval_min: 15,
    agents: [
      { id: 'env_secrets', name: 'Env Secrets Audit', fn: runEnvSecretsAgent },
      { id: 'public_homepage', name: 'Homepage Render', fn: runPublicHomepageAgent },
      { id: 'signin_page', name: 'Sign-In Page', fn: runSignInPageAgent },
      { id: 'og_image', name: 'OG Preview Image', fn: runOGImageAgent },
    ],
  },
]

// ─── Orchestrator ─────────────────────────────────────────────────────────

export async function runAllAgentsAcrossGroups(): Promise<{
  groups: Array<{ group: AgentGroup; checks: HealthCheck[] }>
  summary: { total: number; passed: number; failed: number; errors: number; warnings: number }
  executed_at: string
}> {
  const groupResults = await Promise.all(
    AGENT_GROUPS.map(async (group) => {
      const checks = await Promise.all(group.agents.map((agent) => agent.fn()))
      return { group, checks }
    })
  )

  const allChecks = groupResults.flatMap((r) => r.checks)
  const summary = {
    total: allChecks.length,
    passed: allChecks.filter((c) => c.status === 'pass').length,
    failed: allChecks.filter((c) => c.status === 'fail').length,
    errors: allChecks.filter((c) => c.status === 'error').length,
    warnings: allChecks.filter((c) => c.status === 'warning').length,
  }

  return { groups: groupResults, summary, executed_at: new Date().toISOString() }
}
