'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface ApiUsageStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgResponseTime: number
  requestsThisMonth: number
  currentRateLimit: number
}

interface WebhookStats {
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  avgDeliveryTime: number
  retryRate: number
  activeWebhooks: number
}

interface HealthMetrics {
  apiStatus: 'healthy' | 'degraded' | 'down'
  webhookStatus: 'healthy' | 'degraded' | 'down'
  uptime: number
  lastIncident: string | null
}

export function PartnerDashboard() {
  const [apiStats, setApiStats] = useState<ApiUsageStats | null>(null)
  const [webhookStats, setWebhookStats] = useState<WebhookStats | null>(null)
  const [health, setHealth] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [apiRes, webhookRes, healthRes] = await Promise.all([
          fetch('/api/v1/partner/stats/api'),
          fetch('/api/v1/partner/stats/webhooks'),
          fetch('/api/v1/partner/health'),
        ])

        if (apiRes.ok) {
          const data = await apiRes.json()
          setApiStats(data.stats)
        }

        if (webhookRes.ok) {
          const data = await webhookRes.json()
          setWebhookStats(data.stats)
        }

        if (healthRes.ok) {
          const data = await healthRes.json()
          setHealth(data.metrics)
        }
      } catch (error) {
        console.error('[Partner Dashboard] Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400'
      case 'degraded':
        return 'text-yellow-400'
      case 'down':
        return 'text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="api">API Usage</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${getStatusColor(health.apiStatus)}`} />
                  API Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{health.apiStatus}</div>
                <p className="text-xs text-muted-foreground mt-1">Uptime: {health.uptime.toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${getStatusColor(health.webhookStatus)}`} />
                  Webhook Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{health.webhookStatus}</div>
                {health.lastIncident && (
                  <p className="text-xs text-muted-foreground mt-1">Last incident: {health.lastIncident}</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-slate-900/30 border-slate-800">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn how to integrate with the MD API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">API Documentation</h4>
              <p className="text-sm text-muted-foreground">
                Read the OpenAPI specification and integration guides at <code className="bg-slate-800 px-2 py-1 rounded text-xs">api.motorsportsdata.io/docs</code>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">TypeScript SDK</h4>
              <p className="text-sm text-muted-foreground">
                Install the SDK with <code className="bg-slate-800 px-2 py-1 rounded text-xs">npm install @motorsportsdata/sdk</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="api" className="space-y-4">
        {apiStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Requests This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{apiStats.requestsThisMonth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rate limit: {apiStats.currentRateLimit}/min
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {((apiStats.successfulRequests / apiStats.totalRequests) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {apiStats.failedRequests} failed requests
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{apiStats.avgResponseTime}ms</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{apiStats.totalRequests.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="webhooks" className="space-y-4">
        {webhookStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Webhook Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {((webhookStats.successfulDeliveries / webhookStats.totalDeliveries) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {webhookStats.failedDeliveries} failed deliveries
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Avg Delivery Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{webhookStats.avgDeliveryTime}ms</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{webhookStats.activeWebhooks}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/30 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Retry Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{webhookStats.retryRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
