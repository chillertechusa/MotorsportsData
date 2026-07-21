'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

interface FeatureChatbotProps {
  feature: 'fitness' | 'mental' | 'coach' | 'session' | 'setup' | 'parts' | 'spec' | 'schedule' | 'finances'
  title: string
}

const FEATURE_CONTEXT: Record<string, string> = {
  fitness: 'You are a fitness and readiness coach. Help the user understand their HRV, sleep, energy, and recovery metrics. Give actionable advice on training load and rest days.',
  mental: 'You are a sports psychologist and mental performance coach. Help the user manage race anxiety, build confidence, and maintain mental edge during competition.',
  coach: 'You are a racing coach. Answer questions about setup, strategy, riding technique, and race planning. Help riders prepare for their next event.',
  session: 'You are a session data analyst. Help riders understand their session logs, lap times, feedback, and how to improve performance.',
  setup: 'You are a suspension and setup expert. Answer questions about suspension settings, geometry, tuning, and how setup affects bike handling.',
  parts: 'You are a parts and maintenance specialist. Help riders and mechanics understand parts inventory, maintenance schedules, and when to replace components.',
  spec: 'You are an OEM data specialist. Answer questions about bike specifications, stock vs upgraded components, and tech comparisons.',
  schedule: 'You are a race calendar and logistics expert. Help teams plan their season, manage race schedules, and coordinate logistics.',
  finances: 'You are a motorsports business advisor. Help track budgets, sponsorship, expenses, and financial planning for racing teams.',
}

export default function FeatureChatbot({ feature, title }: FeatureChatbotProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hey! I'm here to help with ${title}. Ask me anything about ${title.toLowerCase()}.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/md-feature-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          messages: [...messages, { role: 'user', text: userMessage }],
        }),
      })

      if (!res.ok) throw new Error('Chat failed')

      const reader = res.body?.getReader()
      let aiResponse = ''

      if (reader) {
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          aiResponse += decoder.decode(value)
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: aiResponse }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I had trouble understanding that. Try again?' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-8 right-8 z-40 h-14 w-14 rounded-full bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-8 z-50 w-96 max-w-[calc(100vw-32px)] rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col h-[32rem]">
          {/* Header */}
          <div className="border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lime-400">Feature Help</p>
              <p className="text-sm text-zinc-300 mt-1">{title} Assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-lime-400/20 text-lime-100 border border-lime-400/30'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-800 px-5 py-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for help..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-lime-400 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-lg bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 flex items-center justify-center transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
