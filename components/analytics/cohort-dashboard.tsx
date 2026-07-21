'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Download, AlertTriangle } from 'lucide-react'
import { RetentionChart } from './retention-chart'
import { LtvChart } from './ltv-chart'
import { AtRiskTable } from './at-risk-table'

export function CohortDashboard() {
  const [loading, setLoading] = useState(true)

  const { data: cohortsData, isLoading: cohortsLoading } = useSWR(
    '/api/md-analytics/cohorts?metric=retention&source=all',
    (url) => fetch(url).then(r => r.json())
  )

  const { data: atRiskData, isLoading: atRiskLoading } = useSWR(
    '/api/md-analytics/at-risk',
    (url) => fetch(url).then(r => r.json())
  )

  useEffect(() => {
    setLoading(cohortsLoading || atRiskLoading)
  }, [cohortsLoading, atRiskLoading])

  const handleExportAtRisk = () => {
    if (!atRiskData?.atRiskTeams) return

    const headers = ['Team Name', 'Email', 'Plan', 'Days to Expiry', 'Last Session', 'LTV', 'Risk Level']
    const rows = atRiskData.atRiskTeams.map((team: any) => [
      team.teamName,
      team.ownerEmail,
      team.currentPlan,
      team.daysToExpiry ?? 'N/A',
      team.daysSinceLastSession ?? 'N/A',
      `$${team.ltv.toFixed(2)}`,
      team.riskLevel.toUpperCase(),
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `at-risk-teams-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const redTeams = atRiskData?.atRiskTeams?.filter((t: any) => t.riskLevel === 'red').length || 0
  const yellowTeams = atRiskData?.atRiskTeams?.filter((t: any) => t.riskLevel === 'yellow').length || 0

  return (
    <div className="space-y-6">
      <Tabs defaultValue="retention" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="ltv">LTV Analysis</TabsTrigger>
          <TabsTrigger value="at-risk">
            At-Risk
            {redTeams > 0 && <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">{redTeams}</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retention Curves by Source</CardTitle>
              <CardDescription>
                Percentage of teams active at D7, D30, D90, D365 by signup source
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cohortsData?.cohorts && cohortsData.cohorts.length > 0 ? (
                <RetentionChart data={cohortsData.cohorts} />
              ) : (
                <div className="text-sm text-muted-foreground">No cohort data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value by Tier</CardTitle>
              <CardDescription>
                Total and expansion revenue by plan tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cohortsData?.cohorts && cohortsData.cohorts.length > 0 ? (
                <LtvChart data={cohortsData.cohorts} />
              ) : (
                <div className="text-sm text-muted-foreground">No LTV data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">At-Risk Teams</h3>
              <p className="text-sm text-muted-foreground">
                {redTeams} critical, {yellowTeams} warning
              </p>
            </div>
            {(redTeams > 0 || yellowTeams > 0) && (
              <Button onClick={handleExportAtRisk} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          {redTeams > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900">Critical Risk</h4>
                <p className="text-sm text-red-700">{redTeams} team{redTeams !== 1 ? 's' : ''} expiring soon or inactive</p>
              </div>
            </div>
          )}

          <Card>
            <CardContent className="pt-6">
              {atRiskData?.atRiskTeams && atRiskData.atRiskTeams.length > 0 ? (
                <AtRiskTable teams={atRiskData.atRiskTeams} />
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No at-risk teams. Great job!
                </div>
              )}
            </CardContent>
          </Card>

          {atRiskData?.summary && (
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-sm">Potential Monthly Churn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  ${atRiskData.summary.estimatedChurnValuePerMonth.toFixed(2)}/mo
                </div>
                <p className="text-xs text-orange-700 mt-1">
                  Based on LTV of {redTeams} critical-risk team{redTeams !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
