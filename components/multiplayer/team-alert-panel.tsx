'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, Zap } from 'lucide-react'

interface TeamAlert {
  riderId: string
  riderName: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: Date
}

interface TeamAlertPanelProps {
  alerts: TeamAlert[]
}

export function TeamAlertPanel({ alerts }: TeamAlertPanelProps) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical')
  const warningAlerts = alerts.filter(a => a.severity === 'warning')

  return (
    <Card className="p-6 bg-slate-950 border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Team Alerts</h3>
        <div className="flex gap-2">
          {criticalAlerts.length > 0 && (
            <Badge className="bg-red-900 text-red-200">
              {criticalAlerts.length} Critical
            </Badge>
          )}
          {warningAlerts.length > 0 && (
            <Badge className="bg-amber-900 text-amber-200">
              {warningAlerts.length} Warnings
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">No active alerts</div>
        ) : (
          alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex gap-3 p-3 rounded-lg border ${
                alert.severity === 'critical'
                  ? 'bg-red-950/30 border-red-800'
                  : alert.severity === 'warning'
                    ? 'bg-amber-950/30 border-amber-800'
                    : 'bg-blue-950/30 border-blue-800'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {alert.severity === 'critical' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                {alert.severity === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                {alert.severity === 'info' && (
                  <Zap className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{alert.riderName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{alert.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
