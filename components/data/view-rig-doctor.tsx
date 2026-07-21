'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Truck, Lock, ArrowRight, Wrench } from 'lucide-react'
import Link from 'next/link'

interface Msg {
  role: 'user' | 'ai'
  text: string
}

const seed: Msg[] = [
  {
    role: 'ai',
    text: "Rig Doctor on the line. I've got you covered on the hauler — PM schedules, DPF regens, DEF/SCR, air brakes, tires, fault codes, cold-weather prep, and DOT inspections. Tell me your engine and mileage for the sharpest answers, or just ask what's going on.",
  },
]

const QUICK_PROMPTS = [
  'My DPF light is on and it went into a forced regen — what do I do?',
  'When is my next oil change due and what oil analysis should I pull?',
  'Air pressure is dropping overnight — how do I find the leak?',
  'Steer tire is at 5/32" — am I legal to run this trip?',
  "It's dropping to 10°F tonight — how do I keep from gelling up?",
  'Getting a low DEF quality warning and a derate countdown — help.',
]

// Render inline bold (**text**) within a single line.
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

// Lightweight formatter: handles bullets (*, -), bold, and paragraph spacing.
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
        Upgrade to Factory Rig to unlock Rig Doctor
      </h2>
      <p className="text-zinc-400 leading-relaxed mb-8 text-pretty">
        Rig Doctor is your AI diesel technician for the transporter — PM schedules, DPF/DEF, air brakes,
        tires, fault codes, and DOT compliance, powered by Gemini 2.5 Pro. It&apos;s included on the Factory Rig plan.
      </p>
      <Link
        href="/data/pricing"
        className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-lime-400 text-zinc-950 font-black uppercase tracking-wide text-base active:bg-lime-300 transition-colors"
      >
        See Factory Rig <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  )
}

export default function ViewRigDoctor() {
  const [messages, setMessages] = useState<Msg[]>(seed)
  const [input, setInput] = useState('')
  const [truckInfo, setTruckInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send(promptText?: string) {
    const text = (promptText ?? input).trim()
    if (!text || loading) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/md-rig-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, truckInfo: truckInfo.trim() || undefined }),
      })
      // Backend paywall: a non-Factory account hitting this route directly gets a 403.
      if (res.status === 403) {
        setLocked(true)
        return
      }
      const data = await res.json()
      const answer =
        data.success && data.answer
          ? data.answer
          : data.error
            ? `System error: ${data.error}`
            : 'I could not work that one out — try rephrasing with the engine model and mileage.'
      setMessages((m) => [...m, { role: 'ai', text: answer }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'Rig offline — could not reach Rig Doctor. Check your connection and retry.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (locked) return <UpgradePanel />

  const showQuickPrompts = messages.length <= 1 && !loading

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
          <Truck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-zinc-100 leading-tight">Rig Doctor</h2>
          <p className="text-sm text-zinc-500">Diesel maintenance · DPF/DEF · air brakes · DOT</p>
        </div>
      </div>

      {/* Truck details — grounds the AI's answers */}
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2">
        <Wrench className="h-4 w-4 shrink-0 text-zinc-500" />
        <input
          value={truckInfo}
          onChange={(e) => setTruckInfo(e.target.value)}
          placeholder="Your rig (optional): e.g. 2019 Freightliner Cascadia, DD15, 480k mi"
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
        />
      </div>

      {/* Messages */}
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
                  <p className="text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5">Rig Doctor</p>
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

        {/* Quick-prompt chips — only on the fresh screen */}
        {showQuickPrompts && (
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-left text-sm text-zinc-300 hover:border-lime-400/50 hover:text-zinc-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-zinc-900 border border-zinc-800 px-5 py-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5">Rig Doctor</p>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400" />
                <span className="ml-2 text-sm">Checking the service data…</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send()
          }}
          placeholder="Ask about maintenance, fault codes, air brakes, tires..."
          className="flex-1 bg-transparent px-2 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
        <button
          onClick={() => send()}
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
