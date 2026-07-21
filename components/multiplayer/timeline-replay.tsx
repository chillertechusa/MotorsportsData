'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

interface TimelineEvent {
  lap: number
  time: number
  driver: string
  event: string
  type: 'position_change' | 'alert' | 'strategy_call' | 'lap_record'
}

interface TimelineReplayProps {
  events?: TimelineEvent[]
}

export function TimelineReplay({ events = [] }: TimelineReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime, setTotalTime] = useState(300) // 5 minutes

  const mockEvents: TimelineEvent[] = [
    { lap: 1, time: 0, driver: 'Driver 1', event: 'Session started', type: 'lap_record' },
    { lap: 2, time: 120, driver: 'Driver 2', event: 'Takes lead', type: 'position_change' },
    { lap: 3, time: 180, driver: 'Driver 1', event: 'Engine temp warning', type: 'alert' },
    { lap: 4, time: 240, driver: 'Coach', event: 'Pit strategy callout', type: 'strategy_call' },
  ]

  const displayEvents = events.length > 0 ? events : mockEvents

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'position_change':
        return 'text-purple-400'
      case 'alert':
        return 'text-red-400'
      case 'strategy_call':
        return 'text-blue-400'
      case 'lap_record':
        return 'text-green-400'
    }
  }

  return (
    <Card className="p-6 bg-slate-950 border-slate-800">
      <h3 className="text-lg font-bold mb-4 text-foreground">Session Timeline</h3>

      {/* Player controls */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className={isPlaying ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentTime(Math.min(totalTime, currentTime + 10))}
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={totalTime}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="text-sm text-muted-foreground font-mono">
          {Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, '0')}
        </div>
      </div>

      {/* Timeline events */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {displayEvents.map((event, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-2 rounded text-sm ${
              event.time <= currentTime ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <div className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${getEventColor(event.type)}`} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground">{event.driver}</div>
              <div className="text-muted-foreground text-xs">{event.event}</div>
              <div className="text-muted-foreground text-xs">
                Lap {event.lap} - {Math.floor(event.time / 60)}:{String(event.time % 60).padStart(2, '0')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
