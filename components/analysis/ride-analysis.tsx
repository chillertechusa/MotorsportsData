'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Clock, Zap } from 'lucide-react'

const lapTimeData = [
  { lap: 1, time: 52.1 },
  { lap: 2, time: 51.8 },
  { lap: 3, time: 51.5 },
  { lap: 4, time: 51.3 },
  { lap: 5, time: 51.23 },
  { lap: 6, time: 51.4 },
]

const conditionData = [
  { condition: 'Dry', avgTime: 51.2, sessions: 8 },
  { condition: 'Wet', avgTime: 53.1, sessions: 3 },
  { condition: 'Dusty', avgTime: 52.4, sessions: 5 },
]

export function RideAnalysis() {
  return (
    <div className="space-y-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-lime-400" />
          Lap Time Progression
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lapTimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="lap" stroke="#71717a" />
            <YAxis stroke="#71717a" />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
              labelStyle={{ color: '#fafafa' }}
            />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#a3e635"
              dot={{ fill: '#a3e635' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-zinc-400 mt-4">
          Improvement: 0.87s faster over last session. Best lap: <span className="text-lime-400 font-bold">51.23s</span>
        </p>
      </div>

      <div>
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-zinc-400" />
          Performance by Condition
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conditionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="condition" stroke="#71717a" />
            <YAxis stroke="#71717a" />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
              labelStyle={{ color: '#fafafa' }}
            />
            <Bar dataKey="avgTime" fill="#a3e635" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'Fastest Lap', value: '51.23s', color: 'text-lime-400' },
          { icon: TrendingUp, label: 'Improvement', value: '+0.87s', color: 'text-lime-400' },
          { icon: Clock, label: 'Total Time', value: '5:23.4', color: 'text-zinc-300' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-zinc-800 rounded-lg p-4">
            <Icon className="h-4 w-4 text-zinc-400 mb-2" />
            <p className="text-xs text-zinc-500">{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
