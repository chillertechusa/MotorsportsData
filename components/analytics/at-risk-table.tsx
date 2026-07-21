'use client'

import { AlertCircle, Clock, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AtRiskTeam {
  teamId: string
  teamName: string
  ownerEmail: string
  currentPlan: string
  expiryDate: string | null
  daysToExpiry: number | null
  riskLevel: 'red' | 'yellow' | 'green'
  lastSessionAt: string | null
  daysSinceLastSession: number | null
  ltv: number
  notes: string[]
}

export function AtRiskTable({ teams }: { teams: AtRiskTeam[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left font-semibold text-muted-foreground py-3 px-4">Team</th>
            <th className="text-left font-semibold text-muted-foreground py-3 px-4">Email</th>
            <th className="text-left font-semibold text-muted-foreground py-3 px-4">Plan</th>
            <th className="text-left font-semibold text-muted-foreground py-3 px-4">Status</th>
            <th className="text-left font-semibold text-muted-foreground py-3 px-4">Days to Expiry</th>
            <th className="text-left font-semibold text-muted-foreground py-3 px-4">Last Session</th>
            <th className="text-left font-semibold text-muted-foreground py-3 px-4">LTV</th>
            <th className="text-left font-semibold text-muted-foreground py-3 px-4">Risk</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.teamId} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-4 px-4">
                <div className="font-medium text-foreground">{team.teamName}</div>
              </td>
              <td className="py-4 px-4 text-xs text-muted-foreground">{team.ownerEmail}</td>
              <td className="py-4 px-4">
                <Badge variant="outline" className="capitalize">{team.currentPlan}</Badge>
              </td>
              <td className="py-4 px-4">
                <div className="space-y-1">
                  {team.notes.map((note, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                      {note.includes('Expires') && <Clock className="h-3 w-3" />}
                      {note.includes('EXPIRED') && <AlertCircle className="h-3 w-3 text-red-600" />}
                      {note.includes('activity') && <TrendingDown className="h-3 w-3" />}
                      {note}
                    </div>
                  ))}
                </div>
              </td>
              <td className="py-4 px-4">
                {team.daysToExpiry !== null ? (
                  <span className={team.daysToExpiry <= 7 ? 'text-red-600 font-medium' : 'text-amber-600'}>
                    {team.daysToExpiry} days
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="py-4 px-4">
                {team.daysSinceLastSession !== null ? (
                  <span className={team.daysSinceLastSession > 14 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                    {team.daysSinceLastSession}d ago
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="py-4 px-4">
                <span className="font-medium">${team.ltv.toFixed(0)}</span>
              </td>
              <td className="py-4 px-4">
                <Badge
                  className={
                    team.riskLevel === 'red'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }
                >
                  {team.riskLevel.toUpperCase()}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
