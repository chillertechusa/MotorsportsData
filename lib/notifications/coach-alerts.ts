/**
 * Coach notification system
 * Alerts for readiness changes, rider compliance, performance insights
 */

export type NotificationType =
  | 'READINESS_PEAKED'
  | 'READINESS_DECLINED'
  | 'ASSIGNMENT_MISSED'
  | 'ASSIGNMENT_ACKNOWLEDGED'
  | 'LAP_RECORD'
  | 'OUTLIER_DETECTED'

export interface CoachNotification {
  id: string
  coachId: string
  type: NotificationType
  riderId: string
  riderName: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export class CoachNotificationManager {
  async createNotification(
    coachId: string,
    type: NotificationType,
    riderId: string,
    riderName: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<CoachNotification> {
    const notification: CoachNotification = {
      id: Math.random().toString(36).substring(7),
      coachId,
      type,
      riderId,
      riderName,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actionUrl,
    }

    // TODO: Store in database
    console.log('[Notification]', notification)
    return notification
  }

  async sendReadinessAlert(
    coachId: string,
    riderId: string,
    riderName: string,
    readinessScore: number,
    previousScore: number
  ) {
    const isPeaked = readinessScore >= 90 && previousScore < 90
    const isDeclined = readinessScore < 70 && previousScore >= 70

    if (isPeaked) {
      return this.createNotification(
        coachId,
        'READINESS_PEAKED',
        riderId,
        riderName,
        `${riderName} is PEAKED`,
        `Readiness score jumped to ${readinessScore} (was ${previousScore}). Race-day ready.`,
        `/data/race-team?view=readiness&rider=${riderId}`
      )
    }

    if (isDeclined) {
      return this.createNotification(
        coachId,
        'READINESS_DECLINED',
        riderId,
        riderName,
        `⚠️ ${riderName} readiness declined`,
        `Score dropped to ${readinessScore} (was ${previousScore}). Check sleep & HRV.`,
        `/data/race-team?view=readiness&rider=${riderId}`
      )
    }
  }

  async sendComplianceAlert(
    coachId: string,
    riderId: string,
    riderName: string,
    assignmentType: string
  ) {
    return this.createNotification(
      coachId,
      'ASSIGNMENT_MISSED',
      riderId,
      riderName,
      `Missed assignment: ${assignmentType}`,
      `${riderName} did not complete the ${assignmentType} assignment.`,
      `/data/race-team?view=accountability&rider=${riderId}`
    )
  }

  async sendPerformanceAlert(
    coachId: string,
    riderId: string,
    riderName: string,
    insight: string
  ) {
    return this.createNotification(
      coachId,
      'OUTLIER_DETECTED',
      riderId,
      riderName,
      'Performance insight detected',
      insight,
      `/data/race-team?view=sessioncomp&rider=${riderId}`
    )
  }
}

export const notificationManager = new CoachNotificationManager()
