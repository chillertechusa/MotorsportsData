'use client'

import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PaceChartData {
  lap: number
  driver1: number
  driver2: number
  driver3?: number
}

interface RacePaceChartProps {
  data: PaceChartData[]
  drivers: Array<{ name: string; color: string }>
}

export function RacePaceChart({ data, drivers }: RacePaceChartProps) {
  return (
    <Card className="p-6 bg-slate-950 border-slate-800">
      <h3 className="text-lg font-bold mb-4 text-foreground">Race Pace Trend</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="lap" stroke="#94a3b8" label={{ value: 'Lap', position: 'insideBottomRight', offset: -5 }} />
          <YAxis stroke="#94a3b8" label={{ value: 'Lap Time (sec)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Legend />

          {drivers.map((driver, idx) => (
            <Line
              key={driver.name}
              type="monotone"
              dataKey={`driver${idx + 1}`}
              stroke={driver.color}
              strokeWidth={2}
              dot={false}
              name={driver.name}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
