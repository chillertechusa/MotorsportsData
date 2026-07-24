'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, CalendarDays, ClipboardList, FileText,
  BarChart3, Zap, ArrowRight, Clock, CheckCircle2,
  TrendingUp, DollarSign, Brain, Target, Dumbbell, ChevronRight,
} from 'lucide-react'

// ── Static mock data for the product preview ─────────────────────────────────

const MOCK_ATHLETES = [
  { name: 'Tyler Ramirez',  discipline: 'MX / SX',  cls: '250 Pro',    track: 'Milestone MX',    rating: 4 },
  { name: 'Jade Kovacs',    discipline: 'MX / SX',  cls: '450 Am',     track: 'Glen Helen',       rating: 4 },
  { name: 'Mason Webb',     discipline: 'Enduro',   cls: 'Pro Open',   track: 'Snowshoe WV',      rating: 3 },
  { name: 'Sienna Cruz',    discipline: 'Karting',  cls: 'ROK Senior', track: 'Calspeed Karting', rating: 5 },
  { name: 'Brody Haines',   discipline: 'MX / SX',  cls: '65cc Youth', track: 'Perris Raceway',   rating: 0 },
]

const MOCK_SESSIONS = [
  { title: 'Tuesday MX — Gate Starts + Rhythm', type: 'Track', when: 'In 2 days',  athletes: 3, status: 'scheduled' },
  { title: 'Video Review — Saturday Qualifying', type: 'Video', when: 'In 4 days', athletes: 2, status: 'scheduled' },
  { title: 'Enduro — Rocky Section Technique',   type: 'Track', when: '3 days ago', athletes: 1, status: 'completed' },
  { title: 'Karting — Sector Time Optimization', type: 'Track', when: '7 days ago', athletes: 1, status: 'completed' },
]

const MOCK_INVOICES = [
  { client: 'Tyler Ramirez', desc: 'MX Private Training — July',    amount: '$800',   status: 'paid'  },
  { client: 'Jade Kovacs',   desc: 'MX Private Training — August',  amount: '$800',   status: 'sent'  },
  { client: 'Sienna Cruz',   desc: 'Performance Academy — Month 1', amount: '$2,400', status: 'paid'  },
  { client: 'Mason Webb',    desc: 'Enduro session + AI debrief',   amount: '$450',   status: 'draft' },
]

const DISC_CHIP: Record<string, string> = {
  'MX / SX': 'text-lime-400 bg-lime-400/10 border-lime-400/20',
  'Enduro':  'text-sky-400 bg-sky-400/10 border-sky-400/20',
  'Karting': 'text-violet-400 bg-violet-400/10 border-violet-400/20',
}
const STATUS_CHIP: Record<string, string> = {
  paid:      'text-lime-400 bg-lime-400/10',
  sent:      'text-amber-400 bg-amber-400/10',
  draft:     'text-zinc-400 bg-zinc-700/50',
  scheduled: 'text-sky-400 bg-sky-400/10',
  completed: 'text-zinc-500 bg-zinc-800/60',
}

// ── Product OS mockup ─────────────────────────────────────────────────────────

