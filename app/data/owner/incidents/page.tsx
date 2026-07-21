'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Trash2, Archive } from 'lucide-react'

interface AlertHistoryItem {
  id: string
  channel: string
  recipient: string
  status: string
  createdAt: string
}

interface Incident {
  id: string
  checkType: string
  severity: 'critical' | 'warning' | 'info'
  status: 'active' | 'resolved' | 'acknowledged'
  title: string
  description?: string
  errorMessage?: string
  failureCount: number
  lastOccurredAt: string
  resolvedAt?: string
  recentAlerts: AlertHistoryItem[]
  createdAt: string
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/50',
  warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-red-500/10 text-red-300',
  resolved: 'bg-green-500/10 text-green-300',
  acknowledged: 'bg-yellow-500/10 text-yellow-300',
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved' | 'all'>('active')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/incidents?status=${statusFilter}`)
        if (!response.ok) throw new Error('Failed to load incidents')
        const data = await response.json()
        setIncidents(data.incidents || [])
      } catch (error) {
        console.error('[v0] Failed to load incidents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIncidents()
  }, [statusFilter])

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: 'owner' }),
      })

      if (!response.ok) throw new Error('Failed to resolve incident')
      const data = await response.json()

      setIncidents(incidents.map(i => (i.id === incidentId ? data.incident : i)))
      setSelectedIncident(null)
    } catch (error) {
      console.error('[v0] Error resolving incident:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getTimeSinceOccurrence = (dateString: string) => {
    const date = new Date(dateString)
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Incidents</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage system incidents with real-time alerts
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['active', 'resolved', 'all'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded font-semibold transition ${
              statusFilter === status
                ? 'bg-[#ccff00] text-black'
                : 'bg-background border border-border hover:border-[#ccff00]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading incidents...</div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No incidents to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`bg-background border rounded-lg p-6 cursor-pointer transition hover:border-[#ccff00] ${
                SEVERITY_COLORS[incident.severity]
              }`}
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{incident.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${STATUS_COLORS[incident.status]}`}>
                        {incident.status}
                      </span>
                    </div>
                    <p className="text-sm opacity-75">{incident.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-muted-foreground">#{incident.id.slice(0, 8)}</p>
                </div>
              </div>

              {/* Incident Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="opacity-75 text-xs">Check Type</span>
                  <p className="font-semibold">{incident.checkType}</p>
                </div>
                <div>
                  <span className="opacity-75 text-xs">Severity</span>
                  <p className="font-semibold uppercase">{incident.severity}</p>
                </div>
                <div>
                  <span className="opacity-75 text-xs">Failures</span>
                  <p className="font-semibold">{incident.failureCount}</p>
                </div>
                <div>
                  <span className="opacity-75 text-xs">Last Seen</span>
                  <p className="font-semibold">{getTimeSinceOccurrence(incident.lastOccurredAt)}</p>
                </div>
              </div>

              {/* Recent Alerts Preview */}
              {incident.recentAlerts.length > 0 && (
                <div className="text-xs opacity-75 border-t border-current pt-3">
                  <p className="font-semibold mb-2">Recent Alerts ({incident.recentAlerts.length})</p>
                  <div className="space-y-1">
                    {incident.recentAlerts.slice(0, 2).map((alert) => (
                      <div key={alert.id} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${alert.status === 'sent' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span>{alert.channel}</span>
                        <span>→ {alert.recipient}</span>
                        <span>{formatDate(alert.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {incident.status === 'active' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-current">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleResolveIncident(incident.id)
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded text-sm hover:bg-green-500/30 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedIncident.title}</h2>
                <p className="text-muted-foreground mt-1">{selectedIncident.description}</p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Full Details */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Check Type</p>
                  <p className="font-semibold">{selectedIncident.checkType}</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <p className="font-semibold uppercase">{selectedIncident.severity}</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className={`font-semibold ${STATUS_COLORS[selectedIncident.status]}`}>
                    {selectedIncident.status}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Failures</p>
                  <p className="font-semibold">{selectedIncident.failureCount}</p>
                </div>
              </div>

              {selectedIncident.errorMessage && (
                <div className="bg-muted p-4 rounded">
                  <p className="text-xs text-muted-foreground mb-2">Error Message</p>
                  <code className="text-sm block overflow-x-auto">{selectedIncident.errorMessage}</code>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">Timeline</p>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <span className="text-xs text-muted-foreground min-w-fit">Created:</span>
                    <span className="text-sm">{formatDate(selectedIncident.createdAt)}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-xs text-muted-foreground min-w-fit">Last Occurred:</span>
                    <span className="text-sm">{formatDate(selectedIncident.lastOccurredAt)}</span>
                  </div>
                  {selectedIncident.resolvedAt && (
                    <div className="flex gap-4">
                      <span className="text-xs text-muted-foreground min-w-fit">Resolved:</span>
                      <span className="text-sm">{formatDate(selectedIncident.resolvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Alert History */}
              {selectedIncident.recentAlerts.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">Alert History</p>
                  <div className="space-y-2">
                    {selectedIncident.recentAlerts.map((alert) => (
                      <div key={alert.id} className="bg-muted p-3 rounded text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold capitalize">{alert.channel}</span>
                          <span className={`text-xs px-2 py-1 rounded ${alert.status === 'sent' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.recipient}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(alert.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedIncident.status === 'active' && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleResolveIncident(selectedIncident.id)
                  }}
                  className="flex-1 px-4 py-2 bg-green-500/20 text-green-300 rounded font-semibold hover:bg-green-500/30 transition"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Resolve Incident
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
