'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface LiveCoachChatProps {
  liveSessionId: string
  riderName: string
}

export function LiveCoachChat({ liveSessionId, riderName }: LiveCoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/md-coach-live/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveSessionId,
          question: input,
          riderName,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.recommendation,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('[v0] Coach chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 flex flex-col h-96">
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-lime-400" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Live Coach AI</p>
            <p className="text-xs text-slate-500">Ask questions about {riderName}'s lap</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-sm text-slate-500">
              Ask the coach AI anything about the current lap or setup
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-lime-500/20 border border-lime-500/30 text-lime-100'
                  : 'bg-slate-800 border border-slate-700 text-slate-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-slate-500 mt-1">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-800 p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about setup, pace, or strategy..."
          disabled={loading}
          className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-lime-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