function ProductMockup({ tab }: { tab: 'roster' | 'sessions' | 'billing' }) {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900 overflow-hidden shadow-2xl shadow-black/70 select-none">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950/90 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-lime-500/60" aria-hidden="true" />
        <div className="ml-3 flex-1 max-w-sm rounded bg-zinc-800/50 px-3 py-0.5">
          <span className="font-mono text-[10px] text-zinc-500">motorsportsdata.io/data/coach/{tab}</span>
        </div>
        <span className="ml-auto rounded border border-lime-400/20 bg-lime-400/8 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-lime-400">
          Coach Pro
        </span>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: 296 }}>
        {/* Sidebar */}
        <aside className="w-36 shrink-0 border-r border-zinc-800 bg-zinc-950/50 flex flex-col px-2 py-3 gap-0.5">
          <p className="px-2 pb-1.5 font-mono text-[8px] uppercase tracking-widest text-zinc-600">Coach OS</p>
          {[
            { icon: BarChart3,     label: 'Command'  },
            { icon: Users,         label: 'Roster',   active: tab === 'roster'   },
            { icon: CalendarDays,  label: 'Sessions', active: tab === 'sessions' },
            { icon: ClipboardList, label: 'Plans'     },
            { icon: DollarSign,    label: 'Billing',  active: tab === 'billing'  },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-[11px] ${
                active
                  ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                  : 'text-zinc-600 border border-transparent'
              }`}
            >
              <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
              {label}
            </div>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-3 flex flex-col gap-1.5">
          {tab === 'roster' && (
            <>
              <p className="text-[11px] font-semibold text-zinc-300 mb-0.5">Active Roster — 5 athletes</p>
              {MOCK_ATHLETES.map((a) => (
                <div key={a.name} className="flex items-center gap-2 rounded border border-zinc-800/80 bg-zinc-800/25 px-2.5 py-1.5">
                  <div className="h-5 w-5 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center font-bold text-[9px] text-zinc-300">
                    {a.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-zinc-200 leading-none">{a.name}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{a.cls} &middot; {a.track}</p>
                  </div>
                  <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-medium ${DISC_CHIP[a.discipline] ?? 'text-zinc-400 bg-zinc-700/40 border-zinc-600/30'}`}>
                    {a.discipline}
                  </span>
                  {a.rating > 0 && (
                    <span className="shrink-0 font-mono text-[9px] text-amber-400">{'★'.repeat(a.rating)}</span>
                  )}
                </div>
              ))}
            </>
          )}

          {tab === 'sessions' && (
            <>
              <p className="text-[11px] font-semibold text-zinc-300 mb-0.5">Upcoming + Recent</p>
              {MOCK_SESSIONS.map((s) => (
                <div key={s.title} className="flex items-center gap-2 rounded border border-zinc-800/80 bg-zinc-800/25 px-2.5 py-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-zinc-200 leading-none">{s.title}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{s.type} &middot; {s.when} &middot; {s.athletes} athlete{s.athletes !== 1 ? 's' : ''}</p>
                  </div>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${STATUS_CHIP[s.status]}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </>
          )}

          {tab === 'billing' && (
            <>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="rounded border border-lime-400/20 bg-lime-400/8 px-2.5 py-1 text-center">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">This month</p>
                  <p className="font-mono text-sm font-bold text-lime-400">$4,050</p>
                </div>
                <div className="rounded border border-zinc-700/50 bg-zinc-800/30 px-2.5 py-1 text-center">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Outstanding</p>
                  <p className="font-mono text-sm font-bold text-amber-400">$1,250</p>
                </div>
                <div className="rounded border border-zinc-700/50 bg-zinc-800/30 px-2.5 py-1 text-center">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Athletes</p>
                  <p className="font-mono text-sm font-bold text-zinc-200">5</p>
                </div>
              </div>
              {MOCK_INVOICES.map((inv) => (
                <div key={inv.desc} className="flex items-center gap-2 rounded border border-zinc-800/80 bg-zinc-800/25 px-2.5 py-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-zinc-200 leading-none">{inv.client}</p>
                    <p className="truncate text-[9px] text-zinc-500 mt-0.5">{inv.desc}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-zinc-200">{inv.amount}</span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${STATUS_CHIP[inv.status]}`}>
                    {inv.status}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* AI strip */}
      <div className="flex items-center gap-2 border-t border-zinc-800 bg-zinc-950/70 px-4 py-2">
        <Zap className="h-3 w-3 shrink-0 text-lime-400" aria-hidden="true" />
        <p className="text-[10px] text-zinc-400">
          <span className="font-semibold text-lime-400">Rig Doctor — </span>
          {tab === 'roster'   && "Sienna knocked 0.4s off sector 2 last session. Tyler's gate-drop consistency is up 18% this month."}
          {tab === 'sessions' && 'Tuesday session has 3 confirmed. Recommend adding Mason for the enduro warmup — he has a race in 10 days.'}
          {tab === 'billing'  && '$800 due from Jade in 7 days. Mason\'s draft invoice is ready to send — pending your review.'}
        </p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DemoLaunchClient() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'roster' | 'sessions' | 'billing'>('roster')

  async function launch() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/demo/provision', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Provisioning failed — please try again.')
        return
      }
      router.push(data.redirectTo ?? '/data/coach/roster')
    } catch {
      setStatus('error')
      setErrorMsg('Network error — check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/25 bg-lime-400/8 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-lime-400">
            <Zap className="h-3 w-3" aria-hidden="true" />
            Live product — real data — no credit card
          </span>
          <h1
            className="max-w-2xl text-balance text-5xl font-black leading-none tracking-tight md:text-6xl"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
          >
            This is what coaches build on.<br />
            <span className="text-lime-400">Walk in. See it yourself.</span>
          </h1>
          <p className="max-w-xl text-balance text-base leading-relaxed text-zinc-400 md:text-lg">
            One click provisions a real coaching account — 5 named athletes, 4 sessions,
            3 training plans, 5 invoices. You are in the actual product, not a slideshow.
          </p>
        </div>

        {/* ── Tab switcher + OS mockup ── */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-center gap-1" role="tablist" aria-label="Preview section">
            {(['roster', 'sessions', 'billing'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'border border-lime-400/25 bg-lime-400/10 text-lime-400'
                    : 'border border-transparent text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <ProductMockup tab={activeTab} />
        </div>

        {/* ── Launch CTA ── */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={launch}
            disabled={status === 'loading'}
            className="group flex items-center gap-2 rounded-lg bg-lime-400 px-9 py-3.5 text-base font-black tracking-wide text-zinc-950 shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            {status === 'loading' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" aria-hidden="true" />
                Provisioning your account...
              </>
            ) : (
              <>
                Enter the live platform
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </>
            )}
          </button>

          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Takes about 3 seconds. Demo expires in 2 hours.
          </p>

          {status === 'error' && (
            <p role="alert" className="rounded border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs text-red-400">
              {errorMsg}
            </p>
          )}
        </div>
      </section>

      {/* ── What is inside ── */}
      <section className="border-t border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            What you will find inside
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Users,        label: '5 athletes',        sub: 'Real names, disciplines, home tracks' },
              { icon: CalendarDays, label: '4 sessions',        sub: '2 upcoming, 2 completed with AI debrief' },
              { icon: ClipboardList,label: '3 training plans',  sub: 'Physical, technical, and mental blocks' },
              { icon: FileText,     label: '5 invoices',        sub: 'Full billing cycle — paid, sent, draft' },
              { icon: Brain,        label: 'AI on every screen',sub: 'Rig Doctor insights per session' },
              { icon: TrendingUp,   label: '$4,050 MRR',        sub: 'Real month-to-date revenue KPIs' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-center">
                <Icon className="mx-auto mb-2 h-4 w-4 text-lime-400" aria-hidden="true" />
                <p className="text-xs font-semibold text-zinc-200">{label}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-zinc-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Honesty + conversion strip ── */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0 sm:divide-x sm:divide-zinc-800">
            <div className="flex flex-1 items-start gap-3 sm:pr-8">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">What is real</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  Live database. Real auth session. Same routes, queries, and UI as a paying account. No mocks.
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-start gap-3 sm:px-8">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">What is not required</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  No email. No credit card. No form. One click, you are inside.
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-start gap-2 sm:pl-8">
              <p className="text-xs text-zinc-500">Ready to keep it?</p>
              <Link
                href="/checkout/tier?tier=coach_pro&utm_source=demo_bottom"
                className="flex items-center gap-1.5 rounded-lg border border-lime-400/30 bg-lime-400/8 px-4 py-2 text-sm font-semibold text-lime-400 transition-colors hover:bg-lime-400/15"
              >
                Start Coach Pro &mdash; $499/mo
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Broader platform capabilities ── */}
      <section className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            The demo shows the Coach Business OS — the full platform also includes
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Target,   label: 'Telemetry & Lap Data',     sub: 'Device ingest, session replay, channel normalization across all disciplines' },
              { icon: Dumbbell, label: 'Rider Health & Readiness',  sub: 'Physical, mental, nutrition, injury tracking, RTR protocol' },
              { icon: BarChart3,label: 'Race Team Operations',      sub: 'Parts vault, work orders, expenses, payroll, sponsor ROI' },
              { icon: Brain,    label: 'Rig Doctor AI',             sub: 'Setup coaching, debrief analysis, training plan generation, race-day intelligence' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <Icon className="mb-2 h-5 w-5 text-lime-400" aria-hidden="true" />
                <p className="text-sm font-semibold leading-snug text-zinc-200">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} Motorsport Data &mdash; Chiller Tech Support LLC
          </p>
          <div className="flex items-center gap-5">
            <Link href="/legal/privacy" className="text-xs text-zinc-600 transition-colors hover:text-zinc-400">Privacy</Link>
            <Link href="/legal/terms"   className="text-xs text-zinc-600 transition-colors hover:text-zinc-400">Terms</Link>
            <Link href="/account/sign-up?plan=coach_pro" className="flex items-center gap-1 text-xs font-medium text-lime-400 hover:underline">
              Get started <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
