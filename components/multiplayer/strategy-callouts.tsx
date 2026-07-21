'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Megaphone, Send } from 'lucide-react'

interface Callout {
  id: string
  coach: string
  message: string
  timestamp: Date
  broadcast: boolean
}

export function StrategyCallouts() {
  const [callouts, setCallouts] = useState<Callout[]>([])
  const [newCallout, setNewCallout] = useState('')

  const handleBroadcast = async () => {
    if (!newCallout.trim()) return

    const callout: Callout = {
      id: Date.now().toString(),
      coach: 'Coach',
      message: newCallout,
      timestamp: new Date(),
      broadcast: true,
    }

    setCallouts([callout, ...callouts])
    setNewCallout('')

    // Post to API
    try {
      await fetch('/api/md-multiplayer/callout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newCallout,
          broadcast: true,
        }),
      })
    } catch (error) {
      console.error('[v0] Broadcast error:', error)
    }
  }

  return (
    <Card className="p-6 bg-slate-950 border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-foreground">Strategy Callouts</h3>
      </div>

      <div className="space-y-3">
        {/* Callout input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCallout}
            onChange={(e) => setNewCallout(e.target.value)}
            placeholder="Broadcast strategy to team..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded text-foreground placeholder:text-muted-foreground text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBroadcast()
            }}
          />
          <Button onClick={handleBroadcast} size="sm" className="gap-2">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>

        {/* Callout list */}
        <div className="max-h-48 overflow-y-auto space-y-2">
          {callouts.length === 0 ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              No callouts yet. Broadcast strategy to your team.
            </div>
          ) : (
            callouts.map((callout) => (
              <div
                key={callout.id}
                className="p-3 rounded-lg bg-blue-950/30 border border-blue-800 text-sm"
              >
                <div className="font-semibold text-blue-300">{callout.coach}</div>
                <div className="text-foreground mt-1">{callout.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {callout.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
