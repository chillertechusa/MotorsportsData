'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface SystemHealthData {
  id: string
  check_type: string
  status: 'pass' | 'warning' | 'fail'
  message: string
  response_time_ms: number
  created_at: string
  checks: {
    cron_execution: boolean
    cron_last_run_age_minutes: number
    incident_creation: boolean
    alert_rules_accessible: boolean
    alert_delivery_healthy: boolean
    database_responsive: boolean
  }
  error_details?: Record<string, any>
}

export function SystemHealthStatus() {
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchSystemHealth = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/cron/system-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      setSystemHealth(data.system_health)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemHealth()

    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (!systemHealth) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-900">System Health Unknown</p>
            <p className="text-sm text-yellow-700">Loading system health status...</p>
          </div>
          <button
            onClick={fetchSystemHealth}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-2 rounded px-3 py-1 text-sm font-medium text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = {
    pass: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-600', title: 'System Healthy', subtitle: 'All monitoring systems operational' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-600', title: 'System Warning', subtitle: 'Some monitoring issues detected' },
    fail: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-600', title: 'System Failure', subtitle: 'Monitoring system not operational' },
  }

  const config = statusConfig[systemHealth.status]
  const Icon = config.icon

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
          <div>
            <p className={`font-semibold ${config.iconColor}`}>{config.title}</p>
            <p className={`text-sm ${config.iconColor} opacity-75`}>{config.subtitle}</p>
          </div>
        </div>
        <button
          onClick={fetchSystemHealth}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium hover:opacity-75 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
        <div className="rounded bg-white/50 p-2">
          <p className="text-gray-600">Database</p>
          <p className={`font-semibold ${systemHealth.checks.database_responsive ? 'text-green-600' : 'text-red-600'}`}>
            {systemHealth.checks.database_responsive ? 'Responsive' : 'Unresponsive'}
          </p>
        </div>

        <div className="rounded bg-white/50 p-2">
          <p className="text-gray-600">Cron Job</p>
          <p className={`font-semibold ${systemHealth.checks.cron_execution ? 'text-green-600' : 'text-red-600'}`}>
            {systemHealth.checks.cron_execution ? `${systemHealth.checks.cron_last_run_age_minutes}m ago` : 'Stalled'}
          </p>
        </div>

        <div className="rounded bg-white/50 p-2">
          <p className="text-gray-600">Incident System</p>
          <p className={`font-semibold ${systemHealth.checks.incident_creation ? 'text-green-600' : 'text-red-600'}`}>
            {systemHealth.checks.incident_creation ? 'Working' : 'Failed'}
          </p>
        </div>

        <div className="rounded bg-white/50 p-2">
          <p className="text-gray-600">Alert Rules</p>
          <p className={`font-semibold ${systemHealth.checks.alert_rules_accessible ? 'text-green-600' : 'text-red-600'}`}>
            {systemHealth.checks.alert_rules_accessible ? 'Accessible' : 'Error'}
          </p>
        </div>

        <div className="rounded bg-white/50 p-2">
          <p className="text-gray-600">Alert Delivery</p>
          <p className={`font-semibold ${systemHealth.checks.alert_delivery_healthy ? 'text-green-600' : 'text-red-600'}`}>
            {systemHealth.checks.alert_delivery_healthy ? 'Healthy' : 'Failed'}
          </p>
        </div>

        <div className="rounded bg-white/50 p-2">
          <p className="text-gray-600">Response Time</p>
          <p className="font-semibold text-blue-600">{systemHealth.response_time_ms}ms</p>
        </div>
      </div>

      {systemHealth.error_details && Object.keys(systemHealth.error_details).length > 0 && (
        <div className="mt-3 rounded bg-white/50 p-2 text-xs">
          <p className="mb-1 font-semibold text-gray-700">Error Details:</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-gray-600">
            {JSON.stringify(systemHealth.error_details, null, 2)}
          </pre>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Last checked: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'} · Auto-refresh: {autoRefresh ? 'On' : 'Off'}
      </p>
    </div>
  )
}
