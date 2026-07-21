'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TeamPerformanceData {
  driver: string
  avgLapTime: number
  consistency: number
  improvementTrend: number
}

interface TeamPerformanceProps {
  data?: TeamPerformanceData[]
}

export function TeamPerformance({ data = [] }: TeamPerformanceProps) {
  const mockData = [
    { driver: 'Driver 1', avgLapTime: 62.5, consistency: 92, improvementTrend: 8 },
    { driver: 'Driver 2', avgLapTime: 63.2, consistency: 88, improvementTrend: -2 },
    { driver: 'Driver 3', avgLapTime: 64.1, consistency: 85, improvementTrend: 12 },
  ]

  const displayData = data.length > 0 ? data : mockData

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Average lap time comparison */}
      <Card className="p-6 bg-slate-950 border-slate-800">
        <h3 className="text-lg font-bold mb-4 text-foreground">Average Lap Times</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="driver" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Bar dataKey="avgLapTime" fill="#3b82f6" name="Avg Lap Time (sec)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Consistency and improvement */}
      <div className="space-y-4">
        <Card className="p-6 bg-slate-950 border-slate-800">
          <h3 className="text-lg font-bold mb-4 text-foreground">Consistency Score</h3>
          <div className="space-y-3">
            {displayData.map((driver, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{driver.driver}</span>
                  <span className="text-sm text-muted-foreground">{driver.consistency}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${driver.consistency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-slate-950 border-slate-800">
          <h3 className="text-lg font-bold mb-4 text-foreground">Improvement Trend</h3>
          <div className="space-y-3">
            {displayData.map((driver, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{driver.driver}</span>
                <span
                  className={`text-sm font-bold ${
                    driver.improvementTrend > 0
                      ? 'text-green-400'
                      : driver.improvementTrend < 0
                        ? 'text-red-400'
                        : 'text-muted-foreground'
                  }`}
                >
                  {driver.improvementTrend > 0 ? '+' : ''}{driver.improvementTrend}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
