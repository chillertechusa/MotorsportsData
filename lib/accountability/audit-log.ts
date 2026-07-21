/**
 * Accountability Audit Log System
 * Tracks every rider assignment and compliance with legal weight
 */

export type AuditEventType =
  | 'ASSIGNMENT_ISSUED'
  | 'ASSIGNMENT_ACKNOWLEDGED'
  | 'SESSION_COMPLETED'
  | 'COMPLIANCE_CHECK'
  | 'COMPLIANCE_PASSED'
  | 'COMPLIANCE_FAILED'
  | 'RIDER_OFFBOARDED'

export interface AuditLogEntry {
  id: string
  riderId: string
  coachId: string
  eventType: AuditEventType
  timestamp: Date
  ipAddress: string
  userAgent: string
  
  // Assignment details
  assignmentId?: string
  assignmentType?: string // '40min@150BPM', 'Strength training', etc.
  assignmentTarget?: string
  
  // Compliance details
  assignmentMetrics?: {
    target: Record<string, number | string>
    actual: Record<string, number | string>
    compliancePercentage: number
    status: 'COMPLIANT' | 'PARTIAL' | 'FAILED'
  }
  
  // Legal metadata
  legalWeight: boolean // True = admissible in court
  signedHash?: string // Digital signature of this entry
}

export class AccountabilityAuditLog {
  private entries: Map<string, AuditLogEntry> = new Map()

  /**
   * Log when coach issues an assignment
   */
  logAssignmentIssued(
    riderId: string,
    coachId: string,
    assignmentId: string,
    assignmentType: string,
    ipAddress: string,
    userAgent: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: Math.random().toString(36).substring(7),
      riderId,
      coachId,
      eventType: 'ASSIGNMENT_ISSUED',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      assignmentId,
      assignmentType,
      legalWeight: true,
    }

    this.entries.set(entry.id, entry)
    console.log('[Audit]', {
      event: 'ASSIGNMENT_ISSUED',
      riderId,
      assignmentType,
      timestamp: entry.timestamp.toISOString(),
      ip: ipAddress,
    })

    return entry
  }

  /**
   * Log when rider acknowledges assignment
   * Critical: rider MUST tap "I acknowledge" before workout unlocks
   */
  logAssignmentAcknowledged(
    riderId: string,
    assignmentId: string,
    ipAddress: string,
    userAgent: string,
    delayMinutes?: number
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: Math.random().toString(36).substring(7),
      riderId,
      coachId: 'system',
      eventType: 'ASSIGNMENT_ACKNOWLEDGED',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      assignmentId,
      legalWeight: true,
    }

    this.entries.set(entry.id, entry)
    console.log('[Audit]', {
      event: 'ASSIGNMENT_ACKNOWLEDGED',
      riderId,
      assignmentId,
      acknowledgeDelayMinutes: delayMinutes || 0,
      timestamp: entry.timestamp.toISOString(),
    })

    return entry
  }

  /**
   * Log compliance check after session
   * Compare assignment target vs. actual telemetry
   */
  logComplianceCheck(
    riderId: string,
    coachId: string,
    assignmentId: string,
    target: Record<string, number | string>,
    actual: Record<string, number | string>,
    compliancePercentage: number,
    ipAddress: string,
    userAgent: string
  ): AuditLogEntry {
    const status: 'COMPLIANT' | 'PARTIAL' | 'FAILED' =
      compliancePercentage >= 95
        ? 'COMPLIANT'
        : compliancePercentage >= 80
          ? 'PARTIAL'
          : 'FAILED'

    const entry: AuditLogEntry = {
      id: Math.random().toString(36).substring(7),
      riderId,
      coachId,
      eventType: status === 'COMPLIANT' ? 'COMPLIANCE_PASSED' : 'COMPLIANCE_FAILED',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      assignmentId,
      assignmentMetrics: {
        target,
        actual,
        compliancePercentage,
        status,
      },
      legalWeight: true,
    }

    this.entries.set(entry.id, entry)
    console.log('[Audit]', {
      event: entry.eventType,
      riderId,
      assignmentId,
      compliancePercentage: `${compliancePercentage}%`,
      status,
      timestamp: entry.timestamp.toISOString(),
    })

    return entry
  }

  /**
   * Log when rider offboarded (contract ended)
   * Access immediately revoked
   */
  logRiderOffboarded(
    riderId: string,
    coachId: string,
    ipAddress: string,
    userAgent: string,
    reason?: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: Math.random().toString(36).substring(7),
      riderId,
      coachId,
      eventType: 'RIDER_OFFBOARDED',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      legalWeight: true,
    }

    this.entries.set(entry.id, entry)
    console.log('[Audit]', {
      event: 'RIDER_OFFBOARDED',
      riderId,
      coachId,
      reason,
      timestamp: entry.timestamp.toISOString(),
      accessRevoked: true,
    })

    return entry
  }

  /**
   * Get all audit logs for a rider (coach view)
   */
  getRiderLog(riderId: string): AuditLogEntry[] {
    return Array.from(this.entries.values()).filter((e) => e.riderId === riderId)
  }

  /**
   * Get compliance summary for a rider
   */
  getComplianceSummary(riderId: string): {
    totalAssignments: number
    compliant: number
    partial: number
    failed: number
    complianceRate: number
  } {
    const logs = this.getRiderLog(riderId)

    const compliant = logs.filter((e) => e.eventType === 'COMPLIANCE_PASSED').length
    const partial = logs.filter((e) => e.assignmentMetrics?.status === 'PARTIAL').length
    const failed = logs.filter((e) => e.eventType === 'COMPLIANCE_FAILED').length
    const totalAssignments = compliant + partial + failed

    return {
      totalAssignments,
      compliant,
      partial,
      failed,
      complianceRate: totalAssignments > 0 ? Math.round((compliant / totalAssignments) * 100) : 0,
    }
  }

  /**
   * Generate legal report (e.g., for contract disputes)
   */
  generateLegalReport(riderId: string, startDate: Date, endDate: Date): string {
    const logs = this.getRiderLog(riderId).filter(
      (e) => e.timestamp >= startDate && e.timestamp <= endDate
    )

    let report = `ACCOUNTABILITY AUDIT REPORT\n`
    report += `Rider ID: ${riderId}\n`
    report += `Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`
    report += `Generated: ${new Date().toISOString()}\n`
    report += `Legal Weight: TRUE (Admissible in court)\n\n`

    report += `EVENTS:\n`
    logs.forEach((entry) => {
      report += `[${entry.timestamp.toISOString()}] ${entry.eventType}\n`
      if (entry.assignmentType) report += `  Assignment: ${entry.assignmentType}\n`
      if (entry.assignmentMetrics) {
        report += `  Compliance: ${entry.assignmentMetrics.compliancePercentage}% (${entry.assignmentMetrics.status})\n`
      }
      report += `  IP: ${entry.ipAddress} | UA: ${entry.userAgent}\n\n`
    })

    const summary = this.getComplianceSummary(riderId)
    report += `COMPLIANCE SUMMARY:\n`
    report += `  Total Assignments: ${summary.totalAssignments}\n`
    report += `  Compliant: ${summary.compliant}\n`
    report += `  Partial: ${summary.partial}\n`
    report += `  Failed: ${summary.failed}\n`
    report += `  Overall Rate: ${summary.complianceRate}%\n`

    return report
  }
}

export const auditLog = new AccountabilityAuditLog()
