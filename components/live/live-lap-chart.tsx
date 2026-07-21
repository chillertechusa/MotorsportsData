'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface LapTimeData {
  lap: number
  lapTime: number
  bestLapTime: number
}

interface LiveLapChartProps {
  data: LapTimeData[]
  bestLapTime: number
}

export function LiveLapChart({ data, bestLapTime }: LiveLapChartProps) {
  const delta = data.length > 0 ? data[data.length - 1].lapTime - bestLapTime : 0

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Lap Time Trend</h3>
          <p className="text-2xl font-black text-slate-50">{data[data.length - 1]?.lapTime.toFixed(2)}s</p>
          <p className={`text-sm ${delta > 0 ? 'text-red-400' : 'text-lime-400'}`}>
            {delta > 0 ? '+' : ''}{delta.toFixed(2)}s vs best
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Best Lap</p>
          <p className="text-2xl font-black text-lime-400">{bestLapTime.toFixed(2)}s</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="lap" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="lapTime"
            stroke="#EF4444"
            dot={false}
            strokeWidth={2}
            name="Lap Time"
          />
          <Line
            type="monotone"
            dataKey="bestLapTime"
            stroke="#22C55E"
            dot={false}
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Best Lap"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
