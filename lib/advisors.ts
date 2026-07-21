import { db } from '@/lib/db'
import { mdAdvisorReports } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { generateText } from 'ai'
import {
  ADVISORS,
  advisorMeta,
  type AdvisorKey,
  type AdvisorRecommendation,
  type AdvisorReport,
  type HealthSignal,
} from '@/lib/advisor-types'

export {
  ADVISORS,
  advisorMeta,
  type AdvisorKey,
  type AdvisorRecommendation,
  type AdvisorReport,
  type HealthSignal,
}

/**
 * ADVISOR AGENTS (WS4) — evaluate + recommend, on a schedule.
 *
 * Pipeline per advisor:
 *   1) collect()   — deterministic DB queries → a flat metrics object (no LLM)
 *   2) score()     — rules → health signal + baseline recommendations (no LLM)
 *   3) synthesize()— OPTIONAL cheap LLM turns metrics+rules into a crisp headline,
 *                    summary, and prioritized recommendations. Falls back to the
 *                    rule-based output if the model call fails or is unavailable.
 *
 * The health signal is ALWAYS rules-derived (deterministic + trustworthy); the LLM
 * only improves the wording. Cheap model, few calls/day = pennies (per cost model).
 */

// Cheap scheduled model (Standard tier). Swap here if the Gateway catalog changes.
const ADVISOR_MODEL = 'google/gemini-2.5-flash'

type Metrics = Record<string, number | string | null>

