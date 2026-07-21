'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CohortData {
  source: string
  d7: { retentionPercent: number }
  d30: { retentionPercent: number }
  d90: { retentionPercent: number }
  d365: { retentionPercent: number }
}

export function RetentionChart({ data }: { data: CohortData[] }) {
  const chartData = [
    {
      day: 'D7',
      ...Object.fromEntries(data.map(cohort => [cohort.source, cohort.d7.retentionPercent])),
    },
    {
      day: 'D30',
      ...Object.fromEntries(data.map(cohort => [cohort.source, cohort.d30.retentionPercent])),
    },
    {
      day: 'D90',
      ...Object.fromEntries(data.map(cohort => [cohort.source, cohort.d90.retentionPercent])),
    },
    {
      day: 'D365',
      ...Object.fromEntries(data.map(cohort => [cohort.source, cohort.d365.retentionPercent])),
    },
  ]

  const colors = ['#84cc16', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
        {data.map((cohort, idx) => (
          <Line
            key={cohort.source}
            type="monotone"
            dataKey={cohort.source}
            stroke={colors[idx % colors.length]}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
