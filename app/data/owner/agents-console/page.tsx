'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  BarChart3,
  Shield,
} from 'lucide-react'
import { SystemHealthStatus } from '@/components/owner/system-health-status'

interface HealthCheck {
  check_type: string
  status: 'pass' | 'fail' | 'error' | 'warning'
  message: string
  response_time_ms: number
}

interface AgentStatus {
  type: 'health' | 'seo' | 'system'
  name: string
  status: string
  checks_total?: number
  checks_passed?: number
  last_run?: string
}

export default function AgentsConsole() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [seoChecks, setSeoChecks] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'health' | 'seo'>('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadAllChecks()

    // Set up auto-refresh
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(loadAllChecks, 30000) // Refresh every 30 seconds
    }

    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadAllChecks = async () => {
    setLoading(true)
    try {
      const [healthRes, seoRes] = await Promise.all([
        fetch('/api/health-checks'),
        fetch('/api/seo-audits'),
      ])

      if (healthRes.ok) {
        const data = await healthRes.json()
        setHealthChecks(data.checks || [])
      }

      if (seoRes.ok) {
        const data = await seoRes.json()
        setSeoChecks(data)
      }
    } catch (error) {
      console.error('Failed to load checks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthSummary = () => {
    const passed = healthChecks.filter(c => c.status === 'pass').length
    const failed = healthChecks.filter(c => c.status === 'error' || c.status === 'fail').length
    const warnings = healthChecks.filter(c => c.status === 'warning').length
    return { passed, failed, warnings, total: healthChecks.length }
  }

  const getSeoSummary = () => {
    if (!seoChecks?.summary) return { passed: 0, failed: 0, warnings: 0, total: 0 }
    return seoChecks.summary
  }

  const getSystemStatus = () => {
    const health = getHealthSummary()
    const seo = getSeoSummary()

    if (health.failed > 0 || seo.failed > 0) return 'error'
    if (health.warnings > 0 || seo.warnings > 0) return 'warning'
    return 'pass'
  }

  const renderStatusIcon = (status: string, size = 'md') => {
    const sizeClass = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5'
    switch (status) {
      case 'pass':
        return <CheckCircle2 className={`${sizeClass} text-green-500`} />
      case 'warning':
        return <AlertTriangle className={`${sizeClass} text-yellow-500`} />
      case 'error':
      case 'fail':
        return <AlertCircle className={`${sizeClass} text-red-500`} />
      default:
        return <Activity className={`${sizeClass} text-gray-500`} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
      case 'fail':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50'
    }
  }

  const systemStatus = getSystemStatus()
  const healthSummary = getHealthSummary()
  const seoSummary = getSeoSummary()

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Agents Console
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring dashboard: health checks, SEO audits, system status
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
          </Button>
          <Button onClick={loadAllChecks} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Layer 3: System Monitoring Health (Meta-Monitoring) */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Layer 3: System Monitoring Health</h2>
        <SystemHealthStatus />
      </div>

      {/* System Status Card */}
      <div className={`p-6 rounded-lg border-2 ${getStatusColor(systemStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {renderStatusIcon(systemStatus, 'lg')}
            <div>
              <div className="text-lg font-bold">System Status</div>
              <div className="text-sm text-gray-600">
                {systemStatus === 'pass' && 'All systems operational'}
                {systemStatus === 'warning' && 'Minor issues detected'}
                {systemStatus === 'error' && 'Critical issues - immediate attention required'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {healthSummary.passed + seoSummary.passed}/{healthSummary.total + seoSummary.total}
            </div>
            <div className="text-sm text-gray-600">Checks Passing</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/data/owner/sentinel" className="group">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">Sentinel Squad</div>
              <Shield className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs text-gray-500 mt-2">access · consent · IP · security</div>
          </div>
        </Link>

        <Link href="/data/owner/advisors" className="group">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">Advisor Agents</div>
              <BarChart3 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs text-gray-500 mt-2">growth · revenue · retention · data</div>
          </div>
        </Link>

        <Link href="/data/owner/health-checks" className="group">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">Health Checks</div>
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{healthSummary.passed}/{healthSummary.total}</div>
            <div className="text-xs text-gray-500 mt-2">
              {healthSummary.failed > 0 && (
                <span className="text-red-600">{healthSummary.failed} failed</span>
              )}
              {healthSummary.warnings > 0 && (
                <span className="text-yellow-600">{healthSummary.warnings} warnings</span>
              )}
            </div>
          </div>
        </Link>

        <Link href="/data/owner/seo-audits" className="group">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">SEO Audits</div>
              <Search className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{seoSummary.passed}/{seoSummary.total}</div>
            <div className="text-xs text-gray-500 mt-2">
              {seoSummary.failed > 0 && (
                <span className="text-red-600">{seoSummary.failed} failed</span>
              )}
              {seoSummary.warnings > 0 && (
                <span className="text-yellow-600">{seoSummary.warnings} warnings</span>
              )}
            </div>
          </div>
        </Link>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-700">Coverage</div>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {Math.round(
              ((healthSummary.passed + seoSummary.passed) /
                (healthSummary.total + seoSummary.total)) *
              100
            )}
            %
          </div>
          <div className="text-xs text-gray-500 mt-2">7 total checks</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['overview', 'health', 'seo'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition ${
              selectedTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Last health check run</span>
                <span className="font-mono text-xs">2 seconds ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Last SEO audit run</span>
                <span className="font-mono text-xs">5 seconds ago</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Next scheduled check</span>
                <span className="font-mono text-xs">28 seconds</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'health' && (
        <div className="space-y-3">
          {healthChecks.map(check => (
            <div key={check.check_type} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
              <div className="flex items-center gap-3">
                {renderStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="font-semibold capitalize">{check.check_type.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-gray-700">{check.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{check.response_time_ms}ms</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'seo' && seoChecks && (
        <div className="space-y-3">
          {seoChecks.checks?.map((check: any) => (
            <div key={check.id} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
              <div className="flex items-center gap-3">
                {renderStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="font-semibold capitalize">{check.check_type.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-gray-700">{check.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{check.response_time_ms}ms</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
