'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Compass, Lock, ArrowRight, CalendarCheck, HeartPulse, DollarSign, Brain, ChevronDown, ChevronUp, Bike, Activity, Wallet, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { isRaceTeamOrAbove } from '@/lib/md-tiers'

interface Msg {
  role: 'user' | 'ai'
  text: string
}

interface ContextSummary {
  fleet: string[]
  sessionCount: number
  lastSessionTrack: string | null
  nextEvent: { title: string; date: string; type: string } | null
  readiness: { date: string; hrv: number | null; energy: number | null; fatigue: number | null } | null
  mental: { mood: number | null; confidence: number | null; anxiety: number | null } | null
  seasonSpendDollars: number
  activeSponsors: number
  upcomingEventCount: number
  hasNutrition: boolean
  injuryCount: number
}

function CoachContextBrief() {
  const [ctx, setCtx] = useState<ContextSummary | null>(null)
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (loaded) return
    try {
      const res = await fetch('/api/md-coach-context')
      const data = await res.json()
      if (data.success) setCtx(data.summary)
      setLoaded(true)
    } catch { setLoaded(true) }
  }, [loaded])

  useEffect(() => { load() }, [load])

  const items = ctx ? [
    { icon: Bike, label: 'Fleet', value: ctx.fleet.length ? ctx.fleet.join(', ') : 'No vehicles', filled: ctx.fleet.length > 0 },
    { icon: Activity, label: 'Sessions', value: ctx.sessionCount ? `${ctx.sessionCount} recent${ctx.lastSessionTrack ? ` · last at ${ctx.lastSessionTrack}` : ''}` : 'No sessions logged', filled: ctx.sessionCount > 0 },
    { icon: HeartPulse, label: 'Readiness', value: ctx.readiness ? `HRV ${ctx.readiness.hrv ?? '?'} · Energy ${ctx.readiness.energy ?? '?'}/100` : 'No check-in today', filled: !!ctx.readiness },
    { icon: Brain, label: 'Mental', value: ctx.mental ? `Mood ${ctx.mental.mood ?? '?'}/10 · Confidence ${ctx.mental.confidence ?? '?'}/10` : 'No check-in logged', filled: !!ctx.mental },
    { icon: Wallet, label: 'Finances', value: ctx.seasonSpendDollars > 0 ? `$${ctx.seasonSpendDollars.toLocaleString()} season spend · ${ctx.activeSponsors} sponsor${ctx.activeSponsors !== 1 ? 's' : ''}` : 'No expenses logged', filled: ctx.seasonSpendDollars > 0 },
    { icon: CalendarCheck, label: 'Schedule', value: ctx.nextEvent ? `Next: ${ctx.nextEvent.title}` : 'No upcoming events', filled: !!ctx.nextEvent },
    ...(ctx.injuryCount > 0 ? [{ icon: AlertCircle, label: 'Injuries', value: `${ctx.injuryCount} active injury${ctx.injuryCount > 1 ? ' histories' : ''}`, filled: true }] : []),
  ] : []

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">What your coach knows</span>
          {ctx && (
            <span className="text-xs text-zinc-600">
              · {items.filter(i => i.filled).length}/{items.length} data sources active
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
      </button>

      {open && (
        <div className="border-t border-zinc-800 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {!loaded ? (
            <div className="col-span-2 space-y-2">
              {[80, 65, 50].map(w => <div key={w} className="h-3 rounded-full bg-zinc-800 animate-pulse" style={{ width: `${w}%` }} />)}
            </div>
          ) : items.map(({ icon: Icon, label, value, filled }) => (
            <div key={label} className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 border ${filled ? 'border-zinc-700/50 bg-zinc-800/40' : 'border-zinc-800/50 bg-transparent opacity-50'}`}>
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${filled ? 'text-lime-400' : 'text-zinc-600'}`} />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
                <p className="text-sm text-zinc-300 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const seed: Msg[] = [
  {
    role: 'ai',
    text: "Coach here. I've got your whole program in front of me — bike, body, mind, and money. Ask me about race prep, your readiness, where the season money is going, or what to focus on next.",
  },
]

const QUICK_PROMPTS: { label: string; icon: typeof CalendarCheck; prompt: string }[] = [
  {
    label: 'Race day prep',
    icon: CalendarCheck,
    prompt: 'Walk me through my prep plan for my next event — setup, readiness, mental, and nutrition.',
  },
  {
    label: 'How am I trending?',
    icon: HeartPulse,
    prompt: "Look at my recent readiness, mental check-ins, and any active injuries. How am I trending and what should I adjust?",
  },
  {
    label: 'Season money check',
    icon: DollarSign,
    prompt: 'Give me an honest read on my season spend, cost-per-result, and whether my sponsors are pulling their weight.',
  },
  {
    label: 'What do I focus on?',
    icon: Brain,
    prompt: 'Across everything you can see, what is the single most important thing I should focus on this week?',
  },
]

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-zinc-50">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function FormattedAnswer({ text }: { text: string }) {
  const lines = text.split('\n').map((l) => l.trim())
  const blocks: React.ReactNode[] = []
  let bullets: string[] = []

  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc space-y-1 pl-5 my-1.5">
          {bullets.map((b, i) => (
            <li key={i}>{renderInline(b)}</li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }

  for (const line of lines) {
    if (!line) {
      flush()
      continue
    }
    const bulletMatch = line.match(/^[*-]\s+(.*)$/)
    if (bulletMatch) {
      bullets.push(bulletMatch[1])
    } else {
      flush()
      blocks.push(
        <p key={`p-${blocks.length}`} className="my-1 first:mt-0 last:mb-0">
          {renderInline(line)}
        </p>,
      )
    }
  }
  flush()
  return <>{blocks}</>
}

function UpgradePanel() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] max-w-lg mx-auto text-center px-4">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 mb-6">
        <Lock className="h-8 w-8" />
      </span>
      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-50 mb-3 text-balance">
        Unlock your Race Coach
      </h2>
      <p className="text-zinc-400 leading-relaxed mb-8 text-pretty">
        Race Coach is your AI pocket coach — it reads your bike setup, race schedule, readiness,
        nutrition, mental check-ins, injuries, and season finances to give one connected game plan.
        Included on Race Team and Factory Rig.
      </p>
      <Link
        href="/data/pricing"
        className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wide text-base active:bg-lime-300 transition-colors"
      >
        See Plans <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  )
}

export default function ViewCoach({ tier }: { tier?: string }) {
  const [messages, setMessages] = useState<Msg[]>(seed)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Client-side gate for instant UX; the route enforces the real paywall.
  if (tier && !isRaceTeamOrAbove(tier)) return <UpgradePanel />
  if (locked) return <UpgradePanel />

  async function send(text: string) {
    const q = text.trim()
    if (!q || loading) return
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/md-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      })
      if (res.status === 403) {
        setLocked(true)
        return
      }
      const data = await res.json()
      const answer =
        data.success && data.answer
          ? data.answer
          : data.error
            ? `Coach is offline: ${data.error}`
            : 'I could not pull your program just now — try again in a moment.'
      setMessages((m) => [...m, { role: 'ai', text: answer }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'Connection dropped — could not reach your coach. Check your signal and retry.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const showQuickPrompts = messages.length <= 1

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-zinc-100 leading-tight">Race Coach</h2>
          <p className="text-sm text-zinc-500">Bike · body · mind · money — one game plan</p>
        </div>
      </div>

      <div className="mb-3">
        <CoachContextBrief />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3.5 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-lime-400 text-zinc-950 font-medium rounded-br-md whitespace-pre-line'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-md'
              }`}
            >
              {m.role === 'ai' ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5">Race Coach</p>
                  <div className="text-sm sm:text-base">
                    <FormattedAnswer text={m.text} />
                  </div>
                </>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}

        {showQuickPrompts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {QUICK_PROMPTS.map((qp) => {
              const Icon = qp.icon
              return (
                <button
                  key={qp.label}
                  onClick={() => send(qp.prompt)}
                  disabled={loading}
                  className="flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-left active:bg-zinc-800 transition-colors disabled:opacity-40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-bold text-zinc-100">{qp.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-zinc-900 border border-zinc-800 px-5 py-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5">Race Coach</p>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400" />
                <span className="ml-2 text-sm">Reading your whole program…</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send(input)
          }}
          placeholder="Ask your coach anything..."
          className="flex-1 bg-transparent px-3 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
        <button
          onClick={() => send(input)}
          disabled={loading}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-zinc-950 active:bg-lime-300 transition-colors disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