type RuleResult = {
  healthSignal: HealthSignal
  headline: string
  summary: string
  recommendations: AdvisorRecommendation[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function scalar(query: ReturnType<typeof sql>): Promise<number> {
  const res: any = await db.execute(query)
  const row = res.rows?.[0] ?? {}
  const val = Object.values(row)[0]
  const n = typeof val === 'string' ? Number(val) : (val as number)
  return Number.isFinite(n) ? n : 0
}

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

const PAID_TIER_FILTER = sql`subscription_tier IS NOT NULL AND lower(subscription_tier) NOT IN ('rookie','free','fan')`

// ── GROWTH ──────────────────────────────────────────────────────────────────

async function collectGrowth(): Promise<Metrics> {
  const totalUsers = await scalar(sql`SELECT count(*) FROM "user"`)
  const newUsers30 = await scalar(sql`SELECT count(*) FROM "user" WHERE "createdAt" >= now() - interval '30 days'`)
  const newUsers7 = await scalar(sql`SELECT count(*) FROM "user" WHERE "createdAt" >= now() - interval '7 days'`)
  const totalTeams = await scalar(sql`SELECT count(*) FROM md_teams`)
  const paidTeams = await scalar(sql`SELECT count(*) FROM md_teams WHERE ${PAID_TIER_FILTER}`)
  const upgrades30 = await scalar(
    sql`SELECT count(*) FROM md_subscription_events WHERE event_type ILIKE '%upgrade%' AND created_at >= now() - interval '30 days'`,
  )
  const agents = await scalar(sql`SELECT count(*) FROM md_external_accounts WHERE account_type = 'agent'`)

  return {
    totalUsers,
    newUsers30,
    newUsers7,
    totalTeams,
    paidTeams,
    freeTeams: Math.max(totalTeams - paidTeams, 0),
    freeToPaidPct: pct(paidTeams, totalTeams),
    upgrades30,
    agentAccounts: agents,
  }
}

function scoreGrowth(m: Metrics): RuleResult {
  const conv = Number(m.freeToPaidPct)
  const newUsers30 = Number(m.newUsers30)
  const recs: AdvisorRecommendation[] = []
  let signal: HealthSignal = 'good'

  if (newUsers30 === 0) {
    signal = 'risk'
    recs.push({ title: 'No new signups in 30 days', detail: 'The top of funnel is dry. Revisit industry landing pages, UTM campaigns, and agent-driven acquisition.', priority: 'high' })
  }
  if (conv < 5) {
    signal = signal === 'risk' ? 'risk' : 'watch'
    recs.push({ title: 'Low free-to-paid conversion', detail: `Only ${conv}% of teams are on a paid tier. Test an upgrade prompt on the Free Rider console and highlight premium AI depth.`, priority: 'high' })
  }
  if (Number(m.agentAccounts) === 0) {
    recs.push({ title: 'Activate the agent channel', detail: 'No agent accounts yet. Agents are a force-multiplier (1 agent = several rider upgrades). Recruit the first agents.', priority: 'medium' })
  }
  if (recs.length === 0) {
    recs.push({ title: 'Keep the funnel warm', detail: 'Growth signals are healthy. Maintain landing-page experiments and monitor tier conversion weekly.', priority: 'low' })
  }

  return {
    healthSignal: signal,
    headline: `${newUsers30} new signups in 30d · ${conv}% on a paid tier`,
    summary: `${m.totalUsers} total users across ${m.totalTeams} teams. ${m.upgrades30} upgrade events in the last 30 days. ${m.agentAccounts} agent acquisition accounts.`,
    recommendations: recs,
  }
}

// ── REVENUE ───────────────────────────────────────────────────────────────────

async function collectRevenue(): Promise<Metrics> {
  const activeExternal = await scalar(sql`SELECT count(*) FROM md_external_accounts WHERE billing_status = 'active'`)
  const compedExternal = await scalar(sql`SELECT count(*) FROM md_external_accounts WHERE is_comped = true`)
  const pendingExternal = await scalar(
    sql`SELECT count(*) FROM md_external_accounts WHERE billing_status IN ('none','pending','past_due')`,
  )
  const paidTeams = await scalar(sql`SELECT count(*) FROM md_teams WHERE ${PAID_TIER_FILTER}`)
  const atRiskTeams = await scalar(
    sql`SELECT count(*) FROM md_teams WHERE (${PAID_TIER_FILTER}) AND (coalesce(payment_failure_count,0) > 0 OR payment_status IN ('failed','past_due'))`,
  )
  const revenue30 = await scalar(
    sql`SELECT coalesce(sum(amount_cents),0) FROM md_subscription_events WHERE created_at >= now() - interval '30 days' AND amount_cents > 0`,
  )

  return {
    activeExternalAccounts: activeExternal,
    compedExternalAccounts: compedExternal,
    pendingExternalAccounts: pendingExternal,
    paidTeams,
    atRiskTeams,
    revenueEvents30Cents: revenue30,
    revenueEvents30Usd: Math.round(revenue30 / 100),
  }
}

function scoreRevenue(m: Metrics): RuleResult {
  const recs: AdvisorRecommendation[] = []
  let signal: HealthSignal = 'good'

  if (Number(m.atRiskTeams) > 0) {
    signal = 'risk'
    recs.push({ title: `${m.atRiskTeams} paid team(s) at risk`, detail: 'These teams have payment failures. Trigger dunning / a save flow before they churn.', priority: 'high' })
  }
  if (Number(m.pendingExternalAccounts) > 0) {
    signal = signal === 'risk' ? 'risk' : 'watch'
    recs.push({ title: 'External accounts awaiting billing', detail: `${m.pendingExternalAccounts} external account(s) are not on active billing. Convert them to active entitlements — that is the profit engine.`, priority: 'high' })
  }
  if (Number(m.activeExternalAccounts) === 0) {
    signal = signal === 'risk' ? 'risk' : 'watch'
    recs.push({ title: 'No active external revenue', detail: 'External accounts fund rider-facing AI. Land the first paid agent/sponsor to start the flywheel.', priority: 'high' })
  }
  if (Number(m.compedExternalAccounts) > 0) {
    recs.push({ title: 'Review comped accounts', detail: `${m.compedExternalAccounts} account(s) are comped. Confirm they are launch partners and plan their path to paid.`, priority: 'low' })
  }
  if (recs.length === 0) {
    recs.push({ title: 'Revenue steady', detail: 'No at-risk accounts detected. Look for expansion opportunities in your largest external accounts.', priority: 'low' })
  }

  return {
    healthSignal: signal,
    headline: `${m.activeExternalAccounts} active external account(s) · $${m.revenueEvents30Usd} booked in 30d`,
    summary: `${m.paidTeams} paid teams, ${m.atRiskTeams} at risk. ${m.pendingExternalAccounts} external account(s) pending billing, ${m.compedExternalAccounts} comped.`,
    recommendations: recs,
  }
}

// ── RETENTION ───────────────────────────────────────────────────────────────

async function collectRetention(): Promise<Metrics> {
  const totalTeams = await scalar(sql`SELECT count(*) FROM md_teams`)
  const active7 = await scalar(
    sql`SELECT count(DISTINCT team_id) FROM md_sessions WHERE team_id IS NOT NULL AND coalesce(session_date, created_at::date) >= (now() - interval '7 days')::date`,
  )
  const active30 = await scalar(
    sql`SELECT count(DISTINCT team_id) FROM md_sessions WHERE team_id IS NOT NULL AND coalesce(session_date, created_at::date) >= (now() - interval '30 days')::date`,
  )
  const sessions30 = await scalar(
    sql`SELECT count(*) FROM md_sessions WHERE coalesce(session_date, created_at::date) >= (now() - interval '30 days')::date`,
  )
  const quietTeams = Math.max(totalTeams - active30, 0)

  return {
    totalTeams,
    activeTeams7d: active7,
    activeTeams30d: active30,
    quietTeams,
    activeRate30dPct: pct(active30, totalTeams),
    sessions30d: sessions30,
    avgSessionsPerActiveTeam: active30 ? Math.round((sessions30 / active30) * 10) / 10 : 0,
  }
}

function scoreRetention(m: Metrics): RuleResult {
  const activeRate = Number(m.activeRate30dPct)
  const recs: AdvisorRecommendation[] = []
  let signal: HealthSignal = 'good'

  if (Number(m.totalTeams) === 0) {
    signal = 'watch'
    recs.push({ title: 'No teams to measure yet', detail: 'Retention becomes meaningful once teams start logging sessions. Revisit after onboarding the first cohort.', priority: 'low' })
  } else {
    if (activeRate < 40) {
      signal = 'risk'
      recs.push({ title: 'Most teams are inactive', detail: `Only ${activeRate}% of teams logged a session in 30 days. Launch a re-engagement nudge and surface the stickiest feature (setup logs / Rig Doctor).`, priority: 'high' })
    } else if (activeRate < 70) {
      signal = 'watch'
      recs.push({ title: 'Engagement slipping', detail: `${activeRate}% active in 30 days. Identify the ${m.quietTeams} quiet team(s) and send a targeted check-in before they churn.`, priority: 'medium' })
    }
    if (Number(m.quietTeams) > 0) {
      recs.push({ title: `${m.quietTeams} quiet team(s)`, detail: 'Teams with no session in 30+ days are the leading churn indicator. Prioritize outreach to them.', priority: activeRate < 40 ? 'high' : 'medium' })
    }
  }
  if (recs.length === 0) {
    recs.push({ title: 'Engagement healthy', detail: 'Activity is strong. Consider a loyalty or referral incentive to convert engaged teams into advocates.', priority: 'low' })
  }

  return {
    healthSignal: signal,
    headline: `${m.activeTeams30d}/${m.totalTeams} teams active in 30d (${activeRate}%)`,
    summary: `${m.sessions30d} sessions logged in 30 days, averaging ${m.avgSessionsPerActiveTeam} per active team. ${m.quietTeams} team(s) have gone quiet.`,
    recommendations: recs,
  }
}

// ── DATA-ASSET ────────────────────────────────────────────────────────────────

async function collectDataAsset(): Promise<Metrics> {
  const totalSessions = await scalar(sql`SELECT count(*) FROM md_sessions`)
  const sessions30 = await scalar(sql`SELECT count(*) FROM md_sessions WHERE created_at >= now() - interval '30 days'`)
  const totalTeams = await scalar(sql`SELECT count(*) FROM md_teams`)
  const wmxTeams = await scalar(sql`SELECT count(*) FROM md_teams WHERE discipline ILIKE '%wmx%' OR discipline ILIKE '%women%'`)
  const disciplines = await scalar(sql`SELECT count(DISTINCT discipline) FROM md_teams WHERE discipline IS NOT NULL AND discipline <> ''`)
  const consentUsers = await scalar(sql`SELECT count(DISTINCT user_id) FROM md_consent_records`)
  const grantsGranted = await scalar(sql`SELECT count(*) FROM md_external_access_grants WHERE status = 'granted'`)
  const billableGrants = await scalar(sql`SELECT count(*) FROM md_external_access_grants WHERE status = 'granted' AND billable = true`)

  return {
    totalSessions,
    sessions30d: sessions30,
    totalTeams,
    wmxTeams,
    wmxCoveragePct: pct(wmxTeams, totalTeams),
    disciplineCount: disciplines,
    consentUsers,
    grantsGranted,
    billableGrants,
  }
}

function scoreDataAsset(m: Metrics): RuleResult {
  const recs: AdvisorRecommendation[] = []
  let signal: HealthSignal = 'good'

  if (Number(m.totalSessions) < 100) {
    signal = 'watch'
    recs.push({ title: 'Dataset still thin', detail: `${m.totalSessions} sessions logged. The aggregate moat is not yet monetizable to OEMs — focus on session volume and breadth first.`, priority: 'medium' })
  }
  if (Number(m.sessions30d) === 0) {
    signal = 'risk'
    recs.push({ title: 'No new data in 30 days', detail: 'The dataset is not growing. Data growth is the moat — drive session logging via onboarding and retention nudges.', priority: 'high' })
  }
  if (Number(m.wmxCoveragePct) < 10) {
    recs.push({ title: 'Grow WMX coverage', detail: `WMX is ${m.wmxCoveragePct}% of teams. WMX is the fastest-growing, least-served segment — a first-mover data advantage. Recruit WMX riders.`, priority: 'medium' })
  }
  if (Number(m.grantsGranted) === 0) {
    recs.push({ title: 'No consented data-sharing yet', detail: 'No riders have granted external access. Consent rate directly determines what you can license to sponsors/OEMs.', priority: 'medium' })
  }
  if (recs.length === 0) {
    recs.push({ title: 'Moat compounding', detail: 'Dataset is growing with healthy consent. Start packaging aggregate analytics for promoter/OEM data licenses.', priority: 'low' })
  }

  return {
    healthSignal: signal,
    headline: `${m.totalSessions} sessions · ${m.grantsGranted} consented grants · WMX ${m.wmxCoveragePct}%`,
    summary: `${m.sessions30d} new sessions in 30 days across ${m.disciplineCount} discipline(s). ${m.consentUsers} users have consent records; ${m.billableGrants} billable granted access(es).`,
    recommendations: recs,
  }
}

// ── Registry wiring ─────────────────────────────────────────────────────────

const COLLECTORS: Record<AdvisorKey, () => Promise<Metrics>> = {
  growth: collectGrowth,
  revenue: collectRevenue,
  retention: collectRetention,
  data_asset: collectDataAsset,
}

const SCORERS: Record<AdvisorKey, (m: Metrics) => RuleResult> = {
  growth: scoreGrowth,
  revenue: scoreRevenue,
  retention: scoreRetention,
  data_asset: scoreDataAsset,
}

// ── Optional LLM synthesis (cheap, best-effort) ───────────────────────────────

async function synthesize(
  key: AdvisorKey,
  metrics: Metrics,
  rules: RuleResult,
): Promise<{ headline: string; summary: string; recommendations: AdvisorRecommendation[]; synthesizedBy: string }> {
  const meta = advisorMeta(key)
  const fallback = {
    headline: rules.headline,
    summary: rules.summary,
    recommendations: rules.recommendations,
    synthesizedBy: 'rules',
  }

  try {
    const system = `You are the ${meta?.label} for MotorsportsData.io, a motocross/supercross data platform. You EVALUATE metrics and give the owner crisp, actionable business advice. Be specific and concise. Never invent numbers not present in the data. Return STRICT JSON only.`
    const prompt = `Advisor focus: ${meta?.description}
Deterministic health signal (do not change it): ${rules.healthSignal}
Metrics (JSON): ${JSON.stringify(metrics)}
Baseline rule-based recommendations: ${JSON.stringify(rules.recommendations)}

Return JSON with this exact shape:
{"headline": string (<=120 chars, punchy, reference real numbers),
 "summary": string (2-3 sentences of plain-language interpretation),
 "recommendations": [{"title": string, "detail": string, "priority": "high"|"medium"|"low"}] (2-4 items, most important first)}`

    const { text } = await generateText({ model: ADVISOR_MODEL, system, prompt })
    const jsonStr = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
    const parsed = JSON.parse(jsonStr)
    if (!parsed.headline || !Array.isArray(parsed.recommendations)) return fallback

    const recs: AdvisorRecommendation[] = parsed.recommendations
      .slice(0, 4)
      .map((r: any) => ({
        title: String(r.title ?? '').slice(0, 160),
        detail: String(r.detail ?? '').slice(0, 400),
        priority: ['high', 'medium', 'low'].includes(r.priority) ? r.priority : 'medium',
      }))
      .filter((r: AdvisorRecommendation) => r.title)

    return {
      headline: String(parsed.headline).slice(0, 280),
      summary: String(parsed.summary ?? rules.summary).slice(0, 1200),
      recommendations: recs.length ? recs : rules.recommendations,
      synthesizedBy: ADVISOR_MODEL,
    }
  } catch (err) {
    console.log('[v0] advisor synthesis fell back to rules:', (err as Error).message)
    return fallback
  }
}

// ── Public: run + persist ─────────────────────────────────────────────────────

export async function runAdvisor(key: AdvisorKey): Promise<AdvisorReport> {
  const metrics = await COLLECTORS[key]()
  const rules = SCORERS[key](metrics)
  const synth = await synthesize(key, metrics, rules)

  const [row] = await db
    .insert(mdAdvisorReports)
    .values({
      advisorKey: key,
      period: '30d',
      healthSignal: rules.healthSignal, // deterministic
      headline: synth.headline,
      summary: synth.summary,
      metrics: metrics as any,
      recommendations: synth.recommendations as any,
      synthesizedBy: synth.synthesizedBy,
    })
    .returning()

  return mapReport(row)
}

export async function runAllAdvisors(): Promise<{ key: AdvisorKey; healthSignal: HealthSignal; synthesizedBy: string }[]> {
  const out: { key: AdvisorKey; healthSignal: HealthSignal; synthesizedBy: string }[] = []
  for (const a of ADVISORS) {
    try {
      const r = await runAdvisor(a.key)
      out.push({ key: a.key, healthSignal: r.healthSignal, synthesizedBy: r.synthesizedBy })
    } catch (err) {
      console.log(`[v0] advisor ${a.key} failed:`, (err as Error).message)
      out.push({ key: a.key, healthSignal: 'watch', synthesizedBy: 'error' })
    }
  }
  return out
}

// ── Public: read layer (owner console) ────────────────────────────────────────

function mapReport(row: any): AdvisorReport {
  return {
    id: row.id,
    advisorKey: row.advisorKey,
    period: row.period,
    healthSignal: row.healthSignal,
    headline: row.headline,
    summary: row.summary,
    metrics: (row.metrics ?? {}) as Record<string, number | string | null>,
    recommendations: (row.recommendations ?? []) as AdvisorRecommendation[],
    synthesizedBy: row.synthesizedBy,
    acknowledged: row.acknowledged,
    createdAt: row.createdAt,
  }
}

/** Latest report for each of the four advisors (nulls where none has run yet). */
export async function getLatestAdvisorReports(): Promise<Record<AdvisorKey, AdvisorReport | null>> {
  const rows = await db
    .select()
    .from(mdAdvisorReports)
    .orderBy(desc(mdAdvisorReports.createdAt))
    .limit(200)

  const latest: Record<AdvisorKey, AdvisorReport | null> = {
    growth: null,
    revenue: null,
    retention: null,
    data_asset: null,
  }
  for (const r of rows) {
    const key = r.advisorKey as AdvisorKey
    if (key in latest && !latest[key]) latest[key] = mapReport(r)
  }
  return latest
}

/** Recent history for one advisor. */
export async function getAdvisorHistory(key: AdvisorKey, limit = 10): Promise<AdvisorReport[]> {
  const rows = await db
    .select()
    .from(mdAdvisorReports)
    .where(eq(mdAdvisorReports.advisorKey, key))
    .orderBy(desc(mdAdvisorReports.createdAt))
    .limit(limit)
  return rows.map(mapReport)
}

export async function acknowledgeAdvisorReport(id: string): Promise<void> {
  await db.update(mdAdvisorReports).set({ acknowledged: true }).where(eq(mdAdvisorReports.id, id))
}
