'use client'

import { useState } from 'react'
import { Send, Loader } from 'lucide-react'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function SetupAIRecommender({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || '')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/md-setup-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          message: input,
          conversationHistory: messages,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, { role: 'assistant', content: data.recommendation }])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Error getting recommendation. Try again.' }])
      }
    } catch (e) {
      console.error('Failed to get recommendation:', e)
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-zinc-100 mb-2">Setup AI Advisor</h1>
          <p className="text-zinc-400">Ask the AI for suspension setup recommendations based on your vehicle and track conditions</p>
        </div>

        {/* Vehicle selector */}
        <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <label className="block text-sm font-mono text-zinc-400 uppercase tracking-widest mb-2">Select Vehicle</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 text-zinc-100 focus:outline-none focus:border-lime-400"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.type}
              </option>
            ))}
          </select>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg mb-6 p-6 overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-zinc-500 mb-4">Ask the AI Advisor any setup questions</p>
                <p className="text-sm text-zinc-600">Examples:</p>
                <ul className="text-sm text-zinc-600 mt-2 space-y-1">
                  <li>"What fork setup works best on sand?"</li>
                  <li>"Should I increase shock compression for harder pack?"</li>
                  <li>"Recommend tire pressure for clay tracks"</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-lime-400 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 text-zinc-100 border border-zinc-700 p-4 rounded-lg flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && !loading) sendMessage()
            }}
            placeholder="Ask a setup question..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-lime-400"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-lime-400 text-zinc-950 p-3 rounded font-black hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  )
}
