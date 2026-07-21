'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CohortData {
  source: string
  cohortSize: number
  expansionRevenue: number
}

export function LtvChart({ data }: { data: CohortData[] }) {
  const chartData = data.map(cohort => ({
    name: cohort.source,
    'Cohort Size': cohort.cohortSize,
    'Expansion Revenue': Math.round(cohort.expansionRevenue / 100), // Convert cents to dollars
  }))

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" label={{ value: 'Teams', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="Cohort Size" fill="#3b82f6" />
          <Bar yAxisId="right" dataKey="Expansion Revenue" fill="#84cc16" />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4">
        {data.map(cohort => (
          <div key={cohort.source} className="rounded-lg border p-4">
            <p className="text-sm font-medium text-muted-foreground">{cohort.source}</p>
            <p className="text-2xl font-bold text-foreground">${(cohort.expansionRevenue / 100).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Expansion from {cohort.cohortSize} teams</p>
          </div>
        ))}
      </div>
    </div>
  )
}
