'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  riderId: string
  riderName: string
  bestLapTime: number
  lastLapTime: number
  currentLap: number
  gapToLeader: number
  pace: 'improving' | 'stable' | 'dropping'
}

export function LiveLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let eventSource: EventSource
    let mounted = true

    const connect = () => {
      eventSource = new EventSource('/api/md-multiplayer/leaderboard/stream')

      eventSource.onmessage = (event) => {
        if (mounted) {
          const { leaderboard } = JSON.parse(event.data)
          setLeaderboard(leaderboard)
          setLoading(false)
        }
      }

      eventSource.onerror = () => {
        if (mounted) {
          setLoading(false)
          eventSource.close()
          // Retry after 3 seconds
          setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      mounted = false
      eventSource?.close()
    }
  }, [])

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading leaderboard...</div>
  }

  return (
    <Card className="p-6 bg-slate-950 border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-bold text-foreground">Live Leaderboard</h2>
      </div>

      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <div
            key={entry.riderId}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-sm">
                {entry.rank}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{entry.riderName}</div>
                <div className="text-xs text-muted-foreground">Lap {entry.currentLap}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-sm font-mono text-foreground">{entry.bestLapTime.toFixed(2)}s</div>
                <div className="text-xs text-muted-foreground">Best Lap</div>
              </div>

              <div className="text-right">
                {entry.gapToLeader > 0 ? (
                  <div className="text-sm text-amber-400">+{entry.gapToLeader.toFixed(2)}s</div>
                ) : (
                  <div className="text-sm text-green-400">Leader</div>
                )}
              </div>

              {entry.pace === 'improving' && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              {entry.pace === 'dropping' && (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
