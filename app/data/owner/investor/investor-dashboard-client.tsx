'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import type { OwnerFinancials } from '@/app/actions/md-owner'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, DollarSign, Zap, Target, RefreshCw } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt$(cents: number) {
  const d = cents / 100
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(2)}M`
  if (d >= 1_000) return `$${(d / 1_000).toFixed(1)}K`
  return `$${d.toFixed(0)}`
}

function fmtPct(a: number, b: number) {
  if (!b) return '—'
  return `${((a / b) * 100).toFixed(1)}%`
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent = false, icon: Icon,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
  icon: React.ElementType
}) {
  return (
    <div className={`rounded-2xl border p-6 flex flex-col gap-3 ${
      accent
        ? 'bg-lime-400 border-lime-300'
        : 'bg-zinc-900 border-zinc-800'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-widest ${accent ? 'text-zinc-900' : 'text-zinc-500'}`}>
          {label}
        </span>
        <Icon className={`h-4 w-4 ${accent ? 'text-zinc-900' : 'text-zinc-600'}`} />
      </div>
      <span className={`text-4xl font-black tabular-nums tracking-tight ${accent ? 'text-zinc-950' : 'text-zinc-50'}`}>
        {value}
      </span>
      {sub && (
        <span className={`text-xs ${accent ? 'text-zinc-800' : 'text-zinc-500'}`}>{sub}</span>
      )}
    </div>
  )
}

// ── Tier colours ─────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  rookie:      '#52525b',
  privateer:   '#a3e635',
  race_team:   '#facc15',
  factory_rig: '#f97316',
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function InvestorDashboardClient({
  financials,
  ownerEmail,
}: {
  financials: OwnerFinancials
  ownerEmail: string
}) {
  const {
    mrrCents, arrCents, activeCount, churnedCount,
    tierBreakdown, aiCallsThisMonth, aiCostCentsThisMonth,
    monthlyExpenses, revenueTimeline, subscribers,
  } = financials

  const totalRevenueCents = mrrCents
  const aiMarginCents = mrrCents - aiCostCentsThisMonth
  const aiMarginPct = mrrCents > 0 ? ((aiMarginCents / mrrCents) * 100).toFixed(1) : '—'
  const ltv = activeCount > 0 ? fmt$(mrrCents / activeCount * 12) : '—' // simple 12-mo LTV
  const churnRate = (activeCount + churnedCount) > 0
    ? fmtPct(churnedCount, activeCount + churnedCount)
    : '0%'

  // Tier bar data
  const tierData = Object.entries(tierBreakdown).map(([tier, { count, mrrCents: tm }]) => ({
    tier: tier.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count,
    mrr: tm / 100,
    fill: TIER_COLORS[tier] ?? '#a1a1aa',
  }))

  const [refreshing, setRefreshing] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/data/owner" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-lime-400">Motorsport Data</p>
            <h1 className="text-lg font-black tracking-tight">Investor Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
            Live · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs text-zinc-600 hidden md:block">{ownerEmail}</span>
          <button
            onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800) }}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Executive summary bar ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 flex flex-wrap gap-6 items-center">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Platform</p>
            <p className="text-sm font-semibold text-zinc-200 mt-0.5">The OS for two wheels. White-label motorsport data infrastructure.</p>
          </div>
          <div className="ml-auto flex gap-8 text-right">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Founding</p>
              <p className="text-sm font-bold text-zinc-200">2026</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Stage</p>
              <p className="text-sm font-bold text-lime-400">Pre-Seed</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Founder equity</p>
              <p className="text-sm font-bold text-lime-400">51%+ protected</p>
            </div>
          </div>
        </div>

        {/* ── Primary KPI grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Monthly Recurring Revenue"
            value={fmt$(mrrCents)}
            sub="Active subscriptions only"
            accent
            icon={DollarSign}
          />
          <StatCard
            label="Annual Run Rate"
            value={fmt$(arrCents)}
            sub="MRR × 12"
            icon={TrendingUp}
          />
          <StatCard
            label="Active Teams"
            value={activeCount.toString()}
            sub={`${churnedCount} churned all-time · ${churnRate} churn rate`}
            icon={Users}
          />
          <StatCard
            label="Est. 12-mo LTV"
            value={ltv}
            sub="Per active account"
            icon={Target}
          />
        </div>

        {/* ── Revenue timeline ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Revenue Timeline</h2>
              <p className="text-xs text-zinc-600 mt-1">30-day rolling daily MRR contribution</p>
            </div>
            <span className="text-2xl font-black text-lime-400 tabular-nums">{fmt$(mrrCents)}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueTimeline} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3e635" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
                width={48}
              />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#a3e635' }}
                formatter={(v: unknown) => [`$${(v as number).toFixed(2)}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#a3e635"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Tier breakdown + AI economics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tier breakdown */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1">Tier Breakdown</h2>
            <p className="text-xs text-zinc-600 mb-6">Subscribers and MRR contribution by plan</p>
            {tierData.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">No active subscribers yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={tierData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="tier" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={48} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#a1a1aa' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any, name: any) => [name === 'mrr' ? `$${(v as number).toFixed(2)}` : v, name === 'mrr' ? 'MRR' : 'Teams'] as any}
                  />
                  <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                    {tierData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Tier legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {tierData.map((t) => (
                <div key={t.tier} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: t.fill }} />
                  <span className="text-zinc-400 truncate">{t.tier}</span>
                  <span className="ml-auto text-zinc-300 font-bold tabular-nums">{t.count} team{t.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI economics */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-1">AI Economics</h2>
              <p className="text-xs text-zinc-600">Cost vs revenue — the moat metric</p>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-4 flex flex-col gap-1">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">AI Calls</span>
                <span className="text-3xl font-black text-zinc-50 tabular-nums">{aiCallsThisMonth.toLocaleString()}</span>
                <span className="text-xs text-zinc-500">This month</span>
              </div>
              <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-4 flex flex-col gap-1">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">AI Cost</span>
                <span className="text-3xl font-black text-zinc-50 tabular-nums">{fmt$(aiCostCentsThisMonth)}</span>
                <span className="text-xs text-zinc-500">vs {fmt$(mrrCents)} MRR</span>
              </div>
              <div className="rounded-xl bg-lime-400/10 border border-lime-400/30 p-4 flex flex-col gap-1 col-span-2">
                <span className="text-xs text-lime-400 uppercase tracking-wider font-bold">AI Gross Margin</span>
                <span className="text-3xl font-black text-lime-400 tabular-nums">{aiMarginPct}%</span>
                <span className="text-xs text-zinc-500">{fmt$(aiMarginCents)} remaining after AI cost</span>
              </div>
            </div>
            <div className="rounded-xl bg-zinc-800/40 border border-zinc-700/30 p-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                AI is the <strong className="text-zinc-200">retention mechanism</strong>, not a cost center.
                A mechanic with 3 years of work orders on the platform does not leave.
                A rider whose coaching AI knows their entire career does not leave.
                The data compounds.
              </p>
            </div>
          </div>
        </div>

        {/* ── Operating expenses ── */}
        {monthlyExpenses.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Monthly Operating Expenses</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {monthlyExpenses.map((e) => (
                <div key={e.label} className="rounded-xl bg-zinc-800/50 border border-zinc-700/40 p-4">
                  <p className="text-xs text-zinc-500 truncate mb-1">{e.label}</p>
                  <p className="text-xl font-black tabular-nums text-zinc-100">{fmt$(e.cents)}</p>
                </div>
              ))}
              <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/40 p-4">
                <p className="text-xs text-zinc-500 mb-1">Total Expenses</p>
                <p className="text-xl font-black tabular-nums text-zinc-100">
                  {fmt$(monthlyExpenses.reduce((s, e) => s + e.cents, 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Subscriber table ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Active Subscribers</h2>
              <p className="text-xs text-zinc-600 mt-1">{activeCount} paying teams</p>
            </div>
            <span className="text-xs text-zinc-600 hidden sm:block">Sorted by MRR ↓</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Team', 'Owner', 'Tier', 'Status', 'MRR', 'Since'].map((h) => (
                    <th key={h} className="text-left text-xs text-zinc-600 font-bold uppercase tracking-wider pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscribers
                  .sort((a, b) => b.mrr - a.mrr)
                  .map((s, i) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-zinc-200 max-w-[160px] truncate">{s.teamName}</td>
                      <td className="py-3 pr-4 text-zinc-400 max-w-[180px] truncate">{s.ownerEmail ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize"
                          style={{
                            background: `${TIER_COLORS[s.tier] ?? '#52525b'}22`,
                            color: TIER_COLORS[s.tier] ?? '#a1a1aa',
                            border: `1px solid ${TIER_COLORS[s.tier] ?? '#52525b'}44`,
                          }}
                        >
                          {s.tierLabel}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          s.status === 'active' ? 'text-lime-400' : 'text-zinc-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.status === 'active' ? 'bg-lime-400' : 'bg-zinc-600'}`} />
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-black tabular-nums text-zinc-100">{fmt$(s.mrr)}</td>
                      <td className="py-3 text-zinc-500 text-xs">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-600 text-sm">
                      No subscribers yet — they&apos;re coming.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── White-label pipeline ── */}
        <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-lime-400 mb-1">White-Label Pipeline</h2>
              <p className="text-zinc-300 text-sm leading-relaxed max-w-xl">
                The motorcycle product is the proof of concept. The engine licenses to NASCAR, NHRA, drag racing, karting, and rally.
                Each vertical gets its own branded overlay. The infrastructure is identical. Development cost per new sport: near zero.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              {['NASCAR', 'NHRA', 'Karting', 'Rally'].map((sport) => (
                <div key={sport} className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-center">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{sport}</p>
                  <p className="text-xs text-lime-400 font-bold mt-0.5">Target</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs text-zinc-600">
          <span>Motorsport Data · Confidential · {new Date().getFullYear()}</span>
          <span>Auth-gated · Not publicly indexed</span>
        </div>

      </main>
    </div>
  )
}
