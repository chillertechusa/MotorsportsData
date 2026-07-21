'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Download } from 'lucide-react'

interface RaceResult {
  riderName: string
  position: number
  bestLapTime: number
  totalTime: number
  sessionType: string
}

interface PostRaceReplayProps {
  results?: RaceResult[]
  sessionDate?: Date
}

export function PostRaceReplay({ results = [], sessionDate = new Date() }: PostRaceReplayProps) {
  const [selectedRider, setSelectedRider] = useState(0)

  const mockResults: RaceResult[] = [
    { riderName: 'Driver 1', position: 1, bestLapTime: 62.345, totalTime: 1243.2, sessionType: 'Race' },
    { riderName: 'Driver 2', position: 2, bestLapTime: 62.756, totalTime: 1255.8, sessionType: 'Race' },
    { riderName: 'Driver 3', position: 3, bestLapTime: 63.421, totalTime: 1269.3, sessionType: 'Race' },
  ]

  const displayResults = results.length > 0 ? results : mockResults

  return (
    <Card className="p-6 bg-slate-950 border-slate-800">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground">Post-Race Analysis</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {sessionDate.toLocaleDateString()} - Race Results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results table */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-foreground mb-3">Final Results</h4>
          <div className="space-y-2">
            {displayResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRider(idx)}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedRider === idx
                    ? 'bg-blue-900 border border-blue-700'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
                    {result.position}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{result.riderName}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.bestLapTime.toFixed(2)}s best
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed analysis */}
        <div className="lg:col-span-2">
          {displayResults[selectedRider] && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {displayResults[selectedRider].riderName} - Detailed Stats
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-900">
                  <div className="text-xs text-muted-foreground">Finish Position</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {displayResults[selectedRider].position}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900">
                  <div className="text-xs text-muted-foreground">Best Lap Time</div>
                  <div className="text-2xl font-bold text-foreground mt-1 font-mono">
                    {displayResults[selectedRider].bestLapTime.toFixed(2)}s
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900">
                  <div className="text-xs text-muted-foreground">Total Time</div>
                  <div className="text-2xl font-bold text-foreground mt-1 font-mono">
                    {(displayResults[selectedRider].totalTime / 60).toFixed(1)}m
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900">
                  <div className="text-xs text-muted-foreground">Gap to Winner</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                    {selectedRider === 0 ? '—' : (displayResults[selectedRider].totalTime - displayResults[0].totalTime).toFixed(2)}s
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Play className="w-4 h-4" />
                  Watch Replay
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
