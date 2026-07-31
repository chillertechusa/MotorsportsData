/**
 * Co-Pilot AI signals — forward-thinking alerts that act before the user asks.
 * Each signal has a console, severity, module, and actionable next step.
 */

export type SignalSeverity = 'info' | 'warning' | 'critical'
export type ConsoleType = 'team_manager' | 'crew_chief' | 'mechanic' | 'analyst' | 'logistics' | 'athlete'

export interface CoPilotSignal {
  id: string
  console: ConsoleType
  severity: SignalSeverity
  title: string
  description: string
  action: string
  actionUrl?: string
  timestamp: Date
  module: string // which platform module this signal belongs to
}

/**
 * Generate contextual co-pilot signals based on team data.
 * In production, these would come from a real ML pipeline analyzing team telemetry + behavior.
 * For now, these are templated examples showing what the UI would display.
 */
export function generateCoPilotSignals(teamData: {
  teamName: string
  discipline: string
  tier: string
  lastActivityDays: number
}): CoPilotSignal[] {
  const signals: CoPilotSignal[] = []
  const now = new Date()

  // Team Manager signals
  if (teamData.lastActivityDays > 7) {
    signals.push({
      id: 'inactive-warning',
      console: 'team_manager',
      severity: 'warning',
      title: 'Low Team Activity',
      description: `Your team hasn't logged any activity in ${teamData.lastActivityDays} days. Engagement drives better insights.`,
      action: 'Invite team members',
      actionUrl: '/data/owner?tab=team',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      module: 'Management',
    })
  }

  // Crew Chief signals
  if (teamData.tier === 'privateer' || teamData.tier === 'race_team') {
    signals.push({
      id: 'ai-coach-available',
      console: 'crew_chief',
      severity: 'info',
      title: 'AI Coach Ready for Next Session',
      description: 'AI Coach can analyze your setup if you log your next session. Ready to capture data?',
      action: 'Start session',
      actionUrl: '/data/live',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      module: 'Crew Chief AI',
    })
  }

  // Mechanic signals
  signals.push({
    id: 'maintenance-reminder',
    console: 'mechanic',
    severity: 'warning',
    title: 'Scheduled Maintenance Due',
    description: 'Oil change and brake inspection scheduled for this weekend based on your log.',
    action: 'View schedule',
    actionUrl: '/data/mechanic?filter=maintenance',
    timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    module: 'Service Desk',
  })

  // Analyst signals
  if (teamData.tier === 'race_team' || teamData.tier === 'factory_command') {
    signals.push({
      id: 'performance-trend',
      console: 'analyst',
      severity: 'info',
      title: 'Lap Time Improvement Detected',
      description: 'Your last 3 sessions show a 2.4% improvement in consistency. New setup working.',
      action: 'View analytics',
      actionUrl: '/data/analytics',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
      module: 'Analytics',
    })
  }

  // Logistics signals
  signals.push({
    id: 'fuel-level-low',
    console: 'logistics',
    severity: 'warning',
    title: 'Fuel Reserve Running Low',
    description: 'Current fuel estimate: 3 events remaining. Plan refill for next haul.',
    action: 'View logistics',
    actionUrl: '/data/logistics',
    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    module: 'Logistics',
  })

  // Athlete signals
  signals.push({
    id: 'readiness-peak',
    console: 'athlete',
    severity: 'info',
    title: 'Peak Readiness Window',
    description: 'Based on your HRV and sleep, you\'re in peak performance range for the next 2 days.',
    action: 'View readiness',
    actionUrl: '/data/athlete?section=readiness',
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
    module: 'Athlete Readiness',
  })

  return signals
}

/**
 * Filter signals for a specific console.
 */
export function filterSignalsForConsole(
  signals: CoPilotSignal[],
  console: ConsoleType
): CoPilotSignal[] {
  return signals.filter((s) => s.console === console)
}

/**
 * Get the color class for a severity level.
 */
export function getSeverityColor(severity: SignalSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 border-red-500/30 text-red-400'
    case 'warning':
      return 'bg-amber-500/20 border-amber-500/30 text-amber-400'
    case 'info':
    default:
      return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
  }
}
