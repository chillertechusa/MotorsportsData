'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Send, Sparkles, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Msg {
  role: 'user' | 'ai'
  text: string
}

const seed: Msg[] = [
  {
    role: 'ai',
    text: 'Crew chief online. Ask me anything from your logged sessions — suspension clickers, tire pressures, ECU maps, or part history for any track you\'ve run.',
  },
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
// Keeps the crew-chief answers readable without a full markdown dependency.
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
        Upgrade to Factory Rig to unlock MD Intel
      </h2>
      <p className="text-zinc-400 leading-relaxed mb-8 text-pretty">
        MD Intel is your AI crew chief — instant recall of every setup, part lifecycle, and track note
        across your entire fleet, powered by Gemini 2.5 Pro. It&apos;s included on the Factory Rig plan.
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

export default function ViewMdIntel() {
  const [messages, setMessages] = useState<Msg[]>(seed)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/md-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      // Backend paywall: a privateer hitting this route directly gets a 403.
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
            : "I don't have that data logged in the system."
      setMessages((m) => [...m, { role: 'ai', text: answer }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: 'Rig offline — could not reach MD Intel. Check your connection and retry.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (locked) return <UpgradePanel />

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide text-zinc-100 leading-tight">MD Intel</h2>
          <p className="text-sm text-zinc-500">Setup recall · part history · track notes</p>
        </div>
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
                  <p className="text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5">MD Intel</p>
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
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-zinc-900 border border-zinc-800 px-5 py-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5">MD Intel</p>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-lime-400" />
                <span className="ml-2 text-sm">Pulling session history…</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-800 p-2">
        <button
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-lime-400 active:bg-zinc-700 transition-colors"
          aria-label="Voice to text"
        >
          <Mic className="h-5 w-5" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send()
          }}
          placeholder="Ask about setups, parts, or track history..."
          className="flex-1 bg-transparent px-2 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
        <button
          onClick={send}
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
