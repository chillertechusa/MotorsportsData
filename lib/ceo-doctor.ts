import { getOwnerFinancials } from '@/app/actions/md-owner'
import { getLatestAdvisorReports } from '@/lib/advisors'
import { getSentinelStats } from '@/lib/sentinel'
import { ADVISORS, type AdvisorKey, type AdvisorReport } from '@/lib/advisor-types'
import { MD_PLAN_LABELS, type MdPlanId } from '@/lib/md-plans'

/**
 * THE CEO DOCTOR — the capstone oversight brain.
 *
 * It does NOT compute anything new. It AGGREGATES the outputs of the systems we
 * already built — the financial engine (getOwnerFinancials), the four Advisor
 * agents (getLatestAdvisorReports), and the Sentinel Squad (getSentinelStats) —
 * into a single structured snapshot, then renders that snapshot into a grounding
 * block for a frontier LLM. The model answers CEO-level questions strictly from
 * this real, live data. No hallucinated numbers.
 *
 * Cost: owner-only, low-volume, so we spend on the best model available.
 */

const dollars = (cents: number) =>
  '$' + Math.round(cents / 100).toLocaleString('en-US')

export type CeoSnapshot = {
  generatedAt: string
  financials: {
    mrr: string
    arr: string
    activeTeams: number
    churnedTeams: number
    freeRiders: number
    netProfitMonthly: string
    marginPct: number
    monthlyExpenses: string
    tierBreakdown: { tier: string; label: string; count: number; mrr: string }[]
    note: string
  }
  advisors: {
    key: AdvisorKey
    label: string
    signal: string
    headline: string
    topRecommendation: string | null
  }[]
  sentinels: {
    totalUnacknowledged: number
    totalCritical: number
    byLens: { lens: string; total: number; unacknowledged: number; critical: number }[]
  }
}

/** Pull every oversight system into one structured snapshot. */
export async function buildCeoSnapshot(): Promise<CeoSnapshot> {
  const [financials, advisorReports, sentinelStats] = await Promise.all([
    getOwnerFinancials(),
    getLatestAdvisorReports(),
    getSentinelStats(),
  ])

  const totalExpenseCents = financials.monthlyExpenses.reduce((s, e) => s + e.cents, 0)
  const netCents = financials.mrrCents - totalExpenseCents
  const marginPct =
    financials.mrrCents > 0 ? Math.round((netCents / financials.mrrCents) * 100) : 0

  const freeRiders = financials.subscribers.filter(
    (s) => (s.tier === 'rookie' || s.tier === 'fan') && s.status === 'active',
  ).length

  const tierBreakdown = Object.entries(financials.tierBreakdown)
    .map(([tier, bd]) => ({
      tier,
      label: MD_PLAN_LABELS[tier as MdPlanId] ?? tier,
      count: bd.count,
      mrr: dollars(bd.mrrCents),
    }))
    .sort((a, b) => b.count - a.count)

  const advisors = ADVISORS.map((meta) => {
    const report: AdvisorReport | null = advisorReports[meta.key]
    const topRec =
      report?.recommendations
        ?.slice()
        .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))[0] ?? null
    return {
      key: meta.key,
      label: meta.label,
      signal: report?.healthSignal ?? 'no data',
      headline: report?.headline ?? 'No report yet.',
      topRecommendation: topRec ? `${topRec.title} — ${topRec.detail}` : null,
    }
  })

  const byLens = Object.entries(sentinelStats.byLens).map(([lens, s]) => ({
    lens,
    total: s.total,
    unacknowledged: s.unacknowledged,
    critical: s.critical,
  }))

  return {
    generatedAt: new Date().toISOString(),
    financials: {
      mrr: dollars(financials.mrrCents),
      arr: dollars(financials.arrCents),
      activeTeams: financials.activeCount,
      churnedTeams: financials.churnedCount,
      freeRiders,
      netProfitMonthly: dollars(netCents),
      marginPct,
      monthlyExpenses: dollars(totalExpenseCents),
      tierBreakdown,
      note: 'REAL collected revenue — counts only teams with an active Square subscription. Seeded/test accounts are excluded, so pre-launch this reads ~$0 and grows on the first real checkout.',
    },
    advisors,
    sentinels: {
      totalUnacknowledged: sentinelStats.totalUnacknowledged,
      totalCritical: sentinelStats.totalCritical,
      byLens,
    },
  }
}

function priorityRank(p: 'high' | 'medium' | 'low') {
  return p === 'high' ? 3 : p === 'medium' ? 2 : 1
}

/** Render the snapshot into a grounding block for the system prompt. */
export function snapshotToPrompt(s: CeoSnapshot): string {
  const lines: string[] = []
  lines.push('=== LIVE PLATFORM SNAPSHOT ===')
  lines.push(`(generated ${s.generatedAt})`)
  lines.push('')
  lines.push('-- FINANCIALS (monthly basis) --')
  lines.push(`MRR: ${s.financials.mrr}   ARR: ${s.financials.arr}`)
  lines.push(
    `Net profit/mo: ${s.financials.netProfitMonthly} (${s.financials.marginPct}% margin, expenses ${s.financials.monthlyExpenses}/mo)`,
  )
  lines.push(
    `Active paid teams: ${s.financials.activeTeams}   Churned: ${s.financials.churnedTeams}   Free Riders: ${s.financials.freeRiders}`,
  )
  lines.push('Tier mix:')
  for (const t of s.financials.tierBreakdown) {
    lines.push(`  - ${t.label}: ${t.count} team(s), ${t.mrr}/mo`)
  }
  lines.push(`IMPORTANT: ${s.financials.note}`)
  lines.push('')
  lines.push('-- ADVISOR AGENTS (latest reports) --')
  for (const a of s.advisors) {
    lines.push(`[${a.label}] signal=${a.signal.toUpperCase()} — ${a.headline}`)
    if (a.topRecommendation) lines.push(`   top rec: ${a.topRecommendation}`)
  }
  lines.push('')
  lines.push('-- SENTINEL SQUAD (security/consent/access/IP) --')
  lines.push(
    `Unacknowledged events: ${s.sentinels.totalUnacknowledged}   Critical: ${s.sentinels.totalCritical}`,
  )
  for (const l of s.sentinels.byLens) {
    lines.push(
      `  - ${l.lens}: ${l.total} total, ${l.unacknowledged} open, ${l.critical} critical`,
    )
  }
  lines.push('=== END SNAPSHOT ===')
  return lines.join('\n')
}
