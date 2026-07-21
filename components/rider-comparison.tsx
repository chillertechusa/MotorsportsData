'use client'

interface RiderMetrics {
  riderEmail: string
  currentSpeed: number
  bestLap: number
  currentLap: number
  throttleAvg: number
  brakeAvg: number
  engineTempMax: number
  lapDelta?: number
}

interface RiderComparisonProps {
  riders: RiderMetrics[]
  referenceLap?: number
}

export function RiderComparison({ riders, referenceLap = 0 }: RiderComparisonProps) {
  const sortedRiders = [...riders].sort((a, b) => (a.bestLap || Infinity) - (b.bestLap || Infinity))

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Multi-Rider Comparison</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Rider</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Best Lap</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Δ to 1st</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Speed</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Throttle Avg</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Brake Avg</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Engine Max</th>
            </tr>
          </thead>
          <tbody>
            {sortedRiders.map((rider, idx) => {
              const fastestLap = sortedRiders[0]?.bestLap || 0
              const delta = fastestLap && rider.bestLap ? rider.bestLap - fastestLap : 0
              const isLeader = idx === 0

              return (
                <tr
                  key={rider.riderEmail}
                  className={`border-b border-zinc-800 ${isLeader ? 'bg-lime-950/30' : 'hover:bg-zinc-800/50'}`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-semibold text-foreground">
                        {isLeader ? '🥇 ' : ''}
                        {rider.riderEmail.split('@')[0]}
                      </div>
                      <div className="text-xs text-muted-foreground">Lap {rider.currentLap}</div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className={`font-mono font-semibold ${isLeader ? 'text-lime-400' : 'text-blue-400'}`}>
                      {rider.bestLap?.toFixed(2)}s
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className={`font-mono ${delta > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(2)}s
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="font-mono text-yellow-400">{Math.round(rider.currentSpeed)} km/h</div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="font-mono text-blue-400">{Math.round(rider.throttleAvg)}%</div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="font-mono text-orange-400">{Math.round(rider.brakeAvg)}%</div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className={`font-mono ${rider.engineTempMax > 100 ? 'text-red-400' : 'text-green-400'}`}>
                      {Math.round(rider.engineTempMax)}°C
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground mb-1">Total Riders</div>
          <div className="text-2xl font-bold text-lime-400">{riders.length}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Pace Spread</div>
          <div className="text-2xl font-bold text-orange-400">
            {(
              sortedRiders[sortedRiders.length - 1]?.bestLap -
              sortedRiders[0]?.bestLap
            )?.toFixed(2)}s
          </div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Avg Speed</div>
          <div className="text-2xl font-bold text-blue-400">
            {Math.round(riders.reduce((a, r) => a + r.currentSpeed, 0) / riders.length)} km/h
          </div>
        </div>
      </div>
    </div>
  )
}
