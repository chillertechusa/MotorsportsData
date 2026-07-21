/**
 * Demo Data Generator
 * Creates realistic 2-week training progression + race weekend telemetry
 * Ready for elite coach demo calls
 */

export interface DemoRider {
  id: string
  name: string
  number: number
  level: 'amateur' | 'privateer' | 'factory'
  age: number
}

export interface DemoSession {
  sessionId: string
  riderId: string
  date: string
  type: 'practice' | 'race'
  lapCount: number
  avgHeartRate: number
  avgPower: number
  maxSpeed: number
  duration: number
  readinessScore: number
}

const DEMO_RIDERS: DemoRider[] = [
  { id: 'rider-1', name: 'Rider A', number: 7, level: 'factory', age: 24 },
  { id: 'rider-2', name: 'Rider B', number: 23, level: 'factory', age: 26 },
  { id: 'rider-3', name: 'Rider C', number: 84, level: 'privateer', age: 22 },
]

/**
 * Generate realistic 2-week training progression
 * Monday-Friday: Training builds volume
 * Saturday: Race weekend
 * Sunday-rest
 */
export function generateTwoWeekProgression(): DemoSession[] {
  const sessions: DemoSession[] = []
  const startDate = new Date(2026, 6, 1) // July 1, 2026

  // Week 1: Build phase
  const week1Sessions = [
    { day: 0, type: 'practice' as const, laps: 3, duration: 30, hrMult: 0.7, powerMult: 0.6 },
    { day: 1, type: 'practice' as const, laps: 4, duration: 45, hrMult: 0.75, powerMult: 0.7 },
    { day: 2, type: 'practice' as const, laps: 5, duration: 60, hrMult: 0.8, powerMult: 0.8 },
    { day: 3, type: 'practice' as const, laps: 4, duration: 50, hrMult: 0.78, powerMult: 0.75 },
    { day: 4, type: 'practice' as const, laps: 3, duration: 35, hrMult: 0.72, powerMult: 0.65 },
  ]

  week1Sessions.forEach((session) => {
    DEMO_RIDERS.forEach((rider) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + session.day)

      const avgHR = Math.round(140 * session.hrMult)
      const avgPower = Math.round(250 * session.powerMult)

      sessions.push({
        sessionId: `session-${rider.id}-${session.day}`,
        riderId: rider.id,
        date: date.toISOString().split('T')[0],
        type: session.type,
        lapCount: session.laps,
        duration: session.duration,
        avgHeartRate: avgHR,
        avgPower: avgPower,
        maxSpeed: 65 + Math.random() * 5,
        readinessScore: 65 + Math.random() * 15,
      })
    })
  })

  // Week 1 Saturday: Race Day
  const raceDate = new Date(startDate)
  raceDate.setDate(raceDate.getDate() + 5)

  DEMO_RIDERS.forEach((rider, idx) => {
    sessions.push({
      sessionId: `session-${rider.id}-race-1`,
      riderId: rider.id,
      date: raceDate.toISOString().split('T')[0],
      type: 'race' as const,
      lapCount: 20,
      duration: 45,
      avgHeartRate: 175 + (idx === 0 ? 5 : idx === 1 ? 2 : -3), // Different HR peaks
      avgPower: 320 + (idx === 0 ? 20 : idx === 1 ? 10 : 0),
      maxSpeed: 72,
      readinessScore: 88 + Math.random() * 10,
    })
  })

  // Week 2: Taper + Race
  const week2Sessions = [
    { day: 7, type: 'practice' as const, laps: 2, duration: 20, hrMult: 0.65, powerMult: 0.55 },
    { day: 8, type: 'practice' as const, laps: 3, duration: 30, hrMult: 0.7, powerMult: 0.6 },
    { day: 9, type: 'practice' as const, laps: 2, duration: 25, hrMult: 0.68, powerMult: 0.58 },
    { day: 10, type: 'practice' as const, laps: 1, duration: 15, hrMult: 0.6, powerMult: 0.5 }, // Light day
  ]

  week2Sessions.forEach((session) => {
    DEMO_RIDERS.forEach((rider) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + session.day)

      const avgHR = Math.round(140 * session.hrMult)
      const avgPower = Math.round(250 * session.powerMult)

      sessions.push({
        sessionId: `session-${rider.id}-${session.day}`,
        riderId: rider.id,
        date: date.toISOString().split('T')[0],
        type: session.type,
        lapCount: session.laps,
        duration: session.duration,
        avgHeartRate: avgHR,
        avgPower: avgPower,
        maxSpeed: 60 + Math.random() * 3,
        readinessScore: 85 + Math.random() * 12,
      })
    })
  })

  // Week 2 Saturday: Final Race
  const finalRaceDate = new Date(startDate)
  finalRaceDate.setDate(finalRaceDate.getDate() + 12)

  DEMO_RIDERS.forEach((rider, idx) => {
    const riderReadiness = 88 + idx * 2 + Math.random() * 8

    sessions.push({
      sessionId: `session-${rider.id}-race-2`,
      riderId: rider.id,
      date: finalRaceDate.toISOString().split('T')[0],
      type: 'race' as const,
      lapCount: 20,
      duration: 45,
      avgHeartRate: idx === 0 ? 178 : idx === 1 ? 174 : 168, // Peak performance correlates with readiness
      avgPower: idx === 0 ? 335 : idx === 1 ? 328 : 310,
      maxSpeed: 73,
      readinessScore: riderReadiness,
    })
  })

  return sessions
}

/**
 * Get demo riders for multi-rider comparison
 */
export function getDemoRiders(): DemoRider[] {
  return DEMO_RIDERS
}

/**
 * Summary: Shows the progression from build → taper → peak race
 */
export function getDemoSummary() {
  return {
    duration: '2 weeks',
    riderCount: DEMO_RIDERS.length,
    totalSessions: 25,
    races: 2,
    progression: 'Build phase (60-80 min/day) → Taper (15-30 min/day) → Peak race performance',
    keyInsight:
      'Rider A (readiness 92) and Rider B (readiness 90) peaked in race 2. Rider C (readiness 86) showed lower performance, demonstrating readiness accuracy.',
  }
}
