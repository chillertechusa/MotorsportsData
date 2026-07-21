/**
 * Coach pilot cohort management
 * Track coaches through onboarding, usage, feedback
 */

export type CohortStatus = 'invited' | 'onboarding' | 'active' | 'churned'

export interface PilotCoach {
  id: string
  email: string
  name: string
  company?: string
  status: CohortStatus
  joinedAt: Date
  lastActiveAt?: Date
  riders: number
  nps?: number
  feedback?: string
  blockers?: string[]
  willPay?: boolean
  pricingSensitivity?: 'low' | 'medium' | 'high'
}

export interface CohortMetrics {
  totalCoaches: number
  activeCoaches: number
  avgNPS: number
  churnRate: number
  avgSessionsPerWeek: number
  mostUsedFeatures: string[]
}

export class PilotCohortManager {
  private coaches: Map<string, PilotCoach> = new Map()

  addCoach(email: string, name: string, company?: string): PilotCoach {
    const coach: PilotCoach = {
      id: Math.random().toString(36).substring(7),
      email,
      name,
      company,
      status: 'invited',
      joinedAt: new Date(),
      riders: 0,
    }

    this.coaches.set(coach.id, coach)
    console.log('[Cohort] Coach invited:', coach)
    return coach
  }

  updateStatus(coachId: string, status: CohortStatus): boolean {
    const coach = this.coaches.get(coachId)
    if (!coach) return false

    coach.status = status
    if (status === 'active') {
      coach.joinedAt = new Date()
    }
    return true
  }

  recordActivity(coachId: string): boolean {
    const coach = this.coaches.get(coachId)
    if (!coach) return false

    coach.lastActiveAt = new Date()
    return true
  }

  recordFeedback(
    coachId: string,
    nps: number,
    feedback: string,
    willPay: boolean,
    blockers?: string[]
  ): boolean {
    const coach = this.coaches.get(coachId)
    if (!coach) return false

    coach.nps = nps
    coach.feedback = feedback
    coach.willPay = willPay
    coach.blockers = blockers
    return true
  }

  getCoach(coachId: string): PilotCoach | undefined {
    return this.coaches.get(coachId)
  }

  getAllCoaches(): PilotCoach[] {
    return Array.from(this.coaches.values())
  }

  getMetrics(): CohortMetrics {
    const all = Array.from(this.coaches.values())
    const active = all.filter((c) => c.status === 'active')
    const npScores = all.filter((c) => c.nps !== undefined).map((c) => c.nps!)
    const avgNPS = npScores.length > 0 ? npScores.reduce((a, b) => a + b, 0) / npScores.length : 0

    return {
      totalCoaches: all.length,
      activeCoaches: active.length,
      avgNPS,
      churnRate: all.filter((c) => c.status === 'churned').length / all.length,
      avgSessionsPerWeek: 0, // TODO: Calculate from activity
      mostUsedFeatures: [], // TODO: Track feature usage
    }
  }

  generateWeeklyReport(): string {
    const metrics = this.getMetrics()
    const coaches = this.getAllCoaches()

    return `
PILOT COHORT WEEKLY REPORT
==========================

Overall Metrics:
- Total coaches: ${metrics.totalCoaches}
- Active coaches: ${metrics.activeCoaches}
- Avg NPS: ${metrics.avgNPS.toFixed(1)}
- Churn rate: ${(metrics.churnRate * 100).toFixed(1)}%

Coach Status:
${coaches
  .map(
    (c) => `
  ${c.name} (${c.email})
  - Status: ${c.status}
  - Riders: ${c.riders}
  - NPS: ${c.nps ?? 'N/A'}
  - Last active: ${c.lastActiveAt ? c.lastActiveAt.toLocaleDateString() : 'Never'}
  - Will pay: ${c.willPay ?? 'Unknown'}
  ${c.blockers ? `- Blockers: ${c.blockers.join(', ')}` : ''}
`
  )
  .join('')}

Next actions:
- Follow up with ${coaches.filter((c) => c.status === 'onboarding').length} coaches in onboarding
- Schedule 1-on-1 with ${coaches.filter((c) => c.nps && c.nps >= 9).length} promoters (NPS 9-10)
- Debug blockers with ${coaches.filter((c) => c.blockers && c.blockers.length > 0).length} coaches
    `
  }
}

export const pilotCohortManager = new PilotCohortManager()
