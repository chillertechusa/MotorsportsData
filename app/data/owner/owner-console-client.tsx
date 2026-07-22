'use client'

import { useState, useTransition } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, Users, TrendingUp, Zap,
  ChevronDown, ChevronUp, Activity,
  CreditCard, Receipt, RefreshCw, Download, Mail, CheckCircle2, XCircle,
  Bell, Search,
} from 'lucide-react'
import type { OwnerFinancials, BillingRow } from '@/app/actions/md-owner'
import { getOwnerFinancials, getBillingHistory, runExpiryAlerts } from '@/app/actions/md-owner'
import { MD_PLAN_LABELS } from '@/lib/md-plans'
import { GrantAccessPanel } from './grant-access-panel'

// ── Helpers ───────────────────────────────────────────────────────────────────

function dollars(cents: number) {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function dollarsRounded(cents: number) {
  return '$' + Math.round(cents / 100).toLocaleString('en-US')
}

const TIER_ACCENT: Record<string, string> = {
  rookie:      'text-lime-400 border-lime-400/30 bg-lime-400/5',
  privateer:   'text-sky-400 border-sky-400/30 bg-sky-400/5',
  race_team:   'text-orange-400 border-orange-400/30 bg-orange-400/5',
  factory_rig: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
}

const TIER_CHART_COLOR: Record<string, string> = {
  rookie:      '#a3e635',
  privateer:   '#38bdf8',
  race_team:   '#fb923c',
  factory_rig: '#facc15',
}

const STATUS_PILL: Record<string, string> = {
  active:   'bg-lime-400/10 text-lime-400 border border-lime-400/20',
  trialing: 'bg-sky-400/10 text-sky-400 border border-sky-400/20',
  inactive: 'bg-zinc-800 text-zinc-500 border border-zinc-700',
  past_due: 'bg-red-400/10 text-red-400 border border-red-400/20',
}

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent = 'lime',
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; accent?: 'lime' | 'sky' | 'orange' | 'yellow' | 'zinc'
}) {
  const accentMap = {
    lime:   'text-lime-400 bg-lime-400/10',
    sky:    'text-sky-400 bg-sky-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    zinc:   'text-zinc-400 bg-zinc-800',
  }
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex items-start gap-4">
      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentMap[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-zinc-50 leading-none">{value}</p>
        {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
      </div>
    </div>
  )
}

// ── Tooltip for chart ──────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="font-bold text-lime-400">${payload[0].value.toFixed(2)}</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function OwnerConsoleClient({
  owner,
  financials: initialFinancials,
}: {
  owner: { email: string; name: string | null }
  financials: OwnerFinancials
}) {
  const [financials, setFinancials] = useState(initialFinancials)
  const [showSubs, setShowSubs] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [billingHistory, setBillingHistory] = useState<BillingRow[] | null>(null)
  const [billingSearch, setBillingSearch] = useState('')
  const [loadingBilling, startBillingTransition] = useTransition()
  const [alertStatus, setAlertStatus] = useState<{ state: 'idle'|'running'|'done'; sent?: number; errors?: string[] }>({ state: 'idle' })
  const [runningAlerts, startAlertTransition] = useTransition()

  function loadBillingHistory() {
    startBillingTransition(async () => {
      const rows = await getBillingHistory()
      setBillingHistory(rows)
    })
  }

  function handleRunAlerts() {
    setAlertStatus({ state: 'running' })
    startAlertTransition(async () => {
      const result = await runExpiryAlerts()
      setAlertStatus({ state: 'done', sent: result.sent, errors: result.errors })
    })
  }
  const [emailTest, setEmailTest] = useState<{ state: 'idle' | 'sending' | 'ok' | 'err'; msg?: string; detail?: string }>({ state: 'idle' })

  async function handleTestEmail() {
    setEmailTest({ state: 'sending' })
    try {
      const res = await fetch('/api/md-owner/test-email', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setEmailTest({ state: 'ok', msg: `Sent to ${data.to} via ${data.from} (key: ${data.apiKeyPrefix})` })
      } else {
        setEmailTest({ state: 'err', msg: data.error, detail: data.detail })
      }
    } catch (e) {
      setEmailTest({ state: 'err', msg: e instanceof Error ? e.message : 'Network error' })
    }
  }

  const totalExpenseCents = financials.monthlyExpenses.reduce((s, e) => s + e.cents, 0)
  const netCents   = financials.mrrCents - totalExpenseCents
  const marginPct  = financials.mrrCents > 0 ? Math.round((netCents / financials.mrrCents) * 100) : 0
  const tierOrder  = ['rookie', 'privateer', 'race_team', 'factory_rig']

  function handleRefresh() {
    startTransition(async () => {
      const fresh = await getOwnerFinancials()
      setFinancials(fresh)
    })
  }

  function handleExport() {
    const lines: string[] = [
      `MOTORSPORT DATA — OWNER FINANCIAL REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      `Revenue reflects real Square subscriptions only (collected).`,
      ``,
      `── KPIs (monthly basis) ──────────────────`,
      `MRR:           ${dollarsRounded(financials.mrrCents)}`,
      `ARR:           ${dollarsRounded(financials.arrCents)}`,
      `Active Teams:  ${financials.activeCount}`,
      `Churned:       ${financials.churnedCount}`,
      `Net Profit:    ${dollarsRounded(netCents)}`,
      `Margin:        ${marginPct}%`,
      ``,
      `── REVENUE BY TIER ───────────────────────`,
      ...tierOrder.map((t) => {
        const bd = financials.tierBreakdown[t]
        const label = MD_PLAN_LABELS[t as keyof typeof MD_PLAN_LABELS] ?? t
        return bd ? `${label.padEnd(16)} ×${bd.count}  ${dollars(bd.mrrCents)}` : ''
      }).filter(Boolean),
      ``,
      `── MONTHLY EXPENSES ──────────────────────`,
      ...financials.monthlyExpenses.map((e) => `${e.label.padEnd(40)} ${dollars(e.cents)}`),
      `${'Total Expenses'.padEnd(40)} ${dollars(totalExpenseCents)}`,
      ``,
      `── SUBSCRIBERS ───────────────────────────`,
      ...financials.subscribers.map((s) =>
        `${s.teamName.padEnd(24)} ${(s.ownerEmail ?? '').padEnd(30)} ${s.tier.padEnd(12)} ${s.status.padEnd(10)} ${s.mrr > 0 ? dollars(s.mrr) : '—'}`
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `md-financials-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">

      {/* Slim topbar — nav lives in the sidebar layout */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="px-6 h-14 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Revenue</p>
            <p
              className="text-zinc-50 font-black uppercase leading-none text-lg"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors font-mono text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
              {isPending ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors font-mono text-xs uppercase tracking-wider"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              onClick={handleTestEmail}
              disabled={emailTest.state === 'sending'}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50 ${
                emailTest.state === 'ok'  ? 'border-emerald-600 text-emerald-400 bg-emerald-950' :
                emailTest.state === 'err' ? 'border-red-700 text-red-400 bg-red-950' :
                'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
              }`}
              title="Send a test email to yourself to verify Resend is wired"
            >
              {emailTest.state === 'sending' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> :
               emailTest.state === 'ok'      ? <CheckCircle2 className="h-3.5 w-3.5" /> :
               emailTest.state === 'err'     ? <XCircle className="h-3.5 w-3.5" /> :
                                               <Mail className="h-3.5 w-3.5" />}
              {emailTest.state === 'sending' ? 'Sending…' :
               emailTest.state === 'ok'      ? 'Email OK' :
               emailTest.state === 'err'     ? 'Email Err' : 'Test Email'}
            </button>
          </div>
        </div>
      </header>

      {/* Email test result banner */}
      {(emailTest.state === 'ok' || emailTest.state === 'err') && (
        <div className={`border-b px-4 py-2.5 flex items-start gap-3 text-sm ${
          emailTest.state === 'ok'
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            : 'bg-red-950/60 border-red-800 text-red-300'
        }`}>
          {emailTest.state === 'ok'
            ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{emailTest.state === 'ok' ? 'Test email sent successfully' : `Resend error: ${emailTest.msg}`}</p>
            {emailTest.msg && emailTest.state === 'ok' && <p className="text-xs opacity-70 mt-0.5 font-mono">{emailTest.msg}</p>}
            {emailTest.detail && <p className="text-xs opacity-70 mt-0.5 font-mono truncate">{emailTest.detail}</p>}
          </div>
          <button onClick={() => setEmailTest({ state: 'idle' })} className="text-current opacity-50 hover:opacity-100 shrink-0">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">

        {/* KPI strip */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Live Metrics</h2>
            <span
              className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-lime-500/40 bg-lime-500/10 text-lime-400"
              title="Real collected revenue from active Square subscriptions. Seeded/test teams are excluded, so this starts at $0 and grows on the first real checkout."
            >
              Collected · Live
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="MRR" value={dollarsRounded(financials.mrrCents)} sub={`ARR ${dollarsRounded(financials.arrCents)}`} icon={DollarSign} accent="lime" />
            <StatCard label="Net Profit" value={dollarsRounded(netCents)} sub={`${marginPct}% margin`} icon={TrendingUp} accent={marginPct >= 50 ? 'lime' : marginPct >= 20 ? 'orange' : 'sky'} />
            <StatCard label="Active Teams" value={String(financials.activeCount)} sub={`${financials.churnedCount} churned`} icon={Users} accent="sky" />
            <StatCard label="AI Calls Est." value={financials.aiCallsThisMonth.toLocaleString()} sub={`${dollars(financials.aiCostCentsThisMonth)} cost`} icon={Cpu} accent="orange" />
          </div>
        </section>

        {/* 30-day revenue area chart */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-lime-400" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">30-Day Revenue</h3>
            </div>
            <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">Daily rate · active subs</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financials.revenueTimeline} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a3e635" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false} axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#a3e635" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Two-col: P&L + tier breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Monthly P&L */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Receipt className="h-4 w-4 text-zinc-400" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">Monthly P&amp;L</h3>
            </div>

            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-mono">Revenue</p>
            {tierOrder.map((tier) => {
              const bd = financials.tierBreakdown[tier]
              if (!bd) return null
              const label = MD_PLAN_LABELS[tier as keyof typeof MD_PLAN_LABELS] ?? tier
              return (
                <div key={tier} className="flex items-center justify-between py-1.5">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${TIER_ACCENT[tier] ?? 'text-zinc-400 border-zinc-700'}`}>
                    {label} ×{bd.count}
                  </span>
                  <span className="text-sm font-bold text-zinc-100">{dollars(bd.mrrCents)}</span>
                </div>
              )
            })}
            <div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between mb-5">
              <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Total Revenue</span>
              <span className="text-base font-black text-lime-400">{dollars(financials.mrrCents)}</span>
            </div>

            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-mono">Expenses</p>
            {financials.monthlyExpenses.map((exp) => (
              <div key={exp.label} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-zinc-400">{exp.label}</span>
                <span className={`text-sm font-bold ${exp.cents === 0 ? 'text-zinc-600' : 'text-red-400'}`}>
                  {exp.cents === 0 ? '—' : dollars(exp.cents)}
                </span>
              </div>
            ))}
            <div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between">
              <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Total Expenses</span>
              <span className="text-base font-black text-red-400">{dollars(totalExpenseCents)}</span>
            </div>

            <div className={`mt-4 rounded-xl p-4 flex justify-between items-center ${netCents >= 0 ? 'bg-lime-400/10 border border-lime-400/20' : 'bg-red-400/10 border border-red-400/20'}`}>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">Net Profit</span>
              <div className="text-right">
                <p className={`text-2xl font-black ${netCents >= 0 ? 'text-lime-400' : 'text-red-400'}`}>{dollars(netCents)}</p>
                <p className="text-xs text-zinc-500">{marginPct}% margin</p>
              </div>
            </div>
          </div>

          {/* Tier breakdown + AI cost model */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="h-4 w-4 text-zinc-400" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">Tier Breakdown</h3>
            </div>

            {tierOrder.map((tier) => {
              const bd    = financials.tierBreakdown[tier]
              const label = MD_PLAN_LABELS[tier as keyof typeof MD_PLAN_LABELS] ?? tier
              const count = bd?.count ?? 0
              const mrrCents = bd?.mrrCents ?? 0
              const pct   = financials.mrrCents > 0 ? Math.round((mrrCents / financials.mrrCents) * 100) : 0
              return (
                <div key={tier} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${TIER_ACCENT[tier] ?? 'text-zinc-400 border-zinc-700'}`}>{label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-zinc-100">{dollars(mrrCents)}</span>
                      <span className="text-xs text-zinc-500 ml-2">{count} team{count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: TIER_CHART_COLOR[tier] ?? '#a3e635' }} />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{pct}% of MRR</p>
                </div>
              )
            })}

            {/* Cost allocation grid */}
            <div className="mt-6 pt-5 border-t border-zinc-800">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">Cost Allocation</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'AI Costs', cents: financials.aiCostCentsThisMonth, color: 'text-orange-400' },
                  { label: 'Fixed',    cents: financials.monthlyExpenses.filter(e => !e.label.includes('Gemini') && !e.label.includes('Square')).reduce((s, e) => s + e.cents, 0), color: 'text-sky-400' },
                  { label: 'Gross Profit', cents: netCents, color: netCents >= 0 ? 'text-lime-400' : 'text-red-400' },
                ].map((item) => {
                  const pct = financials.mrrCents > 0 ? Math.abs(Math.round((item.cents / financials.mrrCents) * 100)) : 0
                  return (
                    <div key={item.label} className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-center">
                      <p className={`text-lg font-black ${item.color}`}>{pct}%</p>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">{item.label}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{dollarsRounded(item.cents)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI model detail */}
            <div className="mt-5 pt-5 border-t border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-3.5 w-3.5 text-orange-400" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">AI Cost Model</p>
              </div>
              <div className="space-y-1.5">
                {[
                  ['Model', 'gemini-2.5-pro'],
                  ['Cost/call (est)', '~$0.003'],
                  ['Factory Rig teams', String(financials.tierBreakdown['factory_rig']?.count ?? 0)],
                  ['Est calls/mo (5/day)', financials.aiCallsThisMonth.toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-zinc-400">{k}</span>
                    <span className="font-mono text-zinc-300">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold border-t border-zinc-800 pt-2">
                  <span className="text-zinc-300">Est AI cost/mo</span>
                  <span className="text-orange-400">{dollars(financials.aiCostCentsThisMonth)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriber table */}
        <section>
          <button
            onClick={() => setShowSubs((v) => !v)}
            className="flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5" />
            All Subscribers ({financials.subscribers.length})
            {showSubs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showSubs && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left">
                      {['Team', 'Owner Email', 'Tier', 'Status', 'MRR', 'Joined'].map((h) => (
                        <th key={h} className={`px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-normal ${h === 'MRR' ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {financials.subscribers.map((sub) => (
                      <tr key={sub.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-zinc-100">{sub.teamName}</td>
                        <td className="px-5 py-3.5 text-zinc-400 text-xs font-mono">{sub.ownerEmail ?? '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${TIER_ACCENT[sub.tier] ?? 'text-zinc-400 border-zinc-700 bg-transparent'}`}>
                            {MD_PLAN_LABELS[sub.tier as keyof typeof MD_PLAN_LABELS] ?? sub.tier}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded capitalize ${STATUS_PILL[sub.status] ?? STATUS_PILL.inactive}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-zinc-100">{sub.mrr > 0 ? dollars(sub.mrr) : '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-zinc-500">
                          {sub.createdAt ? new Date(sub.createdAt).toUTCString().split(' ').slice(1, 4).join(' ') : '—'}
                        </td>
                      </tr>
                    ))}
                    {financials.subscribers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-zinc-600 text-sm">
                          No subscribers yet. Go get that first sale.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-zinc-800">
                {financials.subscribers.map((sub) => (
                  <div key={sub.id} className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-zinc-100">{sub.teamName}</p>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border shrink-0 ${TIER_ACCENT[sub.tier] ?? 'text-zinc-400 border-zinc-700'}`}>
                        {MD_PLAN_LABELS[sub.tier as keyof typeof MD_PLAN_LABELS] ?? sub.tier}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono">{sub.ownerEmail ?? '—'}</p>
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded capitalize ${STATUS_PILL[sub.status] ?? STATUS_PILL.inactive}`}>{sub.status}</span>
                      <span className="font-bold text-zinc-100">{sub.mrr > 0 ? dollars(sub.mrr) : '—'}</span>
                    </div>
                  </div>
                ))}
                {financials.subscribers.length === 0 && (
                  <p className="p-6 text-center text-zinc-600 text-sm">No subscribers yet.</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Billing history */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Billing History</h2>
            {!billingHistory && (
              <button
                onClick={loadBillingHistory}
                disabled={loadingBilling}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {loadingBilling ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Receipt className="h-3 w-3" />}
                {loadingBilling ? 'Loading…' : 'Load History'}
              </button>
            )}
            {billingHistory && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
                <input
                  value={billingSearch}
                  onChange={(e) => setBillingSearch(e.target.value)}
                  placeholder="Search team or email…"
                  className="bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 w-52"
                />
              </div>
            )}
          </div>
          {billingHistory === null ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-10 text-center">
              <Receipt className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">Click &ldquo;Load History&rdquo; to see all billing records.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900">
                    {['Team', 'Email', 'Plan', 'Amount', 'Period Start', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {billingHistory
                    .filter((r) => {
                      const q = billingSearch.toLowerCase()
                      return !q || r.teamName.toLowerCase().includes(q) || (r.email ?? '').toLowerCase().includes(q)
                    })
                    .map((row) => (
                      <tr key={row.teamId} className="bg-zinc-900/30 hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-semibold text-zinc-200">{row.teamName}</td>
                        <td className="px-5 py-3.5 text-xs text-zinc-400">{row.email ?? '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {row.tierLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-bold text-lime-400">
                          {dollars(row.amountCents)}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-500">
                          {row.date ? new Date(row.date).toUTCString().split(' ').slice(1, 4).join(' ') : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            row.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {billingHistory.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-600 text-sm">No billing records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Expiry alerts */}
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-4">Plan Expiry Alerts</h2>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-zinc-200 mb-1">Send 7-day expiry warnings</p>
              <p className="text-xs text-zinc-500">Emails every active team whose plan expires within 7 days. Only fires once per team per expiry cycle.</p>
              {alertStatus.state === 'done' && (
                <p className={`text-xs mt-2 font-semibold ${alertStatus.errors?.length ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {alertStatus.sent} email{alertStatus.sent !== 1 ? 's' : ''} sent
                  {alertStatus.errors?.length ? ` · ${alertStatus.errors.length} error${alertStatus.errors.length !== 1 ? 's' : ''}` : ''}
                </p>
              )}
            </div>
            <button
              onClick={handleRunAlerts}
              disabled={runningAlerts || alertStatus.state === 'running'}
              className="flex items-center gap-2 h-9 px-5 rounded-xl bg-amber-500/10 border border-amber-600/40 text-amber-400 hover:bg-amber-500/20 font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {runningAlerts ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
              {runningAlerts ? 'Sending…' : 'Run Alerts'}
            </button>
          </div>
        </section>

        {/* Grant access */}
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-4">Access Control</h2>
          <GrantAccessPanel />
        </section>

      </main>
    </div>
  )
}
