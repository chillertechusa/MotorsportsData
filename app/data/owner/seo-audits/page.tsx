'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'

interface SeoCheck {
  id: string
  check_type: string
  status: 'pass' | 'fail' | 'error' | 'warning'
  message: string
  response_time_ms: number
  error_details?: Record<string, any>
  created_at: string
}

interface SeoAuditResult {
  checks: SeoCheck[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
    overall_status: string
  }
  execution_time_ms: number
  created_at: string
}

export default function SeoAuditsPage() {
  const [auditResults, setAuditResults] = useState<SeoAuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null)

  // Load latest audit on mount
  useEffect(() => {
    loadAudit()
  }, [])

  const loadAudit = async () => {
    try {
      const response = await fetch('/api/seo-audits')
      if (response.ok) {
        const data = await response.json()
        setAuditResults(data)
      }
    } catch (error) {
      console.error('Failed to load audit:', error)
    }
  }

  const runAudit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seo-audits', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setAuditResults(data)
      }
    } catch (error) {
      console.error('Failed to run audit:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Audits</h1>
          <p className="text-gray-600 mt-1">
            Automated SEO health checks: redirect chains, broken links, indexing
          </p>
        </div>
        <Button
          onClick={runAudit}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running...' : 'Run Audit'}
        </Button>
      </div>

      {auditResults && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-sm text-gray-600">Total Checks</div>
              <div className="text-2xl font-bold">{auditResults.summary.total}</div>
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <div className="text-sm text-green-700">Passed</div>
              <div className="text-2xl font-bold text-green-900">{auditResults.summary.passed}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <div className="text-sm text-yellow-700">Warnings</div>
              <div className="text-2xl font-bold text-yellow-900">{auditResults.summary.warnings}</div>
            </div>
            <div className="bg-red-50 p-4 rounded border border-red-200">
              <div className="text-sm text-red-700">Failed</div>
              <div className="text-2xl font-bold text-red-900">{auditResults.summary.failed}</div>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`p-4 rounded border-2 ${getStatusColor(auditResults.summary.overall_status)}`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(auditResults.summary.overall_status)}
              <div>
                <div className="font-semibold">Overall Status</div>
                <div className="text-sm text-gray-600">
                  {auditResults.summary.overall_status === 'pass'
                    ? 'All SEO checks passed'
                    : auditResults.summary.overall_status === 'warning'
                    ? 'Some warnings detected'
                    : 'Critical issues found'}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Checks */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Audit Details</h2>
            {auditResults.checks.map(check => (
              <div
                key={check.id}
                className={`border rounded p-4 cursor-pointer transition ${getStatusColor(check.status)}`}
                onClick={() =>
                  setExpandedCheck(expandedCheck === check.id ? null : check.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="font-semibold capitalize">
                        {check.check_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{check.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Response time: {check.response_time_ms}ms
                      </div>
                    </div>
                  </div>
                  <div className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                    {check.status}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedCheck === check.id && check.error_details && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-mono bg-white bg-opacity-30 p-3 rounded overflow-auto max-h-96">
                      <pre>{JSON.stringify(check.error_details, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Last Run Info */}
          <div className="text-sm text-gray-500 pt-4">
            Last audit: {new Date(auditResults.created_at).toLocaleString()}
            <br />
            Total execution time: {auditResults.execution_time_ms}ms
          </div>
        </>
      )}

      {!auditResults && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded border-2 border-dashed">
          <div className="text-gray-600">No audit results yet</div>
          <Button onClick={runAudit} variant="outline" className="mt-4">
            Run First Audit
          </Button>
        </div>
      )}
    </div>
  )
}
