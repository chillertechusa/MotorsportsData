'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Stethoscope, Send, Loader2, DollarSign, ShieldAlert,
  TrendingUp, Sparkles, RefreshCw,
} from 'lucide-react'
import type { CeoSnapshot } from '@/lib/ceo-doctor'

type Message = { role: 'user' | 'assistant'; text: string }

const SIGNAL_STYLE: Record<string, string> = {
  good: 'text-lime-400 border-lime-400/40 bg-lime-400/10',
  watch: 'text-amber-400 border-amber-400/40 bg-amber-400/10',
  risk: 'text-red-400 border-red-400/40 bg-red-400/10',
  'no data': 'text-zinc-500 border-zinc-700 bg-zinc-800/50',
}

const SUGGESTED = [
  'What is the single most important thing I should focus on this week?',
  'Where is my biggest revenue risk right now?',
  'Is the data moat growing fast enough to matter?',
  'Give me a one-paragraph board update.',
]

export function CeoDoctorClient({
  initialSnapshot,
  ownerName,
}: {
  initialSnapshot: CeoSnapshot
  ownerName: string
}) {
  const [snapshot, setSnapshot] = useState<CeoSnapshot>(initialSnapshot)
  const [refreshing, setRefreshing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `I'm the CEO Doctor. I'm reading your live financials, all four Advisor agents, and the Sentinel Squad right now. Ask me anything about the state of the business — or tap a question below to start.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  async function refreshSnapshot() {
    setRefreshing(true)
    try {
      const res = await fetch('/api/md-owner/ceo-doctor', { method: 'GET' })
      if (res.ok) setSnapshot(await res.json())
    } catch {
      /* keep existing snapshot */
    } finally {
      setRefreshing(false)
    }
  }

  async function send(text: string) {
    const q = text.trim()
    if (!q || loading) return
    setInput('')
    const next = [...messages, { role: 'user' as const, text: q }]
    setMessages([...next, { role: 'assistant', text: '' }])
    setLoading(true)

    try {
      const res = await fetch('/api/md-owner/ceo-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.ok || !res.body) throw new Error('request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', text: acc }
          return copy
        })
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = {
          role: 'assistant',
          text: 'I hit an error reaching the model. Try again in a moment.',
        }
        return copy
      })
    } finally {
      setLoading(false)
    }
  }

  const f = snapshot.financials
  const openSentinels = snapshot.sentinels.totalUnacknowledged

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/data/owner" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" />
              Owner Console
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">
              <Stethoscope className="h-3.5 w-3.5" />
              CEO Doctor
            </span>
          </div>
          <button
            onClick={refreshSnapshot}
            disabled={refreshing}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors font-mono text-xs uppercase tracking-wider disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        {/* Intro */}
        <div>
          <h1 className="text-2xl font-bold text-balance">
            Good to see you, {ownerName}.
          </h1>
          <p className="text-zinc-400 mt-1 text-pretty">
            Your live command read across finance, advisors, and security — grounded in real platform data.
          </p>
        </div>

        {/* Snapshot cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SnapshotCard icon={DollarSign} accent="lime" label="MRR" value={f.mrr} sub={`ARR ${f.arr}`} badge="Modeled" />
          <SnapshotCard icon={TrendingUp} accent={f.marginPct >= 50 ? 'lime' : 'amber'} label="Net / mo" value={f.netProfitMonthly} sub={`${f.marginPct}% margin`} />
          <SnapshotCard icon={Sparkles} accent="sky" label="Teams" value={String(f.activeTeams)} sub={`${f.freeRiders} free · ${f.churnedTeams} churned`} />
          <SnapshotCard icon={ShieldAlert} accent={openSentinels > 0 ? 'amber' : 'lime'} label="Sentinel Alerts" value={String(openSentinels)} sub={`${snapshot.sentinels.totalCritical} critical`} />
        </section>

        {/* Advisor signal strip */}
        <section className="flex flex-wrap gap-2">
          {snapshot.advisors.map((a) => (
            <span
              key={a.key}
              title={a.headline}
              className={`font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded border ${SIGNAL_STYLE[a.signal] ?? SIGNAL_STYLE['no data']}`}
            >
              {a.label.replace(' Advisor', '')}: {a.signal}
            </span>
          ))}
        </section>

        {/* Chat */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col h-[32rem]">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-lime-400/15 text-lime-50 border border-lime-400/30'
                      : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                  }`}
                >
                  {m.text || (loading && i === messages.length - 1 ? (
                    <span className="flex items-center gap-2 text-zinc-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Reading the platform…
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions (only before first question) */}
          {messages.length === 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs text-zinc-400 hover:text-lime-300 border border-zinc-700 hover:border-lime-400/50 rounded-lg px-3 py-2 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-zinc-800 px-4 py-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send(input)
              }}
              placeholder="Ask the CEO Doctor…"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-lime-400 transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-lg bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 flex items-center justify-center transition-colors"
              aria-label="Send"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </section>

        <p className="text-center text-[11px] text-zinc-600 font-mono">
          Powered by Claude Opus · grounded in live platform data · financials are modeled, not collected
        </p>
      </main>
    </div>
  )
}

function SnapshotCard({
  icon: Icon, accent, label, value, sub, badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  accent: 'lime' | 'amber' | 'sky'
  label: string
  value: string
  sub: string
  badge?: string
}) {
  const accentMap = {
    lime: 'text-lime-400 bg-lime-400/10',
    amber: 'text-amber-400 bg-amber-400/10',
    sky: 'text-sky-400 bg-sky-400/10',
  }
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        {badge && (
          <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400">
            {badge}
          </span>
        )}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-3">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
    </div>
  )
}
