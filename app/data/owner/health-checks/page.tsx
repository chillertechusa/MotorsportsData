'use client'

import { useEffect, useState } from 'react'
import { HealthCheck } from '@/lib/health-check-types'
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

export default function HealthChecksDashboard() {
  const [checks, setChecks] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [summary, setSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0,
  })

  const runHealthChecks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health-checks', { method: 'POST' })
      const data = await response.json()

      if (data.checks) {
        setChecks(data.checks)
        if (data.summary) {
          setSummary(data.summary)
        }
        setLastRun(new Date(data.executed_at).toLocaleString())
      }
    } catch (error) {
      console.error('Failed to run health checks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load initial checks
    const loadChecks = async () => {
      try {
        const response = await fetch('/api/health-checks')
        const data = await response.json()

        if (data.checks) {
          setChecks(data.checks)
          if (data.summary) {
            setSummary(data.summary)
          }
        }
      } catch (error) {
        console.error('Failed to load health checks:', error)
      }
    }

    loadChecks()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200'
      case 'fail':
        return 'bg-red-50 border-red-200'
      case 'error':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Checks</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor critical system functions</p>
        </div>
        <button
          onClick={runHealthChecks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running...' : 'Run Now'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Checks</div>
          <div className="text-2xl font-bold">{summary.total}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-700">Passed</div>
          <div className="text-2xl font-bold text-green-700">{summary.passed}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-700">Failed</div>
          <div className="text-2xl font-bold text-red-700">{summary.failed}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-700">Errors</div>
          <div className="text-2xl font-bold text-orange-700">{summary.errors}</div>
        </div>
      </div>

      {/* Last Run */}
      {lastRun && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm text-blue-700">
          Last run: {lastRun}
        </div>
      )}

      {/* Health Checks List */}
      <div className="space-y-3">
        {checks.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-600">
            No health checks have been run yet. Click "Run Now" to start.
          </div>
        ) : (
          checks.map((check) => (
            <div
              key={check.id}
              className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{getStatusIcon(check.status)}</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {check.check_type.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <span className="text-xs text-gray-600">
                      {check.response_time_ms}ms
                    </span>
                  </div>
                  <p className="text-sm mt-1">{check.message}</p>
                  {check.error_details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-gray-600 hover:text-gray-900">
                        Details
                      </summary>
                      <pre className="mt-2 text-xs bg-black bg-opacity-5 p-2 rounded overflow-auto">
                        {JSON.stringify(check.error_details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
