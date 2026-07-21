'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, DollarSign, TrendingDown, Download } from 'lucide-react'

interface AnalyticsSummary {
  totalSignups: number
  totalCheckouts: number
  totalRevenueCents: number
  tierDistribution: Record<string, number>
  billingFrequencyDistribution: { annual: number; monthly: number }
  eventsByType: Record<string, number>
}

interface TrendData {
  date: string
  signups: number
  checkouts: number
  revenue: number
}

const TIER_COLORS: Record<string, string> = {
  rookie: '#3b82f6',
  privateer: '#10b981',
  race_team: '#f59e0b',
  factory_rig: '#ef4444',
  wrench: '#8b5cf6',
  agent: '#ec4899',
  coach: '#06b6d4',
}

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/analytics/metrics?startDate=${startDate}&endDate=${endDate}`)
        if (!response.ok) throw new Error('Failed to load analytics')
        const data = await response.json()
        setSummary(data.summary)
        setTrends(data.trends)
      } catch (error) {
        console.error('[v0] Failed to load analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const pieChartData = summary
    ? Object.entries(summary.tierDistribution).map(([tier, count]) => ({
        name: tier,
        value: count,
        color: TIER_COLORS[tier] || '#6b7280',
      }))
    : []

  const billingData = summary
    ? [
        { name: 'Annual', value: summary.billingFrequencyDistribution.annual },
        { name: 'Monthly', value: summary.billingFrequencyDistribution.monthly },
      ]
    : []

  const downloadCSV = () => {
    if (!summary) return

    const csv = [
      ['Analytics Summary'],
      ['Metric', 'Value'],
      ['Total Signups', summary.totalSignups],
      ['Total Checkouts', summary.totalCheckouts],
      ['Total Revenue', formatCurrency(summary.totalRevenueCents)],
      [],
      ['Tier Distribution'],
      ...Object.entries(summary.tierDistribution).map(([tier, count]) => [tier, count]),
      [],
      ['Billing Frequency'],
      ['Annual', summary.billingFrequencyDistribution.annual],
      ['Monthly', summary.billingFrequencyDistribution.monthly],
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-8">
      {/* Date Range & Export */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded text-foreground"
            />
          </div>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#ccff00] text-black rounded font-semibold hover:bg-lime-300 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
      ) : summary ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">Total Signups</span>
                <Users className="w-5 h-5 text-[#ccff00]" />
              </div>
              <p className="text-3xl font-bold">{summary.totalSignups}</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">Checkouts</span>
                <TrendingUp className="w-5 h-5 text-[#ccff00]" />
              </div>
              <p className="text-3xl font-bold">{summary.totalCheckouts}</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-[#ccff00]" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(summary.totalRevenueCents)}</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">Avg Order Value</span>
                <DollarSign className="w-5 h-5 text-[#ccff00]" />
              </div>
              <p className="text-3xl font-bold">
                {summary.totalCheckouts > 0 ? formatCurrency(Math.floor(summary.totalRevenueCents / summary.totalCheckouts)) : '$0.00'}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Signup & Checkout Trends */}
            <div className="bg-background border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Signups & Checkouts Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Line type="monotone" dataKey="signups" stroke="#3b82f6" name="Signups" />
                  <Line type="monotone" dataKey="checkouts" stroke="#34d399" name="Checkouts" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Trend */}
            <div className="bg-background border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Daily Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" fill="#ccff00" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tier Distribution */}
            <div className="bg-background border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Tier Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Billing Frequency */}
            <div className="bg-background border border-border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Billing Frequency</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded">
                  <span className="font-medium">Annual</span>
                  <span className="text-[#ccff00] font-bold">{billingData[0]?.value || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded">
                  <span className="font-medium">Monthly</span>
                  <span className="text-[#ccff00] font-bold">{billingData[1]?.value || 0}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-6 p-4 bg-muted rounded">
                  Annual savings: ~{formatCurrency((billingData[0]?.value || 0) * 99 * 15 / 100)} at 15% discount
                </div>
              </div>
            </div>
          </div>

          {/* Event Breakdown */}
          <div className="bg-background border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Event Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(summary.eventsByType).map(([eventType, count]) => (
                <div key={eventType} className="p-4 bg-muted rounded text-center">
                  <p className="text-muted-foreground text-sm mb-2 capitalize">{eventType.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-[#ccff00]">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No data available</div>
      )}
    </div>
  )
}
