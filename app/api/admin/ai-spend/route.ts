import { NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const auth = await requireMdOwner()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Total spend all-time
  const { data: totals } = await supabase
    .from('md_ai_cost_log')
    .select('cost_usd_micro, input_tokens, output_tokens')

  const totalCostMicro = totals?.reduce((s, r) => s + (r.cost_usd_micro ?? 0), 0) ?? 0
  const totalInputTokens = totals?.reduce((s, r) => s + (r.input_tokens ?? 0), 0) ?? 0
  const totalOutputTokens = totals?.reduce((s, r) => s + (r.output_tokens ?? 0), 0) ?? 0
  const totalCalls = totals?.length ?? 0

  // Last 30 days
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('md_ai_cost_log')
    .select('cost_usd_micro, created_at')
    .gte('created_at', since30)
  const cost30d = recent?.reduce((s, r) => s + (r.cost_usd_micro ?? 0), 0) ?? 0

  // Last 24 hours
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: today } = await supabase
    .from('md_ai_cost_log')
    .select('cost_usd_micro, created_at')
    .gte('created_at', since24h)
  const cost24h = today?.reduce((s, r) => s + (r.cost_usd_micro ?? 0), 0) ?? 0

  // Per-route breakdown
  const { data: byRoute } = await supabase
    .from('md_ai_cost_log')
    .select('route, model, cost_usd_micro, input_tokens, output_tokens, latency_ms')

  const routeMap: Record<string, { calls: number; costMicro: number; inputTokens: number; outputTokens: number; latencyMs: number[]; model: string }> = {}
  for (const row of byRoute ?? []) {
    if (!routeMap[row.route]) {
      routeMap[row.route] = { calls: 0, costMicro: 0, inputTokens: 0, outputTokens: 0, latencyMs: [], model: row.model }
    }
    routeMap[row.route].calls++
    routeMap[row.route].costMicro += row.cost_usd_micro ?? 0
    routeMap[row.route].inputTokens += row.input_tokens ?? 0
    routeMap[row.route].outputTokens += row.output_tokens ?? 0
    if (row.latency_ms) routeMap[row.route].latencyMs.push(row.latency_ms)
    routeMap[row.route].model = row.model // last seen model
  }

  const routes = Object.entries(routeMap)
    .map(([route, v]) => ({
      route,
      model: v.model,
      calls: v.calls,
      costUSD: v.costMicro / 1_000_000,
      inputTokens: v.inputTokens,
      outputTokens: v.outputTokens,
      avgLatencyMs: v.latencyMs.length ? Math.round(v.latencyMs.reduce((a, b) => a + b, 0) / v.latencyMs.length) : null,
      costPerCall: v.calls ? (v.costMicro / v.calls) / 1_000_000 : 0,
    }))
    .sort((a, b) => b.costUSD - a.costUSD)

  // Daily spend for sparkline (last 14 days)
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: daily } = await supabase
    .from('md_ai_cost_log')
    .select('cost_usd_micro, created_at')
    .gte('created_at', since14)
    .order('created_at', { ascending: true })

  const dayMap: Record<string, number> = {}
  for (const row of daily ?? []) {
    const day = row.created_at.slice(0, 10)
    dayMap[day] = (dayMap[day] ?? 0) + (row.cost_usd_micro ?? 0)
  }
  const sparkline = Object.entries(dayMap).map(([date, micro]) => ({ date, costUSD: micro / 1_000_000 }))

  return NextResponse.json({
    summary: {
      totalCostUSD: totalCostMicro / 1_000_000,
      cost30dUSD: cost30d / 1_000_000,
      cost24hUSD: cost24h / 1_000_000,
      totalCalls,
      totalInputTokens,
      totalOutputTokens,
    },
    routes,
    sparkline,
  })
}
